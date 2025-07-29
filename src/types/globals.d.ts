import type { Redis } from "@upstash/redis";

declare global {
	var _betterAuthRedis: Redis | undefined;

	type EmailError =
		| { type: 'SEND_FAILED'; message: string }
		| { type: 'CONFIG_ERROR'; message: string }
		| { type: 'INVALID_EMAIL'; message: string; errors?: any[] };

	// Define the success type
	type EmailSuccess = { success: true; message?: string };

	// Define the result type
	type EmailResult = Result<EmailSuccess, EmailError>;

	type SidebarActions = "home" | "time-tracking" | "schedule" | "team" | "reports" | "quick-actions";

}