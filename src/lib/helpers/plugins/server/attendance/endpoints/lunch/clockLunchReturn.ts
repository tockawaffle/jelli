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

export const clockLunchReturn = createAuthEndpoint("/attendance/lunch-return", {
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

	// Keep as dayjs object in the organization's timezone
	const now = dayjs().tz(orgMetadata.hours.timezone);
	// Set the start of day in the organization's timezone
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
		throw new APIError("BAD_REQUEST", { message: "No clock-in record found for today" });
	}

	if (attendance.status !== "LUNCH_BREAK_STARTED") {
		throw new APIError("BAD_REQUEST", { message: "Must be on lunch break to end it" });
	}

	const lunchTime: "flexible" | string | undefined = session.user.metadata?.lunchTime;
	const gracePeriod = orgMetadata.hours.gracePeriod;
	const orgLunchTimeLimit: number | undefined = orgMetadata.lunchTimeLimit;

	const lunchTimeStart = dayjs(attendance.lunchBreakOut).tz(orgMetadata.hours.timezone);
	const lunchTimeEnd = lunchTimeStart.add(
		orgLunchTimeLimit ? dayjs.duration(orgLunchTimeLimit, "minutes") : dayjs.duration(60, "minutes")
	)

	if (!lunchTime) {
		throw new APIError("BAD_REQUEST", { message: "User does not have a lunch time set, contact your administrator to set one.", code: "CLOCK_LS_NOT_SET" });
	}


	// Min and max time the user can return from lunch break.
	const lunchTimeReturnMax = lunchTimeEnd.add(dayjs.duration(gracePeriod, "minutes"));
	const lunchTimeReturnMin = lunchTimeStart.add(dayjs.duration(orgLunchTimeLimit || 60, "minutes"))
		.subtract(dayjs.duration(gracePeriod, "minutes"));

	try {
		switch (true) {
			// Check if the user is after the lunch time return max time.
			case now.isAfter(lunchTimeReturnMax): {
				throw new APIError("BAD_REQUEST", { message: `You cannot return from lunch break after ${lunchTimeReturnMax.format('HH:mm:ss')}. Please make a request instead.`, code: "CLOCK_LR_AFTER_TIME" });
			}
			// Check if the user is before the lunch time return min time.
			case now.isBefore(lunchTimeReturnMin): {
				throw new APIError("BAD_REQUEST", { message: `You cannot return from lunch break before ${lunchTimeReturnMin.format('HH:mm:ss')}. Please make a request instead.`, code: "CLOCK_LR_BEFORE_TIME" });
			}
			// The user CAN return from lunch break if:
			// 1. The user is between the lunch time return min time and the lunch end time. Eg: Lunch ends at 13:00:00 and it's currently 12:55:00.
			// 2. The user is between the lunch end time and the lunch time return max time. Eg: Lunch ends at 13:00:00 and it's currently 13:05:00.
			case
				now.isBetween(lunchTimeReturnMin, lunchTimeEnd) ||
				now.isBetween(lunchTimeEnd, lunchTimeReturnMax): {
					const updated = await updateAttendance(ctx, attendance, now, operationType);
					return ctx.json(updated as Attendance);
				}
			default: {
				throw new APIError("BAD_REQUEST", { message: "An error occurred while returning from lunch break", code: "CLOCK_LR_ERROR" });
			}
		}
	} catch (error) {
		if (error instanceof APIError) {
			throw error;
		}

		throw new APIError("BAD_REQUEST", { message: "An error occurred while returning from lunch break", code: "CLOCK_LR_ERROR" });
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
			lunchBreakReturn: now.format(),
			status: "LUNCH_BREAK_ENDED",
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