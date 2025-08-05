import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * @description Get all attendance from the current active org or from a specific org
 */
export const getAllAttendance = query({
	args: {
		orgId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;



		const attendance = await ctx.db.query("attendance").withIndex("by_org_id").filter((q) => q.eq(q.field("org_id"), args.orgId)).collect();
		return attendance;
	}
});

export const getScheduledTimeOffAmount = query({
	args: {
		orgId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity();
		if (!identity) return null;

		const scheduledTimeOff = await ctx.db.query("scheduled_time_off").withIndex("by_org_id").filter((q) => q.eq(q.field("org_id"), args.orgId)).collect();
		return scheduledTimeOff.length;
	}
});