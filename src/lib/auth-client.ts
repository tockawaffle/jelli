import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { betterAuthLocalizationClientPlugin } from "better-auth-localization";
import { deviceAuthorizationClient, lastLoginMethodClient, organizationClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { attendanceClientPlugin } from "./helpers/plugins/client/attendance";
import { userHelpersClientPlugin } from "./helpers/plugins/client/user_helpers";

export const authClient = createAuthClient({
	plugins: [
		convexClient(),
		userHelpersClientPlugin(),
		organizationClient({
			enabled: true,
			teams: {
				enabled: true,
			},
		}),
		twoFactorClient(),
		lastLoginMethodClient(),
		deviceAuthorizationClient(),
		betterAuthLocalizationClientPlugin(),
		attendanceClientPlugin()
	],
});