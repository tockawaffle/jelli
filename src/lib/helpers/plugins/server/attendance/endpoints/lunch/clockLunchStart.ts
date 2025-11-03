import { APIError } from "better-auth";
import { getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint, Member, Organization } from "better-auth/plugins";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { Attendance } from "../..";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(isBetween);

export const clockLunchStart = createAuthEndpoint("/attendance/lunch-start", {
	method: "POST",
	use: [sessionMiddleware],
}, async (ctx) => {
	const session = await getSessionFromCtx(ctx);
	if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

	const orgId = session.session.activeOrganizationId as string;
	if (!orgId) throw new APIError("BAD_REQUEST", { message: "You do not have an active organization, please set one." });

	const operationType = (() => {
		if (!ctx.request) return "webapp";

		const userAgent = ctx.request.headers.get("user-agent");
		if (!userAgent) return "webapp";

		const browserMatch = userAgent.match(/(MSIE|(?!Gecko.+)Firefox|(?!AppleWebKit.+Chrome.+)Safari|(?!AppleWebKit.+)Chrome|AppleWebKit(?!.+Chrome|.+Safari)|Gecko(?!.+Firefox))(?: |\/)([\d\.apre]+)/);
		if (browserMatch) {
			return "webapp";
		} else if (userAgent.includes("JelliApp")) {
			return "nfc";
		}
		return "webapp"
	})();

	// Get the organization opening time to check if the user is late
	const organization = await ctx.context.adapter.findOne<Organization>({
		model: "organization",
		where: [
			{
				operator: "eq",
				field: "_id",
				value: orgId,
			},
		]
	});

	if (!organization) throw new APIError("NOT_FOUND", { message: "Organization not found" });
	const orgMetadata: OrgMetadata = typeof organization.metadata === "string" ? JSON.parse(organization.metadata) : organization.metadata;

	// Check if user is a member of the organization
	const member = await ctx.context.adapter.findOne<Member>({
		model: "member",
		where: [
			{
				operator: "eq",
				field: "userId",
				value: session.user.id,
			},
			{
				operator: "eq",
				field: "organizationId",
				value: orgId,
			},
		]
	});

	if (!member) throw new APIError("UNAUTHORIZED", { message: "User is not a member of the organization" });

	const now = dayjs().tz(orgMetadata.hours.timezone);
	const startOfDay = now.startOf('day');

	// Find today's attendance record
	const attendance = await ctx.context.adapter.findOne<Attendance>({
		model: "attendance",
		where: [
			{
				operator: "eq",
				field: "userId",
				value: session.user.id,
			},
			{
				operator: "eq",
				field: "orgId",
				value: orgId,
			},
			{
				operator: "gte",
				field: "date",
				value: startOfDay.format(),
			},
		]
	});

	if (!attendance) {
		throw new APIError("BAD_REQUEST", { message: "No clock-in record found for today", code: "CLOCK_LS_NO_RECORD" });
	}

	if (attendance.status !== "CLOCKED_IN") {
		const messages: Record<string, string> = {
			"LUNCH_BREAK_STARTED": "Already started lunch break",
			"LUNCH_BREAK_ENDED": "Already ended lunch break",
			"CLOCKED_OUT": "Already clocked out"
		};

		throw new APIError("BAD_REQUEST", {
			message: messages[attendance.status] || "Must be clocked in to start lunch break",
			code: "CLOCK_LS_NOT_CLOCKED_IN"
		});
	}

	const lunchTime: "flexible" | string | undefined = session.user.metadata?.lunchTime;
	const gracePeriod = orgMetadata.hours.gracePeriod;
	const orgLunchTimeLimit: number | undefined = orgMetadata.lunchTimeLimit;
	const isOrgStrict = orgMetadata.strictLunchTime || false;

	if (!lunchTime) {
		throw new APIError("BAD_REQUEST", { message: "User does not have a lunch time set, contact your administrator to set one.", code: "CLOCK_LS_NOT_SET" });
	} else if (lunchTime !== "flexible") {
		const lunchTimeParts: Record<"hour" | "minute" | "second", number> = {
			hour: parseInt(lunchTime.split(":")[0]),
			minute: parseInt(lunchTime.split(":")[1]),
			second: parseInt(lunchTime.split(":")[2]),
		}
		const lunchTimeDate = now.set("hour", lunchTimeParts.hour).set("minute", lunchTimeParts.minute).set("second", lunchTimeParts.second);

		// Min and max time the user can start lunch break is the lunch time + grace period. For example, if the lunch time is 12:00:00 and the grace period is 15 minutes, the min time the user can start lunch break is 11:45:00 and the max time the user can start lunch break is 12:15:00.
		const lunchTimeDateWithGracePeriodMax = lunchTimeDate.add(dayjs.duration(gracePeriod, "minutes"));
		const lunchTimeDateWithGracePeriodMin = lunchTimeDate.subtract(dayjs.duration(gracePeriod, "minutes"));

		// The user cannot start lunch break before the lunch time - grace period or after the lunch time + grace period.
		// Example: If the lunch time is 12:00:00 and the grace period is 15 minutes, the user cannot start lunch break before 11:45:00 or after (lunch time + lunch time limit)
		const lunchTimeLimit = orgLunchTimeLimit ? dayjs.duration(orgLunchTimeLimit, "minutes") : dayjs.duration(60, "minutes"); // If the lunch time limit is not set, default to 60 minutes.

		try {
			switch (true) {
				// Check if the user is after the lunch time + lunch time limit.
				// Eg: Lunch time set to 12:00:00 and lunch time limit is 60 minutes, the user cannot start lunch break after 13:00:00.
				case now.isAfter(lunchTimeDate.add(lunchTimeLimit)): {
					throw new APIError("BAD_REQUEST", { message: `You cannot start lunch break after ${lunchTimeDate.add(lunchTimeLimit).format('HH:mm:ss')}. Please make a request instead.`, code: "CLOCK_LS_OUT_OF_TIME" });
				}
				// The user CANNOT start lunch break if lunch time + grace period is after the current time.
				// Eg: Lunch time set to 12:00:00 and grace period is 15 minutes, the user cannot start lunch break after 12:15:00.
				case now.isAfter(lunchTimeDateWithGracePeriodMax): {
					throw new APIError("BAD_REQUEST", { message: `You cannot start lunch break after ${lunchTimeDateWithGracePeriodMax.format('HH:mm:ss')}. Please make a request instead.`, code: "CLOCK_LS_OUT_OF_TIME" });
				}
				// Check if the user is before the lunch time - grace period.
				// Eg: Lunch time set to 12:00:00 and grace period is 15 minutes, the user cannot start lunch break before 11:45:00.
				case now.isBefore(lunchTimeDateWithGracePeriodMin): {
					throw new APIError("BAD_REQUEST", { message: `You cannot start lunch break before ${lunchTimeDateWithGracePeriodMin.format('HH:mm:ss')}. Please make a request instead.`, code: "CLOCK_LS_OUT_OF_TIME" });
				}
				// The user CAN start lunch break if:
				// 1. The user is between the lunch time - grace period and the lunch time. Eg: Lunch time set to 12:00:00 and it's currently 11:55:00.
				// 2. The user is between the lunch time and the lunch time + grace period. Eg: Lunch time set to 12:00:00 and it's currently 12:05:00.
				case
					now.isBetween(lunchTimeDateWithGracePeriodMin, lunchTimeDate) ||
					now.isBetween(lunchTimeDate, lunchTimeDateWithGracePeriodMax): {
						if (isOrgStrict) {
							throw new APIError("BAD_REQUEST", { message: `You cannot start lunch break before ${lunchTimeDateWithGracePeriodMin.format('HH:mm:ss')} or after ${lunchTimeDate.add(lunchTimeLimit).format('HH:mm:ss')}. Please make a request instead.`, code: "CLOCK_LS_OUT_OF_TIME" });
						}

						const updated = await updateAttendance(ctx, attendance, now, operationType);
						return ctx.json(updated as Attendance);
					}
				default: {
					throw new APIError("BAD_REQUEST", { message: "An error occurred while starting lunch break", code: "CLOCK_LS_ERROR" });
				}
			}
		} catch (error) {
			if (error instanceof APIError) {
				throw error;
			}

			throw new APIError("BAD_REQUEST", { message: "An error occurred while starting lunch break", code: "CLOCK_LS_ERROR" });
		}
	}
})

async function updateAttendance(ctx: any, attendance: Attendance, now: Dayjs, operationType: "nfc" | "webapp" | "qr") {
	return await ctx.context.adapter.update({
		model: "attendance",
		where: [
			{
				operator: "eq",
				field: "_id",
				value: (attendance as any).id,
			}
		],
		update: {
			lunchBreakOut: now.format(),
			status: "LUNCH_BREAK_STARTED",
			timesUpdated: (attendance.timesUpdated || 0) + 1,
			operation: [
				...(attendance.operation || []),
				{
					id: crypto.randomUUID(),
					type: operationType,
					createdAt: now.format(),
				}
			]
		}
	})
}