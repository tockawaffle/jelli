import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { authClient } from "@/lib/auth-client";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, FileTextIcon, MapPin, QrCode, Settings, SmartphoneNfc } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { METHOD_OPTIONS } from "./constants";
import { useLocationPermission } from "./hooks";
import type { ClockInOutMethod, ControlledProps, RequestType } from "./types";
import { calculateDistance, getDisabledMap, getRecommendationReason, getRecommendedType, isWithinRange } from "./utils";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

export default function ClockInOutDialog({
	open,
	onOpenChange,
	error,
	userRole,
	hasRegisteredDevice = false,
	attendance
}: ControlledProps) {
	const [method, setMethod] = useState<ClockInOutMethod>("request");
	const [requestType, setRequestType] = useState<RequestType>("clock-in");
	const { data: activeOrg } = authClient.useActiveOrganization();

	const orgMetadata: OrgMetadata = typeof activeOrg?.metadata === "string" ? JSON.parse(activeOrg?.metadata) : activeOrg?.metadata;

	const now = dayjs().tz(orgMetadata.hours.timezone);
	const startOfDay = now.startOf('day');
	const closingTime = startOfDay.format('YYYY-MM-DD') + ` ${orgMetadata.hours.close}`;
	const closingTimeDate = dayjs(closingTime).tz(orgMetadata.hours.timezone);
	const gracePeriod = orgMetadata.hours.gracePeriod;
	const closingTimeMinusGracePeriod = closingTimeDate.subtract(dayjs.duration(gracePeriod, "minutes"));
	const isBefore = now.isBefore(closingTimeMinusGracePeriod);

	const { locationStatus, userLocation, requestLocationPermission } = useLocationPermission(open);

	const status: string = (attendance[0])?.status ?? "NONE";
	const disabledMap = getDisabledMap(status);

	useEffect(() => {
		console.log(isBefore);
		console.log(closingTime)
	}, [now, closingTime, gracePeriod]);

	useEffect(() => {
		if (method === "request") {
			setRequestType(getRecommendedType(attendance[0]));
		}
	}, [method, attendance]);

	useEffect(() => {
		if (locationStatus === "granted" && !userLocation) {
			requestLocationPermission();
		}
	}, [locationStatus, userLocation]);

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
						{
							requestType === "clock-out" && now.isAfter(closingTimeMinusGracePeriod) && (
								<motion.div
									className="bg-warning/10 border border-warning/20 text-warning p-4 rounded-lg text-sm flex items-center gap-2"
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									role="alert"
									aria-live="polite"
								>
									<AlertTriangle className="h-4 w-4 shrink-0" />
									The grace period for clocking out has ended. Create a request instead to clock out.
								</motion.div>
							)
						}
						{
							requestType === "clock-out" && now.isBefore(closingTimeMinusGracePeriod) && (
								<motion.div
									className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm flex items-center gap-2"
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									role="alert"
									aria-live="polite"
								>
									<AlertTriangle className="h-4 w-4 shrink-0" />
									Are you sure you want to clock out early? This action is irreversible and will be recorded as an early out.
								</motion.div>
							)
						}
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
									{METHOD_OPTIONS.map((option, index) => {
										const Icon = option.icon;
										const isSelected = method === option.id;
										const isDisabled = option.id === "qr" && !hasRegisteredDevice;
										return (
											<motion.button
												key={option.id}
												className={`relative p-4 rounded-xl border text-center transition-all duration-200 ${isSelected
													? "bg-primary/10 border-primary/30 text-primary"
													: "bg-background/50 border-border/50 hover:bg-muted/50 hover:border-border"
													} ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"}`}
												onClick={() => !isDisabled && setMethod(option.id)}
												disabled={isDisabled}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3, delay: index * 0.1 }}
												whileHover={isDisabled ? {} : { y: -2 }}
												whileTap={isDisabled ? {} : { scale: 0.98 }}
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
										<Badge variant="secondary">
											{
												requestType.replaceAll("-", " ").charAt(0).toUpperCase() + requestType.replaceAll("-", " ").slice(1)
											}
										</Badge>
										<span className="text-xs text-muted-foreground">— {getRecommendationReason(attendance[0], requestType, now, orgMetadata)}</span>
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
										<ToggleGroup type="single" value={requestType} onValueChange={(v) => v && setRequestType(v as RequestType)} className="w-full" variant="outline">
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
												<span className="text-xs text-muted-foreground">— {getRecommendationReason(attendance[0], requestType, now, orgMetadata)}</span>
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
								disabled={locationStatus === "denied" || locationStatus === "error" || locationStatus === "idle" || locationStatus === "checking" || !userLocation}
								onClick={() => {
									if (!activeOrg) return;
									const orgMetadata = typeof activeOrg.metadata === "string" ? JSON.parse(activeOrg.metadata) : activeOrg.metadata;
									// Check if the location is within the organization's location
									if (!orgMetadata.location) {
										toast.error("Organization location is not set. Please contact an admin to set the location.")
										return
									}

									if (orgMetadata.location.latitude && orgMetadata.location.longitude) {
										// Check if user location is available
										if (!userLocation) {
											toast.error("Unable to get your location. Please try again.");
											return;
										}

										// Calculate distance and check if within range (100 meters by default)
										const distance = calculateDistance(
											userLocation.latitude,
											userLocation.longitude,
											orgMetadata.location.latitude,
											orgMetadata.location.longitude
										);

										const withinRange = isWithinRange(
											userLocation.latitude,
											userLocation.longitude,
											orgMetadata.location.latitude,
											orgMetadata.location.longitude
										);

										if (!withinRange) {
											toast.error(
												`You're too far from the organization location. Distance: ${Math.round(distance)}m (max: 100m)`
											);
											return;
										}

										// User is within range, proceed with clock-in
										console.debug(`User is within range. Distance: ${distance.toFixed(2)}m`);
									}

									switch (requestType) {
										case "clock-in": {
											authClient.attendance.clockIn({}, {
												onSuccess: () => {
													toast.success("Clocked in successfully");
													onOpenChange(false);
												},
												onError: (error) => {
													toast.error("Failed to clock-in. Please try again.");
													console.error(error);
												}
											});
											break;
										}
										case "lunch-break-start": {
											authClient.attendance.lunchStart({}, {
												onSuccess: () => {
													toast.success("Lunch break started successfully");
													onOpenChange(false);
												},
												onError: ({ error }) => {
													if (error.code === "CLOCK_LS_OUT_OF_TIME") {
														toast.error(error.message || "You cannot start lunch break after the grace period. Please try again.");
														console.error(error);
														return;
													} else {
														toast.error(error.message || "Failed to start lunch break. Please try again.");
														console.error(error);
														return;
													}
												}
											});
											break;
										}
										case "lunch-break-end": {
											authClient.attendance.lunchReturn({}, {
												onSuccess: () => {
													toast.success("Welcome back from lunch! Hope it was refreshing.");
													onOpenChange(false);
												},
												onError: ({ error }) => {
													if (error.code === "CLOCK_LR_AFTER_TIME") {
														toast.error(error.message || "You cannot return from lunch break after the grace period. Please try again.");
													} else if (error.code === "CLOCK_LR_BEFORE_TIME") {
														toast.error(error.message || "You cannot return from lunch break before the grace period. Please try again.");
													} else {
														toast.error(error.message || "Failed to end lunch break. Please try again.");
													}
												}
											});
											break;
										}
									}
								}}
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

