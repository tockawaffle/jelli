import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import React from "react";

type ControlledProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Optional error message to render inside the modal/sheet */
	error?: string | null;
	orgData: FullOrganization;
};
export default function RequestTimeOffDialog({ open, onOpenChange, error }: ControlledProps) {
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