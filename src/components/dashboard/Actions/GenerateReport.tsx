import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { BarChart, Calendar, Download, FileText, User, Users } from "lucide-react";
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
			<DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-sm border-border/50">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
				>
					<DialogHeader className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
								<BarChart className="h-5 w-5 text-primary" />
							</div>
							<div>
								<DialogTitle className="text-xl">Generate Report</DialogTitle>
								<DialogDescription className="text-base">
									Create detailed timesheet reports for analysis
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<div className="space-y-6 mt-6">
						{error && (
							<motion.div
								className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm"
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								role="alert"
								aria-live="polite"
							>
								{error}
							</motion.div>
						)}

						{/* Report Scope */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-4">
								<div className="flex items-center gap-2">
									<Users className="h-4 w-4 text-primary" />
									<h3 className="text-sm font-medium text-foreground">Report Scope</h3>
								</div>
								<Tabs value={scope} onValueChange={(v) => setScope(v as any)}>
									<TabsList className="grid w-full grid-cols-2 bg-muted/30">
										<TabsTrigger value="self" className="flex items-center gap-2">
											<User className="h-4 w-4" />
											<span>My Report</span>
										</TabsTrigger>
										<TabsTrigger value="org" disabled={!canGenerateOrgReport} className="flex items-center gap-2">
											<Users className="h-4 w-4" />
											<span>Organization</span>
										</TabsTrigger>
									</TabsList>
									<TabsContent value="self" className="mt-3">
										<div className="bg-accent/10 border border-accent/20 p-3 rounded-lg text-sm">
											<p className="font-medium text-foreground">Personal Report</p>
											<p className="text-muted-foreground text-xs mt-1">Generate a report containing only your time tracking data</p>
										</div>
									</TabsContent>
									<TabsContent value="org" className="mt-3">
										<div className="bg-primary/10 border border-primary/20 p-3 rounded-lg text-sm">
											<p className="font-medium text-foreground">Organization Report</p>
											<p className="text-muted-foreground text-xs mt-1">Generate a comprehensive report for all team members</p>
										</div>
									</TabsContent>
								</Tabs>
							</div>
						</motion.div>

						{/* Date Range */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.2 }}
						>
							<div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-4">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-primary" />
									<h3 className="text-sm font-medium text-foreground">Date Range</h3>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="from" className="text-sm font-medium">From Date</Label>
										<Input
											id="from"
											type="date"
											className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="to" className="text-sm font-medium">To Date</Label>
										<Input
											id="to"
											type="date"
											className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
										/>
									</div>
								</div>
							</div>
						</motion.div>

						{/* Format Options */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.3 }}
						>
							<div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-4">
								<div className="flex items-center gap-2">
									<FileText className="h-4 w-4 text-primary" />
									<h3 className="text-sm font-medium text-foreground">Export Options</h3>
								</div>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label className="text-sm font-medium">File Format</Label>
										<Select defaultValue="csv">
											<SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="csv">CSV Spreadsheet</SelectItem>
												<SelectItem value="pdf">PDF Document</SelectItem>
												<SelectItem value="xlsx">Excel Workbook</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label className="text-sm font-medium">Detail Level</Label>
										<Select defaultValue="summary">
											<SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="summary">Summary Only</SelectItem>
												<SelectItem value="detailed">Detailed Breakdown</SelectItem>
												<SelectItem value="raw">Raw Data</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							</div>
						</motion.div>
					</div>

					<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
						<Button
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancel
						</Button>
						<Button className="gap-2">
							<Download className="h-4 w-4" />
							Generate Report
						</Button>
					</DialogFooter>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}