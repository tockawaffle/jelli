"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { AlertTriangle, Cookie, Database, Download, Eye, FileText, Globe, Lock, Shield, Trash2, Users } from "lucide-react"
import { useState } from "react"

export default function PrivacySettings() {
	const [dataSharing, setDataSharing] = useState(false)
	const [analytics, setAnalytics] = useState(true)
	const [profileVisibility, setProfileVisibility] = useState("team")
	const [marketingCookies, setMarketingCookies] = useState(false)
	const [analyticsCookies, setAnalyticsCookies] = useState(true)

	const privacyScore = 75 // Based on current settings
	const dataCollected = "2.3 MB"
	const lastDataExport = "Never"

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-6"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			{/* Privacy Overview */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="bg-card/50 border border-border/50 rounded-xl p-4 md:p-6 backdrop-blur-sm"
			>
				<div className="flex items-center gap-3 mb-4">
					<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
						<Shield className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground">Privacy Overview</h3>
						<p className="text-sm text-muted-foreground">Your data and privacy status</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Shield className="h-4 w-4 text-green-500" />
							<span className="text-sm font-medium">Privacy Score</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{privacyScore}%</p>
						<p className="text-xs text-muted-foreground">Good protection level</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Database className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">Data Collected</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{dataCollected}</p>
						<p className="text-xs text-muted-foreground">Total data stored</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<FileText className="h-4 w-4 text-orange-500" />
							<span className="text-sm font-medium">Last Export</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{lastDataExport}</p>
						<p className="text-xs text-muted-foreground">Data backup status</p>
					</div>
				</div>
			</motion.div>

			{/* Data Sharing & Privacy */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Eye className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Data Sharing & Privacy</h3>
							<p className="text-sm text-muted-foreground">Control how your data is shared and used</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<Label htmlFor="data-sharing" className="text-sm font-medium">Share Usage Data</Label>
							<p className="text-sm text-muted-foreground">
								Help improve Jelli by sharing anonymous usage data and analytics.
							</p>
						</div>
						<Switch
							id="data-sharing"
							checked={dataSharing}
							onCheckedChange={setDataSharing}
							className="shrink-0"
						/>
					</div>

					<Separator className="my-4" />

					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<Label htmlFor="analytics" className="text-sm font-medium">Analytics & Performance</Label>
							<p className="text-sm text-muted-foreground">
								Allow collection of performance data to help optimize your experience.
							</p>
						</div>
						<Switch
							id="analytics"
							checked={analytics}
							onCheckedChange={setAnalytics}
							className="shrink-0"
						/>
					</div>
				</div>
			</motion.div>

			{/* Profile Visibility */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Users className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Profile Visibility</h3>
							<p className="text-sm text-muted-foreground">Choose who can see your profile information</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<RadioGroup value={profileVisibility} onValueChange={setProfileVisibility} className="space-y-4">
						<motion.div
							className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
							whileHover={{ scale: 1.01 }}
							transition={{ duration: 0.2 }}
						>
							<RadioGroupItem value="public" id="public" />
							<Label htmlFor="public" className="flex-1 cursor-pointer">
								<div className="flex items-center gap-2">
									<Globe className="h-4 w-4 text-blue-500" />
									<div>
										<p className="font-medium">Public</p>
										<p className="text-sm text-muted-foreground">Anyone can see your profile</p>
									</div>
								</div>
							</Label>
						</motion.div>
						<motion.div
							className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
							whileHover={{ scale: 1.01 }}
							transition={{ duration: 0.2 }}
						>
							<RadioGroupItem value="team" id="team" />
							<Label htmlFor="team" className="flex-1 cursor-pointer">
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4 text-green-500" />
									<div>
										<p className="font-medium">Team Only</p>
										<p className="text-sm text-muted-foreground">Only team members can see your profile</p>
									</div>
								</div>
							</Label>
						</motion.div>
						<motion.div
							className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
							whileHover={{ scale: 1.01 }}
							transition={{ duration: 0.2 }}
						>
							<RadioGroupItem value="private" id="private" />
							<Label htmlFor="private" className="flex-1 cursor-pointer">
								<div className="flex items-center gap-2">
									<Lock className="h-4 w-4 text-red-500" />
									<div>
										<p className="font-medium">Private</p>
										<p className="text-sm text-muted-foreground">Only you can see your profile</p>
									</div>
								</div>
							</Label>
						</motion.div>
					</RadioGroup>
				</div>
			</motion.div>

			{/* Data Management */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Database className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Data Management</h3>
							<p className="text-sm text-muted-foreground">Download or delete your personal data</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
						<div className="flex items-center gap-3">
							<Download className="h-8 w-8 text-primary bg-primary/10 rounded-lg p-2" />
							<div>
								<h4 className="font-medium">Download Your Data</h4>
								<p className="text-sm text-muted-foreground">Get a copy of all your data in JSON format.</p>
							</div>
						</div>
						<Button variant="outline" className="shrink-0 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
							<Download className="h-4 w-4 mr-2" />
							Download
						</Button>
					</div>

					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5 dark:bg-destructive/10">
						<div className="flex items-center gap-3">
							<AlertTriangle className="h-8 w-8 text-destructive bg-destructive/10 rounded-lg p-2" />
							<div>
								<h4 className="font-medium text-destructive">Delete All Data</h4>
								<p className="text-sm text-muted-foreground">Permanently delete all your personal data.</p>
							</div>
						</div>
						<Button variant="destructive" className="shrink-0">
							<Trash2 className="h-4 w-4 mr-2" />
							Delete Data
						</Button>
					</div>
				</div>
			</motion.div>

			{/* Cookie Preferences */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.5 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Cookie className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Cookie Preferences</h3>
							<p className="text-sm text-muted-foreground">Manage your cookie and tracking preferences</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<div className="space-y-6">
						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border border-border/50">
							<div className="flex items-center gap-3">
								<Lock className="h-5 w-5 text-green-500" />
								<div>
									<Label className="text-sm font-medium">Essential Cookies</Label>
									<p className="text-sm text-muted-foreground">Required for the website to function</p>
								</div>
							</div>
							<Switch checked disabled className="shrink-0" />
						</div>

						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border border-border/50">
							<div className="flex items-center gap-3">
								<Eye className="h-5 w-5 text-blue-500" />
								<div>
									<Label className="text-sm font-medium">Analytics Cookies</Label>
									<p className="text-sm text-muted-foreground">Help us understand how you use our site</p>
								</div>
							</div>
							<Switch
								checked={analyticsCookies}
								onCheckedChange={setAnalyticsCookies}
								className="shrink-0"
							/>
						</div>

						<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-lg bg-background/50 border border-border/50">
							<div className="flex items-center gap-3">
								<Globe className="h-5 w-5 text-orange-500" />
								<div>
									<Label className="text-sm font-medium">Marketing Cookies</Label>
									<p className="text-sm text-muted-foreground">Used to show you relevant ads</p>
								</div>
							</div>
							<Switch
								checked={marketingCookies}
								onCheckedChange={setMarketingCookies}
								className="shrink-0"
							/>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	)
}
