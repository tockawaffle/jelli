import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, FileText, Users } from "lucide-react";

const actions = [
	{
		label: "Clock In/Out",
		description: "Quick time tracking",
		icon: Clock,
	},
	{
		label: "Request Time Off",
		description: "Submit leave request",
		icon: Calendar,
	},
	{
		label: "Generate Report",
		description: "Create timesheet report",
		icon: FileText,
	},
	{
		label: "Manage Team",
		description: "Add or edit team members",
		icon: Users,
	}
];

export default function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick Actions</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
					{actions.map((action, index) => {
						const Icon = action.icon;
						return (
							<Button
								key={index}
								variant="outline"
								size="lg"
								aria-label={action.label}
								className="group touch-manipulation min-h-[90px] sm:min-h-[110px] h-auto py-4 sm:py-5 flex flex-col items-center justify-center gap-2 rounded-lg"
							>
								<div className="flex items-center justify-center size-10 sm:size-11 rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
									<Icon className="size-5 sm:size-6" />
								</div>
								<div className="text-center min-w-0">
									<p className="text-xs sm:text-sm font-medium truncate">{action.label}</p>
									<p className="text-[10px] sm:text-xs text-muted-foreground truncate">{action.description}</p>
								</div>
							</Button>
						)
					})}
				</div>
			</CardContent>
		</Card>
	);
}
