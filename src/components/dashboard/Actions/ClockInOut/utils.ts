import { Attendance } from "@/lib/helpers/plugins/server/attendance";
import { getDistance, isPointWithinRadius } from "geolib";
import type { RequestType } from "./types";

/**
 * Calculate the distance between two coordinates
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns Distance in meters
 */
export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number
): number {
	return getDistance(
		{ latitude: lat1, longitude: lon1 },
		{ latitude: lat2, longitude: lon2 }
	);
}

/**
 * Check if a user is within the allowed radius of the organization's location
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param orgLat Organization's latitude
 * @param orgLon Organization's longitude
 * @param maxDistanceMeters Maximum allowed distance in meters (default: 100m)
 * @returns true if user is within range, false otherwise
 */
export function isWithinRange(
	userLat: number,
	userLon: number,
	orgLat: number,
	orgLon: number,
	maxDistanceMeters: number = 100
): boolean {
	return isPointWithinRadius(
		{ latitude: userLat, longitude: userLon },
		{ latitude: orgLat, longitude: orgLon },
		maxDistanceMeters
	);
}


import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useTranslations } from "next-intl";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export function getRecommendationReason(row: Omit<Attendance, "_id">, type: RequestType, now: dayjs.Dayjs, orgMetadata: OrgMetadata, locale: ReturnType<typeof useTranslations<"DashboardHome.QuickActions.Actions.ClockInOut">>): string {
	if (!row) return locale("Options.Manual.Recommended.Reasons.NoRecord");
	switch (type) {
		case "ClockIn":
			return row.clockIn ? locale("Options.Manual.Recommended.Reasons.AlreadyClockedIn") : locale("Options.Manual.Recommended.Reasons.NotClockedIn");
		case "LunchStart":
			return row.status === "CLOCKED_IN" ? locale("Options.Manual.Recommended.Reasons.CurrentClockIn", { time: dayjs(row.clockIn).tz(orgMetadata.hours.timezone).format("h:mm A") }) : locale("Options.Manual.Recommended.Reasons.NotClockedIn");
		case "LunchEnd":
			return row.status === "LUNCH_BREAK_STARTED" ? locale("Options.Manual.Recommended.Reasons.LunchStarted", { time: dayjs(row.lunchBreakOut).tz(orgMetadata.hours.timezone).format("h:mm A") }) : locale("Options.Manual.Recommended.Reasons.LunchNotStarted");
		case "ClockOut":
			return row.status === "LUNCH_BREAK_ENDED" || row.status === "CLOCKED_IN" ? locale("Options.Manual.Recommended.Reasons.ReadyToClockOut") : locale("Options.Manual.Recommended.Reasons.ClockOutError");
		default:
			return locale("Options.Manual.Recommended.Reasons.Default");
	}
}

export function getRecommendedType(row: Omit<Attendance, "_id">): RequestType {
	if (!row) return "ClockIn";
	switch (row.status) {
		case "TBR":
			return row.clockIn ? "LunchStart" : "ClockIn";
		case "CLOCKED_IN":
			return row.lunchBreakOut ? "ClockOut" : "LunchStart";
		case "LUNCH_BREAK_STARTED":
			return "LunchEnd";
		case "LUNCH_BREAK_ENDED":
			return row.clockOut ? "ClockIn" : "ClockOut";
		case "CLOCKED_OUT":
		default:
			return "ClockIn";
	}
}

export function getDisabledMap(status: string): Record<RequestType, boolean> {
	return {
		"ClockIn": ["CLOCKED_IN", "LUNCH_BREAK_STARTED", "LUNCH_BREAK_ENDED"].includes(status),
		"LunchStart": status !== "CLOCKED_IN",
		"LunchEnd": status !== "LUNCH_BREAK_STARTED",
		"ClockOut": !["CLOCKED_IN", "LUNCH_BREAK_ENDED"].includes(status),
		"TimeOff": false,
	};
}

