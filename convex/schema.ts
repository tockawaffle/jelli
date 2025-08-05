import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({
		/**
		 * @type {object}
		 * The organization that the user is a member of.
		 * This is autofilled when the user creates an organization or joins one.
		 * @property {string} org_id - The id of the organization.
		 * @property {string} role - The role of the user in the organization.
		 * @property {string} created_at - The date and time the user was added to the organization.
		 * @property {string} updated_at - The date and time the user was last updated in the organization.
		 */
		org: v.optional(
			v.object(
				{
					org_id: v.string(),
					role: v.string(),
					created_at: v.string(),
					updated_at: v.string(),
				}
			)
		)
	}),
	/**
	 * This table is used to store the attendance of the users in the organization.
	 * Example:
	 * ```json
	 * {
	 * 	"user_id": "user_123",
	 * 	"role": "admin",
	 * 	"date": "31/07/2025",
	 * 	"clock_in": "09:00:00",
	 * 	"lunch_break_out": "12:00:00",
	 * 	"lunch_break_return": "13:00:00",
	 * 	"clocked_out": "17:00:00",
	 * 	"total_hours": "08:00:00"
	 * }
	 * ```
	 */
	attendance: defineTable({
		/**
		 * @type {id}
		 * The id of the user.
		 */
		id: v.id("user"),
		/**
		 * @type {id}
		 * The id of the organization.
		 */
		org_id: v.string(),
		/**
		 * @type {string}
		 * Not decided yet, so we'll use a string
		 */
		role: v.string(),
		/**
		 * @type {string}
		 * Date will always be in the format of "DD/MM/YYYY" and will be stored as a string to be later parsed to a date.
		 * This cannot be anything else, otherwise this will not count as a valid record.
		 */
		date: v.string(),
		/**
		 * @type {string}
		 * Time will always be in the format of "HH:MM:SS" and will be stored as a string to be later parsed to a time.
		 * This cannot be anything else, otherwise this will not count as a valid record.
		 */
		clock_in: v.string(),
		/**
		 * @type {string}
		 * Time will always be in the format of "HH:MM:SS" and will be stored as a string to be later parsed to a time.
		 * This cannot be anything else, otherwise this will not count as a valid record.
		 */
		lunch_break_out: v.string(),
		/**
		 * @type {string}
		 * Time will always be in the format of "HH:MM:SS" and will be stored as a string to be later parsed to a time.
		 * This cannot be anything else, otherwise this will not count as a valid record.
		 */
		lunch_break_return: v.string(),
		/**
		 * @type {string}
		 * Time will always be in the format of "HH:MM:SS" and will be stored as a string to be later parsed to a time.
		 * This cannot be anything else, otherwise this will not count as a valid record.
		 */
		clocked_out: v.string()
	})
		.index("by_user_id", ["id"])
		.index("by_org_id", ["org_id"]),
	scheduled_time_off: defineTable({
		user_id: v.id("user"),
		org_id: v.string(),
		date: v.string(),
		type: v.union(v.literal("vacation"), v.literal("sick_leave"), v.literal("personal_day"), v.literal("not_provided"), v.literal("unpaid"), v.literal("other")),
		hours: v.optional(v.number()),
		reason: v.optional(v.string()),
		created_at: v.optional(v.string()),
		updated_at: v.optional(v.string()),
	}).index("by_user_id", ["user_id"]).index("by_org_id", ["org_id"]),
});