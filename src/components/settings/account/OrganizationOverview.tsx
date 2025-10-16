"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { Building2, Crown, MoreHorizontal, Settings, Shield, UserCircle2 } from "lucide-react"
import { fadeInUp, isAdminOrOwner } from "./utils"

interface OrganizationOverviewProps {
	currentOrg: OrganizationType;
}

export function OrganizationOverview({ currentOrg }: OrganizationOverviewProps) {
	const memberRole = currentOrg.members.find((member) => member.user.id === currentOrg.currentUser.id)?.role
	const isAdmin = isAdminOrOwner(memberRole)

	return (
		<motion.div
			{...fadeInUp(0.1)}
			className="bg-card/50 border border-border/50 rounded-xl p-4 md:p-6 backdrop-blur-sm"
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					<div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
						<Building2 className="h-6 w-6 text-primary" />
					</div>
					<div>
						<h3 className="font-semibold text-lg text-foreground">{currentOrg.name}</h3>
						{isAdmin && (
							<p className="text-sm text-muted-foreground">{currentOrg.members.length} team members</p>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{isAdmin ? (
						<Crown className="h-4 w-4 text-primary" />
					) : (
						<UserCircle2 className="h-4 w-4 text-primary" />
					)}
					<Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
						{memberRole ? memberRole.charAt(0).toUpperCase() + memberRole.slice(1).toLowerCase() : "Member"}
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

			{isAdmin && (
				<div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<Label className="text-sm font-medium text-muted-foreground">Plan</Label>
						<p className="text-sm font-medium text-foreground">{currentOrg.metadata.plan}</p>
					</div>
				</div>
			)}
		</motion.div>
	)
}

