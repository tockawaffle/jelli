import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const teamMembers = [
	{
		name: "Sarah Chen",
		role: "Frontend Developer",
		status: "active",
		time: "9:02 AM",
		avatar: "/placeholder.svg"
	},
	{
		name: "Mike Johnson",
		role: "Backend Developer",
		status: "break",
		time: "8:45 AM",
		avatar: "/placeholder.svg"
	},
	{
		name: "Emily Rodriguez",
		role: "Designer",
		status: "active",
		time: "9:15 AM",
		avatar: "/placeholder.svg"
	},
	{
		name: "David Kim",
		role: "Product Manager",
		status: "offline",
		time: "Not clocked in",
		avatar: "/placeholder.svg"
	}
];

const statusStyles: { [key: string]: { dot: string, text: string, badge: string } } = {
	"active": { dot: "bg-green-500", text: "text-green-500", badge: "bg-black text-white" },
	"break": { dot: "bg-yellow-500", text: "text-yellow-500", badge: "bg-yellow-200 text-yellow-800" },
	"offline": { dot: "bg-gray-400", text: "text-gray-400", badge: "bg-gray-200 text-gray-800" },
};

export default function TeamStatus() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team Status</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					{teamMembers.map((member, index) => (
						<div key={index} className="flex items-center justify-between">
							<div className="flex items-center">
								<Avatar className="h-9 w-9">
									<AvatarImage src={member.avatar} alt="Avatar" />
									<AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
									<span className={`bottom-0 left-7 absolute  w-3.5 h-3.5 ${statusStyles[member.status]?.dot} border-2 border-white dark:border-gray-800 rounded-full`}></span>
								</Avatar>
								<div className="ml-4 space-y-1">
									<p className="text-sm font-medium leading-none">{member.name}</p>
									<p className="text-sm text-muted-foreground">{member.role}</p>
								</div>
							</div>
							<div className="text-right">
								<Button variant="outline" size="sm" className={`h-6 px-2 text-xs ${statusStyles[member.status]?.badge}`}>{member.status}</Button>
								<p className="text-sm text-muted-foreground">{member.time}</p>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
