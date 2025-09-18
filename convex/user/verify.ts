import { v } from "convex/values"
import { query } from "../_generated/server"

/**
 * @description Check if a user exists by email
 * @param email - The email of the user
 * @returns True if the user exists, false otherwise
 */

export const ifExists = query({
	args: v.object({
		email: v.string(),
	}),
	returns: v.boolean(),
	handler: async (ctx, args) => {
		const { email } = args
		const user = await ctx.db.query("users").withIndex("email", q => q.eq("email", email)).first()
		return user !== null
	}
})