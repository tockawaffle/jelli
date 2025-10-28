import type { UnauthHandler } from "./unauthHandler";

export interface AuditLogsOptions {
	/**
	 * The actions that should be ignored.
	 *
	 * Please, if not using the "mergeDefaultIgnoredActions" option, make sure to include the action "audit-logs" and "get-session" in the list.
	 * Otherwise, the audit logs will be spammed with these actions.
	 * It's your choice though, do what you want.

	 * Actions are case-sensitive, so make sure to match the exact action name.
	 * What are actions? You can have an action from the path of the request.
	 * For example: "/api/auth/email-otp/send-verification-otp" would be "send-verification-otp"
	 * Actions that have more than one path after "/api/auth/" are parsed and joined by a "-"
	 * For example: "/api/auth/sign-in/callback/twitch" would be "callback-twitch" or 
	 * 
	 * 
	 */
	ignoredActions?: string[];
	/**
	 * If true, the default ignored actions will be merged with the ones provided by the user.
	 * 
	 * Default actions that are ignored:
	 * - "get-session"
	 * - "sign-out"
	 * - "list-sessions"
	 * - "delete-user"
	 * - "refresh-token"
	 * - "audit-logs"
	 */
	mergeDefaultIgnoredActions?: boolean;
	/**
	 * A custom severity map to override the default severity map.
	 * 
	 * This is useful if you want to override the default severity for a specific action.
	 * 
	 * @example
	 * {
	 * 	"send-verification-otp": "info"
	 * }
	 */
	customSeverityMap?: Record<string, UnauthHandler["severity"]>;
	/**
	 * If true, the default severity map will be merged with the custom severity map.
	 * Any severity on the custom severity map will override the default severity map.
	 * 
	 * @default true
	 * 
	 * Default severity map:
	 * - "sign-in-email": "warning"
	 * - "sign-in": "warning"
	 * - "sign-out": "info"
	 * - "change-email": "severe"
	 * - "update-user": "info"
	 * - "link-social": "warning"
	 * - "unlink-social": "warning"
	 * - "data-export": "severe"
	 * - "send-verification-email": "info"
	 * - "verify-email": "info"
	 * - "revoke-session": "info"
	 * - "upload-profile": "info"
	 */
	mergeDefaultSeverityMap?: boolean;
	/**
	 * If true, console logs will be enabled for the plugin.
	 * Error logs will not be disabled, even if this is false.
	 * @default false
	 */
	enableLogging?: boolean;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export type Severity = "info" | "warning" | "error" | "severe" | "unknown";

export type LogType = "authentication" | "authorization" | "api" | "unknown";

