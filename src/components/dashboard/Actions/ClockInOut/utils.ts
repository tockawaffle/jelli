import { getDistance, isPointWithinRadius } from "geolib";
import type { AttendanceRow, RequestType } from "./types";

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

export function getRecommendationReason(row: AttendanceRow, type: RequestType): string {
	if (!row) return "we haven't recorded any clock-in for today.";
	switch (type) {
		case "clock-in":
			return row.clock_in ? "you already clocked in earlier today." : "you haven't clocked in yet today.";
		case "lunch-break-start":
			return row.status === "CLOCKED_IN" ? `you are currently clocked in since ${row.clock_in || "--:--"}.` : "you're not clocked in.";
		case "lunch-break-end":
			return row.status === "LUNCH_BREAK_STARTED" ? `your lunch started at ${row.lunch_break_out || "--:--"}.` : "you haven't started lunch.";
		case "clock-out":
			return row.status === "LUNCH_BREAK_ENDED" || row.status === "CLOCKED_IN" ? "you're in a valid state to clock out." : "you must be clocked in (and ideally have ended lunch).";
		default:
			return "today's context";
	}
}

export function getRecommendedType(row: AttendanceRow): RequestType {
	if (!row) return "clock-in";
	switch (row.status) {
		case "TBR":
			return row.clock_in ? "lunch-break-start" : "clock-in";
		case "CLOCKED_IN":
			return row.lunch_break_out ? "clock-out" : "lunch-break-start";
		case "LUNCH_BREAK_STARTED":
			return "lunch-break-end";
		case "LUNCH_BREAK_ENDED":
			return row.clocked_out ? "clock-in" : "clock-out";
		case "CLOCKED_OUT":
		default:
			return "clock-in";
	}
}

export function getDisabledMap(status: string): Record<RequestType, boolean> {
	return {
		"clock-in": ["CLOCKED_IN", "LUNCH_BREAK_STARTED", "LUNCH_BREAK_ENDED"].includes(status),
		"lunch-break-start": status !== "CLOCKED_IN",
		"lunch-break-end": status !== "LUNCH_BREAK_STARTED",
		"clock-out": !["CLOCKED_IN", "LUNCH_BREAK_ENDED"].includes(status),
		"time-off": false,
	};
}

