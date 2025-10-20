"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Check, Chrome, GithubIcon, Loader2 } from "lucide-react"
import { type JSX, useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { fadeInLeft, fadeInUp } from "./utils"

// Available providers from auth config
const AVAILABLE_PROVIDERS = [
	{ id: "github", name: "GitHub", icon: GithubIcon },
	{ id: "google", name: "Google", icon: Chrome },
] as const

export function ConnectedAccounts() {
	const [connectedAccounts, setConnectedAccounts] = useState<{
		id: string;
		providerId: string;
		createdAt: Date;
		updatedAt: Date;
		accountId: string;
		scopes: string[];
		icon: JSX.Element;
	}[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [actionLoading, setActionLoading] = useState<string | null>(null)

	const fetchAccounts = useCallback(async () => {
		setIsLoading(true)
		try {
			const { data } = await authClient.listAccounts()

			if (!data) {
				setConnectedAccounts([])
				return
			}

			const mappedAccounts = data.map((account) => ({
				id: account.id,
				providerId: account.providerId,
				createdAt: account.createdAt,
				updatedAt: account.updatedAt,
				accountId: account.accountId,
				scopes: account.scopes,
				icon: (() => {
					const provider = AVAILABLE_PROVIDERS.find(p => p.id === account.providerId)
					const Icon = provider?.icon || Chrome
					return <Icon className="h-5 w-5 text-muted-foreground" />
				})(),
			}))

			setConnectedAccounts(mappedAccounts)
		} catch (error) {
			console.error("Failed to fetch connected accounts:", error)
		} finally {
			setIsLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchAccounts()
	}, [fetchAccounts])

	const handleLinkAccount = async (providerId: string) => {
		setActionLoading(providerId)
		try {
			await authClient.linkSocial({
				provider: providerId as "github" | "google",
			})
			toast.success(`${providerId.charAt(0).toUpperCase() + providerId.slice(1)} account connected successfully`)
			await fetchAccounts()
		} catch (error) {
			console.error("Failed to link account:", error)
			toast.error(`Failed to connect ${providerId} account`)
		} finally {
			setActionLoading(null)
		}
	}

	const handleUnlinkAccount = async (accountId: string, providerId: string) => {
		setActionLoading(accountId)
		try {
			await authClient.unlinkAccount({
				providerId,
				accountId,
			})

			toast.success(`${providerId.charAt(0).toUpperCase() + providerId.slice(1)} account disconnected successfully`)
			await fetchAccounts()
		} catch (error) {
			console.error("Failed to unlink account:", error)
			toast.error(`Failed to disconnect ${providerId} account`)
		} finally {
			setActionLoading(null)
		}
	}

	// Get list of providers that are not yet connected
	const availableToConnect = AVAILABLE_PROVIDERS.filter(
		provider => !connectedAccounts.some(account => account.providerId === provider.id)
	)

	return (
		<motion.div
			{...fadeInUp(0.3)}
			className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
		>
			<div className="p-4 md:p-6 border-b border-border/50">
				<h3 className="text-lg font-semibold text-foreground">Connected Accounts</h3>
				<p className="text-sm text-muted-foreground">Manage your connected third-party accounts.</p>
			</div>

			<div className="p-4 md:p-6">
				{isLoading ? (
					<div className="space-y-3">
						{[1, 2].map((i) => (
							<div
								key={i}
								className="flex items-center justify-between gap-3 p-4 border border-border/50 rounded-lg bg-background/30"
							>
								<div className="flex items-center gap-3">
									<div className="h-10 w-10 rounded-md bg-muted/50 animate-pulse" />
									<div className="space-y-2">
										<div className="h-4 w-20 bg-muted/50 rounded animate-pulse" />
										<div className="h-3 w-32 bg-muted/50 rounded animate-pulse" />
									</div>
								</div>
								<div className="h-8 w-20 bg-muted/50 rounded animate-pulse" />
							</div>
						))}
					</div>
				) : (
					<div className="space-y-3">
						{/* Connected Accounts */}
						{connectedAccounts.map((account, index) => (
							<motion.div
								key={account.id}
								{...fadeInLeft(index * 0.1)}
								className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors"
							>
								<div className="flex items-center gap-3 min-w-0 flex-1">
									<div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
										{account.icon}
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-medium text-sm text-foreground capitalize">{account.providerId}</p>
										{account.accountId && (
											<p className="text-xs text-muted-foreground truncate">{account.accountId}</p>
										)}
									</div>
								</div>
								<div className="flex items-center gap-3 shrink-0">
									<div className="flex items-center gap-2">
										<Check className="h-4 w-4 text-chart-3" />
										<Badge variant="secondary" className="text-xs bg-chart-3/10 text-chart-3 border-chart-3/20">
											Connected
										</Badge>
									</div>
									<Button
										variant="outline"
										size="sm"
										className="text-xs hover:bg-muted/50"
										onClick={() => handleUnlinkAccount(account.accountId, account.providerId)}
										disabled={actionLoading === account.id || account.providerId === "credential"}
									>
										{actionLoading === account.id ? (
											<>
												<Loader2 className="h-3 w-3 mr-1 animate-spin" />
												Disconnecting...
											</>
										) : (
											"Disconnect"
										)}
									</Button>
								</div>
							</motion.div>
						))}

						{/* Available to Connect */}
						{availableToConnect.map((provider, index) => {
							const Icon = provider.icon
							return (
								<motion.div
									key={provider.id}
									{...fadeInLeft((connectedAccounts.length + index) * 0.1)}
									className={cn(
										"flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-border/50 rounded-lg bg-background/30 hover:bg-background/50 transition-colors",
										// This is temporary until we implement Google OAuth
										provider.id === "google" && "opacity-50 cursor-not-allowed bg-secondary/50 hover:bg-secondary/50"
									)}
								>
									<div className="flex items-center gap-3 min-w-0 flex-1">
										<div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center shrink-0">
											<Icon className="h-5 w-5 text-muted-foreground" />
										</div>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-sm text-foreground">{provider.name}</p>
											<p className="text-xs text-muted-foreground">Not connected</p>
										</div>
									</div>
									<div className="flex items-center gap-3 shrink-0">
										<Button
											variant="outline"
											size="sm"
											className="text-xs hover:bg-muted/50"
											onClick={() => handleLinkAccount(provider.id)}
											disabled={actionLoading === provider.id || provider.id === "google"}
										>
											{
												// If Google, show "To be implemented"
												actionLoading === provider.id ? (
													<>
														<Loader2 className="h-3 w-3 mr-1 animate-spin" />
														Connecting...
													</>
												) : (
													provider.id === "google" ? "To be implemented" : "Connect"
												)
											}
										</Button>
									</div>
								</motion.div>
							)
						})}

						{/* Empty state when no providers configured */}
						{connectedAccounts.length === 0 && availableToConnect.length === 0 && (
							<div className="text-center py-8">
								<p className="text-sm text-muted-foreground">No social providers configured.</p>
							</div>
						)}
					</div>
				)}
			</div>
		</motion.div>
	)
}

