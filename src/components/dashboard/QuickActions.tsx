import { motion } from "framer-motion";
import { Calendar, Clock, FileText, Users, Zap } from "lucide-react";
import { useState } from "react";
import ClockInOutDialog from "./Actions/ClockInOut";
import GenerateReportDialog from "./Actions/GenerateReport";
import ManageTeamSheet from "./Actions/ManageTeam";
import RequestTimeOffDialog from "./Actions/RequesTimeOff";

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

export default function QuickActions({ userData, orgData }: { userData: { role: string, id: string }, orgData: FullOrganization }) {
	const [clockModalOpen, setClockModalOpen] = useState(false);
	const [timeOffOpen, setTimeOffOpen] = useState(false);
	const [reportOpen, setReportOpen] = useState(false);
	const [teamOpen, setTeamOpen] = useState(false);

	const canManageTeam = ["admin", "owner"].includes(userData.role);
	const canGenerateOrgReport = canManageTeam;

	return (
		<motion.div
			className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm w-full relative z-0"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay: 0.1 }}
		>
			{/* Header */}
			<motion.div
				className="p-6 border-b border-border/50"
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6, delay: 0.2 }}
			>
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ring-1 ring-primary/20">
						<Zap className="h-5 w-5 text-primary" />
					</div>
					<div>
						<h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
						<p className="text-sm text-muted-foreground">Fast access to common tasks</p>
					</div>
				</div>
			</motion.div>

			{/* Actions Grid */}
			<div className="p-6 isolate">
				<motion.div
					className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					{actions.map((action, index) => {
						const Icon = action.icon;
						const isDisabled = action.roles.length > 0 && !action.roles.includes(userData.role);
						return (
							<motion.button
								key={action.label}
								className={`group relative flex flex-col items-center justify-center gap-3 p-4 min-h-[120px] rounded-xl border transition-all duration-200 ${isDisabled
									? "bg-muted/30 border-border/30 opacity-50 cursor-not-allowed"
									: "bg-background/50 border-border/50 hover:bg-background hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
									}`}
								disabled={isDisabled}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
								whileHover={isDisabled ? {} : { scale: 1.02, y: -2, zIndex: 10 }}
								whileTap={isDisabled ? {} : { scale: 0.98 }}
								style={{ zIndex: 1 }}
								onClick={() => {
									if (isDisabled) return;
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
								{/* Icon Container */}
								<motion.div
									className={`h-12 w-12 rounded-lg flex items-center justify-center transition-colors ${isDisabled
										? "bg-muted text-muted-foreground/50"
										: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
										}`}
									whileHover={isDisabled ? {} : { rotate: 5 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<Icon className="h-6 w-6" />
								</motion.div>

								{/* Text Content */}
								<div className="text-center space-y-1">
									<p className={`text-sm font-medium ${isDisabled ? "text-muted-foreground/70" : "text-foreground"}`}>
										{action.label}
									</p>
									<p className={`text-xs ${isDisabled ? "text-muted-foreground/50" : "text-muted-foreground"}`}>
										{action.description}
									</p>
								</div>

								{/* Disabled Overlay */}
								{isDisabled && (
									<div className="absolute inset-0 rounded-xl bg-background/20 backdrop-blur-[1px]" />
								)}

								{/* Hover Effect */}
								{!isDisabled && (
									<motion.div
										className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
										layoutId={`quick-action-${action.label}`}
									/>
								)}
							</motion.button>
						)
					})}
				</motion.div>
			</div>

			{/* Modals / Sheets */}
			<ClockInOutDialog open={clockModalOpen} onOpenChange={setClockModalOpen} userRole={userData.role} />
			<RequestTimeOffDialog open={timeOffOpen} onOpenChange={setTimeOffOpen} orgData={orgData} />
			<GenerateReportDialog open={reportOpen} onOpenChange={setReportOpen} canGenerateOrgReport={canGenerateOrgReport} orgData={orgData} />
			<ManageTeamSheet open={teamOpen} onOpenChange={setTeamOpen} orgData={orgData} currentUserId={userData.id} />
		</motion.div>
	);
}
