"use client";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function InvitePage() {
	const searchParams = useSearchParams();
	const id = searchParams.get("id");
	const router = useRouter();

	if (!id) return router.push("/auth");

	const { data: session } = authClient.useSession();

	useEffect(() => {
		const acceptInvitation = async () => {
			if (!session) return router.push("/auth?redirect=/orgs/invite?id=" + id);

			const invitation = await authClient.organization.acceptInvitation({
				invitationId: id as string,
			})

			if (invitation) {
				router.push(`/dashboard`);
			}
		}

		acceptInvitation();
	}, [id, session])

	return (
		<div className="flex h-screen w-screen items-center justify-center bg-background">
			<Loader2 className="h-10 w-10 animate-spin text-primary" />
		</div>
	)
}