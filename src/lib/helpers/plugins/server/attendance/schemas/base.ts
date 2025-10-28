import type { BetterAuthPlugin } from "better-auth";
import { attendanceOperationSchema, attendanceStatusSchema } from "./zod";

export const attendanceSchema = {
	attendance: {
		fields: {
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
				type: "string",
				required: true,
				defaultValue: null,
			},
			clockIn: {
				type: "string",
				required: true,
				defaultValue: null,
			},
			lunchBreakOut: {
				type: "string",
				required: false,
				defaultValue: null,
			},
			lunchBreakReturn: {
				type: "string",
				required: false,
				defaultValue: null,
			},
			clockOut: {
				type: "string",
				required: false,
				defaultValue: null,
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
				type: "string[]",
				required: true,
				defaultValue: [],
				validator: {
					input: attendanceOperationSchema
				}
			}
		}
	}
} satisfies BetterAuthPlugin["schema"]