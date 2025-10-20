import { Where, type BetterAuthPlugin } from "better-auth";
import { APIError, getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint, Member } from "better-auth/plugins";
import { z } from "zod";
import { attendanceSchema } from "./schemas/base";

interface Attendance {
	_id: string;
	userId: string;
	orgId: string;
	role: string;
	date: Date;
	clockIn: Date;
	lunchBreakOut?: Date;
	lunchBreakReturn?: Date;
	clockOut?: Date;
	status: "TBR" | "CLOCKED_IN" | "LUNCH_BREAK_STARTED" | "LUNCH_BREAK_ENDED" | "CLOCKED_OUT";
	totalWorkSeconds: number;
	totalBreakSeconds: number;
	wasLate: boolean;
	earlyOut: boolean;
	timesUpdated: number;
	operation: Array<{
		id: string;
		type: "nfc" | "webapp" | "qr";
		createdAt: Date;
	}>;
}

/**
 * Attendance Plugin
 * 
 * It is used to track the attendance of the users.
 */
export const attendancePlugin = () =>
(
	{
		id: "attendancePlugin",
		schema: attendanceSchema,
		endpoints: {
			getAttendance: createAuthEndpoint("/attendance/get", {
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
			}),
			clockIn: createAuthEndpoint("/attendance/clock-in", {
				method: "POST",
				use: [sessionMiddleware],
				body: z.object({
					orgId: z.string(),
					operationType: z.union([z.literal("nfc"), z.literal("webapp"), z.literal("qr")]),
					operationId: z.string(),
				})
			}, async (ctx) => {
				const session = await getSessionFromCtx(ctx);
				if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

				const { orgId, operationType, operationId } = ctx.body;

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

				const now = new Date();
				const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
							value: startOfDay.toISOString(),
						},
					]
				});

				if (existingAttendance) {
					throw new APIError("BAD_REQUEST", { message: "Already clocked in for today" });
				}

				// Create new attendance record
				const attendance = await ctx.context.adapter.create({
					model: "attendance",
					data: {
						userId: session.user.id,
						orgId,
						role: member.role,
						date: startOfDay.toISOString(),
						clockIn: now.toISOString(),
						status: "CLOCKED_IN",
						operation: [{
							id: operationId,
							type: operationType,
							createdAt: now.toISOString(),
						}],
					}
				});

				return ctx.json(attendance);
			}),
			clockOut: createAuthEndpoint("/attendance/clock-out", {
				method: "POST",
				use: [sessionMiddleware],
				body: z.object({
					orgId: z.string(),
					operationType: z.union([z.literal("nfc"), z.literal("webapp"), z.literal("qr")]),
					operationId: z.string(),
				})
			}, async (ctx) => {
				const session = await getSessionFromCtx(ctx);
				if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

				const { orgId, operationType, operationId } = ctx.body;

				const now = new Date();
				const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
				const clockInTime = new Date(attendance.clockIn).getTime();
				const lunchBreakOut = attendance.lunchBreakOut ? new Date(attendance.lunchBreakOut).getTime() : 0;
				const lunchBreakReturn = attendance.lunchBreakReturn ? new Date(attendance.lunchBreakReturn).getTime() : 0;

				let totalWorkSeconds = Math.floor((now.getTime() - clockInTime) / 1000);
				let totalBreakSeconds = attendance.totalBreakSeconds || 0;

				if (lunchBreakOut && lunchBreakReturn) {
					totalBreakSeconds = Math.floor((lunchBreakReturn - lunchBreakOut) / 1000);
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
								id: operationId,
								type: operationType,
								createdAt: now.toISOString(),
							}
						],
					}
				});

				return ctx.json(updated as Attendance);
			}),
			startLunchBreak: createAuthEndpoint("/attendance/lunch-start", {
				method: "POST",
				use: [sessionMiddleware],
				body: z.object({
					orgId: z.string(),
					operationType: z.union([z.literal("nfc"), z.literal("webapp"), z.literal("qr")]),
					operationId: z.string(),
				})
			}, async (ctx) => {
				const session = await getSessionFromCtx(ctx);
				if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

				const { orgId, operationType, operationId } = ctx.body;

				const now = new Date();
				const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

				if (attendance.status !== "CLOCKED_IN") {
					throw new APIError("BAD_REQUEST", { message: "Must be clocked in to start lunch break" });
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
						lunchBreakOut: now.toISOString(),
						status: "LUNCH_BREAK_STARTED",
						timesUpdated: (attendance.timesUpdated || 0) + 1,
						operation: [
							...(attendance.operation || []),
							{
								id: operationId,
								type: operationType,
								createdAt: now.toISOString(),
							}
						],
					}
				});

				return ctx.json(updated as Attendance);
			}),
			endLunchBreak: createAuthEndpoint("/attendance/lunch-end", {
				method: "POST",
				use: [sessionMiddleware],
				body: z.object({
					orgId: z.string(),
					operationType: z.union([z.literal("nfc"), z.literal("webapp"), z.literal("qr")]),
					operationId: z.string(),
				})
			}, async (ctx) => {
				const session = await getSessionFromCtx(ctx);
				if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

				const { orgId, operationType, operationId } = ctx.body;

				const now = new Date();
				const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

				if (attendance.status !== "LUNCH_BREAK_STARTED") {
					throw new APIError("BAD_REQUEST", { message: "Must be on lunch break to end it" });
				}

				// Calculate break time
				const lunchBreakOut = new Date(attendance.lunchBreakOut!).getTime();
				const totalBreakSeconds = Math.floor((now.getTime() - lunchBreakOut) / 1000);

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
						lunchBreakReturn: now.toISOString(),
						status: "LUNCH_BREAK_ENDED",
						totalBreakSeconds,
						timesUpdated: (attendance.timesUpdated || 0) + 1,
						operation: [
							...(attendance.operation || []),
							{
								id: operationId,
								type: operationType,
								createdAt: now.toISOString(),
							}
						],
					}
				});

				return ctx.json(updated as Attendance);
			}),
		}
	} satisfies BetterAuthPlugin
);