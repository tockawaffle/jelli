"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { useMemo, useState } from "react"

interface SearchResult {
	id: string
	title: string
	description: string
	tab: string
	section: string
	keywords: string[]
}

const searchableSettings: SearchResult[] = [
	// Account Settings
	{
		id: "profile-info",
		title: "Profile Information",
		description: "Update your personal information and profile picture",
		tab: "account",
		section: "Profile",
		keywords: ["name", "email", "avatar", "bio", "personal"],
	},
	{
		id: "connected-accounts",
		title: "Connected Accounts",
		description: "Manage third-party integrations",
		tab: "account",
		section: "Integrations",
		keywords: ["github", "slack", "google", "oauth", "connect"],
	},
	{
		id: "organization-info",
		title: "Organization Details",
		description: "View your organization and role",
		tab: "account",
		section: "Organization",
		keywords: ["org", "company", "role", "team"],
	},

	// Security Settings
	{
		id: "password",
		title: "Password Management",
		description: "Change your account password",
		tab: "security",
		section: "Authentication",
		keywords: ["password", "login", "auth", "credentials"],
	},
	{
		id: "two-factor",
		title: "Two-Factor Authentication",
		description: "Enable 2FA for enhanced security",
		tab: "security",
		section: "Authentication",
		keywords: ["2fa", "mfa", "authenticator", "security", "backup codes"],
	},
	{
		id: "recovery",
		title: "Account Recovery",
		description: "Set up recovery options",
		tab: "security",
		section: "Recovery",
		keywords: ["recovery", "backup", "phone", "email", "reset"],
	},
	{
		id: "security-activity",
		title: "Security Activity",
		description: "Monitor recent security events",
		tab: "security",
		section: "Activity",
		keywords: ["login", "activity", "events", "history", "audit"],
	},

	// Privacy Settings
	{
		id: "data-sharing",
		title: "Data Sharing",
		description: "Control how your data is shared",
		tab: "privacy",
		section: "Data",
		keywords: ["privacy", "data", "sharing", "analytics", "usage"],
	},
	{
		id: "profile-visibility",
		title: "Profile Visibility",
		description: "Choose who can see your profile",
		tab: "privacy",
		section: "Visibility",
		keywords: ["visibility", "public", "private", "team", "profile"],
	},
	{
		id: "cookies",
		title: "Cookie Preferences",
		description: "Manage cookie settings",
		tab: "privacy",
		section: "Cookies",
		keywords: ["cookies", "tracking", "marketing", "analytics"],
	},

	// Billing Settings
	{
		id: "subscription",
		title: "Current Plan",
		description: "Manage your subscription",
		tab: "billing",
		section: "Plan",
		keywords: ["plan", "subscription", "billing", "upgrade", "cancel"],
	},
	{
		id: "payment-methods",
		title: "Payment Methods",
		description: "Manage payment methods",
		tab: "billing",
		section: "Payment",
		keywords: ["payment", "credit card", "billing", "visa", "mastercard"],
	},
	{
		id: "billing-history",
		title: "Billing History",
		description: "View past invoices",
		tab: "billing",
		section: "History",
		keywords: ["invoice", "history", "billing", "payment", "receipt"],
	},

	// Notification Settings
	{
		id: "email-notifications",
		title: "Email Notifications",
		description: "Configure email alerts",
		tab: "notifications",
		section: "Email",
		keywords: ["email", "notifications", "alerts", "reminders"],
	},
	{
		id: "push-notifications",
		title: "Push Notifications",
		description: "Configure browser notifications",
		tab: "notifications",
		section: "Push",
		keywords: ["push", "browser", "notifications", "alerts"],
	},
	{
		id: "notification-frequency",
		title: "Notification Frequency",
		description: "Choose notification timing",
		tab: "notifications",
		section: "Frequency",
		keywords: ["frequency", "digest", "immediate", "daily", "weekly"],
	},

	// API/Integrations Settings
	{
		id: "api-keys",
		title: "API Keys",
		description: "Manage your API keys",
		tab: "integrations",
		section: "API",
		keywords: ["api", "keys", "token", "authentication", "developer"],
	},
	{
		id: "webhooks",
		title: "Webhooks",
		description: "Configure webhook endpoints",
		tab: "integrations",
		section: "Webhooks",
		keywords: ["webhook", "endpoint", "callback", "integration"],
	},
	{
		id: "api-usage",
		title: "API Usage",
		description: "Monitor API usage and limits",
		tab: "integrations",
		section: "Usage",
		keywords: ["usage", "limits", "quota", "rate", "api"],
	},
]

interface SettingsSearchProps {
	onResultClick: (tab: string, settingId: string) => void
	currentTab: string
}

export default function SettingsSearch({ onResultClick, currentTab }: SettingsSearchProps) {
	const [query, setQuery] = useState("")
	const [isOpen, setIsOpen] = useState(false)

	const filteredResults = useMemo(() => {
		if (!query.trim()) return []

		const searchTerm = query.toLowerCase()
		return searchableSettings
			.filter(
				(setting) =>
					setting.title.toLowerCase().includes(searchTerm) ||
					setting.description.toLowerCase().includes(searchTerm) ||
					setting.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm)) ||
					setting.section.toLowerCase().includes(searchTerm),
			)
			.slice(0, 8) // Limit to 8 results
	}, [query])

	const handleResultClick = (result: SearchResult) => {
		onResultClick(result.tab, result.id)
		setQuery("")
		setIsOpen(false)
	}

	const clearSearch = () => {
		setQuery("")
		setIsOpen(false)
	}

	return (
		<div className="relative w-full max-w-md">
			<div className="relative">
				<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
				<Input
					placeholder="Search settings..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value)
						setIsOpen(true)
					}}
					onFocus={() => setIsOpen(true)}
					className="pl-10 pr-10"
				/>
				{query && (
					<Button
						variant="ghost"
						size="sm"
						className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
						onClick={clearSearch}
					>
						<X className="h-3 w-3" />
					</Button>
				)}
			</div>

			{isOpen && filteredResults.length > 0 && (
				<Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto">
					<CardContent className="p-2">
						<div className="space-y-1">
							{filteredResults.map((result) => (
								<button
									key={result.id}
									className="w-full text-left p-3 rounded-md hover:bg-muted/50 transition-colors"
									onClick={() => handleResultClick(result)}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<p className="font-medium text-sm">{result.title}</p>
											<p className="text-xs text-muted-foreground">{result.description}</p>
										</div>
										<div className="flex items-center space-x-2">
											<Badge variant="outline" className="text-xs">
												{result.section}
											</Badge>
											<Badge
												variant={result.tab === currentTab ? "default" : "secondary"}
												className="text-xs capitalize"
											>
												{result.tab}
											</Badge>
										</div>
									</div>
								</button>
							))}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	)
}
