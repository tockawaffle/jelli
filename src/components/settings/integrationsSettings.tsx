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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { motion } from "framer-motion"
import { Activity, BarChart3, BookOpen, Clock, Code, Copy, ExternalLink, Eye, EyeOff, Key, MoreHorizontal, Plus, RefreshCw, Settings, Trash2, TrendingUp, Webhook } from "lucide-react"
import { useState } from "react"

export default function IntegrationsSettings() {
	const [showApiKey, setShowApiKey] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	const monthlyRequests = 8432
	const monthlyLimit = 10000
	const rateLimit = 100
	const webhookDeliveries = 1234

	const apiKeys = [
		{
			id: 1,
			name: "Production API Key",
			key: "jelli_prod_1234567890abcdef",
			created: "Dec 1, 2024",
			lastUsed: "2 hours ago",
			status: "active",
		},
		{
			id: 2,
			name: "Development API Key",
			key: "jelli_dev_abcdef1234567890",
			created: "Nov 15, 2024",
			lastUsed: "1 day ago",
			status: "active",
		},
		{
			id: 3,
			name: "Testing API Key",
			key: "jelli_test_fedcba0987654321",
			created: "Oct 20, 2024",
			lastUsed: "Never",
			status: "inactive",
		},
	]

	const webhooks = [
		{
			id: 1,
			name: "Time Tracking Events",
			url: "https://api.company.com/webhooks/time",
			events: ["clock_in", "clock_out"],
			status: "active",
		},
		{
			id: 2,
			name: "Schedule Changes",
			url: "https://api.company.com/webhooks/schedule",
			events: ["schedule_updated"],
			status: "active",
		},
		{
			id: 3,
			name: "Team Updates",
			url: "https://api.company.com/webhooks/team",
			events: ["member_added", "member_removed"],
			status: "inactive",
		},
	]

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
	}

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-6"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			{/* API Overview */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="bg-card/50 border border-border/50 rounded-xl p-4 md:p-6 backdrop-blur-sm"
			>
				<div className="flex items-center gap-3 mb-4">
					<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
						<Code className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground">API Overview</h3>
						<p className="text-sm text-muted-foreground">Your API usage and integration status</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<BarChart3 className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">Requests</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{monthlyRequests.toLocaleString()}</p>
						<p className="text-xs text-muted-foreground">of {monthlyLimit.toLocaleString()} limit</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<TrendingUp className="h-4 w-4 text-green-500" />
							<span className="text-sm font-medium">Rate Limit</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{rateLimit}</p>
						<p className="text-xs text-muted-foreground">requests per minute</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Activity className="h-4 w-4 text-purple-500" />
							<span className="text-sm font-medium">Webhooks</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{webhookDeliveries.toLocaleString()}</p>
						<p className="text-xs text-muted-foreground">deliveries this month</p>
					</div>
				</div>
			</motion.div>

			{/* API Keys */}
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
							<h3 className="text-lg font-semibold text-foreground">API Keys</h3>
							<p className="text-sm text-muted-foreground">Manage your API keys for programmatic access to Jelli</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-4">
					{apiKeys.map((apiKey, index) => (
						<motion.div
							key={apiKey.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							className="flex flex-col gap-4 p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
						>
							<div className="flex items-start justify-between">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<p className="font-medium text-sm">{apiKey.name}</p>
										<Badge variant={apiKey.status === "active" ? "secondary" : "outline"} className={apiKey.status === "active" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : ""}>
											{apiKey.status}
										</Badge>
									</div>
									<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
										<code className="text-xs bg-muted/50 px-2 py-1 rounded font-mono break-all">
											{showApiKey ? apiKey.key : `${apiKey.key.substring(0, 12)}...`}
										</code>
										<div className="flex items-center gap-1">
											<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(apiKey.key)}>
												<Copy className="h-3 w-3" />
											</Button>
											<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowApiKey(!showApiKey)}>
												{showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
											</Button>
										</div>
									</div>
									<div className="text-xs text-muted-foreground">
										Created: {apiKey.created} • Last used: {apiKey.lastUsed}
									</div>
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="h-8 w-8 p-0 shrink-0">
											<MoreHorizontal className="h-4 w-4" />
											<span className="sr-only">API key actions</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-40">
										<DropdownMenuItem>
											<RefreshCw className="h-4 w-4 mr-2" />
											Rotate
										</DropdownMenuItem>
										<DropdownMenuItem>
											<Settings className="h-4 w-4 mr-2" />
											Edit
										</DropdownMenuItem>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
													<Trash2 className="h-4 w-4 mr-2" />
													Delete
												</DropdownMenuItem>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete API Key</AlertDialogTitle>
													<AlertDialogDescription>
														This will permanently delete the API key "{apiKey.name}". Any applications using this key will stop working.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</motion.div>
					))}

					<Button variant="outline" className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/30">
						<Plus className="h-4 w-4 mr-2" />
						Generate New API Key
					</Button>
				</div>
			</motion.div>

			{/* Webhooks */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Webhook className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Webhooks</h3>
							<p className="text-sm text-muted-foreground">Configure webhook endpoints for real-time notifications</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-4">
					{webhooks.map((webhook, index) => (
						<motion.div
							key={webhook.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							className="flex flex-col gap-4 p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
						>
							<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<p className="font-medium text-sm">{webhook.name}</p>
										<Badge variant={webhook.status === "active" ? "secondary" : "outline"} className={webhook.status === "active" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : ""}>
											{webhook.status}
										</Badge>
									</div>
									<p className="text-xs text-muted-foreground mb-2 break-all">{webhook.url}</p>
									<div className="flex flex-wrap gap-1">
										{webhook.events.map((event) => (
											<Badge key={event} variant="outline" className="text-xs">
												{event}
											</Badge>
										))}
									</div>
								</div>
								<div className="flex items-center gap-3 shrink-0">
									<Switch checked={webhook.status === "active"} />
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" size="sm" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
												<span className="sr-only">Webhook actions</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-40">
											<DropdownMenuItem>
												<Settings className="h-4 w-4 mr-2" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Activity className="h-4 w-4 mr-2" />
												Test
											</DropdownMenuItem>
											<DropdownMenuItem className="text-destructive">
												<Trash2 className="h-4 w-4 mr-2" />
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							</div>
						</motion.div>
					))}

					<Button variant="outline" className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/30">
						<Plus className="h-4 w-4 mr-2" />
						Add Webhook
					</Button>
				</div>
			</motion.div>

			{/* API Usage & Activity */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<BarChart3 className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">API Activity</h3>
							<p className="text-sm text-muted-foreground">Recent API usage and performance metrics</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					<div className="space-y-4">
						<h4 className="font-medium text-foreground">Recent API Activity</h4>
						<div className="space-y-3">
							{[
								{ endpoint: "GET /api/v1/time-entries", requests: 45, lastUsed: "2 minutes ago" },
								{ endpoint: "POST /api/v1/clock-in", requests: 12, lastUsed: "5 minutes ago" },
								{ endpoint: "GET /api/v1/team-members", requests: 8, lastUsed: "1 hour ago" },
							].map((activity, index) => (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
									className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-background/50 rounded-lg border border-border/50"
								>
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<Clock className="h-4 w-4 text-muted-foreground shrink-0" />
										<div className="min-w-0 flex-1">
											<code className="text-sm font-mono text-foreground break-all">{activity.endpoint}</code>
											<p className="text-xs text-muted-foreground">{activity.requests} requests today</p>
										</div>
									</div>
									<p className="text-xs text-muted-foreground shrink-0">{activity.lastUsed}</p>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</motion.div>

			{/* API Documentation */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.5 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<BookOpen className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">API Documentation</h3>
							<p className="text-sm text-muted-foreground">Learn how to integrate with Jelli's API</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{[
							{ title: "Getting Started Guide", description: "Learn the basics of using Jelli's API", icon: BookOpen },
							{ title: "API Reference", description: "Complete documentation of all endpoints", icon: Code },
							{ title: "Code Examples", description: "Sample code in multiple languages", icon: ExternalLink },
							{ title: "Webhook Guide", description: "Set up real-time event notifications", icon: Webhook },
						].map((doc, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								whileHover={{ scale: 1.02 }}
							>
								<Button
									variant="outline"
									className="h-auto p-4 flex flex-col items-start gap-3 bg-background/30 hover:bg-background/50 w-full text-left"
								>
									<div className="flex items-center gap-3 w-full">
										<div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
											<doc.icon className="h-4 w-4 text-primary" />
										</div>
										<div className="flex-1">
											<h4 className="font-medium text-sm">{doc.title}</h4>
											<p className="text-xs text-muted-foreground">{doc.description}</p>
										</div>
										<ExternalLink className="h-4 w-4 text-muted-foreground" />
									</div>
								</Button>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div>
		</motion.div>
	)
}
