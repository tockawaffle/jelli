import { APIError } from "better-auth";
import { getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint, Member, Organization } from "better-auth/plugins";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import type { Attendance } from "..";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export const clockOut = createAuthEndpoint("/attendance/clock-out", {
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
		throw new APIError("BAD_REQUEST", { message: "No clock-in record found for today", code: "CLOCK_OUT_NO_RECORD" });
	}

	if (attendance.status === "CLOCKED_OUT") {
		throw new APIError("BAD_REQUEST", { message: "Already clocked out", code: "CLOCK_OUT_ALREADY" });
	}

	if (attendance.status === "LUNCH_BREAK_STARTED") {
		throw new APIError("BAD_REQUEST", { message: "Cannot clock out while on lunch break. Please return from lunch first.", code: "CLOCK_OUT_ON_LUNCH" });
	}

	// Calculate if user is leaving early by comparing current time with closing time - grace period
	const closingTime = startOfDay.format('YYYY-MM-DD') + ` ${orgMetadata.hours.close}`;
	const closingTimeDate = dayjs(closingTime).tz(orgMetadata.hours.timezone);
	const gracePeriod = orgMetadata.hours.gracePeriod;
	const closingTimeMinusGracePeriod = closingTimeDate.subtract(dayjs.duration(gracePeriod, "minutes"));
	const earlyOut = now.isBefore(closingTimeMinusGracePeriod);

	// Calculate work time
	const clockInTime = dayjs(attendance.clockIn).tz(orgMetadata.hours.timezone);
	const lunchBreakOut = attendance.lunchBreakOut ? dayjs(attendance.lunchBreakOut).tz(orgMetadata.hours.timezone) : null;
	const lunchBreakReturn = attendance.lunchBreakReturn ? dayjs(attendance.lunchBreakReturn).tz(orgMetadata.hours.timezone) : null;

	let totalWorkSeconds = now.diff(clockInTime, "seconds");
	let totalBreakSeconds = attendance.totalBreakSeconds || 0;

	// Calculate lunch break duration
	if (lunchBreakOut && lunchBreakReturn) {
		// Completed lunch break
		totalBreakSeconds = lunchBreakReturn.diff(lunchBreakOut, "seconds");
		totalWorkSeconds -= totalBreakSeconds;
	} else if (lunchBreakOut && !lunchBreakReturn) {
		// This shouldn't happen due to status check above, but handle it for safety
		// Currently on lunch break - calculate break time up to now
		totalBreakSeconds = now.diff(lunchBreakOut, "seconds");
		totalWorkSeconds -= totalBreakSeconds;
	}

	// Update attendance record
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
			clockOut: now.format(),
			status: "CLOCKED_OUT",
			totalWorkSeconds,
			totalBreakSeconds,
			earlyOut,
			timesUpdated: (attendance.timesUpdated || 0) + 1,
			operation: [
				...(attendance.operation || []),
				{
					id: crypto.randomUUID(),
					type: operationType,
					createdAt: now.format(),
				}
			],
		}
	});

	return ctx.json(updated as Attendance);
})