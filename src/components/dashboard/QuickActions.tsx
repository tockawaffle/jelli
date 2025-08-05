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
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{actions.map((action, index) => {
						const Icon = action.icon;
						return (
							<Button key={index} variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
								<Icon className="w-8 h-8 text-primary" />
								<div className="text-center">
									<p className="text-sm font-semibold">{action.label}</p>
									<p className="text-xs text-muted-foreground">{action.description}</p>
								</div>
							</Button>
						)
					})}
				</div>
			</CardContent>
		</Card>
	);
}
