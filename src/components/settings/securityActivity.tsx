"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, Clock, Download, Info, MapPin, Search, Shield } from "lucide-react"
import { useMemo, useState } from "react"

interface SecurityEvent {
	id: string
	event: string
	type: "login" | "password" | "security" | "account" | "device"
	date: string
	time: string
	location: string
	ipAddress: string
	device: string
	status: "success" | "failed" | "warning"
	details: string
}

const securityEvents: SecurityEvent[] = [
	{
		id: "1",
		event: "Successful login",
		type: "login",
		date: "2024-12-01",
		time: "09:15 AM",
		location: "San Francisco, CA",
		ipAddress: "192.168.1.100",
		device: "Chrome on macOS",
		status: "success",
		details: "Login from recognized device",
	},
	{
		id: "2",
		event: "Password changed",
		type: "password",
		date: "2024-11-29",
		time: "02:30 PM",
		location: "San Francisco, CA",
		ipAddress: "192.168.1.100",
		device: "Chrome on macOS",
		status: "success",
		details: "Password updated successfully",
	},
	{
		id: "3",
		event: "Failed login attempt",
		type: "login",
		date: "2024-11-28",
		time: "11:45 PM",
		location: "Unknown",
		ipAddress: "203.0.113.42",
		device: "Unknown browser",
		status: "failed",
		details: "Invalid password entered",
	},
	{
		id: "4",
		event: "Two-factor authentication enabled",
		type: "security",
		date: "2024-11-25",
		time: "04:20 PM",
		location: "San Francisco, CA",
		ipAddress: "192.168.1.100",
		device: "Chrome on macOS",
		status: "success",
		details: "2FA enabled with authenticator app",
	},
	{
		id: "5",
		event: "Login from new device",
		type: "device",
		date: "2024-11-20",
		time: "08:30 AM",
		location: "New York, NY",
		ipAddress: "198.51.100.25",
		device: "Safari on iPhone",
		status: "warning",
		details: "First login from this device",
	},
	{
		id: "6",
		event: "API key generated",
		type: "account",
		date: "2024-11-15",
		time: "03:15 PM",
		location: "San Francisco, CA",
		ipAddress: "192.168.1.100",
		device: "Chrome on macOS",
		status: "success",
		details: "New API key created for production",
	},
]

export default function EnhancedSecurityActivity() {
	const [searchQuery, setSearchQuery] = useState("")
	const [typeFilter, setTypeFilter] = useState<string>("all")
	const [statusFilter, setStatusFilter] = useState<string>("all")
	const [sortBy, setSortBy] = useState<string>("date-desc")

	const filteredAndSortedEvents = useMemo(() => {
		const filtered = securityEvents.filter((event) => {
			const matchesSearch =
				event.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
				event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
				event.device.toLowerCase().includes(searchQuery.toLowerCase())

			const matchesType = typeFilter === "all" || event.type === typeFilter
			const matchesStatus = statusFilter === "all" || event.status === statusFilter

			return matchesSearch && matchesType && matchesStatus
		})

		// Sort events
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "date-desc":
					return new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime()
				case "date-asc":
					return new Date(a.date + " " + a.time).getTime() - new Date(b.date + " " + b.time).getTime()
				case "type":
					return a.type.localeCompare(b.type)
				case "status":
					return a.status.localeCompare(b.status)
				default:
					return 0
			}
		})

		return filtered
	}, [searchQuery, typeFilter, statusFilter, sortBy])

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "success":
				return <CheckCircle className="h-4 w-4 text-green-600" />
			case "failed":
				return <AlertTriangle className="h-4 w-4 text-red-600" />
			case "warning":
				return <Info className="h-4 w-4 text-yellow-600" />
			default:
				return <Info className="h-4 w-4 text-gray-600" />
		}
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "success":
				return (
					<Badge variant="secondary" className="bg-green-100 text-green-800">
						Success
					</Badge>
				)
			case "failed":
				return <Badge variant="destructive">Failed</Badge>
			case "warning":
				return (
					<Badge variant="outline" className="border-yellow-500 text-yellow-700">
						Warning
					</Badge>
				)
			default:
				return <Badge variant="outline">Unknown</Badge>
		}
	}

	const getTypeColor = (type: string) => {
		const colors = {
			login: "bg-blue-100 text-blue-800",
			password: "bg-purple-100 text-purple-800",
			security: "bg-green-100 text-green-800",
			account: "bg-orange-100 text-orange-800",
			device: "bg-teal-100 text-teal-800",
		}
		return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
	}

	return (
		<div className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm">
			<div className="p-4 md:p-6 border-b border-border/50">
				<div className="flex items-center gap-3">
					<Shield className="h-5 w-5 text-primary" />
					<div>
						<h3 className="text-lg font-semibold text-foreground">Security Activity</h3>
						<p className="text-sm text-muted-foreground">Monitor and filter recent security events on your account</p>
					</div>
				</div>
			</div>
			<div className="p-4 md:p-6 space-y-6">
				{/* Filters and Search */}
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
						<Input
							placeholder="Search events, locations, devices..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10"
						/>
					</div>

					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-full sm:w-40">
							<SelectValue placeholder="Event Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="login">Login</SelectItem>
							<SelectItem value="password">Password</SelectItem>
							<SelectItem value="security">Security</SelectItem>
							<SelectItem value="account">Account</SelectItem>
							<SelectItem value="device">Device</SelectItem>
						</SelectContent>
					</Select>

					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full sm:w-32">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Status</SelectItem>
							<SelectItem value="success">Success</SelectItem>
							<SelectItem value="failed">Failed</SelectItem>
							<SelectItem value="warning">Warning</SelectItem>
						</SelectContent>
					</Select>

					<Select value={sortBy} onValueChange={setSortBy}>
						<SelectTrigger className="w-full sm:w-40">
							<SelectValue placeholder="Sort By" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date-desc">Newest First</SelectItem>
							<SelectItem value="date-asc">Oldest First</SelectItem>
							<SelectItem value="type">Event Type</SelectItem>
							<SelectItem value="status">Status</SelectItem>
						</SelectContent>
					</Select>

					<Button variant="outline" size="sm">
						<Download className="h-4 w-4 mr-2" />
						Export
					</Button>
				</div>

				{/* Results Summary */}
				<div className="flex items-center justify-between text-sm text-muted-foreground">
					<p>
						Showing {filteredAndSortedEvents.length} of {securityEvents.length} events
					</p>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-1">
							<div className="h-2 w-2 rounded-full bg-green-500"></div>
							<span>Success</span>
						</div>
						<div className="flex items-center space-x-1">
							<div className="h-2 w-2 rounded-full bg-red-500"></div>
							<span>Failed</span>
						</div>
						<div className="flex items-center space-x-1">
							<div className="h-2 w-2 rounded-full bg-yellow-500"></div>
							<span>Warning</span>
						</div>
					</div>
				</div>

				{/* Events List */}
				<div className="space-y-3">
					{filteredAndSortedEvents.map((event, index) => (
						<motion.div
							key={event.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.05 }}
							className="p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
						>
							<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
								<div className="flex items-start gap-3 flex-1 min-w-0">
									<div className="mt-1 shrink-0">{getStatusIcon(event.status)}</div>
									<div className="flex-1 min-w-0">
										<div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
											<p className="font-medium text-sm">{event.event}</p>
											<Badge variant="outline" className={`text-xs ${getTypeColor(event.type)} w-fit`}>
												{event.type}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground mb-2">{event.details}</p>
										<div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs text-muted-foreground">
											<div className="flex items-center gap-1">
												<Clock className="h-3 w-3" />
												<span>{event.date} at {event.time}</span>
											</div>
											<div className="flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												<span>{event.location}</span>
											</div>
											<span className="truncate">{event.device}</span>
											<span className="font-mono text-xs">{event.ipAddress}</span>
										</div>
									</div>
								</div>
								<div className="shrink-0">{getStatusBadge(event.status)}</div>
							</div>
						</motion.div>
					))}
				</div>

				{filteredAndSortedEvents.length === 0 && (
					<div className="text-center py-8 text-muted-foreground">
						<Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
						<p>No security events match your current filters.</p>
						<Button
							variant="outline"
							className="mt-2 bg-transparent"
							onClick={() => {
								setSearchQuery("")
								setTypeFilter("all")
								setStatusFilter("all")
							}}
						>
							Clear Filters
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}


