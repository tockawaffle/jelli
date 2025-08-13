import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, Clock, FileText, Users } from "lucide-react";
import { useState } from "react";
import { ClockInOutDialog, GenerateReportDialog, ManageTeamSheet, RequestTimeOffDialog } from "./QuickActionModals";

const actions = [
	{
		label: "Clock In/Out",
		description: "Quick time tracking",
		icon: Clock,
		roles: [],
	},
	{
		label: "Request Time Off",
		description: "Submit leave request",
		icon: Calendar,
		roles: [],
	},
	/** @description This action creates a specific report for the user's organization. If the user is an admin or owner, they can generate a report for the entire organization. If the user is a member, they can generate a report of their own data.*/
	{
		label: "Generate Report",
		description: "Create timesheet report",
		roles: [],
		icon: FileText,
	},
	{
		label: "Manage Team",
		description: "Add or edit team members",
		roles: ["admin", "owner"],
		icon: Users,
	}
];

export default function QuickActions({ userRole }: { userRole: string }) {
	const [clockModalOpen, setClockModalOpen] = useState(false);
	const [timeOffOpen, setTimeOffOpen] = useState(false);
	const [reportOpen, setReportOpen] = useState(false);
	const [teamOpen, setTeamOpen] = useState(false);

	const canManageTeam = ["admin", "owner"].includes(userRole);
	const canGenerateOrgReport = canManageTeam;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{actions.map((action, index) => {
						const Icon = action.icon;
						const isDisabled = action.roles.length > 0 && !action.roles.includes(userRole);
						return (
							<Button
								key={action.label}
								variant="outline"
								size="lg"
								aria-label={action.label}
								asChild
								className="group touch-manipulation min-h-[96px] sm:min-h-[112px] h-auto py-4 sm:py-5 px-4 flex flex-col items-center justify-center gap-2 rounded-xl transition-all shadow-xs hover:shadow-sm hover:bg-muted hover:text-foreground dark:hover:bg-input/50"
								disabled={isDisabled}
								onClick={() => {
									switch (action.label) {
										case "Clock In/Out":
											setClockModalOpen(true);
											break;
										case "Request Time Off":
											setTimeOffOpen(true);
											break;
										case "Generate Report":
											setReportOpen(true);
											break;
										case "Manage Team":
											setTeamOpen(true);
											break;
									}
								}}
							>
								<motion.button
									initial={{ opacity: 0, y: 6 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.03 }}
									whileHover={isDisabled ? undefined : { scale: 1.01, y: -2 }}
									whileTap={isDisabled ? undefined : { scale: 0.99 }}
								>
									<div className="flex items-center justify-center size-10 sm:size-11 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground ring-1 ring-primary/10 group-hover:ring-transparent transition-colors">
										<Icon className="size-5 sm:size-6" aria-hidden="true" />
									</div>
									<div className="text-center min-w-0">
										<p className="text-foreground text-xs sm:text-sm font-medium truncate">{action.label}</p>
										<p className="text-[11px] sm:text-xs text-muted-foreground truncate">{action.description}</p>
									</div>
								</motion.button>
							</Button>
						)
					})}
				</div>
				{/* Modals / Sheets */}
				<ClockInOutDialog open={clockModalOpen} onOpenChange={setClockModalOpen} />
				<RequestTimeOffDialog open={timeOffOpen} onOpenChange={setTimeOffOpen} />
				<GenerateReportDialog open={reportOpen} onOpenChange={setReportOpen} canGenerateOrgReport={canGenerateOrgReport} />
				<ManageTeamSheet open={teamOpen} onOpenChange={setTeamOpen} />
			</CardContent>
		</Card>
	);
}
