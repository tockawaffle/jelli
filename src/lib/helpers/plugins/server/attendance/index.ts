import { type BetterAuthPlugin } from "better-auth";
import { APIError, getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { z } from "zod";
import { clockIn, clockLunchStart, getAttendance, getAutoAttendance } from "./endpoints";
import { attendanceSchema } from "./schemas/base";
import { attendanceSchema as attendanceSchemaZod } from "./schemas/zod";

dayjs.extend(utc);
dayjs.extend(timezone);

export type Attendance = z.infer<typeof attendanceSchemaZod>;

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
			getAttendance,
			getAutoAttendance,
			clockIn,
			clockLunchStart,

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