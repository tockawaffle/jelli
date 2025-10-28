import { Where } from "better-auth";
import { APIError, getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint, Member } from "better-auth/plugins";
import z from "zod";

export const getAttendance = createAuthEndpoint("/attendance/get", {
	method: "POST",
	use: [sessionMiddleware],
	body: z.object({
		dateInterval: z.object({
			start: z.coerce.date(),
			end: z.coerce.date(),
		}),
		orgId: z.string(),
		limit: z.coerce.number().int().min(1).max(100).optional().default(10),
		offset: z.coerce.number().int().min(0).optional().default(0),
		sort: z.enum(["asc", "desc"]).optional().default("desc"),
		ids: z.array(z.string()).optional(),
	})
}, async (ctx) => {
	const session = await getSessionFromCtx(ctx);
	if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

	// Access validated query parameters directly from ctx.query.
	const { dateInterval, orgId, limit, offset, sort, ids } = ctx.body;

	let whereStatements: Where[] = [
		{
			operator: "eq",
			field: "orgId",
			value: orgId,
		},
	];

	if (ids) {
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

		if (!["admin", "manager", "owner"].includes(member.role)) {
			throw new APIError("UNAUTHORIZED", { message: "You are not authorized to access the attendance of this user", code: "401B" });
		}

		// This method is limited to the current day only.
		// Note: date field is stored as a string in Convex, so we need to convert Date objects to ISO strings
		const todayAttendances = await ctx.context.adapter.findMany({
			model: "attendance",
			where: [
				{
					operator: "eq",
					field: "orgId",
					value: orgId,
				},
				{
					operator: "in",
					field: "userId",
					value: ids,
				},
				{
					operator: "gte",
					field: "date",
					value: dateInterval.start.toISOString(),
				},
				{
					operator: "lte",
					field: "date",
					value: dateInterval.end.toISOString(),
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
				value: dateInterval.start.toISOString(),
			},
			{
				operator: "lte",
				field: "date",
				value: dateInterval.end.toISOString(),
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