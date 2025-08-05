import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { StatsList } from "@/components/dashboard/StatsList";
import TeamStatus from "@/components/dashboard/TeamStatus";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Session, User } from "better-auth";
import { Invitation, Member } from "better-auth/plugins/organization";
import { useQuery } from "convex/react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { BarChart, Calendar, Clock, LucideIcon, Users } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useMemo } from "react";
import { api } from "../../../convex/_generated/api";

type HomeSectionProps = {
	currentOrg: {
		id: string;
		name: string;
		createdAt: Date;
		slug: string;
		metadata?: any;
		logo?: string | null | undefined;
	} & {
		members: (Member & {
			user: {
				id: string;
				name: string;
				email: string;
				image: string | undefined;
			};
		})[];
		invitations: Invitation[];
	} | null,
	session: {
		user: User,
		session: Session,
	},
	activeMember: Member | null,
	router: AppRouterInstance,
}

export default function HomeSection({ currentOrg, session, router, activeMember }: HomeSectionProps) {
	if (!session) return null;
	if (!activeMember || !currentOrg) {
		return (
			<Dialog open={true} modal={true}>
				<DialogContent showCloseButton={false} className="overflow-hidden p-0">
					<div className="h-1 w-full bg-gradient-to-r from-primary/80 via-fuchsia-500/70 to-blue-500/70" />
					<div className="p-6">
						<DialogHeader>
							<DialogTitle>Session out of sync</DialogTitle>
							<DialogDescription>
								We couldn't load your current organization or membership. This can happen after switching orgs or logging in. Please refresh to continue.
							</DialogDescription>
						</DialogHeader>

						<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="mt-4 space-y-4">
							<div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-600 rounded-md" role="alert">
								<p className="font-bold">Tip</p>
								<p className="text-sm">Make sure pop-up blockers or aggressive extensions aren't interfering with org selection.</p>
							</div>
							<div className="flex items-center justify-end gap-2">
								<Button variant="secondary" onClick={() => (typeof window !== "undefined" ? window.history.back() : undefined)}>Go back</Button>
								<Button onClick={() => (typeof window !== "undefined" ? window.location.reload() : undefined)} className="gap-2">
									Reload page
								</Button>
							</div>
						</motion.div>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	const { user } = session;

	const currentGreeting = useMemo(() => {
		const currentHour = dayjs().hour();
		if (currentHour < 12) {
			return `Good morning, ${user?.name}`;
		}
		if (currentHour < 18) {
			return `Good afternoon, ${user?.name}!`;
		}
		return `Good evening, ${user?.name}!`;
	}, [user]);

	const userRole = useMemo(() => {
		return activeMember?.role;
	}, [activeMember]);

	const attendance = useQuery(api.orgs.get.getAllAttendance, {
		orgId: currentOrg.id,
	});
	const scheduledTimeOff = useQuery(api.orgs.get.getScheduledTimeOffAmount, {
		orgId: currentOrg.id,
	});

	const stats = useMemo((): {
		id: string;
		title: string;
		value: string;
		description: string;
		icon: LucideIcon;
		trend: "up" | "down" | "neutral";
	}[] | null => {
		console.debug("[HomeSection] stats function called: ", attendance, scheduledTimeOff);
		if (!attendance || scheduledTimeOff === undefined) {
			return null;
		}

		const today = dayjs();
		const yesterday = dayjs().subtract(1, "day");

		const todayAttendance = attendance.filter((member) =>
			dayjs(member.clock_in).isSame(today, "day")
		);
		const yesterdayAttendance = attendance.filter((member) =>
			dayjs(member.clock_in).isSame(yesterday, "day")
		);

		const todayAttendanceCount = todayAttendance.length;
		const yesterdayAttendanceCount = yesterdayAttendance.length;

		const averageHoursToday =
			todayAttendance.reduce((acc, member) => {
				const clockIn = dayjs(member.clock_in);
				const clockOut = dayjs(member.clocked_out);
				return acc + clockOut.diff(clockIn, "hour", true);
			}, 0) / todayAttendanceCount || 0;

		const attendanceDifference = todayAttendanceCount - yesterdayAttendanceCount;
		const attendanceRate =
			(todayAttendanceCount / currentOrg.members.length) * 100;

		return [
			{
				id: "team-members-active",
				title: "Team Members Active",
				value: `${todayAttendanceCount} / ${currentOrg.members.length}`,
				description: `${Math.abs(attendanceDifference)} ${attendanceDifference >= 0 ? "more" : "less"
					} than yesterday`,
				icon: Users,
				trend:
					attendanceDifference > 0
						? ("up" as const)
						: attendanceDifference < 0
							? ("down" as const)
							: ("neutral" as const),
			},
			{
				id: "average-hours-today",
				title: "Average Hours Today",
				value: `${averageHoursToday.toFixed(1)}h`,
				description: `${todayAttendanceCount} members clocked in today`,
				icon: Clock,
				trend: "neutral" as const,
			},
			{
				id: "attendance-rate",
				title: "Attendance Rate",
				value: `${attendanceRate.toFixed(1)}%`,
				description: `${Math.abs(attendanceDifference)}% ${attendanceDifference >= 0 ? "increase" : "decrease"
					} from yesterday`,
				icon: BarChart,
				trend:
					attendanceDifference > 0
						? ("up" as const)
						: attendanceDifference < 0
							? ("down" as const)
							: ("neutral" as const),
			},
			{
				id: "scheduled-today",
				title: "Scheduled Today",
				value: scheduledTimeOff?.toString() ?? "0",
				description: `${scheduledTimeOff ?? 0} time-off requests`,
				icon: Calendar,
				trend: "neutral" as const,
			},
		];
	}, [attendance, scheduledTimeOff, currentOrg.members]);

	return (
		<div className="p-4 md:p-8">
			<h1 className="text-2xl font-bold">{currentGreeting} 👋</h1>
			<p className="text-muted-foreground">Here's what's happening with your team today. Everything is flowing smoothly.</p>

			{
				["admin", "owner"].includes(userRole!) && (
					<>
						<StatsList currentOrg={currentOrg} activeMember={activeMember} stats={stats ?? []} />
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
							<div className="lg:col-span-2">
								<RecentActivity />
							</div>
							<div>
								<TeamStatus />
							</div>
						</div>
					</>
				)
			}
			<div className="mt-6">
				<QuickActions />
			</div>
		</div>
	)
}
