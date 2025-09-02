"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { motion } from "framer-motion"
import { Calendar, CreditCard, DollarSign, Download, Edit, MapPin, MoreHorizontal, Plus, Trash2, TrendingUp, Users } from "lucide-react"
import { useState } from "react"

export default function BillingSettings() {
	const [isLoading, setIsLoading] = useState(false)

	const paymentMethods = [
		{ id: 1, type: "Visa", last4: "4242", expiry: "12/25", isDefault: true },
		{ id: 2, type: "Mastercard", last4: "8888", expiry: "09/26", isDefault: false },
	]

	const billingHistory = [
		{ id: 1, date: "Dec 1, 2024", amount: "$29.00", status: "Paid", invoice: "INV-001" },
		{ id: 2, date: "Nov 1, 2024", amount: "$29.00", status: "Paid", invoice: "INV-002" },
		{ id: 3, date: "Oct 1, 2024", amount: "$29.00", status: "Paid", invoice: "INV-003" },
	]

	const currentSpend = 29
	const nextBilling = "January 1, 2025"
	const totalTeamMembers = 24

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-6"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			{/* Billing Overview */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="bg-card/50 border border-border/50 rounded-xl p-4 md:p-6 backdrop-blur-sm"
			>
				<div className="flex items-center gap-3 mb-4">
					<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
						<DollarSign className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground">Billing Overview</h3>
						<p className="text-sm text-muted-foreground">Your subscription and billing status</p>
					</div>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<DollarSign className="h-4 w-4 text-green-500" />
							<span className="text-sm font-medium">Current Spend</span>
						</div>
						<p className="text-lg font-semibold text-foreground">${currentSpend}</p>
						<p className="text-xs text-muted-foreground">This month</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Calendar className="h-4 w-4 text-blue-500" />
							<span className="text-sm font-medium">Next Billing</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{nextBilling}</p>
						<p className="text-xs text-muted-foreground">Professional Plan</p>
					</div>
					<div className="p-3 rounded-lg bg-background/50 border border-border/50">
						<div className="flex items-center gap-2 mb-1">
							<Users className="h-4 w-4 text-purple-500" />
							<span className="text-sm font-medium">Team Size</span>
						</div>
						<p className="text-lg font-semibold text-foreground">{totalTeamMembers}</p>
						<p className="text-xs text-muted-foreground">Active members</p>
					</div>
				</div>
			</motion.div>

			{/* Current Plan */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<TrendingUp className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Current Plan</h3>
							<p className="text-sm text-muted-foreground">Manage your subscription and billing details</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-6">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-border/50 rounded-lg bg-primary/5">
						<div className="flex items-center gap-3">
							<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
								<TrendingUp className="h-6 w-6 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold text-lg text-foreground">Professional Plan</h3>
								<p className="text-sm text-muted-foreground">Up to 50 team members</p>
								<p className="text-xs text-muted-foreground mt-1">Next billing: {nextBilling}</p>
							</div>
						</div>
						<div className="text-right">
							<p className="text-3xl font-bold text-primary">$29</p>
							<p className="text-sm text-muted-foreground">per month</p>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-3">
						<Button variant="outline" className="hover:bg-primary/10 hover:text-primary hover:border-primary/30">
							Change Plan
						</Button>
						<Button variant="outline" className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30">
							Cancel Subscription
						</Button>
					</div>
				</div>
			</motion.div>

			{/* Payment Methods */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<CreditCard className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
							<p className="text-sm text-muted-foreground">Manage your payment methods and billing information</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-4">
					{paymentMethods.map((method, index) => (
						<motion.div
							key={method.id}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
						>
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
									<CreditCard className="h-5 w-5 text-muted-foreground" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-sm text-foreground">
										{method.type} •••• {method.last4}
									</p>
									<p className="text-xs text-muted-foreground">Expires {method.expiry}</p>
								</div>
							</div>
							<div className="flex items-center gap-3 shrink-0">
								{method.isDefault && (
									<Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
										Default
									</Badge>
								)}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="outline" size="sm" className="h-8 w-8 p-0">
											<MoreHorizontal className="h-4 w-4" />
											<span className="sr-only">Payment method actions</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-40">
										<DropdownMenuItem>
											<Edit className="h-4 w-4 mr-2" />
											Edit
										</DropdownMenuItem>
										{!method.isDefault && (
											<DropdownMenuItem>
												<CreditCard className="h-4 w-4 mr-2" />
												Set as Default
											</DropdownMenuItem>
										)}
										<DropdownMenuItem className="text-destructive">
											<Trash2 className="h-4 w-4 mr-2" />
											Remove
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</motion.div>
					))}

					<Button variant="outline" className="w-full hover:bg-primary/10 hover:text-primary hover:border-primary/30">
						<Plus className="h-4 w-4 mr-2" />
						Add Payment Method
					</Button>
				</div>
			</motion.div>

			{/* Billing History */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<Calendar className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Billing History</h3>
							<p className="text-sm text-muted-foreground">View and download your past invoices</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6">
					<div className="space-y-3">
						{billingHistory.map((invoice, index) => (
							<motion.div
								key={invoice.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.1 }}
								className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-md bg-muted/50 flex items-center justify-center">
										<Calendar className="h-4 w-4 text-muted-foreground" />
									</div>
									<div>
										<p className="font-medium text-sm">{invoice.invoice}</p>
										<p className="text-xs text-muted-foreground">{invoice.date}</p>
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="text-right">
										<p className="font-medium text-sm">{invoice.amount}</p>
										<Badge variant={invoice.status === "Paid" ? "secondary" : "destructive"} className={invoice.status === "Paid" ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : ""}>
											{invoice.status}
										</Badge>
									</div>
									<Button variant="outline" size="sm" className="shrink-0">
										<Download className="h-4 w-4 mr-2" />
										Download
									</Button>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</motion.div>

			{/* Billing Address */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.5 }}
				className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
			>
				<div className="p-4 md:p-6 border-b border-border/50">
					<div className="flex items-center gap-3">
						<MapPin className="h-5 w-5 text-primary" />
						<div>
							<h3 className="text-lg font-semibold text-foreground">Billing Address</h3>
							<p className="text-sm text-muted-foreground">Update your billing address information</p>
						</div>
					</div>
				</div>

				<div className="p-4 md:p-6 space-y-4">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-10 w-full" />
							<Skeleton className="h-10 w-full" />
							<div className="grid grid-cols-2 gap-4">
								<Skeleton className="h-10 w-full" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>
					) : (
						<div className="p-4 border border-border/50 rounded-lg bg-background/50">
							<div className="flex items-start justify-between">
								<div>
									<p className="font-medium">Acme Corp</p>
									<p className="text-sm text-muted-foreground">123 Business Street</p>
									<p className="text-sm text-muted-foreground">San Francisco, CA 94105</p>
									<p className="text-sm text-muted-foreground">United States</p>
								</div>
								<Button variant="outline" size="sm" className="mt-0">
									<Edit className="h-4 w-4 mr-2" />
									Edit
								</Button>
							</div>
						</div>
					)}
				</div>
			</motion.div>
		</motion.div>
	)
}
