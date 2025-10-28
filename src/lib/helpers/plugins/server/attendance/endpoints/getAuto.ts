import { Where } from "better-auth";
import { APIError, getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint, Member } from "better-auth/plugins";
import { getAutoAttendanceQueryValidation } from "../schemas/zod";

export const getAutoAttendance = createAuthEndpoint("/attendance/get-auto", {
	method: "GET",
	query: getAutoAttendanceQueryValidation,
	use: [sessionMiddleware],
}, async (ctx) => {
	const session = await getSessionFromCtx(ctx);
	if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

	// Access validated query parameters directly from ctx.query.
	const { limit, offset, sort, dateRange } = ctx.query;

	// dateRange is validated and transformed by Zod, with default values if not provided
	const dateInterval = dateRange


	const orgId = session.session.activeOrganizationId as string;
	if (!orgId) throw new APIError("BAD_REQUEST", { message: "You do not have an active organization, please set one." });

	let whereStatements: Where[] = [
		{
			operator: "eq",
			field: "orgId",
			value: orgId,
		},
	];

	// Check the organization and see if the user has enough permissions to access the attendance of the user.
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

	if (!member) throw new APIError("UNAUTHORIZED", { message: "User is not a member of the organization", code: "401A" });

	console.debug(
		"[getAutoAttendance] Member:", member,
		"\n[getAutoAttendance] Organization ID:", orgId,
		"\n[getAutoAttendance] Date Interval:", dateInterval,
		"\n[getAutoAttendance] Limit:", limit,
		"\n[getAutoAttendance] Offset:", offset,
		"\n[getAutoAttendance] Sort:", sort,
		"\n[getAutoAttendance] Where Statements:", whereStatements,
	)

	if (["admin", "manager", "owner"].includes(member.role)) {
		const todayAttendances = await ctx.context.adapter.findMany({
			model: "attendance",
			where: [
				{
					operator: "eq",
					field: "orgId",
					value: orgId,
				},
				{
					operator: "gte",
					field: "date",
					value: dateInterval.start,
				},
				{
					operator: "lte",
					field: "date",
					value: dateInterval.end,
				},
			],
			limit: limit,
			offset: offset
		})

		return ctx.json(todayAttendances);
	} else {
		whereStatements.push(
			{
				operator: "eq",
				field: "userId",
				value: session.user.id,
			},
			{
				operator: "gte",
				field: "date",
				value: dateInterval.start,
			},
			{
				operator: "lte",
				field: "date",
				value: dateInterval.end,
			}
		);
	}

	const attendance = await ctx.context.adapter.findMany({
		model: "attendance",
		where: whereStatements,
		limit: limit,
		offset: offset,
		sortBy: {
			field: "date",
			direction: sort === "asc" ? "asc" : "desc" as "asc" | "desc",
		},
	});

	return ctx.json(attendance);
})