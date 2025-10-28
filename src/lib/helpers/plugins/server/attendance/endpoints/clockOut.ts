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

	const now = dayjs().tz(orgMetadata.hours.timezone).toDate();
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
		throw new APIError("BAD_REQUEST", { message: "No clock-in record found for today" });
	}

	if (attendance.status === "CLOCKED_OUT") {
		throw new APIError("BAD_REQUEST", { message: "Already clocked out" });
	}

	// Calculate work time
	const clockInTime = dayjs(attendance.clockIn).tz(orgMetadata.hours.timezone).toDate();
	const lunchBreakOut = attendance.lunchBreakOut ? dayjs(attendance.lunchBreakOut).tz(orgMetadata.hours.timezone).toDate() : null;
	const lunchBreakReturn = attendance.lunchBreakReturn ? dayjs(attendance.lunchBreakReturn).tz(orgMetadata.hours.timezone).toDate() : null;

	let totalWorkSeconds = dayjs(now).tz(orgMetadata.hours.timezone).diff(dayjs(clockInTime).tz(orgMetadata.hours.timezone), "seconds");
	let totalBreakSeconds = attendance.totalBreakSeconds || 0;

	if (lunchBreakOut && lunchBreakReturn) {
		totalBreakSeconds = dayjs(lunchBreakReturn).tz(orgMetadata.hours.timezone).diff(dayjs(lunchBreakOut).tz(orgMetadata.hours.timezone), "seconds");
		totalWorkSeconds -= totalBreakSeconds;
	}

	// Update attendance record
	const updated = await ctx.context.adapter.update({
		model: "attendance",
		where: [
			{
				operator: "eq",
				field: "_id",
				value: attendance._id,
			}
		],
		update: {
			clockOut: now.toISOString(),
			status: "CLOCKED_OUT",
			totalWorkSeconds,
			totalBreakSeconds,
			timesUpdated: (attendance.timesUpdated || 0) + 1,
			operation: [
				...(attendance.operation || []),
				{
					id: crypto.randomUUID(),
					type: operationType,
					createdAt: now.toISOString(),
				}
			],
		}
	});

	return ctx.json(updated as Attendance);
})