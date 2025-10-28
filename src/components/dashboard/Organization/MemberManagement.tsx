"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { motion } from "framer-motion"
import { Crown, Loader2, MoreHorizontal, Shield, Trash2, UserCircle2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { ROLE_LABELS } from "./constants"
import type { OrganizationSettingsProps } from "./types"
import { canManageMembers, fadeInUp, getUserInitials } from "./utils"

export function MemberManagement({ currentOrg, session, activeMember, refetchOrg }: OrganizationSettingsProps) {
	const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
	const canManage = canManageMembers(activeMember?.role)

	const handleRemoveMember = async (memberId: string, memberEmail: string) => {
		if (!canManage) {
			toast.error("You don't have permission to remove members")
			return
		}

		if (session?.user?.id === memberId) {
			toast.error("You cannot remove yourself from the organization")
			return
		}

		setRemovingMemberId(memberId)

		await authClient.organization.removeMember({
			organizationId: currentOrg.id,
			memberIdOrEmail: memberEmail,
		}, {
			onSuccess: () => {
				refetchOrg()
				toast.success("Member removed successfully")
			},
			onError: (error) => {
				toast.error("Failed to remove member")
				console.error(error)
			},
		})

		setRemovingMemberId(null)
	}

	const getRoleIcon = (role: string) => {
		switch (role) {
			case "owner":
				return <Crown className="h-4 w-4 text-amber-500" />
			case "admin":
				return <Shield className="h-4 w-4 text-blue-500" />
			default:
				return <UserCircle2 className="h-4 w-4 text-gray-500" />
		}
	}

	return (
		<motion.div
			{...fadeInUp(0.1)}
			className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
		>
			<div className="p-4 md:p-6 border-b border-border/50">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-foreground">Team Members</h3>
						<p className="text-sm text-muted-foreground">
							{currentOrg.members.length} {currentOrg.members.length === 1 ? "member" : "members"}
						</p>
					</div>
				</div>
			</div>

			<div className="p-4 md:p-6">
				<div className="space-y-3">
					{currentOrg.members.map((member) => {
						const userInitials = getUserInitials(
							member.user.metadata?.name?.firstName,
							member.user.metadata?.name?.lastName,
							member.user.name || member.user.email
						)

						const isCurrentUser = session?.user?.id === member.userId
						const isOwner = member.role === "owner"
						const canRemove = canManage && !isCurrentUser && !isOwner

						return (
							<motion.div
								key={member.id}
								{...fadeInUp(0)}
								className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
							>
								<div className="flex items-center gap-3 flex-1 min-w-0">
									<Avatar className="h-10 w-10 ring-2 ring-border/50">
										<AvatarImage
											src={member.user.image || "/placeholder-user.jpg"}
											alt={member.user.name || member.user.email}
										/>
										<AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
											{userInitials}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<p className="text-sm font-medium text-foreground truncate">
												{member.user.name || member.user.email}
											</p>
											{isCurrentUser && (
												<Badge variant="outline" className="text-xs">You</Badge>
											)}
										</div>
										<p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50">
										{getRoleIcon(member.role)}
										<span className="text-xs font-medium">
											{ROLE_LABELS[member.role as keyof typeof ROLE_LABELS]}
										</span>
									</div>

									{canRemove && (
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0"
													disabled={removingMemberId === member.userId}
												>
													{removingMemberId === member.userId ? (
														<Loader2 className="h-4 w-4 animate-spin" />
													) : (
														<MoreHorizontal className="h-4 w-4" />
													)}
													<span className="sr-only">Member actions</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end" className="w-48">
												<DropdownMenuItem
													className="text-destructive focus:text-destructive"
													onClick={() => handleRemoveMember(member.userId, member.user.email)}
												>
													<Trash2 className="h-4 w-4 mr-2" />
													Remove Member
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									)}
								</div>
							</motion.div>
						)
					})}
				</div>
			</div>
		</motion.div>
	)
}

