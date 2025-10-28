import { BetterAuthPlugin, Where } from "better-auth";
import { APIError, getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";

/**
 * Query schema for the getAuditLogs endpoint
 */
const getAuditLogsQuerySchema = z.object({
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
});

/**
 * OpenAPI metadata for the getAuditLogs endpoint
 */
const getAuditLogsMetadata = {
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

/**
 * Creates the endpoints for the audit logs plugin
 */
export const createAuditLogsEndpoints = () => ({
	getAuditLogs: createAuthEndpoint("/audit-logs", {
		method: "GET",
		use: [sessionMiddleware],
		query: getAuditLogsQuerySchema
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
		];

		if (actionId) {
			// When filtering by specific action, type and severity are deterministic
			whereStatements.push({
				operator: "eq",
				field: "action",
				value: actionId
			});
		} else {
			// Only use type/severity filters when not filtering by specific action
			if (type) {
				whereStatements.push({
					operator: "eq",
					field: "type",
					value: type
				});
			}

			if (severity) {
				whereStatements.push({
					operator: "eq",
					field: "severity",
					value: severity
				});
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
		});
	}),
}) satisfies BetterAuthPlugin["endpoints"];

