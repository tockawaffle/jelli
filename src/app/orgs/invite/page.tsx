"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { useConvex } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../../convex/_generated/api";

export default function InvitePage() {
	const searchParams = useSearchParams();
	const id = searchParams.get("id");
	const invited = searchParams.get("invited");
	const router = useRouter();
	const convex = useConvex();

	const [isLoading, setIsLoading] = useState(true);
	const [showModalError, setShowModalError] = useState<{
		show: boolean,
		type: "declined" | "canceled" | "error" | null,
		errorMessage: string | null,
	}>({
		show: false,
		type: null,
		errorMessage: null,
	});

	const { data: session } = authClient.useSession();

	useEffect(() => {
		const acceptInvitation = async () => {
			if (!id || !invited) {
				setShowModalError({
					show: true,
					type: "error",
					errorMessage: "Invalid invitation.",
				});
				setIsLoading(false);
				return;
			}

			const inviteValidity = await convex.query(api.orgs.invites.CheckInviteStatus, {
				invitationId: id,
				email: invited
			});

			if (inviteValidity.validInvitation) {
				// Invitation is pending and for the correct user
				if (!session) {
					if (!inviteValidity.userExists) {
						return router.push(`/auth?type=orgInvite&method=signUp&redirect=${process.env.NEXT_PUBLIC_SITE_URL}/orgs/invite?id=${id}&invited=${invited}`);
					}
					return router.push(`/auth?type=orgInvite&method=signIn&redirect=${process.env.NEXT_PUBLIC_SITE_URL}/orgs/invite?id=${id}&invited=${invited}`);
				}

				await authClient.organization.acceptInvitation({
					invitationId: id,
				}, {
					onSuccess: () => {
						router.push(`/dashboard`);
					},
					onError: (e) => {
						console.error(e);
						setShowModalError({
							show: true,
							type: "error",
							errorMessage: e.error.message,
						});
						setIsLoading(false);
					}
				});
			} else {
				// Invitation is not pending, find out why
				try {
					const status = await convex.query(api.orgs.invites.checkInvitation, { invitationId: id });
					switch (status) {
						case "accepted":
							if (!session) return router.push("/auth");
							router.push(`/dashboard`);
							break;
						case "declined":
						case "canceled":
							setShowModalError({
								show: true,
								type: status,
								errorMessage: null,
							});
							setIsLoading(false);
							break;
						default:
							// Should not happen if validInvitation was false
							setIsLoading(false);
							break;
					}
				} catch (error) {
					setShowModalError({
						show: true,
						type: "error",
						errorMessage: "This invitation is invalid or has expired.",
					});
					setIsLoading(false);
				}
			}
		};

		acceptInvitation();
	}, [id, invited, session, convex, router]);

	return (
		<div className="flex h-screen w-screen items-center justify-center bg-background">
			{isLoading ? (
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
			) : (
				<div className="flex flex-col items-center justify-center">
					<h1 className="text-2xl font-bold">Invitation</h1>
				</div>
			)}
			{showModalError.show && (
				<Dialog
					open={showModalError.show}
					onOpenChange={(isOpen) => {
						if (!isOpen) {
							setShowModalError({ show: false, type: null, errorMessage: null });
							router.push("/auth");
						}
					}}
				>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{showModalError.type === "declined" && "Invitation Declined!"}
								{showModalError.type === "canceled" && "Invitation Canceled!"}
								{showModalError.type === "error" && "Error!"}
							</DialogTitle>
							<DialogDescription>
								{showModalError.type === "declined" && "This invitation has already been declined. Please contact the organization's administrator to get a new invitation."}
								{showModalError.type === "canceled" && "This invitation has been canceled. Please contact the organization's administrator to get a new invitation."}
								{showModalError.type === "error" && (showModalError.errorMessage || "An unexpected error occurred.")}
							</DialogDescription>
						</DialogHeader>
					</DialogContent>
				</Dialog>
			)}
		</div>
	)
}