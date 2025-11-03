import dayjs from "dayjs";
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
	_id: z.string(),
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
	timesUpdated: z.coerce.number(),
	operation: attendanceOperationSchema,
}).strict()

export const getAttendanceQueryValidation = z.object({
	limit: z.coerce
		.number("limit must be a valid number")
		.int("limit must be an integer")
		.min(1, "limit must be at least 1")
		.max(100, "limit cannot exceed 100")
		.optional()
		.default(10),
	offset: z.coerce
		.number("offset must be a valid number")
		.int("offset must be an integer")
		.min(0, "offset must be at least 0")
		.optional()
		.default(0),
	sort: z
		.enum(["asc", "desc"], "sort must be either 'asc' or 'desc'")
		.optional()
		.default("desc"),
	dateRange: z
		.string("dateRange must be a string (JSON format expected)")
		.optional()
		.superRefine((val, ctx) => {
			// If no value provided, it's optional - skip validation
			if (!val) return;

			// Try to parse JSON
			let parsed;
			try {
				parsed = JSON.parse(val);
			} catch (e) {
				ctx.addIssue({
					code: "custom",
					message: `dateRange must be valid JSON. Received: "${val}". Error: ${e instanceof Error ? e.message : 'Invalid JSON'}`,
					path: ["dateRange"],
				});
				return;
			}

			// Check if parsed value is an object
			if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
				ctx.addIssue({
					code: "custom",
					message: `dateRange must be a JSON object with 'start' and 'end' fields. Received: ${JSON.stringify(parsed)}`,
					path: ["dateRange"],
				});
				return;
			}

			// Check for required 'start' field
			if (!parsed.start) {
				ctx.addIssue({
					code: "custom",
					message: "dateRange.start is required but was not provided",
					path: ["dateRange", "start"],
				});
			} else if (typeof parsed.start !== "string") {
				ctx.addIssue({
					code: "custom",
					message: `dateRange.start must be a string. Received: ${typeof parsed.start}`,
					path: ["dateRange", "start"],
				});
			} else if (!dayjs(parsed.start).isValid()) {
				ctx.addIssue({
					code: "custom",
					message: `dateRange.start is not a valid date. Received: "${parsed.start}"`,
					path: ["dateRange", "start"],
				});
			}

			// Check for required 'end' field
			if (!parsed.end) {
				ctx.addIssue({
					code: "custom",
					message: "dateRange.end is required but was not provided",
					path: ["dateRange", "end"],
				});
			} else if (typeof parsed.end !== "string") {
				ctx.addIssue({
					code: "custom",
					message: `dateRange.end must be a string. Received: ${typeof parsed.end}`,
					path: ["dateRange", "end"],
				});
			} else if (!dayjs(parsed.end).isValid()) {
				ctx.addIssue({
					code: "custom",
					message: `dateRange.end is not a valid date. Received: "${parsed.end}"`,
					path: ["dateRange", "end"],
				});
			}

			// Validate date range logic (start should be before or equal to end)
			if (
				parsed.start &&
				parsed.end &&
				dayjs(parsed.start).isValid() &&
				dayjs(parsed.end).isValid()
			) {
				if (dayjs(parsed.start).isAfter(dayjs(parsed.end))) {
					ctx.addIssue({
						code: "custom",
						message: `dateRange.start must be before or equal to dateRange.end. Start: "${parsed.start}", End: "${parsed.end}"`,
						path: ["dateRange"],
					});
				}
			}
		})
		.transform((val) => {
			// If no value, return default
			if (!val) {
				return {
					start: dayjs().startOf("day").toISOString(),
					end: dayjs().endOf("day").toISOString(),
				};
			}

			// Parse and return the validated JSON
			return JSON.parse(val);
		}),
})