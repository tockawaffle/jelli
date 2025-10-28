import { APIError } from "better-auth";
import { getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint, Member, Organization } from "better-auth/plugins";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Attendance } from "..";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

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

	const now = dayjs().tz(orgMetadata.hours.timezone).toDate();
	// Set the start of day in the organization's timezone
	const startOfDay = dayjs(now).tz(orgMetadata.hours.timezone).startOf('day').toDate();

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
				value: startOfDay.toISOString(),
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

	// Check if user is clocking on the right time
	// If lunch time is flexible, then we don't need to check it.
	const lunchTime = session.user.metadata?.lunchTime;
	if (!lunchTime) {
		throw new APIError("BAD_REQUEST", { message: "User does not have a lunch time set, contact your administrator to set one.", code: "CLOCK_LS_NOT_SET" });
	} else if (lunchTime !== "flexible") {
		// Lunch time is set as an hour (HH:MM:SS)
		const lunchTimeStr = dayjs(startOfDay).tz(orgMetadata.hours.timezone).format('YYYY-MM-DD') + ` ${lunchTime}`;
		const lunchTimeDate = dayjs(lunchTimeStr).tz(orgMetadata.hours.timezone).toDate();
		const gracePeriod = dayjs.duration(orgMetadata.hours.gracePeriod, "minutes");
		const isStrictLunchTime = orgMetadata.strictLunchTime;

		if (isStrictLunchTime) {
			// Strict: Must start lunch within grace period window (before and after scheduled time)
			const lunchTimeStart = dayjs(lunchTimeDate).subtract(gracePeriod).toDate();
			const lunchTimeEnd = dayjs(lunchTimeDate).add(gracePeriod).toDate();

			if (now < lunchTimeStart) {
				throw new APIError("BAD_REQUEST", {
					message: `You cannot start lunch break before ${lunchTimeStart.toISOString()}`,
					code: "CLOCK_LS_BEFORE_TIME"
				});
			}

			if (now > lunchTimeEnd) {
				throw new APIError("BAD_REQUEST", {
					message: `You cannot start lunch break after ${lunchTimeEnd.toISOString()}`,
					code: "CLOCK_LS_AFTER_TIME"
				});
			}
		} else {
			// Non-strict: Must start lunch within grace period window, but more lenient
			const lunchTimeStart = dayjs(lunchTimeDate).subtract(gracePeriod).toDate();
			const lunchTimeEnd = dayjs(lunchTimeDate).add(gracePeriod).toDate();

			if (now < lunchTimeStart) {
				throw new APIError("BAD_REQUEST", {
					message: `You cannot start lunch break before ${lunchTimeStart.toISOString()}`,
					code: "CLOCK_LS_BEFORE_TIME"
				});
			}

			if (now > lunchTimeEnd) {
				throw new APIError("BAD_REQUEST", {
					message: `You cannot start lunch break after ${lunchTimeEnd.toISOString()}`,
					code: "CLOCK_LS_AFTER_TIME"
				});
			}
		}
	}

	const updatedOperations = [
		...(attendance.operation || []),
		{
			id: crypto.randomUUID(),
			type: operationType,
			createdAt: now.toISOString(),
		}
	];

	const updated = await ctx.context.adapter.update({
		model: "attendance",
		where: [
			{
				operator: "eq",
				field: "_id",
				value: (attendance as any).id,
			}
		],
		update: {
			lunchBreakOut: now.toISOString(),
			status: "LUNCH_BREAK_STARTED",
			timesUpdated: (attendance.timesUpdated || 0) + 1,
			operation: updatedOperations
		}
	});

	return ctx.json(updated as Attendance);
})