import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Copy, Link2Icon, Mail, Trash, Users } from "lucide-react";
import { useState } from "react";

type ControlledProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Optional error message to render inside the modal/sheet */
	error?: string | null;
	orgData: FullOrganization;
	currentUserId: string;
};

export default function ManageTeamSheet({ open, onOpenChange, error, orgData, currentUserId }: ControlledProps) {

	const { members } = orgData;
	const { hours } = JSON.parse(orgData.metadata || "{}") as OrgMetadata;

	const handleMemberClick = (member: FullOrganization["members"][number]) => {
		console.log(member);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			{/* Fullscreen on mobile; constrained on sm+ */}
			<SheetContent side="right" className="p-0 w-full sm:max-w-lg border-l-0 sm:border-l">
				<SheetHeader className="p-4">
					<SheetTitle>Manage Team</SheetTitle>
					<SheetDescription>Invite members, update details, and manage policies.</SheetDescription>
				</SheetHeader>
				<div className="px-4 pb-4 flex-1 overflow-y-auto">
					{error && (
						<div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded-md text-sm mb-2" role="alert" aria-live="polite">
							{error}
						</div>
					)}
					<Tabs defaultValue="members">
						<TabsList className="grid grid-cols-3">
							<TabsTrigger value="members">Members</TabsTrigger>
							<TabsTrigger value="invites">Invites</TabsTrigger>
							<TabsTrigger value="policies">Policies</TabsTrigger>
						</TabsList>
						<MembersTab members={members} handleMemberClick={handleMemberClick} currentUserId={currentUserId} />
						<InvitesTab />
						<PoliciesTab hours={hours} />
					</Tabs>
				</div>
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
					<div className="p-1">
						{filteredMembers.map((member) => (
							<Button
								variant="ghost"
								key={member.id}
								className="flex items-center gap-3 p-2 size-12 rounded-md hover:bg-muted cursor-pointer w-full justify-between"
								tabIndex={0}
								disabled={member.role === "admin"}
								onClick={() => {
									handleMemberClick(member);
								}}
							>
								<Avatar className="size-9">
									<AvatarImage src={member.user.image ?? undefined} alt={`${member.user.name}'s avatar`} />
									<AvatarFallback>{member.user.name?.charAt(0)}</AvatarFallback>
								</Avatar>
								<div className="flex-1 grid gap-0.5">
									<p className="text-sm font-medium truncate">{member.user.name}</p>
									<p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
								</div>
								<p className="text-sm text-muted-foreground">{member.role === "owner" ? "Owner" : member.role === "admin" ? "Admin" : "Member"}</p>
								<Button
									variant="ghost"
									size="icon"
									className="shrink-0 rounded-full size-8 hover:bg-destructive! text-destructive! hover:text-destructive-foreground! cursor-pointer"
									disabled={member.role === "owner" || member.userId === currentUserId}
								>
									<Trash className="size-4" />
								</Button>
							</Button>
						))}
					</div>
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

function InvitesTab() {
	return (
		<TabsContent value="invites" className="pt-3">
			<div className="grid gap-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<div className="grid gap-1.5">
						<Label htmlFor="invite-email">Email</Label>
						<Input id="invite-email" type="email" placeholder="user@company.com" />
					</div>
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
				</div>
				<div className="flex items-center justify-end">
					<Button className="gap-2"><Mail className="size-4" /> Send invite</Button>
				</div>
				<Separator />
				<p className="text-sm text-muted-foreground">Pending invites</p>
				<div className="rounded-md border p-3 text-sm text-muted-foreground grid gap-2">
					<div className="flex items-center justify-between gap-2 p-2 -m-2 rounded-md hover:bg-muted">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-md bg-muted">
								<Link2Icon className="size-4" />
							</div>
							<span className="font-mono text-xs">org_2jC7x...</span>
						</div>
						<Button variant="ghost" size="icon" className="shrink-0 rounded-full size-8">
							<Copy className="size-4" />
						</Button>
					</div>
					<div className="flex items-center justify-between gap-2 p-2 -m-2 rounded-md hover:bg-muted">
						<div className="flex items-center gap-2">
							<div className="p-2 rounded-md bg-muted">
								<Mail className="size-4" />
							</div>
							<span className="font-mono text-xs">user@company.com</span>
						</div>
						<Button variant="ghost" size="icon" className="shrink-0 rounded-full size-8">
							<Trash className="size-4" />
						</Button>
					</div>
				</div>
			</div>
		</TabsContent>
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