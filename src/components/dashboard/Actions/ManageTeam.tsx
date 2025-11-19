import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CalendarIcon, Copy, Link2Icon, Mail, Trash, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

dayjs.extend(relativeTime);

type ControlledProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	error?: string | null;
	orgData: FullOrganization;
	currentUserId: string;
	refetchOrg: () => void;
};

export default function ManageTeamSheet({ open, onOpenChange, error, orgData, currentUserId, refetchOrg }: ControlledProps) {

	const { members, invitations } = orgData;
	const orgMetadata: OrgMetadata = typeof orgData.metadata === "string" ? JSON.parse(orgData.metadata) : orgData.metadata;
	const { hours } = orgMetadata;

	const handleMemberClick = (member: FullOrganization["members"][number]) => {
		console.log(member);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			{/* Fullscreen on mobile; constrained on sm+ */}
			<SheetContent side="right" className="p-0 w-full sm:max-w-2xl border-l-0 sm:border-l bg-card/95 backdrop-blur-sm">
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.3 }}
					className="h-full flex flex-col"
				>
					<SheetHeader className="p-4 md:p-6 border-b border-border/50">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
								<Users className="h-5 w-5 text-primary" />
							</div>
							<div>
								<SheetTitle className="text-xl">Manage Team</SheetTitle>
								<SheetDescription className="text-base">
									Invite members, manage roles, and configure policies
								</SheetDescription>
							</div>
						</div>
					</SheetHeader>
					<div className="p-4 md:p-6 flex-1 overflow-y-auto">
						{error && (
							<motion.div
								className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm mb-4 flex items-center gap-2"
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								role="alert"
								aria-live="polite"
							>
								<AlertCircle className="h-4 w-4 shrink-0" />
								{error}
							</motion.div>
						)}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<Tabs defaultValue="members">
								<TabsList className="grid grid-cols-3 bg-muted/30 mb-6">
									<TabsTrigger value="members" className="flex items-center gap-2">
										<Users className="h-4 w-4" />
										<span className="hidden sm:inline">Members</span>
									</TabsTrigger>
									<TabsTrigger value="invites" className="flex items-center gap-2">
										<Mail className="h-4 w-4" />
										<span className="hidden sm:inline">Invites</span>
									</TabsTrigger>
									<TabsTrigger value="policies" className="flex items-center gap-2">
										<CalendarIcon className="h-4 w-4" />
										<span className="hidden sm:inline">Policies</span>
									</TabsTrigger>
								</TabsList>
								<MembersTab members={members} handleMemberClick={handleMemberClick} currentUserId={currentUserId} />
								<InvitesTab orgData={orgData} refetchOrg={refetchOrg} />
								<PoliciesTab hours={hours} />
							</Tabs>
						</motion.div>
					</div>
				</motion.div>
			</SheetContent>
		</Sheet>
	);
}

function MembersTab({ members, handleMemberClick, currentUserId }: { members: FullOrganization["members"], handleMemberClick: (member: FullOrganization["members"][number]) => void, currentUserId: string }) {
	const [searchTerm, setSearchTerm] = useState("");

	const filteredMembers = members.filter(member =>
		member.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
		member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<TabsContent value="members" className="pt-3">
			<div className="grid gap-4">
				<div className="grid gap-1.5">
					<Label htmlFor="member-search">Search member</Label>
					<Input
						id="member-search"
						placeholder="Search by name or email"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				<ScrollArea className="h-40 rounded-md border">
					<motion.div
						className="p-1"
						variants={{
							hidden: { opacity: 0 },
							show: {
								opacity: 1,
								transition: {
									staggerChildren: 0.05,
								},
							},
						}}
						initial="hidden"
						animate="show"
					>
						<AnimatePresence>
							{filteredMembers.map((member) => (
								<motion.div
									key={member.id}
									variants={{
										hidden: { opacity: 0, y: 20 },
										show: { opacity: 1, y: 0 },
										exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
									}}
									layout
									className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer w-full justify-between"
									tabIndex={0}
									onClick={() => {
										if (member.role !== "admin") handleMemberClick(member);
									}}
								>
									<div className="flex items-center gap-3 flex-1">
										<Avatar className="size-9">
											<AvatarImage src={member.user.image ?? undefined} alt={`${member.user.name}'s avatar`} />
											<AvatarFallback>{member.user.name?.charAt(0)}</AvatarFallback>
										</Avatar>
										<div className="flex-1 grid gap-0.5">
											<p className="text-sm font-medium truncate">{member.user.name}</p>
											<p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
										</div>
									</div>

									<Badge variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"}>
										{member.role === "owner" ? "Owner" : member.role === "admin" ? "Admin" : "Member"}
									</Badge>

									<Button
										variant="ghost"
										size="icon"
										className="shrink-0 rounded-full size-8 hover:bg-destructive hover:text-destructive-foreground"
										disabled={member.role === "owner" || member.userId === currentUserId}
										onClick={(e) => {
											e.stopPropagation();
											// TODO: Implement member removal
											toast.info(`TODO: Implement removal for ${member.user.name}`);
										}}
									>
										<Trash className="size-4" />
									</Button>
								</motion.div>
							))}
						</AnimatePresence>
					</motion.div>
				</ScrollArea>
				<Separator />
				<div className="grid gap-3">
					<div className="grid gap-1.5">
						<Label htmlFor="edit-email">Member email</Label>
						<Input id="edit-email" type="email" placeholder="user@company.com" />
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="grid gap-1.5">
							<Label>Role</Label>
							<Select defaultValue="member">
								<SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="lunch-start">Lunch start</Label>
							<Input id="lunch-start" type="time" />
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="grid gap-1.5">
							<Label>Lunch duration</Label>
							<Select defaultValue="60">
								<SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="30">30 min</SelectItem>
									<SelectItem value="45">45 min</SelectItem>
									<SelectItem value="60">60 min</SelectItem>
									<SelectItem value="90">90 min</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="work-hours">Contract hours per week</Label>
							<Input id="work-hours" type="number" min={0} step={1} placeholder="40" />
						</div>
					</div>
					<div className="flex items-center justify-between gap-2">
						<Button variant="destructive" className="gap-2"><Users className="size-4" /> Remove</Button>
						<Button className="gap-2"><CalendarIcon className="size-4" /> Save changes</Button>
					</div>
				</div>
			</div>
		</TabsContent>
	)
}

function InvitesTab({ orgData, refetchOrg }: { orgData: FullOrganization, refetchOrg: () => void }) {
	const { invitations, id: orgId } = orgData;
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("member");
	const [isSending, setIsSending] = useState(false);
	const [selectedInvite, setSelectedInvite] = useState<FullOrganization["invitations"][number] | null>(null);
	const [inviteToCancel, setInviteToCancel] = useState<FullOrganization["invitations"][number] | null>(null);

	const handleCancelInvite = () => {
		if (!inviteToCancel) return;
		authClient.organization.cancelInvitation({
			invitationId: inviteToCancel.id,
		}, {
			onSuccess: () => {
				toast.success("Invite cancelled successfully");
				setInviteToCancel(null);
				refetchOrg();
			},
			onError: (e) => {
				console.error(e);
				toast.error("Failed to cancel invite: " + e.error.message);
			}
		});
	};


	return (
		<>
			<InviteDetailsModal invite={selectedInvite} members={orgData.members} isOpen={!!selectedInvite} onOpenChange={() => setSelectedInvite(null)} refetchOrg={refetchOrg} />
			<AlertDialog open={!!inviteToCancel} onOpenChange={(open) => !open && setInviteToCancel(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently revoke the invitation for <span className="font-semibold">{inviteToCancel?.email}</span>.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setInviteToCancel(null)}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(e) => {
								e.preventDefault()
								handleCancelInvite()
							}}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
						>
							Continue
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<TabsContent value="invites" className="pt-3">
				<div className="grid gap-4">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="grid gap-1.5">
							<Label htmlFor="invite-email">Email</Label>
							<Input id="invite-email" type="email" placeholder="user@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>
						<div className="grid gap-1.5">
							<Label>Role</Label>
							<Select defaultValue="member" value={role} onValueChange={setRole}>
								<SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="member">Member</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div className="flex items-center justify-end">
						<Button className="gap-2" disabled={isSending || !email} onClick={() => {
							setIsSending(true);
							authClient.organization.inviteMember({
								email,
								role: role as "owner" | "admin" | "member",
								organizationId: orgId,
							}, {
								onSuccess: () => {
									toast.success("Invite sent successfully");
									setEmail("");
									setRole("member");
									setIsSending(false);
								},
								onError: (e) => {
									console.error(e);
									toast.error("Failed to send invite: " + e.error.message);
									setIsSending(false);
								}
							})
						}}><Mail className="size-4" /> {isSending ? "Sending..." : "Send invite"}</Button>
					</div>
					<Separator />
					<p className="text-sm text-muted-foreground">Pending invites</p>
					<ScrollArea className="h-40 rounded-md border">
						<motion.div
							className="p-1 space-y-1"
							variants={{
								hidden: { opacity: 0 },
								show: {
									opacity: 1,
									transition: {
										staggerChildren: 0.1,
									},
								},
							}}
							initial="hidden"
							animate="show"
						>
							{invitations.length > 0 ? (
								<AnimatePresence>
									{invitations.map(invite => {
										if (invite.status === "canceled") return null;

										return (
											<motion.div
												key={invite.id}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
												layout
												className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
												onClick={() => setSelectedInvite(invite)}
											>
												<div className="flex items-center gap-2">
													<div className="p-2 rounded-md bg-muted-foreground/10">
														<Link2Icon className="size-4" />
													</div>
													<div className="grid">
														<span className="font-mono text-xs">{invite.email}</span>
														<Badge variant={invite.role === "admin" ? "secondary" : "outline"} className="w-fit">
															{invite.role === "admin" ? "Admin" : "Member"}
														</Badge>
													</div>
												</div>
												<Button
													variant="ghost"
													size="icon"
													className="shrink-0 rounded-full size-8 hover:bg-destructive hover:text-destructive-foreground"
													onClick={(e) => {
														e.stopPropagation();
														setInviteToCancel(invite);
													}}>
													<Trash className="size-4" />
												</Button>
											</motion.div>
										)
									})}
								</AnimatePresence>
							) : (
								<div className="flex items-center justify-center h-full p-4">
									<p className="text-sm text-muted-foreground">No pending invites!</p>
								</div>
							)}
						</motion.div>
					</ScrollArea>
				</div>
			</TabsContent >
		</>
	)
}

function PoliciesTab({ hours }: { hours: OrgMetadata["hours"] }) {
	return (
		<TabsContent value="policies" className="pt-3">
			<div className="grid gap-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="grid gap-1.5">
						<Label htmlFor="org-start">Workday start</Label>
						<Input id="org-start" type="time" defaultValue={hours.open} />
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="org-end">Workday end</Label>
						<Input id="org-end" type="time" defaultValue={hours.close} />
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="grid gap-1.5">
						<Label>Default lunch duration</Label>
						<Select defaultValue="60">
							<SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
							<SelectContent>
								<SelectItem value="30">30 min</SelectItem>
								<SelectItem value="45">45 min</SelectItem>
								<SelectItem value="60">60 min</SelectItem>
								<SelectItem value="90">90 min</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="timezone">Timezone</Label>
						<Input id="timezone" placeholder="e.g. UTC, America/New_York" defaultValue={hours.timezone} />
					</div>
				</div>
				<div className="flex items-center justify-end">
					<Button className="gap-2"><CalendarIcon className="size-4" /> Save policies</Button>
				</div>
			</div>
		</TabsContent>
	)
}

function InviteDetailsModal({ invite, members, isOpen, onOpenChange, refetchOrg }: { invite: FullOrganization["invitations"][number] | null, members: FullOrganization["members"], isOpen: boolean, onOpenChange: (open: boolean) => void, refetchOrg: () => void }) {
	if (!invite) return null;

	const inviter = members.find(member => member.userId === invite.inviterId);
	const inviteLink = `${window.location.origin}/orgs/invite?token=${invite.id}`;

	const handleRevoke = () => {
		authClient.organization.cancelInvitation({
			invitationId: invite.id,
		}, {
			onSuccess: () => {
				toast.success("Invite cancelled successfully");
				onOpenChange(false);
				refetchOrg();
			},
			onError: (e) => {
				console.error(e);
				toast.error("Failed to cancel invite: " + e.error.message);
			}
		});
	}

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Invitation Details</DialogTitle>
					<DialogDescription>
						An invitation was sent to <span className="font-semibold">{invite.email}</span> to join as a <span className="font-semibold">{invite.role}</span>.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4 pt-4">
					<div className="grid grid-cols-2 gap-4 text-sm">
						<div className="grid gap-1.5">
							<p className="text-muted-foreground">Invited By</p>
							<p className="font-semibold">{inviter?.user.name ?? "Unknown"}</p>
						</div>
						<div className="grid gap-1.5">
							<p className="text-muted-foreground">Expires</p>
							<p className="font-semibold">{dayjs(invite.expiresAt).fromNow()}</p>
						</div>
					</div>
					<Label htmlFor="link">Invite Link</Label>
					<div className="flex items-center gap-2">
						<Input id="link" value={inviteLink} readOnly className="font-mono text-xs h-9" />
						<Button onClick={() => {
							navigator.clipboard.writeText(inviteLink);
							toast.success("Invite link copied to clipboard!");
						}} size="icon" variant="outline" className="shrink-0">
							<Copy className="size-4" />
						</Button>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
					<Button variant="destructive" onClick={handleRevoke}>
						<Trash className="size-4 mr-2" /> Revoke Invite
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}