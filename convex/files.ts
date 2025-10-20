import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
	return await ctx.storage.generateUploadUrl();
});

export const get = query({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async (ctx, args) => {
		if (!args.storageId || args.storageId === "skip") return undefined;
		try {
			const url = await ctx.storage.getUrl(args.storageId);
			if (!url) return undefined;
			return { url };
		} catch (error) {
			console.error("Error getting file URL:", error);
			return undefined;
		}
	},
});

export const deleteFile = action({
	args: {
		storageId: v.id("_storage"),
	},
	handler: async (ctx, args) => {
		try {
			await ctx.storage.delete(args.storageId);
			return { success: true };
		} catch (error) {
			console.error("Error deleting file:", error);
			throw new Error("Failed to delete file");
		}
	},
});