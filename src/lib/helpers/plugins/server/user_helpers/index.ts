import { type BetterAuthPlugin } from "better-auth";
import { APIError, getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { z } from "zod";

export const userHelpersPlugin = () =>
(
	{
		id: "userHelpersPlugin",
		endpoints: {
			updateUserUtility: createAuthEndpoint("/uh/update-user", {
				method: "POST",
				use: [sessionMiddleware],
				body: z.object({
					values: z.object({
						firstName: z.string(),
						lastName: z.string(),
						bio: z.string().optional()
					})
				})
			}, async (ctx) => {
				const session = await getSessionFromCtx(ctx);
				if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

				const { values } = ctx.body;

				try {
					// First, get the current user to access their existing metadata
					const users = await ctx.context.adapter.findMany({
						model: "user",
						where: [{ field: "_id", operator: "eq", value: session.user.id }],
					});

					if (!users || users.length === 0) {
						throw new APIError("NOT_FOUND", { message: "User not found" });
					}

					const currentUser = users[0] as any;
					const currentMetadata = (currentUser.metadata || {}) as Record<string, any>;

					// Merge the new values with existing metadata
					const updatedMetadata = {
						...currentMetadata,
						name: {
							...(currentMetadata.name || {}),
							firstName: values.firstName,
							lastName: values.lastName
						},
						bio: values.bio !== undefined ? values.bio : currentMetadata.bio
					};

					// Update the user with the merged metadata
					await ctx.context.adapter.updateMany({
						model: "user",
						where: [{ field: "_id", operator: "eq", value: session.user.id }],
						update: {
							metadata: updatedMetadata
						}
					});
				} catch (error) {
					console.error("Error updating user:", error);
					throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to update user" });
				}

				return {
					success: true,
					id: session.user.id
				};

			}),
			updateProfilePhoto: createAuthEndpoint("/uh/update-photo", {
				method: "POST",
				use: [sessionMiddleware],
				body: z.object({
					storageId: z.string()
				})
			}, async (ctx) => {
				const session = await getSessionFromCtx(ctx);
				if (!session) throw new APIError("UNAUTHORIZED", { message: "Unauthorized" });

				const { storageId } = ctx.body;

				try {
					// Get current user to merge metadata
					const users = await ctx.context.adapter.findMany({
						model: "user",
						where: [{ field: "id", operator: "eq", value: session.user.id }],
					});

					if (!users || users.length === 0) {
						throw new APIError("NOT_FOUND", { message: "User not found" });
					}

					const currentUser = users[0] as any;
					const currentMetadata = (currentUser.metadata || {}) as Record<string, any>;

					// Merge with existing metadata
					const updatedMetadata = {
						...currentMetadata,
						photoStorageId: storageId,
					};

					// Update user with new image reference
					await ctx.context.adapter.updateMany({
						model: "user",
						where: [{ field: "id", operator: "eq", value: session.user.id }],
						update: {
							metadata: updatedMetadata,
						}
					});
				} catch (error) {
					console.error("Error updating profile photo:", error);
					throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to update profile photo" });
				}

				return {
					success: true,
					storageId,
				};

			}),
		}
	} satisfies BetterAuthPlugin
);