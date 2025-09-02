import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { betterAuthComponent } from "./auth";

function getTodayDateString(): string {
	const now = new Date();
	const dd = String(now.getDate()).padStart(2, "0");
	const mm = String(now.getMonth() + 1).padStart(2, "0");
	const yyyy = String(now.getFullYear());
	return `${dd}/${mm}/${yyyy}`;
}

function formatNowHHMMSS(): string {
	const now = new Date();
	const hh = String(now.getHours()).padStart(2, "0");
	const mm = String(now.getMinutes()).padStart(2, "0");
	const ss = String(now.getSeconds()).padStart(2, "0");
	return `${hh}:${mm}:${ss}`;
}

function parseHHMMSSToSeconds(time: string): number {
	const [h, m, s] = time.split(":").map(Number);
	return (h * 3600) + (m * 60) + s;
}

function secondsDiff(aHHMMSS: string, bHHMMSS: string): number {
	return Math.max(0, parseHHMMSSToSeconds(aHHMMSS) - parseHHMMSSToSeconds(bHHMMSS));
}

async function getOrCreateTodayAttendance(ctx: any, args: { id: string; org_id: string; name: string; role: string }) {
	const today = getTodayDateString();

	const existing = await ctx.db
		.query("attendance")
		.withIndex("by_user_id")
		.filter((q: any) => q.eq(q.field("id"), args.id))
		.collect();

	const todays = existing.filter((r: any) => r.date === today && r.org_id === args.org_id);

	if (todays.length > 0) {
		// pick the one with newest updated_at_ms
		return todays.sort((a: any, b: any) => (b.updated_at_ms ?? 0) - (a.updated_at_ms ?? 0))[0];
	}

	const nowMs = Date.now();
	const docId = await ctx.db.insert("attendance", {
		id: args.id,
		name: args.name,
		org_id: args.org_id,
		role: args.role,
		date: today,
		clock_in: "",
		lunch_break_out: "",
		lunch_break_return: "",
		clocked_out: "",
		status: "TBR",
		total_work_sec: 0,
		total_break_sec: 0,
		was_late: false,
		early_out: false,
		updated_at_ms: nowMs,
	});

	return await ctx.db.get(docId);
}

export const clockIn = mutation({
	args: {
		id: v.string(),
		org_id: v.string(),
		name: v.string(),
		role: v.string(),
		scheduled_start: v.optional(v.string()), // "HH:MM:SS"
		grace_minutes: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const row = await getOrCreateTodayAttendance(ctx, args);
		if (row.status !== "TBR" || row.clock_in !== "") {
			throw new Error("Invalid state: already clocked in or not TBR");
		}
		const nowTime = formatNowHHMMSS();
		const nowMs = Date.now();

		const start = args.scheduled_start ?? "09:00:00";
		const grace = args.grace_minutes ?? 0;
		const lateThresholdSeconds = parseHHMMSSToSeconds(start) + grace * 60;
		const isLate = parseHHMMSSToSeconds(nowTime) > lateThresholdSeconds;

		await ctx.db.patch(row._id, {
			clock_in: nowTime,
			status: "CLOCKED_IN",
			was_late: isLate,
			updated_at_ms: nowMs,
		});

		return { ok: true } as const;
	},
});

export const lunchBreakOut = mutation({
	args: {
		id: v.string(),
		org_id: v.string(),
	},
	handler: async (ctx, args) => {
		const row = await getOrCreateTodayAttendance(ctx, { ...args, name: "", role: "" });
		if (row.status !== "CLOCKED_IN" || row.lunch_break_out !== "") {
			throw new Error("Invalid state: cannot start lunch break");
		}
		const nowTime = formatNowHHMMSS();
		const nowMs = Date.now();

		await ctx.db.patch(row._id, {
			lunch_break_out: nowTime,
			status: "LUNCH_BREAK_STARTED",
			updated_at_ms: nowMs,
		});
		return { ok: true } as const;
	},
});

export const lunchBreakIn = mutation({
	args: {
		id: v.string(),
		org_id: v.string(),
	},
	handler: async (ctx, args) => {
		const row = await getOrCreateTodayAttendance(ctx, { ...args, name: "", role: "" });
		if (row.status !== "LUNCH_BREAK_STARTED" || row.lunch_break_return !== "") {
			throw new Error("Invalid state: cannot end lunch break");
		}
		const nowTime = formatNowHHMMSS();
		const nowMs = Date.now();

		const addedBreak = secondsDiff(nowTime, row.lunch_break_out);

		await ctx.db.patch(row._id, {
			lunch_break_return: nowTime,
			status: "LUNCH_BREAK_ENDED",
			total_break_sec: (row.total_break_sec ?? 0) + addedBreak,
			updated_at_ms: nowMs,
		});
		return { ok: true } as const;
	},
});

export const clockOut = mutation({
	args: {
		id: v.string(),
		org_id: v.string(),
		scheduled_end: v.optional(v.string()), // "HH:MM:SS"
		minimum_minutes: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		const row = await getOrCreateTodayAttendance(ctx, { ...args, name: "", role: "" });
		if ((row.status !== "CLOCKED_IN" && row.status !== "LUNCH_BREAK_ENDED") || row.clocked_out !== "") {
			throw new Error("Invalid state: cannot clock out");
		}
		const nowTime = formatNowHHMMSS();
		const nowMs = Date.now();

		const totalWorkSeconds = Math.max(0, secondsDiff(nowTime, row.clock_in) - (row.total_break_sec ?? 0));

		const end = args.scheduled_end ?? "17:00:00";
		const minMinutes = args.minimum_minutes ?? 0;
		const earlyThresholdSeconds = parseHHMMSSToSeconds(end) - minMinutes * 60;
		const isEarly = parseHHMMSSToSeconds(nowTime) < earlyThresholdSeconds;

		await ctx.db.patch(row._id, {
			clocked_out: nowTime,
			status: "CLOCKED_OUT",
			total_work_sec: totalWorkSeconds,
			early_out: isEarly,
			updated_at_ms: nowMs,
		});
		return { ok: true } as const;
	},
});

export const getTodayForCurrentUser = query({
	args: {
		orgId: v.string(),
	},
	handler: async (ctx, args) => {
		const authUser = await betterAuthComponent.getAuthUser(ctx);
		if (!authUser) return null;

		const today = getTodayDateString();
		const rows = await ctx.db
			.query("attendance")
			.withIndex("by_user_id")
			.filter((q: any) => q.eq(q.field("id"), authUser.userId))
			.collect();

		const todays = rows.filter((r: any) => r.date === today && r.org_id === args.orgId);
		if (todays.length === 0) return null;
		return todays.sort((a: any, b: any) => (b.updated_at_ms ?? 0) - (a.updated_at_ms ?? 0))[0];
	},
});

