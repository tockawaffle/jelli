import { CreateOrganizationSchema } from "@/components/dashboard/CreateOrgDialog";
import type { Redis } from "@upstash/redis";
import type { Invitation, Member } from "better-auth/plugins";

declare global {
	var _betterAuthRedis: Redis | undefined;

	type EmailError =
		| { type: 'SEND_FAILED'; message: string }
		| { type: 'CONFIG_ERROR'; message: string }
		| { type: 'INVALID_EMAIL'; message: string; errors?: any[] }
		| { type: 'INVALID_INVITATION'; message: string; errors?: any[] };

	// Define the success type
	type EmailSuccess = { success: true; message?: string };

	// Define the result type
	type EmailResult = Result<EmailSuccess, EmailError>;

	type SidebarActions = "home" | "time-tracking" | "schedule" | "team" | "reports" | "quick-actions" | "organization" | "settings";

	export type FullOrganization = {
		/**
		 * Organization unique identifier.
		 *
		 * Custom documentation: When consumed via `getFullOrganizationMiddleware` for a
		 * user with role "member", the runtime payload is sanitized to include only:
		 * - The current user within `members`
		 * - `teams` as `null`
		 * - An empty `invitations` array
		 * This does not alter the static type, only the runtime shape for member-level access.
		 */
		id: string
		name: string
		slug: string
		logo: string | null
		createdAt: number
		metadata: OrgMetadata // Should be a JSON string
		invitations: Invitation[]
		members: (Member & {
			user: {
				id: string
				name: string | null
				metadata?: any
				email: string
				image?: string
			}
		})[]
		teams: any | null
	}

	/**
	 * This type is currently being used on the SettingsTabs component to pass the organization data to the components.
	 */
	type OrganizationType = {
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
		currentUser: {
			id: string;
			name: string;
			metadata?: any;
			email: string;
			image: string | undefined;
		};
		invitations: Invitation[];
	}

	type OrgMetadata = CreateOrganizationSchema["metadata"];

	enum ScheduledTimeOffType {
		VACATION = "vacation",
		SICK_LEAVE = "sick_leave",
		PERSONAL_DAY = "personal_day",
		NOT_PROVIDED = "not_provided",
		UNPAID = "unpaid",
		OTHER = "other",
	}

	type OrgInfo = {
		scheduledTimeOff: {
			id: string;
			name: string;
			org_id: string;
			date: string;
			type: ScheduledTimeOffType;
			hours: number | null;
			reason: string | null;
			created_at: string;
			updated_at: string;
		}[] | null;
		members?: {
			continueCursor: string | "[]";
			isDone: boolean;
			page: Member[];
		};
		orgSettings?: any; // Replace with actual type
		orgMetadata?: any; // Replace with actual type
	};

}