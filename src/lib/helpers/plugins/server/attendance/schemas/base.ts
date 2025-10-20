import type { BetterAuthPlugin } from "better-auth";
import { attendanceOperationSchema, attendanceStatusSchema } from "./zod";

export const attendanceSchema = {
	attendance: {
		fields: {
			_id: {
				type: "string",
				required: true,
				unique: true,
				defaultValue: () => {
					return crypto.randomUUID()
				}
			},
			userId: {
				type: "string",
				required: true,
				references: {
					model: "user",
					field: "_id"
				}
			},
			orgId: {
				type: "string",
				required: true,
				references: {
					model: "organization",
					field: "_id"
				}
			},
			role: {
				type: "string",
				required: true,
			},
			date: {
				type: "date",
				required: true,
			},
			clockIn: {
				type: "date",
				required: true,
			},
			lunchBreakOut: {
				type: "date",
				required: false,
			},
			lunchBreakReturn: {
				type: "date",
				required: false,
			},
			clockOut: {
				type: "date",
				required: false,
			},
			status: {
				type: "string",
				required: true,
				validator: {
					input: attendanceStatusSchema
				}
			},
			totalWorkSeconds: {
				type: "number",
				required: true,
				defaultValue: 0,
			},
			totalBreakSeconds: {
				type: "number",
				required: true,
				defaultValue: 0,
			},
			wasLate: {
				type: "boolean",
				required: true,
				defaultValue: false,
			},
			earlyOut: {
				type: "boolean",
				required: true,
				defaultValue: false,
			},
			timesUpdated: {
				type: "number",
				required: true,
				defaultValue: 0,
			},
			operation: {
				type: "json",
				required: true,
				defaultValue: [],
				validator: {
					input: attendanceOperationSchema
				}
			}
		}
	}
} satisfies BetterAuthPlugin["schema"]