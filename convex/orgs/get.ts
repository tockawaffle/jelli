import { type Member } from "better-auth/plugins";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { query } from "../_generated/server";
import { authComponent } from "../auth";

export const getMember = query({
	args: { orgId: v.string(), userId: v.string() },
	async handler(ctx, { orgId, userId }) {
		const member = await ctx.runQuery(
			authComponent.component.adapter.findOne,
			{
				model: "member",
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

		const authUser = await authComponent.getAuthUser(ctx);
		if (!authUser) throw new Error("Unauthorized");

		// Need to use this because the Convex Adapter doesn't have:
		// 1. A method to directly get members from the org and compare by using the userId provided by it's own function
		// 2. A method to directly get the user id (from better-auth)
		const userId = await ctx.runQuery(
			authComponent.component.adapter.findOne,
			{
				model: "user",
				where: [
					{ field: "userId", operator: "eq", value: authUser.userId as string }
				]
			}
		)

		if (!userId) throw new Error("Unauthorized");

		const member = await ctx.runQuery(
			authComponent.component.adapter.findOne,
			{
				model: "member",
				where: [
					{ field: "organizationId", operator: "eq", value: args.orgId },
					{ field: "userId", operator: "eq", value: userId._id as string }
				]
			}
		);

		if (!member) throw new Error("Unauthorized");
		if (typeof member.role !== "string") throw new Error("Unauthorized");

		const role = member.role.toLowerCase();
		const limit = Math.max(1, Math.min(args.limit ?? 50, 200));

		const data: OrgInfo = {
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
							authComponent.component.adapter.findMany,
							{
								model: "member",
								where: [
									{
										field: "organizationId",
										operator: "eq",
										value: args.orgId
									}
								],
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
			data[key] = resolvedValues[i]
		}

		return data;
	}
});

export const getScheduledTimeOffAmount = query({
	args: {
		orgId: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await authComponent.getAuthUser(ctx);
		if (!identity) return null;

		const scheduledTimeOff = await ctx.db.query("scheduled_time_off").withIndex("by_org_id").filter((q) => q.eq(q.field("org_id"), args.orgId)).collect();
		return scheduledTimeOff.length;
	}
});

/**
 * @warning NEEDS TESTING
 */
export const canUserCreateOrganization = query({
	args: v.object({
		userId: v.string(),
	}),
	handler: async (ctx, args) => {
		const { userId } = args;
		const membersData = await ctx.runQuery(
			authComponent.component.adapter.findMany,
			{
				model: "member",
				where: [
					{ field: "userId", operator: "eq", value: userId },
				],
				paginationOpts: {
					cursor: null,
					numItems: 100
				}
			}
		);

		const members = membersData.page as Member[];

		// If the user is not a member of any organization, they can create an organization.
		if (!members || members.length === 0) return true;

		// Org owners can create more organizations.
		// Org members (including admin and other roles that are not owners) cannot create more organizations until they are either kicked out of the organization or leave by their own volition.

		const ownedOrgs = members.filter(m => m.role === "owner");

		// 3. If the user is owner of more than 2 orgs, they can not create more organizations.
		if (ownedOrgs.length > 2) return false;

		// 2. If the user is owner of all organizations, they can create more organizations.
		const isOwnerOfAll = members.every(m => m.role === "owner");

		if (isOwnerOfAll) return true;

		return false;
	}
})