"use client";

import QuickActions from "@/components/dashboard/QuickActions";
import { DashboardSkeleton } from "@/components/dashboard/skeleton";
import MinimalHeader from "@/components/Header";
import { authClient } from "@/lib/auth-client";
import { useConvexAuth } from "convex/react";
import { CalendarIcon, ClockIcon, HomeIcon, Loader2, UsersIcon, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import CreateOrganizationDialog from "./CreateOrgDialog";
import HomeSection from "./Home";
import DashboardSidebar from "./Sidebar";

export type SidebarActions = "home" | "time-tracking" | "schedule" | "team" | "reports" | "quick-actions";

export default function DashboardPage() {
	const { isLoading, isAuthenticated } = useConvexAuth();

	const { data: userOrgs, isPending: isLoadingOrgs, refetch: refetchOrgs } = authClient.useListOrganizations();
	const { data: currentOrg, isPending: isLoadingCurrentOrg, error: currentOrgError, refetch: refetchCurrentOrg } = authClient.useActiveOrganization();
	const { data: session } = authClient.useSession();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedAction, setSelectedAction] = useState<SidebarActions>(() => {
		if (typeof window === "undefined") return "home";
		const stored = localStorage.getItem("dashboard-last-action");
		if (stored) {
			const parsed = z.array(z.enum(["home", "time-tracking", "schedule", "team", "reports", "quick-actions"])).safeParse(stored);
			if (parsed.success) {
				const lastAction = parsed.data[0] as SidebarActions;
				console.debug("[DashboardPage] Loaded last action from localStorage", lastAction);
				return lastAction;
			}
		}
		return "home";
	});
	const { data: activeMember, isPending: isActiveMemberPending } = authClient.useActiveMember();
	const hasSetDefaultOrg = useRef(false);

	useEffect(() => {
		if (hasSetDefaultOrg.current) return;
		if (userOrgs && userOrgs.length > 0 && !currentOrg) {
			hasSetDefaultOrg.current = true;
			authClient.organization.setActive({
				organizationId: userOrgs[0].id,
			});
			refetchCurrentOrg();
		}
	}, [currentOrg, userOrgs, refetchCurrentOrg]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const parsed = z.array(z.enum(["home", "time-tracking", "schedule", "team", "reports", "quick-actions"])).safeParse(selectedAction);
			if (parsed.success) {
				const lastAction = parsed.data[0] as SidebarActions;
				console.debug("[DashboardPage] Saved last action to localStorage", lastAction);
				localStorage.setItem("dashboard-last-action", lastAction);
			}
		}
	}, [selectedAction]);

	useEffect(() => {
		if (!isLoading && (!isAuthenticated || !session)) {
			router.replace("/auth");
		}
	}, [isLoading, isAuthenticated, router, session]);

	// Don't render anything if we don't have a session (prevents null reference errors)
	if (!session) {
		return <div className="flex h-screen w-screen items-center justify-center bg-background">
			<Loader2 className="h-10 w-10 animate-spin text-primary" />
		</div>
	}

	if (isLoading) {
		return <div className="flex h-screen w-screen items-center justify-center bg-background">
			<Loader2 className="h-10 w-10 animate-spin text-primary" />
		</div>
	}

	if (isLoadingOrgs || isLoadingCurrentOrg || userOrgs?.length === 0 || isActiveMemberPending) {
		return (
			<div className="h-screen w-screen bg-background">
				<MinimalHeader user={session?.user || null} organization={null} />
				<DashboardSkeleton />
				<CreateOrganizationDialog open={userOrgs?.length === 0} onClose={() => { refetchOrgs() }} hasNoOrgs={userOrgs?.length === 0} />
			</div>
		)
	}

	if (currentOrgError) {
		return (
			<div className="h-screen w-screen bg-background">
				<div className="flex flex-col items-center justify-center h-full">
					<h1 className="text-2xl font-bold">Error</h1>
					<p className="text-sm text-muted-foreground">{currentOrgError.message}</p>
				</div>
			</div>
		)
	}

	const renderContent = () => {
		switch (selectedAction) {
			case "home":
				return <HomeSection currentOrg={currentOrg} session={session} router={router} activeMember={activeMember} />;
			case "time-tracking":
				return <div className="p-4">Time Tracking Page</div>;
			case "schedule":
				return <div className="p-4">Schedule Page</div>;
			case "team":
				return <div className="p-4">Team Page</div>;
			case "reports":
				return <div className="p-4">Reports Page</div>;
			case "quick-actions":
				return <QuickActions userRole={activeMember?.role || ""} />;
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col h-screen w-screen bg-background">
			<CreateOrganizationDialog open={open} onClose={() => { setOpen(false) }} hasNoOrgs={userOrgs?.length === 0} />
			<MinimalHeader user={session?.user || null} organization={currentOrg || userOrgs?.[0] || null} />
			<div className="flex flex-1 overflow-hidden">
				<DashboardSidebar
					userOrgs={userOrgs}
					currentOrg={currentOrg}
					session={session}
					setOpen={setOpen}
					selectedAction={selectedAction}
					setSelectedAction={setSelectedAction}
					router={router}
					activeMember={activeMember}
				>
					<div className="pb-24 md:pb-0">{renderContent()}</div>
				</DashboardSidebar>
			</div>
			{/* Mobile bottom navigation */}
			<nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
				<div className="grid grid-cols-5 gap-1 px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
					{[
						{ id: "home", label: "Home", icon: HomeIcon, role: null },
						{ id: "time-tracking", label: "Time", icon: ClockIcon, role: null },
						{ id: "quick-actions", label: "Actions", icon: Zap, role: null },
						{ id: "schedule", label: "Schedule", icon: CalendarIcon, role: ["admin", "owner"] as const },
						{ id: "team", label: "Team", icon: UsersIcon, role: ["admin", "owner"] as const },
					]
						.filter((item) => !item.role || item.role.includes(activeMember?.role as any))
						.map((item) => {
							const Icon = item.icon;
							const isActive = selectedAction === item.id;
							return (
								<button
									key={item.id}
									className={`flex flex-col items-center justify-center gap-1 py-1 rounded-md ${isActive ? "text-primary" : "text-muted-foreground"}`}
									onClick={() => setSelectedAction(item.id as SidebarActions)}
									aria-label={item.label}
								>
									<Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
									<span className="text-[11px] leading-none">{item.label}</span>
								</button>
							);
						})}
				</div>
			</nav>
		</div>
	)
}
