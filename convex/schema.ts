import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	users: defineTable({}),
	/**
	 * This table is used to store the attendance of the users in the organization.
	 * Example:
	 * ```json
	 * {
	 * 	"id": "attendance_123",
	 * 	"name": "John Doe",
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
		id: v.string(),
		/**
		 * @type {string}
		 * The name of the user.
		 */
		name: v.string(),
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
		clocked_out: v.string(),
		/**
		 * @type {string}
		 * Lifecycle status of the attendance row for today. This is derived from which fields are set
		 * but persisted to make queries simpler and efficient.
		 */
		status: v.union(
			v.literal("TBR"),
			v.literal("CLOCKED_IN"),
			v.literal("LUNCH_BREAK_STARTED"),
			v.literal("LUNCH_BREAK_ENDED"),
			v.literal("CLOCKED_OUT")
		),
		/** Total work seconds for the day. Computed as (clock_out - clock_in) - total_break_sec */
		total_work_sec: v.number(),
		/** Total break seconds for the day. Increased on lunch return. */
		total_break_sec: v.number(),
		/** True if first clock_in is after scheduled start + grace */
		was_late: v.boolean(),
		/** True if clock_out occurred before scheduled end - minimum */
		early_out: v.boolean(),
		/** Epoch ms for sorting by most recent change */
		updated_at_ms: v.number(),
	})
		.index("by_user_id", ["id"])
		.index("by_org_id", ["org_id"])
		.index("by_org_date", ["org_id", "date"]),
	scheduled_time_off: defineTable({
		id: v.string(),
		name: v.string(),
		org_id: v.string(),
		date: v.string(),
		type: v.union(v.literal("vacation"), v.literal("sick_leave"), v.literal("personal_day"), v.literal("not_provided"), v.literal("unpaid"), v.literal("other")),
		hours: v.optional(v.number()),
		reason: v.optional(v.string()),
		created_at: v.string(),
		updated_at: v.string(),
	}).index("by_user_id", ["id"]).index("by_org_id", ["org_id"]),
});