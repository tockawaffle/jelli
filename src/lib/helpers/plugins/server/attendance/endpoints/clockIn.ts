import type { Attendance } from "@/lib/helpers/plugins/server/attendance";
import { APIError } from "better-auth";
import { getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint, Member, Organization } from "better-auth/plugins";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export const clockIn = createAuthEndpoint("/attendance/clock-in", {
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

	// Check if attendance record already exists for today
	const existingAttendance = await ctx.context.adapter.findOne<Attendance>({
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
				value: startOfDay,
			},
		]
	}) as Attendance | null;

	if (existingAttendance && existingAttendance.status === "CLOCKED_IN" && existingAttendance.clockIn) {
		// Instead of plainly returning an error, return also the next status that would be applied to the attendance record.
		throw new APIError("BAD_REQUEST", {
			message: "Already clocked in for today", code: "400A", data: {
				nextStatus: "LUNCH_BREAK_STARTED",
			}
		});
	}

	// Calculate if user is late to work by comparing the current time with the opening time + grace period
	const openingTime = dayjs(startOfDay).tz(orgMetadata.hours.timezone).format('YYYY-MM-DD') + ` ${orgMetadata.hours.open}`;
	const openingTimeDate = dayjs(openingTime).tz(orgMetadata.hours.timezone).toDate();
	const gracePeriod = dayjs.duration(orgMetadata.hours.gracePeriod, "minutes");
	const openingTimePlusGracePeriod = dayjs(openingTimeDate).add(gracePeriod).toDate();
	const lateToWork = now > openingTimePlusGracePeriod;

	// Create new attendance record
	const attendance = await ctx.context.adapter.create<Omit<Attendance, "_id">>({
		model: "attendance",
		data: {
			userId: session.user.id,
			orgId,
			role: member.role,
			date: startOfDay.toISOString(),
			clockIn: now.toISOString(),
			status: "CLOCKED_IN",
			operation: [{
				id: crypto.randomUUID().toString(),
				type: operationType,
				createdAt: now.toISOString(),
			}],
			wasLate: lateToWork,
			totalWorkSeconds: 0,
			totalBreakSeconds: 0,
			earlyOut: false,
			timesUpdated: 0,
		}
	});

	return ctx.json(attendance);
})