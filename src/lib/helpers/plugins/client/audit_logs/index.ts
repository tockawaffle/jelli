import { BetterAuthClientPlugin, Prettify } from "better-auth";
import { useAuthQuery } from "better-auth/client";
import { BetterFetchOption } from "better-auth/react";
import { atom } from "nanostores";
import { z } from "zod";
import type { auditLogsPlugin } from "../../server/audit_logs";

export type Data<T> = {
	data: T;
	error: null;
};

export type Error$1<E> = {
	data: null;
	error: Prettify<(E extends Record<string, any> ? E : {
		message?: string;
	}) & {
		status: number;
		statusText: string;
	}>;
};

export const queryValidation = z.object({
	limit: z.number().optional(),
	offset: z.number().optional(),
	sort: z.enum(["asc", "desc"]).optional(),
	actionId: z.string().optional(),
	type: z.enum(["authentication", "authorization", "api", "unknown"]).optional(),
	severity: z.enum(["info", "warning", "error", "severe"]).optional(),
})

export const auditLogsClientPlugin = () => {
	const $listAuditLogs = atom(
		{
			data: {
				data: [],
			},
			error: null,
			isPending: false,
			isRefetching: false,
			refetch: () => { }
		}
	)
	return {
		id: "auditLogs",
		$InferServerPlugin: {} as ReturnType<typeof auditLogsPlugin>,
		getActions: ($fetch) => {
			return {
				getUserAuditLogs: async (data?: z.infer<typeof queryValidation>, fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/audit-logs", {
						method: "GET",
						query: {
							limit: data?.limit ?? 10,
							offset: data?.offset ?? 0,
							sort: data?.sort ?? "desc",
							actionId: data?.actionId,
							type: data?.type,
							severity: data?.severity
						},
						output: z.object({
							data: z.array(z.object({
								userId: z.string(),
								action: z.string(),
								timestamp: z.coerce.date(),
								ipAddress: z.string(),
								userAgent: z.string(),
								severity: z.enum(["info", "warning", "error", "severe"]),
								type: z.enum(["authentication", "authorization", "api", "unknown"]),
								id: z.string(),
							})),
							total: z.coerce.number()
						}),
						...fetchOptions
					})

					return res as Data<{
						data: {
							id: string,
							actionId: string,
							userId: string,
							action: string,
							timestamp: string,
							ipAddress: string,
							userAgent: string,
							severity: string,
							type: string
						}[],
						total: number
					}> | Error$1<{
						message?: string;
					}>
				}
			}
		},
		getAtoms: ($fetch) => {
			const listAuditLogs = useAuthQuery<{
				data: {
					id: string;
					actionId: string;
					userId: string;
					action: string;
					timestamp: Date;
					ipAddress: string;
					userAgent: string;
					severity: "info" | "warning" | "error" | "severe";
					type: "authentication" | "authorization" | "api" | "unknown";
				}[];
				total: number;
			}>(
				$listAuditLogs,
				"/audit-logs",
				$fetch,
				{
					method: "GET",
					query: {
						limit: 10,
						offset: 0,
						sort: "desc",
					},
					output: z.object({
						data: z.array(z.object({
							id: z.string(),
							actionId: z.string(),
							userId: z.string(),
							action: z.string(),
							timestamp: z.coerce.date(),
							ipAddress: z.string(),
							userAgent: z.string(),
							severity: z.enum(["info", "warning", "error", "severe"]),
							type: z.enum(["authentication", "authorization", "api", "unknown"])
						})),
						total: z.coerce.number()
					}),
				}
			)

			return {
				$listAuditLogs,
				listAuditLogs
			}
		},
		pathMethods: {
			"/audit-logs": "GET"
		},
		atomListeners: [
			{
				matcher(path) {
					return path === "/audit-logs"
				},
				signal: "$listAuditLogs"
			}
		]
	} satisfies BetterAuthClientPlugin
}
