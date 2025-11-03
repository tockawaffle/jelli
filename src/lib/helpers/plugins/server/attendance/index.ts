import { type BetterAuthPlugin } from "better-auth";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { z } from "zod";
import { clockIn, clockOut, clockLunchReturn, clockLunchStart, getAttendance } from "./endpoints";
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
			clockIn,
			clockOut,
			clockLunchStart,
			clockLunchReturn,
		}
	} satisfies BetterAuthPlugin
);