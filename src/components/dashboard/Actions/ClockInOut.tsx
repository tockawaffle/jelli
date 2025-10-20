import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { authClient } from "@/lib/auth-client";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, FileTextIcon, MapPin, QrCode, Settings, SmartphoneNfc } from "lucide-react";
import React from "react";

type ControlledProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Optional error message to render inside the modal/sheet */
	error?: string | null;
	userRole: string
};

export default function ClockInOutDialog({ open, onOpenChange, error, userRole, hasRegisteredDevice = false }: ControlledProps & { hasRegisteredDevice?: boolean }) {

	const [method, setMethod] = React.useState<"qr" | "request" | "nfc">("request");
	const [requestType, setRequestType] = React.useState<"clock-in" | "clock-out" | "lunch-break-start" | "lunch-break-end" | "time-off">("clock-in");
	const { data: activeOrg } = authClient.useActiveOrganization();
	const todayRow = authClient.getAttendance({
		orgId: activeOrg?.id ?? "",
		dateInterval: {
			start: dayjs().startOf("day").toDate(),
			end: dayjs().endOf("day").toDate(),
		},
		limit: 1,
		offset: 0,
		sort: "desc",
	})
	type LocationStatus = "idle" | "checking" | "granted" | "denied" | "error";
	const [locationStatus, setLocationStatus] = React.useState<LocationStatus>("idle");
	const permissionStateRef = React.useRef<"granted" | "denied" | "prompt" | null>(null);

	const status: string = (todayRow as any)?.status ?? "NONE";

	const disabledMap: Record<typeof requestType, boolean> = {
		"clock-in": ["CLOCKED_IN", "LUNCH_BREAK_STARTED", "LUNCH_BREAK_ENDED"].includes(status),
		"lunch-break-start": status !== "CLOCKED_IN",
		"lunch-break-end": status !== "LUNCH_BREAK_STARTED",
		"clock-out": !["CLOCKED_IN", "LUNCH_BREAK_ENDED"].includes(status),
		"time-off": false,
	};

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
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-border/50">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
				>
					<DialogHeader className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
								<Clock className="h-5 w-5 text-primary" />
							</div>
							<div>
								<DialogTitle className="text-xl">Clock In / Clock Out</DialogTitle>
								<DialogDescription className="text-base">
									Choose your preferred method to record time
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>
					<div className="space-y-6 mt-6">
						{error && (
							<motion.div
								className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm flex items-center gap-2"
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								role="alert"
								aria-live="polite"
							>
								<AlertCircle className="h-4 w-4 shrink-0" />
								{error}
							</motion.div>
						)}

						{/* Method Selection */}
						<motion.div
							className="space-y-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<div className="space-y-2">
								<h3 className="text-sm font-medium text-foreground">Select Method</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									{[
										{
											id: "qr",
											icon: QrCode,
											title: "QR Code",
											description: "Scan at kiosk or team device",
											disabled: !hasRegisteredDevice
										},
										{
											id: "nfc",
											icon: SmartphoneNfc,
											title: "NFC Tag",
											description: "Tap NFC tag for instant clock in/out",
											disabled: false
										},
										{
											id: "request",
											icon: FileTextIcon,
											title: "Manual Request",
											description: "Best for off-site or time corrections",
											disabled: false
										}
									].map((option, index) => {
										const Icon = option.icon;
										const isSelected = method === option.id;
										return (
											<motion.button
												key={option.id}
												className={`relative p-4 rounded-xl border text-center transition-all duration-200 ${isSelected
													? "bg-primary/10 border-primary/30 text-primary"
													: "bg-background/50 border-border/50 hover:bg-muted/50 hover:border-border"
													} ${option.disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
												onClick={() => !option.disabled && setMethod(option.id as any)}
												disabled={option.disabled}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3, delay: index * 0.1 }}
												whileHover={option.disabled ? {} : { y: -2 }}
												whileTap={option.disabled ? {} : { scale: 0.98 }}
											>
												<div className="space-y-3">
													<div className={`h-12 w-12 mx-auto rounded-lg flex items-center justify-center ${isSelected ? "bg-primary/20" : "bg-muted/50"
														}`}>
														<Icon className="h-6 w-6" />
													</div>
													<div>
														<h4 className="font-medium text-sm">{option.title}</h4>
														<p className="text-xs text-muted-foreground mt-1">{option.description}</p>
													</div>
												</div>
												{isSelected && (
													<motion.div
														className="absolute inset-0 rounded-xl bg-primary/5"
														layoutId="method-selection"
														transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
													/>
												)}
											</motion.button>
										);
									})}
								</div>
							</div>
						</motion.div>
						{!hasRegisteredDevice && (
							<motion.div
								className="bg-accent/10 border border-accent/20 p-4 rounded-lg"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3, delay: 0.3 }}
							>
								<div className="flex items-start gap-3">
									<Settings className="h-4 w-4 text-accent mt-0.5 shrink-0" />
									<div className="text-sm">
										<p className="font-medium text-foreground">Device Linking Available</p>
										<p className="text-muted-foreground text-xs mt-1">
											Organization admins can link physical devices for one-click time tracking from specific computers.
										</p>
									</div>
								</div>
							</motion.div>
						)}
						{/* Method-specific Content */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.4 }}
						>
							{method === "request" && (
								<div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-4">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-medium">Recommended:</span>
										<span className="px-2 py-0.5 rounded-md bg-accent-foreground text-foreground text-xs">
											{requestType.replaceAll("-", " ")}
										</span>
										<span className="text-xs text-muted-foreground">— {getRecommendationReason(todayRow as any, requestType)}</span>
									</div>
									<div className="text-xs text-muted-foreground">Now: {dayjs().format("h:mm A")} — Today ({dayjs().format("ddd, MMM D")})</div>
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

							{method === "nfc" && (
								<div className="bg-card/50 border border-border/50 rounded-xl p-4">
									{!hasRegisteredDevice ? (
										userRole === "admin" || userRole === "owner" ? (
											<div className="space-y-2">
												<h3 className="text-sm font-medium">How to link a NFC device</h3>
												<p className="text-xs text-muted-foreground">
													You can link a physical NFC device by downloading the NFC app and creating an API key in the{" "}
													<button
														onClick={() => {
															localStorage.setItem("dashboard-last-action", "settings");
															window.dispatchEvent(new Event("storage-last-action"));
															onOpenChange(false);
														}}
														className="text-primary underline"
													>
														organization settings
													</button>.
													Once linked, all users in the organization can tap a NFC tag to clock in/out.
												</p>
											</div>
										) : (
											<div className="space-y-2">
												<h3 className="text-sm font-medium text-destructive">No NFC devices linked</h3>
												<p className="text-xs text-muted-foreground">
													There are no NFC devices linked to this organization. Ask an admin to link one.
												</p>
											</div>
										)
									) : (
										<div className="space-y-3">
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-medium">Recommended:</span>
												<span className="px-2 py-0.5 rounded-md bg-accent-foreground text-foreground text-xs">
													{requestType.replaceAll("-", " ")}
												</span>
												<span className="text-xs text-muted-foreground">— {getRecommendationReason(todayRow as any, requestType)}</span>
											</div>
										</div>
									)}
								</div>
							)}

							{method === "qr" && (
								<div className="bg-card/50 border border-border/50 rounded-xl p-4">
									<div className="text-center space-y-3">
										<QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
										<div>
											<h3 className="text-sm font-medium">QR Code Ready</h3>
											<p className="text-xs text-muted-foreground">Scan the QR code at your designated kiosk or team device</p>
										</div>
									</div>
								</div>
							)}
						</motion.div>
					</div>
					<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
						<Button variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						{method === "request" && (
							<Button
								className="gap-2"
								disabled={locationStatus === "denied" || locationStatus === "error" || locationStatus === "idle"}
							>
								<FileTextIcon className="h-4 w-4" />
								Submit Request
							</Button>
						)}
						{method === "qr" && hasRegisteredDevice && (
							<Button className="gap-2">
								<QrCode className="h-4 w-4" />
								Scan QR Code
							</Button>
						)}
						{method === "nfc" && (
							<Button className="gap-2" disabled={!hasRegisteredDevice}>
								<SmartphoneNfc className="h-4 w-4" />
								Ready for NFC
							</Button>
						)}
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}