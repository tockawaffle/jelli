import { z } from "zod";
import type { AuditLogsOptions } from "./types";
import { log } from "./utils";

/**
 * Creates the audit logs schema for the Better Auth plugin
 * This defines the database schema for storing audit log entries
 */
export const createAuditLogsSchema = (options: AuditLogsOptions) => ({
	auditLogs: {
		fields: {
			userId: {
				type: "string" as const,
				required: true,
				references: {
					model: "user",
					field: "id"
				}
			},
			action: {
				type: "string" as const,
				required: true,
			},
			timestamp: {
				type: "string" as const,
				required: true,
			},
			ipAddress: {
				type: "string" as const,
				required: true,
			},
			userAgent: {
				type: "string" as const,
				required: true,
			},
			severity: {
				type: "string" as const,
				required: true,
				transform: {
					input: (value: any) => {
						const parsed = z.enum(["info", "warning", "error", "severe", "unknown"]).safeParse(value);
						if (parsed.error) {
							log(`Invalid severity value on input: ${value}. Defaulting to "unknown".`, "warn", options.enableLogging);
							return "unknown";
						}
						return parsed.data;
					},
					output: (value: any) => {
						const parsed = z.enum(["info", "warning", "error", "severe", "unknown"]).safeParse(value);
						if (parsed.error) {
							log(`Invalid severity value on output: ${value}. Defaulting to "unknown".`, "warn", options.enableLogging);
							return "unknown";
						}
						return parsed.data;
					}
				}
			},
			type: {
				type: "string" as const,
				required: true,
				transform: {
					input: (value: any) => {
						const parsed = z.enum(["authentication", "authorization", "api", "unknown"]).safeParse(value);
						if (parsed.error) {
							log(`Invalid type value on input: ${value}. Defaulting to "unknown".`, "warn", options.enableLogging);
							return "unknown";
						}
						return parsed.data;
					},
					output: (value: any) => {
						const parsed = z.enum(["authentication", "authorization", "api", "unknown"]).safeParse(value);
						if (parsed.error) {
							log(`Invalid type value on output: ${value}. Defaulting to "unknown".`, "warn", options.enableLogging);
							return "unknown";
						}
						return parsed.data;
					}
				}
			}
		}
	}
});

