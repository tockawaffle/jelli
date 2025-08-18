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
import { BarChart, Calendar, Clock, LucideIcon, Moon, Sun, SunDim, Users } from "lucide-react";
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

export default function HomeSection({ currentOrg, session, activeMember }: HomeSectionProps) {
	if (!session) return null;
	if (!activeMember || !currentOrg) {
		return (
			<Dialog open={true} modal={true}>
				<DialogContent showCloseButton={false} className="overflow-hidden p-0">
					<div className="h-1 w-full bg-gradient-to-r from-primary/80 via-accent to-primary" />
					<div className="p-6">
						<DialogHeader>
							<DialogTitle>Session out of sync</DialogTitle>
							<DialogDescription>
								We couldn't load your current organization or membership. This can happen after switching orgs or logging in. Please refresh to continue.
							</DialogDescription>
						</DialogHeader>

						<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="mt-4 space-y-4">
							<div className="bg-accent/30 border-l-4 border-accent text-foreground p-4 rounded-md" role="alert">
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



	const userRole = useMemo(() => {
		return activeMember?.role;
	}, [activeMember]);

	const orgInfo = useQuery(api.orgs.get.getOrgMembersInfo, {
		orgId: currentOrg.id,
		info: ["attendance", "scheduledTimeOff", "members", "orgSettings", "orgMetadata"]
	});

	const stats = useMemo((): {
		id: string;
		title: string;
		value: string;
		description: string;
		icon: LucideIcon;
		trend: "up" | "down" | "neutral";
	}[] | null => {
		if (!orgInfo) {
			return null;
		}

		const today = dayjs();
		const yesterday = dayjs().subtract(1, "day");

		const { attendance, scheduledTimeOff, members, orgSettings, orgMetadata } = orgInfo;

		const todayAttendance = attendance?.filter((member) =>
			dayjs(member.clock_in).isSame(today, "day")
		);
		const yesterdayAttendance = attendance?.filter((member) =>
			dayjs(member.clock_in).isSame(yesterday, "day")
		);

		const todayAttendanceCount = todayAttendance?.length ?? 0;
		const yesterdayAttendanceCount = yesterdayAttendance?.length ?? 0;

		const averageHoursToday =
			(todayAttendance ?? []).reduce((acc, member) => {
				const clockIn = dayjs(member.clock_in);
				const clockOut = dayjs(member.clocked_out);
				return acc + clockOut.diff(clockIn, "hour", true);
			}, 0) / (todayAttendanceCount ?? 0) || 0;

		const attendanceDifference = todayAttendanceCount - yesterdayAttendanceCount;
		const attendanceRate =
			(todayAttendanceCount / (members?.page?.length ?? 0)) * 100;

		return [
			{
				id: "team-members-active",
				title: "Team Members Active",
				value: `${todayAttendanceCount} / ${members?.page?.length ?? 0}`,
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
				value: `${scheduledTimeOff?.length ?? 0} time-off requests`,
				description: "",
				icon: Calendar,
				trend: "neutral" as const,
			},
		];
	}, [orgInfo]);

	const currentGreeting = useMemo(() => {
		// Greeting according to the general status of the team and the time of the day
		// Let's consider the following:
		// - If there's no attendance for today, the description should be something along the lines of "No activity yet, stay productive!"
		// - If we have half of the team active, then the description should be more of a warning saying that we might not be on track
		// - If we have more than 3/4 of the team active, then the description should be something along the lines of "Everything's going well, keep it up!"

		const attendanceRate = (orgInfo?.attendance?.length ?? 0) / (orgInfo?.members?.page?.length ?? 0);
		const description = attendanceRate < 0.5 ? "No activity yet, stay productive!" : "Everything's going well, keep it up!";

		const currentHour = dayjs().hour();
		if (currentHour < 12) {
			return {
				greeting: `Good morning, ${user?.name}`,
				description,
				icon: Sun,
			};
		}
		if (currentHour < 18) {
			return {
				greeting: `Good afternoon, ${user?.name}!`,
				description,
				icon: SunDim,
			};
		}
		return {
			greeting: `Good evening, ${user?.name}!`,
			description,
			icon: Moon,
		};
	}, [user]);

	return (
		<div className="p-4 md:p-8">
			<h1 className="text-xl md:text-2xl font-bold">{currentGreeting.greeting} 👋</h1>
			<p className="text-sm md:text-base text-muted-foreground">{currentGreeting.description}</p>

			{
				["admin", "owner"].includes(userRole!) && (
					<>
						<StatsList stats={stats ?? []} />
						<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
							<div className="lg:col-span-2">
								<RecentActivity
									orgInfo={orgInfo}
									orgMembers={currentOrg.members.map(m => ({
										userId: m.userId,
										name: m.user?.name ?? null,
										image: m.user?.image ?? undefined,
									}))}
								/>
							</div>
							<div>
								<TeamStatus
									orgInfo={orgInfo}
									orgMembers={currentOrg.members.map(m => ({
										userId: m.userId,
										name: m.user?.name ?? null,
										role: m.role,
										image: m.user?.image ?? undefined,
									}))}
								/>
							</div>
						</div>
					</>
				)
			}
			<div className="mt-6">
				<QuickActions userData={{ role: userRole || "", id: user.id }} orgData={currentOrg as unknown as FullOrganization} />
			</div>
		</div>
	)
}
