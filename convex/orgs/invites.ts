import type { Invitation } from "better-auth/plugins";
import { v } from "convex/values";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

/**
 * @description Check if the invitation is pending, accepted, declined or canceled
 * @param invitationId - The id of the invitation
 * @returns The status of the invitation
 */
export const checkInvitation = query({
	args: v.object({
		invitationId: v.string(),
	}),
	handler: async (ctx, args): Promise<"pending" | "accepted" | "declined" | "canceled"> => {
		const { invitationId } = args;
		const invitation = await ctx.runQuery(
			authComponent.component.adapter.findOne,
			{
				model: "invitation",
				where: [
					{ field: "id", operator: "eq", value: invitationId },
				]
			}
		)

		if (!invitation) throw new Error("Invitation not found");
		return (invitation as Invitation).status as "pending" | "accepted" | "declined" | "canceled";
	},
	returns: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("canceled")),
})

/**
 * @description Check if the user is registered
 * @param email - The email of the user
 * @returns True if the user is registered, false otherwise
 */
export const isUserRegistered = query({
	args: v.object({
		email: v.string(),
	}),
	handler: async (ctx, args): Promise<boolean> => {
		const { email } = args;
		const user = await ctx.runQuery(
			authComponent.component.adapter.findOne,
			{
				model: "user",
				where: [
					{ field: "email", operator: "eq", value: email },
				]
			}
		);
		return user !== null;
	},
	returns: v.boolean(),
})

/**
 * @description Check if the invitation is valid and the user is registered
 * @param invitationId - The id of the invitation
 * @param email - The email of the user
 * @returns An object with the validity of the invitation and the existence of the user
 */
export const CheckInviteStatus = query({
	args: v.object({
		invitationId: v.string(),
		email: v.string(),
	}),
	returns: v.object({
		validInvitation: v.boolean(),
		userExists: v.boolean(),
	}),
	handler: async (ctx, args) => {
		const { invitationId, email } = args;

		// Check if the invitation exists, is for the given email and is pending
		const invitation = await ctx.runQuery(
			authComponent.component.adapter.findOne,
			{
				model: "invitation",
				where: [
					{ field: "id", operator: "eq", value: invitationId },
					{ field: "email", operator: "eq", value: email },
					{ field: "status", operator: "eq", value: "pending" },
				]
			}
		);

		// Checks if the user is registered 
		const isRegistered = await ctx.runQuery(
			authComponent.component.adapter.findOne,
			{
				model: "user",
				where: [
					{ field: "email", operator: "eq", value: email },
				]
			}
		);

		return {
			validInvitation: invitation !== null,
			userExists: isRegistered !== null,
		}
	},
})