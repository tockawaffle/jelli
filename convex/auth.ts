import {
	AuthFunctions,
	createClient,
} from "@convex-dev/better-auth";
import { components, internal } from "./_generated/api";
import type { DataModel, Id } from "./_generated/dataModel";
import authSchema from "./betterAuth/schema";

// Typesafe way to pass Convex functions defined in this file
const authFunctions: AuthFunctions = internal.auth;

// Initialize the component
export const authComponent = createClient<DataModel, typeof authSchema>(
	components.betterAuth,
	{
		authFunctions,
		triggers: {
			user: {
				onCreate: async (ctx, user) => {
					const userId = await ctx.db.insert("users", {
						email: user.email,
						lunchBreakDynamic: false,
						flexibleHours: false,
					});

					await authComponent.setUserId(ctx, user._id, userId)
				},
				onDelete: async (ctx, authUser) => {
					await ctx.db.delete(authUser.userId as Id<"users">)
				},
			},
		},
		local: {
			schema: authSchema
		}

	}
);

export const { onCreate, onUpdate, onDelete } = authComponent.triggersApi() 