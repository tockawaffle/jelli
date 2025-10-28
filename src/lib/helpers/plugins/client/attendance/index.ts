import { BetterAuthClientPlugin, Prettify } from "better-auth";
import { useAuthQuery } from "better-auth/client";
import { BetterFetchError, BetterFetchOption } from "better-auth/react";
import dayjs from "dayjs";
import { atom } from "nanostores";
import { z } from "zod";
import { Attendance, attendancePlugin } from "../../server/attendance";
import { attendanceSchema } from "../../server/attendance/schemas/base";
import { getAutoAttendanceQueryValidation } from "../../server/attendance/schemas/zod";

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
	const $getAttendance = atom<{
		data: Attendance[] | [];
		error: null | BetterFetchError;
		isPending: boolean;
		isRefetching: boolean;
		refetch: () => void
	}>({
		data: [],
		error: null,
		isPending: true,
		isRefetching: false,
		refetch: () => { }
	});

	const $getAttendanceQuery = atom<z.infer<typeof getAutoAttendanceQueryValidation>>({
		limit: 100,
		offset: 0,
		sort: "desc",
		dateRange: JSON.stringify({
			start: dayjs().subtract(1, "day").startOf("day").toISOString(),
			end: dayjs().endOf("day").toISOString(),
		}),
	});

	return {
		id: "attendancePlugin",
		$InferServerPlugin: {} as ReturnType<typeof attendancePlugin>,
		getActions: ($fetch) => {
			return {
				/**
				 * Get the attendance data for a given date interval, organization ID, limit, offset, and sort.
				 * Prefer using `getAutoAttendance` instead of this method when possible.
				 * @param query - The query parameters for the attendance API.
				 * @param fetchOptions - The fetch options for the attendance API.
				 * @returns A promise that resolves to the attendance data.
				 */
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
				/**
				 * Get the attendance data for a given date interval, organization ID, limit, offset, and sort.
				 * This method is preferred over `getAttendance` when possible.
				 * @param query - The query parameters for the attendance API.
				 * @param fetchOptions - The fetch options for the attendance API.
				 * @returns A promise that resolves to the attendance data.
				 */
				getAutoAttendance: async (query: z.infer<typeof getAutoAttendanceQueryValidation>, fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/attendance/get-auto", {
						method: "GET",
						query: query,
						...fetchOptions
					})

					return res as Data<z.infer<typeof attendanceSchema>[]>;
				},
				clockIn: async (fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/attendance/clock-in", {
						method: "POST",
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
			const getAttendance = useAuthQuery<Omit<Attendance, "_id">[] | []>(
				$getAttendance,
				`/attendance/get-auto`,
				$fetch,
				{
					method: "GET",
					query: $getAttendanceQuery.get(),
				}
			);

			return {
				$getAttendance,
				$getAttendanceQuery,
				getAttendance
			}
		},
		pathMethods: {
			"/attendance/get": "POST",
			"/attendance/get-auto": "GET",
			"/attendance/clock-in": "POST",
			"/attendance/clock-out": "POST",
			"/attendance/lunch-start": "POST",
			"/attendance/lunch-end": "POST"
		},
		atomListeners: [
			{
				matcher(path) {
					return ["/attendance/clock-in", "/attendance/clock-out", "/attendance/lunch-start", "/attendance/lunch-end"].includes(path)
				},
				signal: "$getAttendance"
			}

		]
	} satisfies BetterAuthClientPlugin
}
