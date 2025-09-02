import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { apiKeyClient, organizationClient, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		convexClient(),
		organizationClient({
			enabled: true,
			teams: {
				enabled: true,
			},
		}),
		twoFactorClient(),
		apiKeyClient()
	],
});