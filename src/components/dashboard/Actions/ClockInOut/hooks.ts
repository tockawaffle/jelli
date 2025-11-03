import { authClient } from "@/lib/auth-client";
import React from "react";
import type { AttendanceRow, LocationStatus, UserLocation } from "./types";

export function useAttendanceToday(orgId: string, enabled: boolean) {
	const [todayRow, setTodayRow] = React.useState<AttendanceRow>(null);

	React.useEffect(() => {
		if (!enabled || !orgId) return;

		const fetchTodayAttendance = async () => {
			try {
				await authClient.getAttendance(
					undefined,
					{
						onSuccess: (data) => {
							const row = data.data?.[0] as AttendanceRow;
							setTodayRow(row || null);
						},
						onError: (error) => {
							console.error("Failed to fetch today's attendance:", error);
						},
					}
				);
			} catch (error) {
				console.error("Failed to fetch today's attendance:", error);
			}
		};

		fetchTodayAttendance();
	}, [orgId, enabled]);

	return todayRow;
}

export function useLocationPermission(open: boolean) {
	const [locationStatus, setLocationStatus] = React.useState<LocationStatus>("idle");
	const [userLocation, setUserLocation] = React.useState<UserLocation>(null);
	const permissionStateRef = React.useRef<"granted" | "denied" | "prompt" | null>(null);

	const requestLocationPermission = React.useCallback(() => {
		if (typeof window === "undefined" || !("geolocation" in navigator)) {
			console.debug("[ClockInOutDialog] Geolocation not available in this environment.");
			setLocationStatus("denied");
			return;
		}
		setLocationStatus("checking");
		console.debug("[ClockInOutDialog] Requesting geolocation permission...");
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				console.debug("[ClockInOutDialog] Geolocation granted:", {
					lat: pos.coords.latitude,
					lon: pos.coords.longitude,
					accuracy: pos.coords.accuracy,
				});
				setUserLocation({
					latitude: pos.coords.latitude,
					longitude: pos.coords.longitude,
					accuracy: pos.coords.accuracy,
				});
				setLocationStatus("granted");
			},
			(err) => {
				console.warn("[ClockInOutDialog] Geolocation denied/error:", err);
				// code 1: permission denied, 2: position unavailable, 3: timeout
				if (err?.code === 1) {
					setLocationStatus("denied");
				} else {
					// If permission has been granted but fix failed, treat as granted for flow gating
					if (permissionStateRef.current === "granted") {
						console.debug("[ClockInOutDialog] Permission is granted but position unavailable/timeout. Proceeding as granted.");
						setLocationStatus("granted");
					} else {
						setLocationStatus("error");
					}
				}
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
		);
	}, []);

	React.useEffect(() => {
		if (!open) return;
		const nav: any = typeof navigator !== "undefined" ? (navigator as any) : null;
		if (!nav?.permissions?.query) return;
		let active = true;
		nav.permissions
			.query({ name: "geolocation" as any })
			.then((perm: any) => {
				if (!active) return;
				console.debug("[ClockInOutDialog] Permission state:", perm.state);
				permissionStateRef.current = perm.state;
				setLocationStatus(perm.state === "granted" ? "granted" : perm.state === "denied" ? "denied" : "idle");
				perm.onchange = () => {
					if (!active) return;
					console.debug("[ClockInOutDialog] Permission changed:", perm.state);
					permissionStateRef.current = perm.state;
					setLocationStatus(perm.state === "granted" ? "granted" : perm.state === "denied" ? "denied" : "idle");
				};
			})
			.catch((e: any) => {
				console.debug("[ClockInOutDialog] Permissions API not available or failed:", e);
			});
		return () => {
			active = false;
		};
	}, [open]);

	return {
		locationStatus,
		userLocation,
		requestLocationPermission,
	};
}

