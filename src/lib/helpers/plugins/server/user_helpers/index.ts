import type { Id } from "@/convex/_generated/dataModel";
import { User, type BetterAuthPlugin } from "better-auth";
import { APIError, getSessionFromCtx, sessionMiddleware } from "better-auth/api";
import { createAuthEndpoint } from "better-auth/plugins";
import { fetchAction } from "convex/nextjs";
import { z } from "zod";
import { api } from "../../../../../../convex/_generated/api";

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
				if (
					!values.firstName ||
					!values.lastName
				) {
					throw new APIError("BAD_REQUEST", { message: "First Name and Last Name must be provided." })
				}

				try {
					// First, get the current user to access their existing metadata
					const user = await ctx.context.adapter.findOne({
						model: "user",
						where: [{ field: "_id", operator: "eq", value: session.user.id }],
					});

					if (!user) {
						throw new APIError("NOT_FOUND", { message: "User not found" });
					}

					const currentUser = user as User & {
						metadata: {
							name: string,
							lastName: string
						},
						bio?: string
					}
					const currentMetadata = (currentUser.metadata || {}) as unknown as Record<string, typeof currentUser>;

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
					await ctx.context.adapter.update({
						model: "user",
						where: [{ field: "_id", operator: "eq", value: session.user.id }],
						update: {
							metadata: updatedMetadata
						}
					});
				} catch (error) {
					console.error("[User Helpers Plugin] [updateUserUtility@64]: Error updating user:", error);
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

				if (!storageId) throw new APIError("BAD_REQUEST", { message: "Storage ID is required" });

				try {
					// Get current user to merge metadata
					const user = await ctx.context.adapter.findOne({
						model: "user",
						where: [{ field: "id", operator: "eq", value: session.user.id }],
					}) as User | null

					if (!user) {
						throw new APIError("NOT_FOUND", { message: "User not found" });
					}

					// Delete the old image if any
					const oldImageId = user.image as Id<"_storage"> | null;
					if (oldImageId && oldImageId.startsWith("k")) {
						try {
							await fetchAction(api.files.deleteFile, {
								storageId: oldImageId,
							});
						} catch (error) {
							console.error("[User Helpers Plugin] [updateProfilePhoto] Failed to delete old image:", error);
							// Continue even if deletion fails
						}
					}

					// Update user with new image reference
					await ctx.context.adapter.update({
						model: "user",
						where: [{ field: "id", operator: "eq", value: session.user.id }],
						update: {
							image: storageId,
						}
					});

					return {
						success: true,
						storageId,
					};
				} catch (error) {
					console.error("[User Helpers Plugin] [updateProfilePhoto@123] Error updating profile photo:", error);
					throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to update profile photo" });
				}

			}),
		}
	} satisfies BetterAuthPlugin
);