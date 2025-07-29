import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { organizationClient, adminClient, twoFactorClient } from "better-auth/client/plugins";

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
  ],
});