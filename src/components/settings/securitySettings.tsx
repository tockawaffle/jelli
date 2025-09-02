"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, Clock, Copy, Eye, EyeOff, Key, Lock, RefreshCw, Shield, Smartphone } from "lucide-react"
import { useState } from "react"
import EnhancedSecurityActivity from "./securityActivity"

export default function SecuritySettings() {
	const [isLoading, setIsLoading] = useState(false)
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
	const [showCurrentPassword, setShowCurrentPassword] = useState(false)
	const [showNewPassword, setShowNewPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [showBackupCodes, setShowBackupCodes] = useState(false)
	const [backupCodes] = useState([
		"ABC123DEF456",
		"GHI789JKL012",
		"MNO345PQR678",
		"STU901VWX234",
		"YZA567BCD890",
		"EFG123HIJ456",
		"KLM789NOP012",
		"QRS345TUV678"
	])

	const lastPasswordChange = "3 months ago"
	const activeSessions = 2

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-6"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			{/* Security Overview */}
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
						<h3 className="text-lg font-semibold text-foreground">Security Overview</h3>
						<p className="text-sm text-muted-foreground">Your account security status and quick actions</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Lock className="h-4 w-4 text-primary" />
							<span className="text-sm font-medium">Password</span>
						</div>
						<p className="text-xs text-muted-foreground">Last changed {lastPasswordChange}</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Smartphone className="h-4 w-4 text-green-500" />
							<span className="text-sm font-medium">2FA Status</span>
						</div>
						<p className="text-xs text-muted-foreground">{twoFactorEnabled ? "Enabled" : "Disabled"}</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Clock className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">Active Sessions</span>
						</div>
						<p className="text-xs text-muted-foreground">{activeSessions} devices</p>
					</div>
				</div>
			</motion.div>

			{/* Password Settings */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Key className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Password & Authentication</h3>
							<p className="text-sm text-muted-foreground">Manage your password and authentication methods</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					<div className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="currentPassword" className="text-sm font-medium">Current Password</Label>
							<div className="relative">
								<Input
									id="currentPassword"
									type={showCurrentPassword ? "text" : "password"}
									className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowCurrentPassword(!showCurrentPassword)}
								>
									{showCurrentPassword ? (
										<EyeOff className="h-4 w-4 text-muted-foreground" />
									) : (
										<Eye className="h-4 w-4 text-muted-foreground" />
									)}
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
							<div className="relative">
								<Input
									id="newPassword"
									type={showNewPassword ? "text" : "password"}
									className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowNewPassword(!showNewPassword)}
								>
									{showNewPassword ? (
										<EyeOff className="h-4 w-4 text-muted-foreground" />
									) : (
										<Eye className="h-4 w-4 text-muted-foreground" />
									)}
								</Button>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-10"
								/>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4 text-muted-foreground" />
									) : (
										<Eye className="h-4 w-4 text-muted-foreground" />
									)}
								</Button>
							</div>
						</div>
						<Button
							disabled={isLoading}
							className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
						>
							{isLoading ? "Updating..." : "Update Password"}
						</Button>
					</div>
				</div>
			</motion.div>

			{/* Two-Factor Authentication */}
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
							<h3 className="text-lg font-semibold text-foreground">Two-Factor Authentication</h3>
							<p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<p className="font-medium">Two-Factor Authentication</p>
								{twoFactorEnabled ? (
									<Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
										<CheckCircle className="h-3 w-3 mr-1" />
										Enabled
									</Badge>
								) : (
									<Badge variant="destructive">
										<AlertTriangle className="h-3 w-3 mr-1" />
										Disabled
									</Badge>
								)}
							</div>
							<p className="text-sm text-muted-foreground">
								{twoFactorEnabled
									? "Your account is protected with two-factor authentication."
									: "Enable two-factor authentication for enhanced security."}
							</p>
						</div>
						<Switch
							checked={twoFactorEnabled}
							onCheckedChange={setTwoFactorEnabled}
							className="shrink-0"
						/>
					</div>

					{twoFactorEnabled && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="space-y-4 p-4 bg-background/50 rounded-lg border border-border/50"
						>
							<div className="flex items-center justify-between">
								<h4 className="font-medium">Backup Codes</h4>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setShowBackupCodes(!showBackupCodes)}
								>
									{showBackupCodes ? "Hide Codes" : "View Codes"}
								</Button>
							</div>
							<p className="text-sm text-muted-foreground">
								Store these backup codes in a safe place. You can use them to access your account if you lose your
								phone.
							</p>

							{showBackupCodes && (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className="space-y-3"
								>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-muted/50 rounded-lg font-mono text-sm">
										{backupCodes.map((code, index) => (
											<div key={index} className="flex items-center justify-between p-2 bg-background rounded border">
												<span>{code}</span>
												<Button
													variant="ghost"
													size="sm"
													className="h-6 w-6 p-0"
													onClick={() => navigator.clipboard.writeText(code)}
												>
													<Copy className="h-3 w-3" />
												</Button>
											</div>
										))}
									</div>
									<div className="flex gap-2">
										<Button variant="outline" size="sm">
											<Copy className="h-4 w-4 mr-2" />
											Copy All
										</Button>
										<Button variant="outline" size="sm">
											<RefreshCw className="h-4 w-4 mr-2" />
											Generate New
										</Button>
									</div>
								</motion.div>
							)}
						</motion.div>
					)}
				</div>
			</motion.div>

			{/* Account Recovery */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<h3 className="text-lg font-semibold text-foreground">Account Recovery</h3>
					<p className="text-sm text-muted-foreground">Set up recovery options in case you lose access to your account</p>
				</div>

				<div className="p-4 md:p-6 space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="recoveryEmail" className="text-sm font-medium">Recovery Email</Label>
							<Input
								id="recoveryEmail"
								type="email"
								placeholder="recovery@example.com"
								className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="recoveryPhone" className="text-sm font-medium">Recovery Phone</Label>
							<Input
								id="recoveryPhone"
								type="tel"
								placeholder="+1 (555) 123-4567"
								className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
							/>
						</div>
					</div>
					<Button variant="outline" className="w-full sm:w-auto">
						Update Recovery Options
					</Button>
				</div>
			</motion.div>

			{/* Enhanced Security Activity */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.5 }}
			>
				<EnhancedSecurityActivity />
			</motion.div>
		</motion.div>
	)
}
