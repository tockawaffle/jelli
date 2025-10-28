import { DEFAULT_SEVERITY_MAP } from "./constants";
import type { AuditLogsOptions, LogLevel, Severity } from "./types";

/**
 * Parses the action name from the request path
 * @example "/api/auth/sign-in" -> "sign-in"
 * @example "/api/auth/sign-in/callback/twitch" -> "callback-twitch"
 */
export const parseActionFromPath = (path: string): string | undefined => {
	const segments = path.split("/").filter(Boolean);
	if (segments.length < 2) return segments.pop();
	return segments.slice(-2).join("-");
};

/**
 * Gets the IP address from the request context
 */
export const getIpAddress = (ctx: any): string => {
	return ctx.headers?.get("x-forwarded-for") ||
		ctx.headers?.get("x-real-ip") ||
		ctx.headers?.get("x-client-ip") ||
		ctx.headers?.get("cf-connecting-ip") ||
		"unknown";
};

/**
 * Stores an audit log entry in the database
 */
export async function storeLog(
	ctx: any,
	userId: string,
	type: string,
	action: string,
	severity: Severity
): Promise<void> {
	const ipAddress = getIpAddress(ctx);
	const userAgent = ctx.headers?.get("user-agent") || "unknown";

	await ctx.context.adapter.create({
		model: "auditLogs",
		data: {
			userId,
			action,
			timestamp: new Date().toISOString(),
			ipAddress,
			userAgent,
			severity,
			type
		}
	}).catch((e: any) => console.error(`[Audit Logs] Error creating audit log: ${e}`));
}

/**
 * Determines the severity level for a given action
 */
export const getSeverity = (action: string, options: AuditLogsOptions): Severity => {
	// Check custom severity first
	if (options.customSeverityMap?.[action]) {
		return options.customSeverityMap[action];
	}

	// Check default severity if merging is enabled
	if (options.mergeDefaultSeverityMap !== false && DEFAULT_SEVERITY_MAP[action]) {
		return DEFAULT_SEVERITY_MAP[action];
	}

	return "unknown"; // fallback
};

/**
 * Logs a message with the specified level if logging is enabled
 */
export const log = (
	message: string,
	level: LogLevel,
	loggingEnabled: AuditLogsOptions["enableLogging"]
): void => {
	const enabled = loggingEnabled ?? false;
	if (!enabled) return;

	console[level](`[Audit Logs] ${message}`);
};

/**
 * Merges the default ignored actions with user-provided ones
 */
export const getIgnoredActions = (options: AuditLogsOptions, defaultActions: readonly string[]): string[] => {
	return options.mergeDefaultIgnoredActions
		? [...defaultActions, ...(options.ignoredActions || [])]
		: options.ignoredActions || [...defaultActions];
};

