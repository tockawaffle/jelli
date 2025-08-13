"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	Calendar as CalendarIcon,
	Computer,
	Download,
	FileText as FileTextIcon,
	Mail,
	QrCode,
	Users,
} from "lucide-react";
import * as React from "react";

type ControlledProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Optional error message to render inside the modal/sheet */
	error?: string | null;
};

export function ClockInOutDialog({ open, onOpenChange, error, hasRegisteredDevice = false }: ControlledProps & { hasRegisteredDevice?: boolean }) {
	const [method, setMethod] = React.useState<"qr" | "pc" | "request">("request");
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Clock In / Clock Out</DialogTitle>
					<DialogDescription>
						Choose how you'd like to record your time.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					{error && (
						<div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded-md text-sm" role="alert" aria-live="polite">
							{error}
						</div>
					)}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 items-stretch">
						<Button
							variant={method === "qr" ? "default" : "outline"}
							className="group w-full h-full min-h-28 py-4 px-3 flex flex-col items-center justify-center gap-2 rounded-lg whitespace-normal text-center text-balance"
							aria-pressed={method === "qr"}
							onClick={() => setMethod("qr")}
						>
							<QrCode className={`size-5 ${method === "qr" ? "text-muted" : "text-muted-foreground"}`} />
							<span className={`text-sm font-medium ${method === "qr" ? "text-muted" : "text-muted-foreground"}`}>Via QR Code</span>
							<span className={`text-xs ${method === "qr" ? "text-muted" : "text-muted-foreground"}`}>Scan at a kiosk or team device</span>
						</Button>
						<Button
							variant={method === "pc" ? "default" : "outline"}
							className="group w-full h-full min-h-28 py-4 px-3 flex flex-col items-center justify-center gap-2 rounded-lg whitespace-normal text-center text-balance"
							aria-pressed={method === "pc"}
							onClick={() => setMethod("pc")}
						>
							<Computer className={`size-5 ${method === "pc" ? "text-muted" : "text-muted-foreground"}`} />
							<span className={`text-sm font-medium ${method === "pc" ? "text-muted" : "text-muted-foreground"}`}>This PC</span>
							<span className={`text-xs ${method === "pc" ? "text-muted" : "text-muted-foreground"}`}>
								{hasRegisteredDevice ? "Registered device" : "No device linked"}
							</span>
						</Button>
						<Button
							variant={method === "request" ? "default" : "outline"}
							className="group w-full h-full min-h-28 py-4 px-3 flex flex-col items-center justify-center gap-2 rounded-lg whitespace-normal text-center text-balance"
							aria-pressed={method === "request"}
							onClick={() => setMethod("request")}
						>
							<FileTextIcon className={`size-5 ${method === "request" ? "text-muted" : "text-muted-foreground"}`} />
							<span className={`text-sm font-medium ${method === "request" ? "text-muted" : "text-muted-foreground"}`}>Create a Request</span>
							<span className={`text-xs ${method === "request" ? "text-muted" : "text-muted-foreground"}`}>Recommended when off-site or correcting time</span>
						</Button>
					</div>
					<div className="rounded-md border p-3 text-xs text-muted-foreground">
						Tip: You can link a physical device in organization settings to enable one-click clocking from that PC.
					</div>
				</div>
				<DialogFooter>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>Close</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function RequestTimeOffDialog({ open, onOpenChange, error }: ControlledProps) {
	const [reason, setReason] = React.useState<string>("vacation");
	const [duration, setDuration] = React.useState<string>("full");
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Request Time Off</DialogTitle>
					<DialogDescription>
						Fill in the details below. Attach supporting documents if applicable.
					</DialogDescription>
				</DialogHeader>
				{error && (
					<div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded-md text-sm" role="alert" aria-live="polite">
						{error}
					</div>
				)}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onOpenChange(false);
					}}
					className="grid gap-4"
				>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="grid gap-1.5">
							<Label htmlFor="start-date">Start date</Label>
							<Input id="start-date" type="date" required />
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="end-date">End date</Label>
							<Input id="end-date" type="date" required />
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="grid gap-1.5">
							<Label>Reason</Label>
							<Select value={reason} onValueChange={setReason}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select reason" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Common</SelectLabel>
										<SelectItem className="hover:bg-primary/10!" value="vacation">Vacation</SelectItem>
										<SelectItem className="hover:bg-primary/10!" value="sick">Sick leave</SelectItem>
										<SelectItem className="hover:bg-primary/10!" value="personal">Personal</SelectItem>
										<SelectItem className="hover:bg-primary/10!" value="other">Other</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-1.5">
							<Label>Duration</Label>
							<Select value={duration} onValueChange={setDuration}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select duration" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem className="hover:bg-primary/10!" value="full">Full day</SelectItem>
									<SelectItem className="hover:bg-primary/10!" value="half-am">Half day (AM)</SelectItem>
									<SelectItem className="hover:bg-primary/10!" value="half-pm">Half day (PM)</SelectItem>
									<SelectItem className="hover:bg-primary/10!" value="custom">Custom hours</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					{reason === "other" && (
						<div className="grid gap-1.5">
							<Label htmlFor="custom-reason">Custom reason</Label>
							<Input id="custom-reason" placeholder="Describe the reason" />
						</div>
					)}
					<div className="grid gap-1.5">
						<Label htmlFor="attachments">Attachments</Label>
						<Input id="attachments" type="file" multiple className="file:bg-primary/10 file:text-primary file:border-primary file:hover:bg-primary/20 file:hover:text-primary-foreground file:cursor-pointer file:border-none file:rounded-md file:p-2 file:text-sm file:font-medium file:transition-colors file:duration-200 file:ease-in-out" accept="image/*,application/pdf" />
						<span className="text-xs text-muted-foreground">Upload medical statements or supporting files (optional)</span>
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="notes">Additional notes</Label>
						<Textarea id="notes" placeholder="Anything else we should know?" />
					</div>
					<DialogFooter>
						<Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
						<Button type="submit" className="gap-2"><Mail className="size-4" /> Submit request</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export function GenerateReportDialog({ open, onOpenChange, error, canGenerateOrgReport }: ControlledProps & { canGenerateOrgReport: boolean }) {
	const [scope, setScope] = React.useState<"self" | "org">("self");
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl">
				<DialogHeader>
					<DialogTitle>Generate Report</DialogTitle>
					<DialogDescription>Select the report scope and date range.</DialogDescription>
				</DialogHeader>
				<div className="grid gap-4">
					{error && (
						<div className="bg-destructive/10 border-l-4 border-destructive text-destructive p-3 rounded-md text-sm" role="alert" aria-live="polite">
							{error}
						</div>
					)}
					<Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
						<TabsList>
							<TabsTrigger value="self">My report</TabsTrigger>
							<TabsTrigger value="org" disabled={!canGenerateOrgReport}>Organization</TabsTrigger>
						</TabsList>
						<TabsContent value="self" className="pt-2" />
						<TabsContent value="org" className="pt-2" />
					</Tabs>
					{/* Identification banner for clarity */}
					<div className="bg-accent/30 border-l-4 border-accent text-foreground p-3 rounded-md text-sm" aria-live="polite">
						<span className="font-medium">Generating:</span> {scope === "self" ? "My report" : "Organization report"}
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="grid gap-1.5">
							<Label htmlFor="from">From</Label>
							<Input id="from" type="date" />
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="to">To</Label>
							<Input id="to" type="date" />
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<div className="grid gap-1.5">
							<Label>Format</Label>
							<Select defaultValue="csv">
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="csv">CSV</SelectItem>
									<SelectItem value="pdf">PDF</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-1.5">
							<Label>Include details</Label>
							<Select defaultValue="summary">
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="summary">Summary</SelectItem>
									<SelectItem value="detailed">Detailed</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
					<Button className="gap-2"><Download className="size-4" /> Generate</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function ManageTeamSheet({ open, onOpenChange, error }: ControlledProps) {
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
						<TabsList>
							<TabsTrigger value="members">Members</TabsTrigger>
							<TabsTrigger value="invites">Invites</TabsTrigger>
							<TabsTrigger value="policies">Policies</TabsTrigger>
						</TabsList>
						<TabsContent value="members" className="pt-3">
							<div className="grid gap-4">
								<div className="grid gap-1.5">
									<Label htmlFor="member-search">Search member</Label>
									<Input id="member-search" placeholder="Search by name or email" />
								</div>
								<ScrollArea className="h-40 rounded-md border p-3 text-sm text-muted-foreground">
									No members loaded. Wire your data to render the list here.
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
								<div className="rounded-md border p-3 text-sm text-muted-foreground">
									Pending invites will appear here.
								</div>
							</div>
						</TabsContent>
						<TabsContent value="policies" className="pt-3">
							<div className="grid gap-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div className="grid gap-1.5">
										<Label htmlFor="org-start">Workday start</Label>
										<Input id="org-start" type="time" />
									</div>
									<div className="grid gap-1.5">
										<Label htmlFor="org-end">Workday end</Label>
										<Input id="org-end" type="time" />
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
										<Input id="timezone" placeholder="e.g. UTC, America/New_York" />
									</div>
								</div>
								<div className="flex items-center justify-end">
									<Button className="gap-2"><CalendarIcon className="size-4" /> Save policies</Button>
								</div>
							</div>
						</TabsContent>
					</Tabs>
				</div>
			</SheetContent>
		</Sheet>
	);
}


