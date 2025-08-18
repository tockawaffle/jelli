import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { CheckCircle2, FileTextIcon, MapPin, QrCode } from "lucide-react";
import React from "react";
import { api } from "../../../../convex/_generated/api";

type ControlledProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Optional error message to render inside the modal/sheet */
	error?: string | null;
	orgData: FullOrganization;
};

export default function ClockInOutDialog({ open, onOpenChange, error, hasRegisteredDevice = false }: ControlledProps & { hasRegisteredDevice?: boolean }) {

	const [method, setMethod] = React.useState<"qr" | "request">("request");
	const [requestType, setRequestType] = React.useState<"clock-in" | "clock-out" | "lunch-break-start" | "lunch-break-end" | "time-off">("clock-in");
	const [requestReason, setRequestReason] = React.useState<string>("vacation");
	const { data: activeOrg } = authClient.useActiveOrganization();
	const todayRow = useQuery(api.attendance.getTodayForCurrentUser, { orgId: activeOrg?.id ?? "" });
	type LocationStatus = "idle" | "checking" | "granted" | "denied" | "error";
	const [locationStatus, setLocationStatus] = React.useState<LocationStatus>("idle");
	const permissionStateRef = React.useRef<"granted" | "denied" | "prompt" | null>(null);

	const status: string = (todayRow as any)?.status ?? "NONE";
	const hasClockIn = Boolean((todayRow as any)?.clock_in);

	const disabledMap: Record<typeof requestType, boolean> = {
		"clock-in": false,
		"lunch-break-start": false,
		"lunch-break-end": false,
		"clock-out": false,
		"time-off": false,
	};

	if (!hasClockIn) {
		disabledMap["lunch-break-start"] = true;
		disabledMap["lunch-break-end"] = true;
		disabledMap["clock-out"] = true;
	}
	if (status === "CLOCKED_IN" && !(todayRow as any)?.lunch_break_out) {
		disabledMap["clock-in"] = true;
		disabledMap["lunch-break-start"] = false;
		disabledMap["clock-out"] = false;
	}
	if (status === "LUNCH_BREAK_STARTED") {
		disabledMap["clock-in"] = true;
		disabledMap["lunch-break-start"] = true;
		disabledMap["clock-out"] = true;
		disabledMap["lunch-break-end"] = false;
	}
	if (status === "LUNCH_BREAK_ENDED") {
		disabledMap["clock-in"] = true;
		disabledMap["lunch-break-start"] = true;
		disabledMap["lunch-break-end"] = true;
		disabledMap["clock-out"] = false;
	}
	if (status === "CLOCKED_OUT") {
		disabledMap["lunch-break-start"] = true;
		disabledMap["lunch-break-end"] = true;
		disabledMap["clock-out"] = true;
	}

	function getRecommendationReason(row: any | null, type: typeof requestType): string {
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

	const nowText = dayjs().format("h:mm A");

	function getRecommendedType(row: any | null): typeof requestType {
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

	React.useEffect(() => {
		if (method === "request") {
			setRequestType(getRecommendedType(todayRow as any));
		}
	}, [method, todayRow]);

	function formatToday() {
		const d = new Date();
		return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
	}

	function requestLocationPermission() {
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
			{ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
		);
	}

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
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Clock In / Clock Out</DialogTitle>
					<DialogDescription>
						Choose how you'd like to record your time.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					{error && (
						<div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded-md text-sm" role="alert" aria-live="polite">
							{error}
						</div>
					)}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-stretch">
						<Button
							variant={method === "qr" ? "default" : "outline"}
							className="group w-full h-full min-h-28 py-4 px-3 flex flex-col items-center justify-center gap-2 rounded-lg whitespace-normal text-center text-balance disabled:opacity-50 disabled:cursor-not-allowed select-none"
							aria-pressed={method === "qr"}
							onClick={() => setMethod("qr")}
							disabled={!hasRegisteredDevice}
						>
							<QrCode className={`size-5 ${method === "qr" ? "text-muted" : "text-muted-foreground"}`} />
							<span className={`text-sm font-medium ${method === "qr" ? "text-muted" : "text-muted-foreground"}`}>Via QR Code</span>
							<span className={`text-xs ${method === "qr" ? "text-muted" : "text-muted-foreground"}`}>Scan at a kiosk or team device</span>
						</Button>
						<Button
							variant={method === "request" ? "default" : "outline"}
							className="group w-full h-full min-h-28 py-4 px-3 flex flex-col items-center justify-center gap-2 rounded-lg whitespace-normal text-center text-balance disabled:opacity-50 disabled:cursor-not-allowed select-none"
							aria-pressed={method === "request"}
							onClick={() => setMethod("request")}
						>
							<FileTextIcon className={`size-5 ${method === "request" ? "text-muted" : "text-muted-foreground"}`} />
							<span className={`text-sm font-medium ${method === "request" ? "text-muted" : "text-muted-foreground"}`}>Create a Request</span>
							<span className={`text-xs ${method === "request" ? "text-muted" : "text-muted-foreground"}`}>Recommended when off-site or correcting time</span>
						</Button>
					</div>
					{
						!hasRegisteredDevice && (
							<div className="rounded-md border p-3 text-xs text-muted-foreground">
								Tip: You can link a physical device in organization settings to enable one-click clocking from that PC. This can only be done by organization admins.
							</div>
						)
					}
					{method === "request" && (
						<div className="grid gap-3 text-sm">
							<div className="flex flex-wrap items-center gap-2">
								<span className="font-medium">Recommended:</span>
								<span className="px-2 py-0.5 rounded-md bg-accent-foreground text-foreground text-xs">
									{requestType.replaceAll("-", " ")}
								</span>
								<span className="text-xs text-muted-foreground">— {getRecommendationReason(todayRow as any, requestType)}</span>
							</div>
							<div className="text-xs text-muted-foreground">Now: {nowText} — Today ({formatToday()})</div>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
								<span className="flex items-center gap-1 text-destructive">
									<MapPin className="size-3" /> Location is required. If denied, use Request Time Off.
								</span>
								<Button size="sm" variant="secondary" onClick={requestLocationPermission} disabled={locationStatus === "checking"}
									className="self-start sm:self-auto">
									{locationStatus === "checking" ? "Checking…" : locationStatus === "granted" ? (
										<span className="inline-flex items-center gap-1"><CheckCircle2 className="size-3" /> Permission granted</span>
									) : locationStatus === "denied" ? "Grant access" : locationStatus === "error" ? "Try again" : "Grant access"}
								</Button>
							</div>

							<div className="grid gap-2">
								<Label>What are you requesting?</Label>
								<ToggleGroup type="single" value={requestType} onValueChange={(v) => v && setRequestType(v as any)} className="w-full" variant="outline">
									<ToggleGroupItem value="clock-in" className="text-xs" disabled={disabledMap["clock-in"]}>Clock In</ToggleGroupItem>
									<ToggleGroupItem value="lunch-break-start" className="text-xs" disabled={disabledMap["lunch-break-start"]}>Lunch Out</ToggleGroupItem>
									<ToggleGroupItem value="lunch-break-end" className="text-xs" disabled={disabledMap["lunch-break-end"]}>Lunch In</ToggleGroupItem>
									<ToggleGroupItem value="clock-out" className="text-xs" disabled={disabledMap["clock-out"]}>Clock Out</ToggleGroupItem>
								</ToggleGroup>
								<p className="text-[12px] text-muted-foreground">Requests here are limited to today only</p>
							</div>
						</div>
					)}
				</div>
				<DialogFooter className="sticky bottom-0 left-0 right-0 bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
					<Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
					{method === "request" && (
						<Button className="gap-2" disabled={locationStatus === "denied" || locationStatus === "error" || locationStatus === "idle"}>
							<FileTextIcon className="size-4" /> Submit request
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}