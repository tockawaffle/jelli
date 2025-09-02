import { CreateOrganizationSchema } from "@/components/dashboard/CreateOrgDialog";
import type { Redis } from "@upstash/redis";
import type { Member } from "better-auth/plugins";

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

	type SidebarActions = "home" | "time-tracking" | "schedule" | "team" | "reports" | "quick-actions";

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
		metadata: string // Should be a JSON string
		invitations: {
			id: string
			organizationId: string
			email: string
			role: 'owner' | 'admin' | 'member'
			status: 'pending' | 'accepted' | 'declined'
			expiresAt: number
			inviterId: string
		}[]
		members: {
			id: string
			organizationId: string
			userId: string
			role: 'owner' | 'admin' | 'member'
			createdAt: number
			user: {
				id: string
				name: string | null
				email: string
				image?: string
			}
		}[]
		teams: any | null
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
		attendance: {
			id: string;
			org_id: string;
			name: string;
			role: string;
			date: string; // DD/MM/YYYY
			clock_in: string; // HH:MM:SS or "" when unset
			lunch_break_out: string; // HH:MM:SS or ""
			lunch_break_return: string; // HH:MM:SS or ""
			clocked_out: string; // HH:MM:SS or ""
			status: "TBR" | "CLOCKED_IN" | "LUNCH_BREAK_STARTED" | "LUNCH_BREAK_ENDED" | "CLOCKED_OUT";
			total_work_sec: number;
			total_break_sec: number;
			was_late: boolean;
			early_out: boolean;
			updated_at_ms: number;
		}[] | null;
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