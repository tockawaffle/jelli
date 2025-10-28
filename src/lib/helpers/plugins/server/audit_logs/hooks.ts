import { APIError, getSessionFromCtx } from "better-auth/api";
import { createAuthMiddleware } from "better-auth/plugins";
import { DEFAULT_IGNORED_ACTIONS, DEFAULT_TYPE_MAP } from "./constants";
import type { AuditLogsOptions } from "./types";
import { unauthHandlers } from "./unauthHandler";
import { getIgnoredActions, getSeverity, log, parseActionFromPath, storeLog } from "./utils";

/**
 * Creates the "before" hooks for the audit logs plugin
 */
export const createBeforeHooks = () => [
	{
		matcher: (context: any) => {
			return context.path === "/delete-user";
		},
		handler: createAuthMiddleware(async (ctx) => {
			// Delete all audit logs before processing the request
			const session = await getSessionFromCtx(ctx);
			if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

			await ctx.context.adapter.deleteMany({
				model: "auditLogs",
				where: [
					{
						operator: "eq",
						field: "userId",
						value: session.user.id
					}
				]
			});
		})
	}
];

/**
 * Creates the "after" hooks for the audit logs plugin
 * These hooks handle audit log creation for both authenticated and unauthenticated requests
 */
export const createAfterHooks = (options: AuditLogsOptions) => [
	{
		matcher: (context: any) => {
			return context.context.session !== null;
		},
		handler: createAuthMiddleware(async (ctx) => {
			try {
				// Sanity check to make sure the session is not null.
				const session = ctx.context.session;
				if (!session) return;

				const user = session.user;

				// Create the list of ignored actions by merging the default (if enabled) ignored actions with the ones provided by the user.
				const ignoredActions = getIgnoredActions(options, DEFAULT_IGNORED_ACTIONS);

				// Parse the action from the request path.
				const action = parseActionFromPath(ctx.path);

				if (!action) return;
				else if (ignoredActions.includes(action)) return;

				const severity = getSeverity(action, options);
				await storeLog(ctx, user.id, DEFAULT_TYPE_MAP[action], action, severity);

			} catch (error) {
				console.error(`[Audit Logs] Error creating audit log: ${error}`);
				// Nothing we can do here, returning an error will break the request which is not what we want.
				// I might create a error audit log for administrative purposes with minimal information, but that's about it for now.
			}
		})
	},
	{
		matcher: (context: any) => {
			return context.context.session === null;
		},
		// This handles non-auth endpoints, such as "/api/auth/email-otp/send-verification-otp"
		// Why separate this from the first handler? Because I think it's more readable and easier to maintain since I wouldn't have to check if the user is authenticated or not.
		handler: createAuthMiddleware(async (ctx) => {
			try {
				const action = parseActionFromPath(ctx.path);
				if (!action) {
					log(`No action found for path: ${ctx.path}`, "warn", options.enableLogging);
					return;
				}

				// TODO: Make a default actions list to ensure that this doesn't keep spamming the logs.

				const severity = getSeverity(action, options);

				const descriptor = unauthHandlers.find((h) => h.test(action));
				if (!descriptor) {
					log(`No descriptor found for action: ${action}`, "warn", options.enableLogging);
					return;
				}

				const userId = await descriptor.getUserId(ctx);
				if (!userId) {
					log(`No user ID found for action: ${action}`, "warn", options.enableLogging);
					return;
				}
				const finalAction = descriptor.formatAction
					? descriptor.formatAction(action, ctx)
					: action;

				await storeLog(ctx, userId, DEFAULT_TYPE_MAP[action], finalAction, severity);
			} catch (error) {
				console.error(`[Audit Logs] Error creating audit log: ${error}`);
				// Nothing we can do here, returning an error will break the request which is not what we want.
				// I might create a error audit log for administrative purposes with minimal information, but that's about it for now.
			}
		})
	}
];

