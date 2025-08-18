import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download } from "lucide-react";
import React from "react";

type ControlledProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Optional error message to render inside the modal/sheet */
	error?: string | null;
	orgData: FullOrganization;
};

export default function GenerateReportDialog({ open, onOpenChange, error, canGenerateOrgReport }: ControlledProps & { canGenerateOrgReport: boolean }) {
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