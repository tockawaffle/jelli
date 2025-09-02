"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Bell, CreditCard, Eye, Settings, Shield, User, Zap } from "lucide-react"
import { useState } from "react"
import AccountSettings from "./accountSettings"
import BillingSettings from "./billingSettings"
import IntegrationsSettings from "./integrationsSettings"
import NotificationSettings from "./notificationSettings"
import PrivacySettings from "./privacySettings"
import SecuritySettings from "./securitySettings"

export default function SettingsTabs() {
	const [activeTab, setActiveTab] = useState("account")

	const tabs = [
		{ id: "account", label: "Account", icon: User },
		{ id: "security", label: "Security", icon: Shield },
		{ id: "privacy", label: "Privacy", icon: Eye },
		{ id: "billing", label: "Billing", icon: CreditCard },
		{ id: "notifications", label: "Notifications", icon: Bell },
		{ id: "integrations", label: "Integrations", icon: Zap },
	]

	const handleTabChange = (tab: string) => {
		setActiveTab(tab)
	}

	const renderContent = () => {
		switch (activeTab) {
			case "account":
				return <AccountSettings />
			case "security":
				return <SecuritySettings />
			case "privacy":
				return <PrivacySettings />
			case "billing":
				return <BillingSettings />
			case "notifications":
				return <NotificationSettings />
			case "integrations":
				return <IntegrationsSettings />
			default:
				return <AccountSettings />
		}
	}

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<motion.div
				className="border-b border-border/50 bg-card/30 backdrop-blur-sm"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className="max-w-6xl mx-auto p-4 py-6">
					<div className="flex items-center gap-3 mb-6">
						<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
							<Settings className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-foreground">Settings</h1>
							<p className="text-sm text-muted-foreground">Manage your account preferences and configurations</p>
						</div>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:block">
						<nav className="flex space-x-1 bg-muted/30 p-1 rounded-xl border border-border/50">
							{tabs.map((tab, index) => {
								const Icon = tab.icon
								const isActive = activeTab === tab.id
								return (
									<motion.button
										key={tab.id}
										onClick={() => handleTabChange(tab.id)}
										className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
											? "text-primary bg-background shadow-sm border border-border/50"
											: "text-muted-foreground hover:text-foreground hover:bg-background/50"
											}`}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Icon className="h-4 w-4" />
										<span>{tab.label}</span>
										{isActive && (
											<motion.div
												className="absolute inset-0 rounded-lg bg-primary/5 border border-primary/20"
												layoutId="activeTab"
												transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
											/>
										)}
									</motion.button>
								)
							})}
						</nav>
					</div>

					{/* Mobile Navigation */}
					<div className="md:hidden">
						<div className="flex overflow-x-auto gap-2 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
							{tabs.map((tab, index) => {
								const Icon = tab.icon
								const isActive = activeTab === tab.id
								return (
									<motion.button
										key={tab.id}
										onClick={() => handleTabChange(tab.id)}
										className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${isActive
											? "text-primary bg-primary/10 border border-primary/20"
											: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
											}`}
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<Icon className="h-4 w-4" />
										<span>{tab.label}</span>
									</motion.button>
								)
							})}
						</div>
					</div>
				</div>
			</motion.div>

			{/* Content */}
			<div className="max-w-6xl mx-auto p-4 pb-8">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						{renderContent()}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	)
}
