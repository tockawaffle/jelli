import { BetterAuthClientPlugin, Prettify } from "better-auth";
import { BetterFetchOption } from "better-auth/react";
import { atom } from "nanostores";
import { z } from "zod";
import { attendancePlugin } from "../../server/attendance";
import { attendanceSchema } from "../../server/attendance/schemas/base";

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

export const getAttendanceQueryValidation = z.object({
	dateInterval: z.object({
		start: z.coerce.date(),
		end: z.coerce.date(),
	}),
	orgId: z.string(),
	limit: z.coerce.number().int().min(1).max(100).optional().default(10),
	offset: z.coerce.number().int().min(0).optional().default(0),
	sort: z.enum(["asc", "desc"]).optional().default("desc"),
	ids: z.array(z.string()).optional(),
})

export const attendanceActionValidation = z.object({
	orgId: z.string(),
	operationType: z.union([z.literal("nfc"), z.literal("webapp"), z.literal("qr")]),
	operationId: z.string(),
})

export const attendanceClientPlugin = () => {
	const $getAttendance = atom(
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
		id: "attendancePlugin",
		$InferServerPlugin: {} as ReturnType<typeof attendancePlugin>,
		getActions: ($fetch) => {
			return {
				getAttendance: async (
					query: z.infer<typeof getAttendanceQueryValidation>,
					fetchOptions?: BetterFetchOption,
				): Promise<Data<z.infer<typeof attendanceSchema>[]>> => {
					const searchParams = new URLSearchParams();
					searchParams.set('dateInterval[start]', query.dateInterval.start.toISOString());
					searchParams.set('dateInterval[end]', query.dateInterval.end.toISOString());
					searchParams.set('orgId', query.orgId);
					if (query.limit !== undefined) searchParams.set('limit', query.limit.toString());
					if (query.offset !== undefined) searchParams.set('offset', query.offset.toString());
					if (query.sort !== undefined) searchParams.set('sort', query.sort);
					if (query.ids) searchParams.set('ids', query.ids.join(','));

					const res = await $fetch("/attendance/get", {
						method: "POST",
						body: query,
						...fetchOptions
					})

					return res as Data<z.infer<typeof attendanceSchema>[]>;
				},
				clockIn: async (data: z.infer<typeof attendanceActionValidation>, fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/attendance/clock-in", {
						method: "POST",
						body: data,
						...fetchOptions
					})

					return res
				},
				clockOut: async (data: z.infer<typeof attendanceActionValidation>, fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/attendance/clock-out", {
						method: "POST",
						body: data,
						...fetchOptions
					})

					return res
				},
				startLunchBreak: async (data: z.infer<typeof attendanceActionValidation>, fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/attendance/lunch-start", {
						method: "POST",
						body: data,
						...fetchOptions
					})

					return res
				},
				endLunchBreak: async (data: z.infer<typeof attendanceActionValidation>, fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/attendance/lunch-end", {
						method: "POST",
						body: data,
						...fetchOptions
					})

					return res
				}
			}
		},
		getAtoms: ($fetch) => {
			return {
				$getAttendance
			}
		},
		pathMethods: {
			"/attendance/get": "POST",
			"/attendance/clock-in": "POST",
			"/attendance/clock-out": "POST",
			"/attendance/lunch-start": "POST",
			"/attendance/lunch-end": "POST"
		},
		atomListeners: [
			{
				matcher(path) {
					return path === "/attendance/get"
				},
				signal: "$getAttendance"
			}
		]
	} satisfies BetterAuthClientPlugin
}
