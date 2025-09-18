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
import { Activity, BarChart, Calendar, Clock, LucideIcon, Moon, Sparkles, Sun, SunDim, Users } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useMemo } from "react";
import { api } from "../../../convex/_generated/api";

// FullOrganization type is defined in globals.d.ts

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
	refetchOrg: () => void,
}

export default function HomeSection({ currentOrg, session, activeMember, refetchOrg }: HomeSectionProps) {
	if (!session) return null;
	if (!activeMember || !currentOrg) {
		return (
			<Dialog open={true} modal={true}>
				<DialogContent showCloseButton={false} className="overflow-hidden p-0">
					<div className="h-1 w-full bg-linear-to-r from-primary/80 via-accent to-primary" />
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
		<motion.div
			className="min-h-screen bg-background relative"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Hero Header Section */}
			<motion.div
				className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-accent/5 border-b border-border/50"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				<div className="absolute inset-0 bg-grid-pattern opacity-5" />
				<div className="relative max-w-7xl mx-auto py-8 md:py-12">
					<motion.div
						className="flex flex-col md:flex-row md:items-center justify-between gap-6"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.1 }}
					>
						<div className="space-y-2">
							<div className="flex items-center gap-3">
								<motion.div
									className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20"
									whileHover={{ scale: 1.05, rotate: 5 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<currentGreeting.icon className="h-6 w-6 text-primary" />
								</motion.div>
								<div>
									<motion.h1
										className="text-2xl md:text-3xl font-bold text-foreground"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.6, delay: 0.2 }}
									>
										{currentGreeting.greeting}
									</motion.h1>
									<motion.p
										className="text-sm md:text-base text-muted-foreground flex items-center gap-2"
										initial={{ opacity: 0, x: -20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ duration: 0.6, delay: 0.3 }}
									>
										<Sparkles className="h-4 w-4 text-accent" />
										{currentGreeting.description}
									</motion.p>
								</div>
							</div>
						</div>

						{/* Organization Info Card */}
						<motion.div
							className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							whileHover={{ scale: 1.02 }}
						>
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
									<Activity className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold text-foreground text-sm">{currentOrg.name}</h3>
									<p className="text-xs text-muted-foreground flex items-center gap-1">
										<Users className="h-3 w-3" />
										{currentOrg.members.length} member{currentOrg.members.length !== 1 ? 's' : ''}
									</p>
								</div>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</motion.div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto py-6 space-y-8 relative z-0">
				{["admin", "owner"].includes(userRole!) && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.5 }}
					>
						<StatsList stats={stats ?? []} />
					</motion.div>
				)}

				{/* Dashboard Grid */}
				{["admin", "owner"].includes(userRole!) && (
					<motion.div
						className="grid gap-6 grid-cols-1 lg:grid-cols-3"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6, delay: 0.6 }}
					>
						<motion.div
							className="lg:col-span-2"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.7 }}
						>
							<RecentActivity
								orgInfo={orgInfo}
								orgMembers={currentOrg.members.map(m => ({
									userId: m.userId,
									name: m.user?.name ?? null,
									image: m.user?.image ?? undefined,
								}))}
							/>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.8 }}
						>
							<TeamStatus
								orgInfo={orgInfo}
								orgMembers={currentOrg.members.map(m => ({
									userId: m.userId,
									name: m.user?.name ?? null,
									role: m.role,
									image: m.user?.image ?? undefined,
								}))}
							/>
						</motion.div>
					</motion.div>
				)}

				{/* Quick Actions */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.9 }}
					className="transform-gpu"
				>
					<QuickActions
						userData={{ role: userRole || "", id: user.id }}
						orgData={currentOrg as unknown as FullOrganization}
						refetchOrg={refetchOrg}
					/>
				</motion.div>
			</div>
		</motion.div>
	)
}
