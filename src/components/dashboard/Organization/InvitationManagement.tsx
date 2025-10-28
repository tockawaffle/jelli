"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Clock, Loader2, Mail, MoreHorizontal, Trash2, UserPlus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { ROLE_LABELS } from "./constants"
import { type InviteMemberFormValues, inviteMemberSchema } from "./schemas"
import type { OrganizationSettingsProps } from "./types"
import { canManageMembers, fadeInUp, formatDate } from "./utils"

export function InvitationManagement({ currentOrg, activeMember, refetchOrg }: OrganizationSettingsProps) {
	const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
	const [cancelingInvitationId, setCancelingInvitationId] = useState<string | null>(null)
	const canManage = canManageMembers(activeMember?.role)

	const inviteForm = useForm<InviteMemberFormValues>({
		resolver: zodResolver(inviteMemberSchema),
		defaultValues: {
			email: "",
			role: "member",
		},
	})

	const handleInviteMember = async (values: InviteMemberFormValues) => {
		if (!canManage) {
			toast.error("You don't have permission to invite members")
			return
		}

		await authClient.organization.inviteMember({
			organizationId: currentOrg.id,
			email: values.email,
			role: values.role,
		}, {
			onSuccess: () => {
				refetchOrg()
				toast.success(`Invitation sent to ${values.email}`)
				setIsInviteDialogOpen(false)
				inviteForm.reset()
			},
			onError: (error) => {
				toast.error("Failed to send invitation")
				console.error(error)
			},
		})
	}

	const handleCancelInvitation = async (invitationId: string) => {
		if (!canManage) {
			toast.error("You don't have permission to cancel invitations")
			return
		}

		setCancelingInvitationId(invitationId)

		await authClient.organization.cancelInvitation({
			invitationId,
		}, {
			onSuccess: () => {
				refetchOrg()
				toast.success("Invitation cancelled")
			},
			onError: (error) => {
				toast.error("Failed to cancel invitation")
				console.error(error)
			},
		})

		setCancelingInvitationId(null)
	}

	const getInvitationStatus = (invitation: any) => {
		if (invitation.status === "pending") {
			const expiresAt = new Date(invitation.expiresAt)
			const now = new Date()
			if (expiresAt < now) {
				return { label: "Expired", variant: "destructive" as const }
			}
			return { label: "Pending", variant: "secondary" as const }
		}
		// Capitalize the status
		const capitalizedStatus = invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)
		return { label: capitalizedStatus, variant: "secondary" as const }
	}

	// Filter out canceled and accepted invitations
	const activeInvitations = currentOrg.invitations.filter(
		(invitation) => invitation.status === "pending"
	)

	return (
		<motion.div
			{...fadeInUp(0.2)}
			className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
		>
			<div className="p-4 md:p-6 border-b border-border/50">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-semibold text-foreground">Pending Invitations</h3>
						<p className="text-sm text-muted-foreground">
							{activeInvitations.length} {activeInvitations.length === 1 ? "invitation" : "invitations"}
						</p>
					</div>
					{canManage && (
						<Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
							<DialogTrigger asChild>
								<Button size="sm" className="gap-2">
									<UserPlus className="h-4 w-4" />
									Invite Member
								</Button>
							</DialogTrigger>
							<DialogContent>
								<DialogHeader>
									<DialogTitle>Invite Team Member</DialogTitle>
									<DialogDescription>
										Send an invitation to join your organization.
									</DialogDescription>
								</DialogHeader>
								<Form {...inviteForm}>
									<form onSubmit={inviteForm.handleSubmit(handleInviteMember)} className="space-y-4">
										<FormField
											control={inviteForm.control}
											name="email"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Email Address</FormLabel>
													<FormControl>
														<Input
															type="email"
															placeholder="colleague@example.com"
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={inviteForm.control}
											name="role"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Role</FormLabel>
													<Select onValueChange={field.onChange} defaultValue={field.value}>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select a role" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="member">Member</SelectItem>
															<SelectItem value="admin">Admin</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>
										<div className="flex justify-end gap-2">
											<Button
												type="button"
												variant="outline"
												onClick={() => setIsInviteDialogOpen(false)}
											>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={inviteForm.formState.isSubmitting}
											>
												{inviteForm.formState.isSubmitting ? (
													<>
														<Loader2 className="mr-2 h-4 w-4 animate-spin" />
														Sending...
													</>
												) : (
													<>
														<Mail className="mr-2 h-4 w-4" />
														Send Invitation
													</>
												)}
											</Button>
										</div>
									</form>
								</Form>
							</DialogContent>
						</Dialog>
					)}
				</div>
			</div>

			<div className="p-4 md:p-6">
				{activeInvitations.length === 0 ? (
					<div className="text-center py-8">
						<Mail className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
						<p className="text-sm text-muted-foreground">No pending invitations</p>
					</div>
				) : (
					<div className="space-y-3">
						{activeInvitations.map((invitation) => {
							const status = getInvitationStatus(invitation)

							return (
								<motion.div
									key={invitation.id}
									{...fadeInUp(0)}
									className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/30 hover:bg-background/50 transition-colors"
								>
									<div className="flex items-center gap-3 flex-1 min-w-0">
										<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
											<Mail className="h-5 w-5 text-primary" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground truncate">
												{invitation.email}
											</p>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<Clock className="h-3 w-3" />
												<span>
													Invited {formatDate((invitation as any).creationTime)}
												</span>
											</div>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Badge variant={status.variant} className="text-xs">
											{status.label}
										</Badge>
										<div className="px-2 py-1 rounded-md bg-muted/50">
											<span className="text-xs font-medium">
												{ROLE_LABELS[invitation.role as keyof typeof ROLE_LABELS]}
											</span>
										</div>

										{canManage && invitation.status === "pending" && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant="ghost"
														size="sm"
														className="h-8 w-8 p-0"
														disabled={cancelingInvitationId === invitation.id}
													>
														{cancelingInvitationId === invitation.id ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<MoreHorizontal className="h-4 w-4" />
														)}
														<span className="sr-only">Invitation actions</span>
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-48">
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onClick={() => handleCancelInvitation(invitation.id)}
													>
														<Trash2 className="h-4 w-4 mr-2" />
														Cancel Invitation
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</div>
								</motion.div>
							)
						})}
					</div>
				)}
			</div>
		</motion.div>
	)
}

