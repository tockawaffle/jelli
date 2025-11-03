import { BetterAuthClientPlugin, Prettify } from "better-auth";
import { useAuthQuery } from "better-auth/client";
import { BetterFetchError, BetterFetchOption } from "better-auth/react";
import dayjs from "dayjs";
import { atom } from "nanostores";
import { z } from "zod";
import type { Attendance } from "../../server/attendance";
import { attendancePlugin } from "../../server/attendance";
import { attendanceSchema } from "../../server/attendance/schemas/base";
import { getAttendanceQueryValidation } from "../../server/attendance/schemas/zod";

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

	const $getAttendanceQuery = atom<z.infer<typeof getAttendanceQueryValidation>>({
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
				 * This method is preferred over `getAttendance` when possible.
				 * @param query - The query parameters for the attendance API.
				 * @param fetchOptions - The fetch options for the attendance API.
				 * @returns A promise that resolves to the attendance data.
				 */
				getAttendance: async (query?: z.infer<typeof getAttendanceQueryValidation>, fetchOptions?: BetterFetchOption) => {
					if (query) {
						// I struggled to find how to pass query params to the query hook till I found out I can simply use a custom atom to set the query params.
						$getAttendanceQuery.set(query);
					}

					const res = await $fetch("/attendance/get", {
						method: "GET",
						query: $getAttendanceQuery.get(),
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
					const res = await $fetch("/attendance/lunch-return", {
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
				`/attendance/get`,
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
			"/attendance/get": "GET",
			"/attendance/clock-in": "POST",
			"/attendance/clock-out": "POST",
			"/attendance/lunch-start": "POST",
			"/attendance/lunch-return": "POST"
		},
		atomListeners: [
			{
				matcher(path) {
					return ["/attendance/clock-in", "/attendance/clock-out", "/attendance/lunch-start", "/attendance/lunch-return"].includes(path)
				},
				signal: "$getAttendance"
			}

		]
	} satisfies BetterAuthClientPlugin
}
