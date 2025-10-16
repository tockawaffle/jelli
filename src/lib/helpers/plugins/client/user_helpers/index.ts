import { BetterAuthClientPlugin, Prettify } from "better-auth";
import { BetterFetchOption } from "better-auth/react";
import { atom } from "nanostores";
import { z } from "zod";
import { userHelpersPlugin } from "../../server/user_helpers";

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
	firstName: z.string(),
	lastName: z.string(),
	bio: z.string().optional()
})

export const userHelpersClientPlugin = () => {
	const $updateUserUtility = atom(
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
		id: "userHelpers",
		$InferServerPlugin: {} as ReturnType<typeof userHelpersPlugin>,
		getActions: ($fetch) => {
			return {
				updateUserUtility: async (data?: z.infer<typeof queryValidation>, fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/uh/update-user", {
						method: "POST",
						body: {
							values: data
						},
						...fetchOptions
					})

					return res
				},
				updateProfilePhoto: async (storageId: string, fetchOptions?: BetterFetchOption) => {
					const res = await $fetch("/uh/update-photo", {
						method: "POST",
						body: {
							storageId
						},
						...fetchOptions
					})

					return res
				}
			}
		},
		getAtoms: ($fetch) => {
			return {
				$updateUserUtility
			}
		},
		pathMethods: {
			"/uh/update-user": "POST",
			"/uh/update-photo": "POST"
		},
		atomListeners: [
			{
				matcher(path) {
					return path === "/uh/update-user"
				},
				signal: "$updateUserUtility"
			}
		]
	} satisfies BetterAuthClientPlugin
}
