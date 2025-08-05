"use client";

import { DashboardSkeleton } from "@/components/dashboard/skeleton";
import MinimalHeader from "@/components/Header";
import { authClient } from "@/lib/auth-client";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
	const [selectedAction, setSelectedAction] = useState<SidebarActions>("home");
	const { data: activeMember, isPending: isActiveMemberPending } = authClient.useActiveMember();

	useEffect(() => {
		const localSelectedAction = localStorage.getItem("dashboard-last-action");
		if (localSelectedAction) {
			setSelectedAction(localSelectedAction as SidebarActions);
		}
	}, [setSelectedAction])

	useEffect(() => {
		if (!isLoading && (!isAuthenticated || !session)) {
			router.push("/auth");
		}
	}, [isLoading, isAuthenticated, router, session]);

	useEffect(() => {
		if (userOrgs) {
			if (userOrgs.length > 0 && !currentOrg) {
				authClient.organization.setActive({
					organizationId: userOrgs[0].id,
				});
				refetchCurrentOrg();
			}
		}
	}, [currentOrg, userOrgs, refetchCurrentOrg])

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
				return <div className="p-4">Quick Actions Page</div>;
			default:
				return null;
		}
	};

	return (
		<div className="flex flex-col h-screen w-screen bg-background">
			<CreateOrganizationDialog open={open} onClose={() => { setOpen(false) }} hasNoOrgs={userOrgs?.length === 0} />
			<MinimalHeader user={session?.user || null} organization={userOrgs?.[0] || null} />
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
					{renderContent()}
				</DashboardSidebar>
			</div>
		</div>
	)
}
