import { z } from "zod";

/**
 * The operation ids if user clocked in/out using NFC or QR code. This is used to track the operations if using NFC or QR code. This will match what is stored in the local app of the registered device. Prevents tampering with the attendance records. If using webapp, the id will be a hash of the user's IP address and the current date.
 */
export const attendanceOperationSchema = z.array(
	z.object({
		id: z.string(),
		type: z.union([z.literal("nfc"), z.literal("webapp"), z.literal("qr")]),
		createdAt: z.string(),
	})
)

export const attendanceStatusSchema = z.enum([
	"TBR",
	"CLOCKED_IN",
	"LUNCH_BREAK_STARTED",
	"LUNCH_BREAK_ENDED",
	"CLOCKED_OUT"
])

export const attendanceSchema = z.object({
	userId: z.string(),
	orgId: z.string(),
	role: z.string(),
	date: z.string(),
	clockIn: z.string(),
	lunchBreakOut: z.string().optional(),
	lunchBreakReturn: z.string().optional(),
	clockOut: z.string().optional(),
	status: attendanceStatusSchema,
	totalWorkSeconds: z.coerce.number(),
	totalBreakSeconds: z.coerce.number(),
	wasLate: z.boolean(),
	earlyOut: z.boolean(),
	timesUpdated: z.number(),
	operation: attendanceOperationSchema,
}).strict()