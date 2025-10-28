import { Session, User } from "better-auth";
import { Invitation, Member } from "better-auth/plugins/organization";
import { LucideIcon } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type HomeSectionProps = {
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
				metadata?: any;
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

export type StatItem = {
	id: string;
	title: string;
	value: string;
	description: string;
	icon: LucideIcon;
	trend: "up" | "down" | "neutral";
};

export type GreetingData = {
	greeting: string;
	description: string;
	icon: LucideIcon;
};

