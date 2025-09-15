import { Where, type BetterAuthPlugin } from "better-auth";
import { APIError, getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint, createAuthMiddleware } from "better-auth/plugins";
import { z } from "zod";
import { UnauthHandler, unauthHandlers } from "./unauthHandler";

interface AuditLogsOptions {
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
}

// Function to parse the action from the request path
const parseActionFromPath = (path: string): string | undefined => {
	const segments = path.split("/").filter(Boolean);
	if (segments.length < 2) return segments.pop();
	return segments.slice(-2).join("-");
};

async function storeLog(ctx: any, userId: string, type: string, action: string, severity: UnauthHandler["severity"]) {
	const ipAddress = () => {
		return ctx.headers?.get("x-forwarded-for") ||
			ctx.headers?.get("x-real-ip") ||
			ctx.headers?.get("x-client-ip") ||
			ctx.headers?.get("cf-connecting-ip") ||
			"unknown";
	}
	const userAgent = ctx.headers?.get("user-agent") || "unknown";
	await ctx.context.adapter.create({
		model: "auditLogs",
		data: {
			userId,
			action,
			timestamp: new Date().toISOString(),
			ipAddress: ipAddress(),
			userAgent,
			severity,
			type
		}
	}).catch((e: any) => console.error(`[Audit Logs] Error creating audit log: ${e}`));
}

const getSeverity = (action: string, options: AuditLogsOptions): UnauthHandler["severity"] => {
	// Check custom severity first
	if (options.customSeverityMap?.[action]) {
		return options.customSeverityMap[action];
	}

	// Check default severity if merging is enabled
	if (options.mergeDefaultSeverityMap !== false && DEFAULT_SEVERITY_MAP[action]) {
		return DEFAULT_SEVERITY_MAP[action];
	}

	return "error"; // fallback
};

// default ignored actions for audit logs
const DEFAULT_IGNORED_ACTIONS = [
	"get-session",
	"list-sessions",
	"delete-user",
	"refresh-token",
	"audit-logs",
	"list-accounts",
	"get-user"
];

// severity mapping for actions
const DEFAULT_SEVERITY_MAP: Record<string, UnauthHandler["severity"]> = {
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
};

const DEFAULT_TYPE_MAP: Record<string, string> = {
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
};

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
export const auditLogsPlugin = (options: AuditLogsOptions = {}) =>
(
	{
		id: "auditLogsPlugin",
		schema: {
			auditLogs: {
				fields: {
					userId: {
						type: "string",
						required: true,
						references: {
							model: "user",
							field: "id"
						}
					},
					action: {
						type: "string",
						required: true,
					},
					timestamp: {
						type: "string",
						required: true,
					},
					ipAddress: {
						type: "string",
						required: true,
					},
					userAgent: {
						type: "string",
						required: true,
					},
					severity: {
						type: "string",
						required: true,
						transform: {
							input: (value) => {
								const parsed = z.enum(["info", "warning", "error", "severe"]).safeParse(value);
								if (parsed.error) {
									console.warn(`[Audit Logs] Invalid severity value on input: ${value}. Defaulting to "error".`);
									return "error";
								}

								return parsed.data;
							},
							output: (value) => {
								const parsed = z.enum(["info", "warning", "error", "severe"]).safeParse(value);
								if (parsed.error) {
									console.warn(`[Audit Logs] Invalid severity value on output: ${value}. Defaulting to "error".`);
									return "error";
								}

								return parsed.data;
							}
						}
					},
					type: {
						type: "string",
						required: true,
						transform: {
							input: (value) => {
								const parsed = z.enum(["authentication", "authorization", "api", "unknown"]).safeParse(value);
								if (parsed.error) {
									console.warn(`[Audit Logs] Invalid type value on input: ${value}. Defaulting to "unknown".`);
									return "unknown";
								}

								return parsed.data;
							},
							output: (value) => {
								const parsed = z.enum(["authentication", "authorization", "api", "unknown"]).safeParse(value);
								if (parsed.error) {
									console.warn(`[Audit Logs] Invalid type value on output: ${value}. Defaulting to "unknown".`);
									return "unknown";
								}

								return parsed.data;
							}
						}
					}
				}
			}
		},
		hooks: {
			before: [
				{
					matcher: (context) => {
						return context.path === "/delete-user"
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
						})
					})
				}
			],
			after: [
				{
					matcher: (context) => {
						return context.context.session !== null;
					},
					handler: createAuthMiddleware(async (ctx) => {
						try {
							// Sanity check to make sure the session is not null.
							const session = ctx.context.session;
							if (!session) return;

							const user = session.user;

							// Create the list of ignored actions by merging the default (if enabled) ignored actions with the ones provided by the user.
							const ignoredActions = options.mergeDefaultIgnoredActions ? [
								...DEFAULT_IGNORED_ACTIONS,
								...(options.ignoredActions || [])
							] : options.ignoredActions || DEFAULT_IGNORED_ACTIONS;

							// Parse the action from the request path.
							const action = parseActionFromPath(ctx.path);

							if (!action) return;
							else if (ignoredActions.includes(action)) return;

							const severity = getSeverity(action, options);
							await storeLog(ctx, user.id, DEFAULT_TYPE_MAP[action], action, severity);

						} catch (error) {
							console.error(`[Audit Logs] Error creating audit log: ${error}`)
							// Nothing we can do here, returning an error will break the request which is not what we want.
							// I might create a error audit log for administrative purposes with minimal information, but that's about it for now.
						}
					})
				},
				{
					matcher: (context) => {
						return context.context.session === null;
					},
					// This handles non-auth endpoints, such as "/api/auth/email-otp/send-verification-otp"
					// Why separate this from the first handler? Because I think it's more readable and easier to maintain since I woudn't have to check if the user is authenticated or not.
					handler: createAuthMiddleware(async (ctx) => {
						try {
							const action = parseActionFromPath(ctx.path);
							if (!action) {
								console.warn(`[Audit Logs] No action found for path: ${ctx.path}`);
								return;
							}

							// TODO: Make a default actions list to ensure that this doesn't keep spamming the logs.

							const severity = getSeverity(action, options);

							const descriptor = unauthHandlers.find((h) => h.test(action));
							if (!descriptor) {
								console.warn(`[Audit Logs] No descriptor found for action: ${action}`);
								return;
							}

							const userId = await descriptor.getUserId(ctx);
							if (!userId) {
								console.warn(`[Audit Logs] No user ID found for action: ${action}`);
								return;
							}
							const finalAction = descriptor.formatAction
								? descriptor.formatAction(action, ctx)
								: action;

							await storeLog(ctx, userId, DEFAULT_TYPE_MAP[action], finalAction, severity);
						} catch (error) {
							console.error(`[Audit Logs] Error creating audit log: ${error}`)
							// Nothing we can do here, returning an error will break the request which is not what we want.
							// I might create a error audit log for administrative purposes with minimal information, but that's about it for now.
						}
					})
				}
			]
		},
		endpoints: {
			getAuditLogs: createAuthEndpoint("/audit-logs", {
				metadata: {
					openapi: {
						description: "Get audit logs for the current authenticated user.",
						responses: {
							200: {
								description: "Audit logs retrieved successfully.",
								content: {
									"application/json": {
										schema: {
											type: "object",
											properties: {
												data: {
													type: "array",
													items: {
														type: "object",
														properties: {
															id: { type: "string" },
															userId: { type: "string" },
															action: { type: "string" },
															timestamp: { type: "string" },
															ipAddress: { type: "string" },
															userAgent: { type: "string" },
															severity: { type: "string", enum: ["info", "warning", "error", "severe"] },
															type: { type: "string", enum: ["authentication", "authorization", "api", "unknown"] }
														}
													}
												},
												total: { type: "number" }
											}
										}
									}
								}
							},
							401: {
								description: "Unauthorized",
								content: {
									"application/json": {
										schema: { type: "object", properties: { message: { type: "string" } } }
									}
								}
							}
						}
					}
				},
				method: "GET",
				use: [sessionMiddleware],
				query: z.object({
					limit: z.coerce.number().int().min(1).max(100).optional().default(10),
					offset: z.coerce.number().int().min(0).optional().default(0),
					sort: z.enum(["asc", "desc"]).optional().default("desc"),
					actionId: z.string().optional(),
					type: z.enum(["authentication", "authorization", "api", "unknown"]).optional(),
					severity: z.enum(["info", "warning", "error", "severe"]).optional()
				}).optional().default({
					limit: 10,
					offset: 0,
					sort: "desc",
				})
			}, async (ctx) => {
				const session = await getSessionFromCtx(ctx);
				if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

				// Access validated query parameters directly from ctx.query.
				const { limit, offset, sort, actionId, type, severity } = ctx.query;

				const whereStatements: Where[] = [
					{
						operator: "eq",
						field: "userId",
						value: session.user.id
					}
				]

				if (actionId) {
					// When filtering by specific action, type and severity are deterministic
					whereStatements.push({
						operator: "eq",
						field: "action",
						value: actionId
					})
				} else {
					// Only use type/severity filters when not filtering by specific action
					if (type) {
						whereStatements.push({
							operator: "eq",
							field: "type",
							value: type
						})
					}

					if (severity) {
						whereStatements.push({
							operator: "eq",
							field: "severity",
							value: severity
						})
					}
				}

				const [auditLogs, totalCount] = await Promise.all([
					ctx.context.adapter.findMany({
						model: "auditLogs",
						where: whereStatements,
						limit: limit,
						offset: offset,
						sortBy: {
							field: "timestamp",
							direction: sort
						}
					}),
					ctx.context.adapter.count({
						model: "auditLogs",
						where: whereStatements,
					})
				]);

				return ctx.json({
					data: auditLogs,
					total: totalCount,
				})
			}),
			rateLimitTest: createAuthEndpoint("/rate-limit-test", {
				method: "GET",
			}, async (ctx) => {
				return ctx.json({ message: "Hello, world!" });
			})
		}
	} satisfies BetterAuthPlugin
);