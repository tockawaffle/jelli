"use client"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { AlertTriangle, Building2, Camera, Check, Crown, ExternalLink, Github, MoreHorizontal, Settings, Shield, Slack, Trash2 } from "lucide-react"
import { useState } from "react"

export default function AccountSettings() {
	const [isLoading, setIsLoading] = useState(false)
	const [profileLoading, setProfileLoading] = useState(false)

	const connectedAccounts = [
		{ name: "GitHub", icon: Github, connected: true, email: "john@github.com" },
		{ name: "Slack", icon: Slack, connected: true, email: "john@workspace.slack.com" },
		{ name: "Google", icon: ExternalLink, connected: false, email: null },
	]

	const organizationInfo = {
		name: "Acme Corp",
		role: "Owner",
		joinedDate: "January 15, 2024",
		memberCount: 24,
		plan: "Professional",
		permissions: ["Manage team", "Billing access", "API access", "Export data"],
	}

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-6"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			{/* Organization Overview - Simplified & Mobile-First */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="bg-card/50 border border-border/50 rounded-xl p-4 md:p-6 backdrop-blur-sm"
			>
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
							<Building2 className="h-6 w-6 text-primary" />
						</div>
						<div>
							<h3 className="font-semibold text-lg text-foreground">{organizationInfo.name}</h3>
							<p className="text-sm text-muted-foreground">{organizationInfo.memberCount} team members</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Crown className="h-4 w-4 text-primary" />
						<Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
							{organizationInfo.role}
						</Badge>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-8 w-8 p-0">
									<MoreHorizontal className="h-4 w-4" />
									<span className="sr-only">Organization actions</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">
								<DropdownMenuItem>
									<Building2 className="h-4 w-4 mr-2" />
									Manage Organization
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Shield className="h-4 w-4 mr-2" />
									View Permissions
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Settings className="h-4 w-4 mr-2" />
									Organization Settings
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				<div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Plan</Label>
						<p className="text-sm font-medium text-foreground">{organizationInfo.plan}</p>
					</div>
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Member since</Label>
						<p className="text-sm font-medium text-foreground">{organizationInfo.joinedDate}</p>
					</div>
				</div>

				<div className="mt-4 flex flex-wrap gap-2">
					{organizationInfo.permissions.map((permission, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, scale: 0.8 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.2, delay: index * 0.05 }}
						>
							<Badge variant="outline" className="text-xs bg-muted/50 hover:bg-muted transition-colors">
								{permission}
							</Badge>
						</motion.div>
					))}
				</div>
			</motion.div>

			{/* Profile Information - Cleaner Design */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
					<p className="text-sm text-muted-foreground">Update your personal information and profile picture.</p>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					{profileLoading ? (
						<div className="space-y-4">
							<div className="flex items-center gap-4">
								<Skeleton className="h-16 w-16 rounded-full" />
								<div className="space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
						</div>
					) : (
						<>
							<div className="flex flex-col sm:flex-row sm:items-center gap-4">
								<Avatar className="h-16 w-16 ring-2 ring-border/50">
									<AvatarImage src="/placeholder-user.jpg" alt="Profile" />
									<AvatarFallback className="bg-primary/10 text-primary font-semibold">JD</AvatarFallback>
								</Avatar>
								<div className="space-y-2">
									<Button variant="outline" size="sm" className="hover:bg-muted/50">
										<Camera className="h-4 w-4 mr-2" />
										Change Photo
									</Button>
									<p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
									<Input
										id="firstName"
										defaultValue="John"
										className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
									<Input
										id="lastName"
										defaultValue="Doe"
										className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
								<Input
									id="email"
									type="email"
									defaultValue="john@company.com"
									className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
								<Textarea
									id="bio"
									placeholder="Tell us about yourself..."
									className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 resize-none"
								/>
							</div>

							<Button
								disabled={isLoading}
								className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
							>
								{isLoading ? "Saving..." : "Save Changes"}
							</Button>
						</>
					)}
				</div>
			</motion.div>

			{/* Connected Accounts - Streamlined */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<h3 className="text-lg font-semibold text-foreground">Connected Accounts</h3>
					<p className="text-sm text-muted-foreground">Manage your connected third-party accounts.</p>
				</div>

				<div className="p-4 md:p-6">
					<div className="space-y-3">
						{connectedAccounts.map((account, index) => (
							<motion.div
								key={account.name}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
							>
								<div className="flex items-center gap-3 min-w-0 flex-1">
									<div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
										<account.icon className="h-5 w-5 text-muted-foreground" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm text-foreground">{account.name}</p>
										{account.connected && account.email && (
											<p className="text-xs text-muted-foreground truncate">{account.email}</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-3 shrink-0">
									{account.connected ? (
										<>
											<div className="flex items-center gap-2">
												<Check className="h-4 w-4 text-green-500" />
												<Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
													Connected
												</Badge>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
											>
												Disconnect
											</Button>
										</>
									) : (
										<Button
											variant="outline"
											size="sm"
											className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30"
										>
											Connect
										</Button>
									)}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div>

			{/* Danger Zone - More Subtle */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="bg-card/50 border border-destructive/20 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-destructive/20">
					<div className="flex items-center gap-2">
						<AlertTriangle className="h-5 w-5 text-destructive" />
						<h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
					</div>
					<p className="text-sm text-muted-foreground">Irreversible and destructive actions.</p>
				</div>

				<div className="p-4 md:p-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5 dark:bg-destructive/10">
						<div>
							<h4 className="font-medium text-destructive">Delete Account</h4>
							<p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
						</div>
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" size="sm" className="shrink-0">
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Account
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
									<AlertDialogDescription>
										This action cannot be undone. This will permanently delete your account and remove all your data
										from our servers.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Cancel</AlertDialogCancel>
									<AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete Account</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</motion.div>
		</motion.div>
	)
}
