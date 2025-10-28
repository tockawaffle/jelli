export interface OrganizationSettingsProps {
	currentOrg: FullOrganization;
	session: any;
	activeMember: any;
	refetchOrg: () => void;
}

export interface MemberWithUser {
	id: string;
	userId: string;
	organizationId: string;
	role: "owner" | "admin" | "member";
	createdAt: Date;
	user: {
		id: string;
		name: string | null;
		metadata?: any;
		email: string;
		image?: string;
	};
}

