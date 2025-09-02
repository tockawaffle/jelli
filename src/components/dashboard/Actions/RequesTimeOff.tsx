import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { AlertCircle, Calendar, Clock, FileText, Mail } from "lucide-react";
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
			<DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-border/50">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.3 }}
				>
					<DialogHeader className="space-y-3">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
								<Calendar className="h-5 w-5 text-primary" />
							</div>
							<div>
								<DialogTitle className="text-xl">Request Time Off</DialogTitle>
								<DialogDescription className="text-base">
									Submit your leave request with all necessary details
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					{error && (
						<motion.div
							className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm flex items-center gap-2"
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							role="alert"
							aria-live="polite"
						>
							<AlertCircle className="h-4 w-4 shrink-0" />
							{error}
						</motion.div>
					)}
					<motion.form
						onSubmit={(e) => {
							e.preventDefault();
							onOpenChange(false);
						}}
						className="space-y-6 mt-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
					>
						{/* Date Selection */}
						<div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-4">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-primary" />
								<h3 className="text-sm font-medium text-foreground">Request Dates</h3>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
									<Input
										id="start-date"
										type="date"
										required
										className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
									<Input
										id="end-date"
										type="date"
										required
										className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
									/>
								</div>
							</div>
						</div>

						{/* Request Details */}
						<div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-4">
							<div className="flex items-center gap-2">
								<Clock className="h-4 w-4 text-primary" />
								<h3 className="text-sm font-medium text-foreground">Request Details</h3>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-sm font-medium">Reason</Label>
									<Select value={reason} onValueChange={setReason}>
										<SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
											<SelectValue placeholder="Select reason" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												<SelectLabel>Common Reasons</SelectLabel>
												<SelectItem value="vacation">Vacation</SelectItem>
												<SelectItem value="sick">Sick Leave</SelectItem>
												<SelectItem value="personal">Personal Day</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label className="text-sm font-medium">Duration</Label>
									<Select value={duration} onValueChange={setDuration}>
										<SelectTrigger className="bg-background/50 border-border/50 focus:border-primary/50">
											<SelectValue placeholder="Select duration" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="full">Full Day</SelectItem>
											<SelectItem value="half-am">Half Day (Morning)</SelectItem>
											<SelectItem value="half-pm">Half Day (Afternoon)</SelectItem>
											<SelectItem value="custom">Custom Hours</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{reason === "other" && (
								<motion.div
									className="space-y-2"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3 }}
								>
									<Label htmlFor="custom-reason" className="text-sm font-medium">Custom Reason</Label>
									<Input
										id="custom-reason"
										placeholder="Please describe your reason"
										className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
									/>
								</motion.div>
							)}
						</div>

						{/* Supporting Documents */}
						<div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-4">
							<div className="flex items-center gap-2">
								<FileText className="h-4 w-4 text-primary" />
								<h3 className="text-sm font-medium text-foreground">Supporting Documents</h3>
							</div>
							<div className="space-y-3">
								<div className="space-y-2">
									<Label htmlFor="attachments" className="text-sm font-medium">Attachments (Optional)</Label>
									<Input
										id="attachments"
										type="file"
										multiple
										className="bg-background/50 border-border/50 file:bg-primary/10 file:text-primary file:border-0 file:rounded-md file:px-3 file:py-1.5 file:text-sm file:font-medium file:mr-3 hover:file:bg-primary/20 transition-colors"
										accept="image/*,application/pdf"
									/>
									<p className="text-xs text-muted-foreground">
										Upload medical certificates, documentation, or other supporting files
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="notes" className="text-sm font-medium">Additional Notes (Optional)</Label>
									<Textarea
										id="notes"
										placeholder="Any additional information about your request..."
										className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 min-h-[80px]"
									/>
								</div>
							</div>
						</div>

						<DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit" className="gap-2">
								<Mail className="h-4 w-4" />
								Submit Request
							</Button>
						</DialogFooter>
					</motion.form>
				</motion.div>
			</DialogContent>
		</Dialog>
	);
}