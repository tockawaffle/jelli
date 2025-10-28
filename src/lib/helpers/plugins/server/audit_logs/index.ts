import type { BetterAuthPlugin } from "better-auth";
import { createAuditLogsEndpoints } from "./endpoints";
import { createAfterHooks, createBeforeHooks } from "./hooks";
import { createAuditLogsSchema } from "./schema";
import type { AuditLogsOptions } from "./types";

/**
 * Audit Logs Plugin
 * 
 * It is used to track the actions that are performed by the users and to track the user's activity.
 * Only the user can view their own audit logs.
 *
 * Note that this is really intensive for the database since it creates an audit log for every valid request and also does a lot of queries (to check if the user exists, etc), so be aware of that.
 *
 * I also did not test this throughly, so there might be some bugs. Use with caution and at your own risk.
 *
 * This has a lot of comments because... I'm bored and I like to yap.
 *
 * I tested it with the following setup:
 * - Better Auth v1.3.7
 * - Node v22.15.0
 * - Convex Adapter v0.7.17 (with patches applied)
 * - React v19.1.0
 * - Next.js v15.4.3
 * 
 * And with the following providers:
 * - E-mail
 * - Twitch
 * - E-mail OTP
 *
 * Anything else should work, but I did not test it and do not have any plans to do so.
 * Most likely there are better ways to do this, but this works for me and is easy to maintain.
 */
export const auditLogsPlugin = (options: AuditLogsOptions = {
	enableLogging: false,
	mergeDefaultIgnoredActions: true,
	mergeDefaultSeverityMap: true,
	customSeverityMap: {},
	ignoredActions: [],
}) =>
(
	{
		id: "auditLogsPlugin",
		schema: createAuditLogsSchema(options),
		hooks: {
			before: createBeforeHooks(),
			after: createAfterHooks(options)
		},
		endpoints: createAuditLogsEndpoints()
	} satisfies BetterAuthPlugin
);

// Re-export types and constants for external use
export { DEFAULT_IGNORED_ACTIONS, DEFAULT_SEVERITY_MAP, DEFAULT_TYPE_MAP } from "./constants";
export type { AuditLogsOptions, LogLevel, LogType, Severity } from "./types";
export type { UnauthHandler } from "./unauthHandler";

