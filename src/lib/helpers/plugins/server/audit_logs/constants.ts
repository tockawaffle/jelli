import type { LogType, Severity } from "./types";

/**
 * Default ignored actions for audit logs
 * These actions won't trigger audit log entries when they occur
 */
export const DEFAULT_IGNORED_ACTIONS = [
	"get-session",
	"list-sessions",
	"delete-user",
	"refresh-token",
	"audit-logs",
	"list-accounts",
	"get-user"
] as const;

/**
 * Default severity mapping for actions
 * Determines how critical each action is considered
 */
export const DEFAULT_SEVERITY_MAP: Record<string, Severity> = {
	"sign-in-email": "warning",
	"sign-in": "warning",
	"sign-out": "info",
	"change-email": "severe",
	"update-user": "info",
	"link-social": "warning",
	"unlink-social": "warning",
	"data-export": "severe",
	"send-verification-email": "info",
	"verify-email": "info",
	"revoke-session": "info",
	"upload-profile": "info"
} as const;

/**
 * Default type mapping for actions
 * Categorizes actions by their functional purpose
 */
export const DEFAULT_TYPE_MAP: Record<string, LogType> = {
	"sign-in": "authentication",
	"sign-out": "authentication",
	"change-email": "authentication",
	"update-user": "authentication",
	"data-export": "authorization",
	"api-key": "api",
	"send-verification-otp": "authentication",
	"verify-email": "authentication",
	"revoke-session": "authentication",
	"upload-profile": "authentication",
	"unknown": "unknown"
} as const;

