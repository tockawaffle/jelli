// The OrganizationType is globally defined in src/types/globals.d.ts
// No need to redefine it here

export interface AccountSettingsProps {
	currentOrg: OrganizationType;
	refetchSession: () => void;
}

export interface ConnectedAccount {
	name: string;
	icon: any;
	connected: boolean;
	email: string | null;
}

