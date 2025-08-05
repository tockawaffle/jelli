import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
	{
		name: "Sarah Chen",
		action: "Clocked in",
		time: "9:02 AM",
		status: "on-time",
		avatar: "/placeholder.svg"
	},
	{
		name: "Mike Johnson",
		action: "Early departure approved",
		time: "4:30 PM",
		status: "approved",
		avatar: "/placeholder.svg"
	},
	{
		name: "Emily Rodriguez",
		action: "Break started",
		time: "2:15 PM",
		status: "break",
		avatar: "/placeholder.svg"
	},
	{
		name: "David Kim",
		action: "Late arrival (5 min)",
		time: "9:05 AM",
		status: "late",
		avatar: "/placeholder.svg"
	}
];

const statusStyles: { [key: string]: string } = {
	"on-time": "bg-gray-200 text-gray-800",
	"approved": "bg-black text-white",
	"break": "bg-yellow-200 text-yellow-800",
	"late": "bg-red-200 text-red-800",
};


export default function RecentActivity() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Recent Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{activities.map((activity, index) => (
						<div key={index} className="flex items-center justify-between">
							<div className="flex items-center">
								<Avatar className="h-9 w-9">
									<AvatarImage src={activity.avatar} alt="Avatar" />
									<AvatarFallback>{activity.name.charAt(0)}</AvatarFallback>
								</Avatar>
								<div className="ml-4 space-y-1">
									<p className="text-sm font-medium leading-none">{activity.name}</p>
									<p className="text-sm text-muted-foreground">{activity.action}</p>
								</div>
							</div>
							<div className="text-right">
								<Button variant="outline" size="sm" className={`h-6 px-2 text-xs ${statusStyles[activity.status]}`}>{activity.status}</Button>
								<p className="text-sm text-muted-foreground">{activity.time}</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
