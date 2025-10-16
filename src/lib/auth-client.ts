import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { betterAuthLocalizationClientPlugin } from "better-auth-localization";
import { apiKeyClient, deviceAuthorizationClient, lastLoginMethodClient, organizationClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
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
		apiKeyClient(),
		lastLoginMethodClient(),
		deviceAuthorizationClient(),
		betterAuthLocalizationClientPlugin()
	],
});