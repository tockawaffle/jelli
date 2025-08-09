import { type Member } from "better-auth/plugins";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { betterAuthComponent } from "../auth";

export const getMember = query({
	args: { orgId: v.string(), userId: v.string() },
	async handler(ctx, { orgId, userId }) {
		const member = await ctx.runQuery(
			betterAuthComponent.component.lib.findOne,
			{
				model: "member",
				unique: true,
				where: [
					{ field: "organizationId", operator: "eq", value: orgId },
					{ field: "userId", operator: "eq", value: userId }
				]
			}
		);

		return member as Member | null;
	}
});

/**
 * @description Get all attendance from the current active org or from a specific org
 * @param orgId - The id of the organization
 * @param info - The type of information to get:
 * - attendance: Get all attendance from the current active org or from a specific org (needs )
 * - scheduledTimeOff: Get all scheduled time off from the current active org or from a specific org
 * - members: Get all members from the current active org or from a specific org
 * - orgSettings: Get all org settings from the current active org or from a specific org
 * - orgMetadata: Get all org metadata from the current active org or from a specific org
 * @param limit - The limit of the information to get
 */
export const getOrgMembersInfo = query({
	args: {
		orgId: v.string(),
		info: v.array(
			v.union(
				v.literal("attendance"),
				v.literal("scheduledTimeOff"),
				v.literal("members"),
				v.literal("orgSettings"),
				v.literal("orgMetadata")
			)
		),
		limit: v.optional(v.number()),
		offset: v.optional(v.number())
	},
	handler: async (ctx, args): Promise<OrgInfo> => {

		const authUser = await betterAuthComponent.getAuthUser(ctx);
		if (!authUser) throw new Error("Unauthorized");

		const member = await ctx.runQuery(
			betterAuthComponent.component.lib.findOne,
			{
				model: "member",
				unique: true,
				where: [
					{ field: "organizationId", operator: "eq", value: args.orgId },
					{ field: "userId", operator: "eq", value: authUser._id }
				]
			}
		);

		if (!member) throw new Error("Unauthorized");

		const role = member.role.toLowerCase();
		const limit = Math.max(1, Math.min(args.limit ?? 50, 200));

		const data: OrgInfo = {
			attendance: [],
			scheduledTimeOff: [],
			members: {
				continueCursor: "[]",
				isDone: false,
				page: []
			},
			orgSettings: null,
			orgMetadata: null
		};

		const promises: Partial<
			Record<keyof OrgInfo, Promise<any[] | Doc<any> | null>>
		> = {};

		for (const info of args.info) {
			switch (info) {
				case "attendance":
					if (
						["owner", "admin", "manager"].includes(role)
					) {
						promises.attendance = ctx.db
							.query("attendance")
							.withIndex("by_org_id")
							.filter(q => q.eq(q.field("org_id"), args.orgId))
							.collect()
							.then(rows => rows.slice(0, limit));
					}
					break;
				case "scheduledTimeOff":
					if (
						["owner", "admin", "manager"].includes(role)
					) {
						promises.scheduledTimeOff = ctx.db
							.query("scheduled_time_off")
							.withIndex("by_org_id")
							.filter(q => q.eq(q.field("org_id"), args.orgId))
							.collect()
							.then(rows => rows.slice(0, limit));
					}
					break;
				case "members":
					if (
						["owner", "admin", "manager"].includes(role)
					) {
						promises.members = ctx.runQuery(
							betterAuthComponent.component.lib.findMany,
							{
								model: "member",
								where: [
									{
										field: "organizationId",
										operator: "eq",
										value: args.orgId
									}
								],
								select: ["id", "userId", "organizationId", "role"],
								limit: limit,
								offset: args.offset,
								paginationOpts: {
									cursor: null, numItems: limit
								}
							}
						);
					}
					break;
				case "orgSettings":
					if (["owner", "admin"].includes(role)) {
						// Add logic to fetch org settings
						promises.orgSettings = Promise.resolve(null); // Replace with actual promise
					}
					break;
				case "orgMetadata":
					// All roles can access org metadata
					// Add logic to fetch org metadata
					promises.orgMetadata = Promise.resolve(null); // Replace with actual promise
					break;
				default:
					break;
			}
		}

		const entryList = Object.entries(promises) as [keyof OrgInfo, Promise<any>][];
		const resolvedValues = await Promise.all(entryList.map(([, p]) => p));
		for (let i = 0; i < entryList.length; i++) {
			const [key] = entryList[i];
			data[key] = resolvedValues[i] as any;
		}

		return data;
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