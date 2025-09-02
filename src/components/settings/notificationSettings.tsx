"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { AlertCircle, Bell, Clock, Mail, Settings, Smartphone, Users, VolumeX, Zap } from "lucide-react"
import { useState } from "react"

export default function NotificationSettings() {
	const [emailNotifications, setEmailNotifications] = useState(true)
	const [pushNotifications, setPushNotifications] = useState(true)
	const [frequency, setFrequency] = useState("immediate")
	const [quietHours, setQuietHours] = useState(false)
	const [timeTrackingReminders, setTimeTrackingReminders] = useState(true)
	const [scheduleChanges, setScheduleChanges] = useState(true)
	const [teamUpdates, setTeamUpdates] = useState(false)
	const [weeklyReports, setWeeklyReports] = useState(true)
	const [systemMaintenance, setSystemMaintenance] = useState(true)
	const [clockReminders, setClockReminders] = useState(true)
	const [breakReminders, setBreakReminders] = useState(true)
	const [overtimeAlerts, setOvertimeAlerts] = useState(false)
	const [teamRequests, setTeamRequests] = useState(true)

	const totalNotifications = 47
	const todayNotifications = 12

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-6"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			{/* Notification Overview */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="bg-card/50 border border-border/50 rounded-xl p-4 md:p-6 backdrop-blur-sm"
			>
				<div className="flex items-center gap-3 mb-4">
					<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
						<Bell className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground">Notification Overview</h3>
						<p className="text-sm text-muted-foreground">Your notification preferences and activity</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Bell className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">Total This Week</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{totalNotifications}</p>
						<p className="text-xs text-muted-foreground">All notifications</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Zap className="h-4 w-4 text-green-500" />
							<span className="text-sm font-medium">Today</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{todayNotifications}</p>
						<p className="text-xs text-muted-foreground">New notifications</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<VolumeX className="h-4 w-4 text-orange-500" />
							<span className="text-sm font-medium">Quiet Hours</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{quietHours ? "On" : "Off"}</p>
						<p className="text-xs text-muted-foreground">Do not disturb</p>
					</div>
				</div>
			</motion.div>

			{/* Email Notifications */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Mail className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Email Notifications</h3>
							<p className="text-sm text-muted-foreground">Choose what email notifications you'd like to receive</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<Label htmlFor="email-notifications" className="text-sm font-medium">Email Notifications</Label>
							<p className="text-sm text-muted-foreground">Receive notifications via email</p>
						</div>
						<Switch
							id="email-notifications"
							checked={emailNotifications}
							onCheckedChange={setEmailNotifications}
							className="shrink-0"
						/>
					</div>

					{emailNotifications && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/50"
						>
							<div className="space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Clock className="h-4 w-4 text-blue-500" />
										<Label className="text-sm font-medium">Time tracking reminders</Label>
									</div>
									<Switch
										checked={timeTrackingReminders}
										onCheckedChange={setTimeTrackingReminders}
										className="shrink-0"
									/>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Settings className="h-4 w-4 text-green-500" />
										<Label className="text-sm font-medium">Schedule changes</Label>
									</div>
									<Switch
										checked={scheduleChanges}
										onCheckedChange={setScheduleChanges}
										className="shrink-0"
									/>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Users className="h-4 w-4 text-purple-500" />
										<Label className="text-sm font-medium">Team updates</Label>
									</div>
									<Switch
										checked={teamUpdates}
										onCheckedChange={setTeamUpdates}
										className="shrink-0"
									/>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Bell className="h-4 w-4 text-orange-500" />
										<Label className="text-sm font-medium">Weekly reports</Label>
									</div>
									<Switch
										checked={weeklyReports}
										onCheckedChange={setWeeklyReports}
										className="shrink-0"
									/>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<AlertCircle className="h-4 w-4 text-red-500" />
										<Label className="text-sm font-medium">System maintenance</Label>
									</div>
									<Switch
										checked={systemMaintenance}
										onCheckedChange={setSystemMaintenance}
										className="shrink-0"
									/>
								</div>
							</div>
						</motion.div>
					)}
				</div>
			</motion.div>

			{/* Push Notifications */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Smartphone className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Push Notifications</h3>
							<p className="text-sm text-muted-foreground">Manage in-app and browser notifications</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<Label htmlFor="push-notifications" className="text-sm font-medium">Push Notifications</Label>
							<p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
						</div>
						<Switch
							id="push-notifications"
							checked={pushNotifications}
							onCheckedChange={setPushNotifications}
							className="shrink-0"
						/>
					</div>

					{pushNotifications && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/50"
						>
							<div className="space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Clock className="h-4 w-4 text-blue-500" />
										<Label className="text-sm font-medium">Clock in/out reminders</Label>
									</div>
									<Switch
										checked={clockReminders}
										onCheckedChange={setClockReminders}
										className="shrink-0"
									/>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<VolumeX className="h-4 w-4 text-green-500" />
										<Label className="text-sm font-medium">Break reminders</Label>
									</div>
									<Switch
										checked={breakReminders}
										onCheckedChange={setBreakReminders}
										className="shrink-0"
									/>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<AlertCircle className="h-4 w-4 text-red-500" />
										<Label className="text-sm font-medium">Overtime alerts</Label>
									</div>
									<Switch
										checked={overtimeAlerts}
										onCheckedChange={setOvertimeAlerts}
										className="shrink-0"
									/>
								</div>
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
									<div className="flex items-center gap-3">
										<Users className="h-4 w-4 text-purple-500" />
										<Label className="text-sm font-medium">Team member requests</Label>
									</div>
									<Switch
										checked={teamRequests}
										onCheckedChange={setTeamRequests}
										className="shrink-0"
									/>
								</div>
							</div>
						</motion.div>
					)}
				</div>
			</motion.div>

			{/* Notification Frequency */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Bell className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Notification Frequency</h3>
							<p className="text-sm text-muted-foreground">Choose how often you want to receive notifications</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-4">
						<motion.div
							className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
							whileHover={{ scale: 1.01 }}
							transition={{ duration: 0.2 }}
						>
							<RadioGroupItem value="immediate" id="immediate" />
							<Label htmlFor="immediate" className="flex-1 cursor-pointer">
								<div className="flex items-center gap-2">
									<Zap className="h-4 w-4 text-yellow-500" />
									<div>
										<p className="font-medium">Immediate</p>
										<p className="text-sm text-muted-foreground">Get notified right away</p>
									</div>
								</div>
							</Label>
						</motion.div>
						<motion.div
							className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
							whileHover={{ scale: 1.01 }}
							transition={{ duration: 0.2 }}
						>
							<RadioGroupItem value="hourly" id="hourly" />
							<Label htmlFor="hourly" className="flex-1 cursor-pointer">
								<div className="flex items-center gap-2">
									<Clock className="h-4 w-4 text-blue-500" />
									<div>
										<p className="font-medium">Hourly Digest</p>
										<p className="text-sm text-muted-foreground">Receive a summary every hour</p>
									</div>
								</div>
							</Label>
						</motion.div>
						<motion.div
							className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
							whileHover={{ scale: 1.01 }}
							transition={{ duration: 0.2 }}
						>
							<RadioGroupItem value="daily" id="daily" />
							<Label htmlFor="daily" className="flex-1 cursor-pointer">
								<div className="flex items-center gap-2">
									<Bell className="h-4 w-4 text-green-500" />
									<div>
										<p className="font-medium">Daily Digest</p>
										<p className="text-sm text-muted-foreground">Get a daily summary</p>
									</div>
								</div>
							</Label>
						</motion.div>
						<motion.div
							className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
							whileHover={{ scale: 1.01 }}
							transition={{ duration: 0.2 }}
						>
							<RadioGroupItem value="weekly" id="weekly" />
							<Label htmlFor="weekly" className="flex-1 cursor-pointer">
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-purple-500" />
									<div>
										<p className="font-medium">Weekly Digest</p>
										<p className="text-sm text-muted-foreground">Receive a weekly summary</p>
									</div>
								</div>
							</Label>
						</motion.div>
					</RadioGroup>
				</div>
			</motion.div>

			{/* Quiet Hours */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.5 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<VolumeX className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Quiet Hours</h3>
							<p className="text-sm text-muted-foreground">Set times when you don't want to receive notifications</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<Label className="text-sm font-medium">Enable Quiet Hours</Label>
							<p className="text-sm text-muted-foreground">Pause notifications during specified times</p>
						</div>
						<Switch
							checked={quietHours}
							onCheckedChange={setQuietHours}
							className="shrink-0"
						/>
					</div>

					{quietHours && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg border border-border/50"
						>
							<div className="flex items-center gap-3">
								<Clock className="h-5 w-5 text-muted-foreground" />
								<div>
									<Label className="text-sm font-medium">Start Time</Label>
									<p className="text-sm text-muted-foreground">10:00 PM</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Clock className="h-5 w-5 text-muted-foreground" />
								<div>
									<Label className="text-sm font-medium">End Time</Label>
									<p className="text-sm text-muted-foreground">8:00 AM</p>
								</div>
							</div>
						</motion.div>
					)}
				</div>
			</motion.div>
		</motion.div>
	)
}
