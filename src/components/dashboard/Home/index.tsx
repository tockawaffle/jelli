import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { StatsList } from "@/components/dashboard/StatsList";
import TeamStatus from "@/components/dashboard/TeamStatus";
import type { User } from "better-auth";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { api } from "../../../../convex/_generated/api";
import { HeroHeader } from "./HeroHeader";
import { useAttendanceData } from "./hooks";
import { HomeSectionProps } from "./types";
import { calculateStats, getGreeting, getUserName } from "./utils";

export default function HomeSection({ currentOrg, session, activeMember, refetchOrg }: HomeSectionProps) {
	const locale = useTranslations("DashboardHome");
	if (!session) return null;

	const { user } = session;

	const userRole = useMemo(() => {
		const role = activeMember?.role;
		console.log("Home - activeMember:", activeMember, "userRole:", role);
		return role;
	}, [activeMember]);

	const { todayAttendance, yesterdayAttendance } = useAttendanceData();

	const orgInfo = useQuery(api.orgs.get.getOrgMembersInfo, {
		orgId: currentOrg.id,
		info: ["scheduledTimeOff", "members", "orgSettings", "orgMetadata"]
	});

	const stats = useMemo(() => {
		if (!orgInfo) {
			return null;
		}

		const { scheduledTimeOff, members } = orgInfo;

		return calculateStats(
			todayAttendance,
			yesterdayAttendance,
			members?.page?.length ?? 0,
			scheduledTimeOff ?? undefined,
			locale
		);
	}, [orgInfo, todayAttendance, yesterdayAttendance]);

	const currentGreeting = useMemo(() => {
		return getGreeting(
			user as User & { metadata: { name: { firstName: string; lastName: string } } },
			todayAttendance,
			orgInfo?.members?.page?.length ?? 0,
			locale
		);
	}, [user, todayAttendance, orgInfo]);

	const userName = useMemo(() => {
		return getUserName(session.user as User & { metadata: { name: { firstName: string; lastName: string } } }, "fullName");
	}, [session.user]);

	return (
		<motion.div
			className="min-h-screen bg-background"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			{/* Hero Header Section */}
			<HeroHeader
				currentGreeting={currentGreeting}
				organizationName={currentOrg.name}
				memberCount={currentOrg.members.length}
				locale={locale}
			/>

			{/* Main Content */}
			<div className="max-w-6xl mx-auto p-4 pb-16 space-y-8 relative z-0">
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
									name: userName,
									image: m.user.image ?? undefined,
								}))}
								todayAttendance={todayAttendance || []}
								userRole={userRole}
								locale={locale}
							/>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.8 }}
						>
							<TeamStatus
								orgMembers={currentOrg.members.map(m => ({
									userId: m.userId,
									name: userName,
									role: m.role,
									image: m.user.image ?? undefined,
								}))}
								todayAttendance={todayAttendance || []}
								locale={locale}
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
						attendance={todayAttendance || []}
						locale={locale}
					/>
				</motion.div>
			</div>
		</motion.div>
	)
}

