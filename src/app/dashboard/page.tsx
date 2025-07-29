"use client";

import { DashboardSkeleton } from "@/components/dashboard/skeleton";
import MinimalHeader from "@/components/Header";
import { authClient } from "@/lib/auth-client";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CreateOrganizationDialog from "./CreateOrgDialog";
import DashboardSidebar from "./Sidebar";

export default function DashboardPage() {
	const { isLoading, isAuthenticated } = useConvexAuth();
	const { data: userOrgs, isPending: isLoadingOrgs, refetch: refetchOrgs } = authClient.useListOrganizations();
	const { data: currentOrg, isPending: isLoadingCurrentOrg, error: currentOrgError, refetch: refetchCurrentOrg } = authClient.useActiveOrganization();
	const { data: session } = authClient.useSession();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [selectedAction, setSelectedAction] = useState<SidebarActions>("home");

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

	if (isLoadingOrgs || isLoadingCurrentOrg || userOrgs?.length === 0) {
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

	return (
		<div className="flex flex-col h-screen w-screen bg-background">
			<CreateOrganizationDialog open={open} onClose={() => { setOpen(false) }} hasNoOrgs={userOrgs?.length === 0} />
			<MinimalHeader user={session?.user || null} organization={userOrgs?.[0] || null} />
			<div className="flex flex-1 overflow-hidden">
				<DashboardSidebar userOrgs={userOrgs} currentOrg={currentOrg} session={session} setOpen={setOpen} selectedAction={selectedAction} setSelectedAction={setSelectedAction} router={router} />
			</div>
		</div>
	)
}

