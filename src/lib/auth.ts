import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { apiKey, createAuthMiddleware, deviceAuthorization, haveIBeenPwned, lastLoginMethod, openAPI, organization, twoFactor } from "better-auth/plugins";
import { fetchAction } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { type GenericCtx } from "../../convex/_generated/server";
import { authComponent } from "../../convex/auth";
import { getFullOrganizationMiddleware } from "./helpers/middlewares";
import { auditLogsPlugin } from "./helpers/plugins/server/audit_logs";
import { localization as errorLocalization } from "./helpers/plugins/server/better-auth-localization";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const createAuth = (ctx: GenericCtx) =>
	betterAuth({
		baseURL: siteUrl,
		trustedOrigins: async (request) => {
			const isDev = process.env.IS_DEV == "true";
			console.log("[BetterAuth - Internal] IS_DEV:", process.env.IS_DEV)
			console.log("[BetterAuth - Internal] isDev:", isDev)
			if (isDev) {
				// Have to set this manually, ffs
				let trustedOriginsEnv = process.env.TRUSTED_ORIGINS || "";
				// Format the trusted origins env variable to an array
				let trustedOrigins = trustedOriginsEnv.split(",");
				console.log("[BetterAuth - Internal] Trusted origins:", [siteUrl, ...trustedOrigins])
				return [siteUrl, ...trustedOrigins] as string[]; // Add all local ip addresses to the trusted origins (ALL IPS FROM ALL INTERFACES)
			} else {
				return [siteUrl] as string[];
			}
		},
		advanced: {
			ipAddress: {
				ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "x-client-ip"],
				disableIpTracking: false
			}
		},
		database: authComponent.adapter(ctx),
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
			sendResetPassword: async ({ user, url, token, }, request) => {
				console.log("sendResetPassword", user, url, token)
				await fetchAction(api.emails.password.sendResetPasswordRequest, {
					user: user as any,
					url,
					token,
				})
			},
			onPasswordReset: async ({ user }) => {
				await fetchAction(api.emails.password.sendResetPasswordSuccess, {
					user: user as any
				})
			},
		},
		emailVerification: {
			sendVerificationEmail: async ({ user, url, token }) => {
				await fetchAction(api.emails.verification.send, {
					user: user as any,
					url,
					token
				})
			},
			autoSignInAfterVerification: true,
			sendOnSignUp: true,
			sendOnSignIn: false
		},
		session: {
			// Convex plugin is bugged, it cannot retrieve the session if
			// the session is being stored on the secondary storage.
			storeSessionInDatabase: true,
		},
		plugins: [
			convex(),
			organization({
				allowUserToCreateOrganization(user) {
					return true;
				},
				organizationLimit: 2,
				organizationCreation: {
					beforeCreate: async ({ organization, user }, request) => {
						if (organization.logo && organization.logo.startsWith("storage_")) {
							const url = await ctx.storage.getUrl(organization.logo as any);
							organization.logo = url;
						}
						return {
							data: organization
						}
					}
				},
				async sendInvitationEmail(data) {
					const inviteLink = `${siteUrl}/orgs/invite/${data.id}`
					await fetchAction(api.emails.orgs.send, {
						email: data.email,
						invitedByUsername: data.inviter.user.name,
						invitedByEmail: data.inviter.user.email,
						orgName: data.organization.name,
						inviteLink
					})
				},
			}),
			haveIBeenPwned(),
			twoFactor(),
			openAPI(),
			apiKey({
				enableMetadata: true,
				rateLimit: {
					enabled: true,
					maxRequests: 1000,
					timeWindow: 1000 * 60 * 60 * 24,
				}
			}),
			lastLoginMethod(),
			deviceAuthorization({
				expiresIn: "1h",
				interval: "5s"
			}),
			auditLogsPlugin(
				{
					mergeDefaultIgnoredActions: true,
					ignoredActions: [
						"organization-get-full-organization",
						"convex-token"
					]
				}
			),
			errorLocalization({
				defaultLocale: "pt-BR",
				fallbackLocale: "default",
				translations: {
					"pt-BR": {
						//@ts-ignore
						PASSWORD_COMPROMISED: "Essa senha foi comprometida, por favor, utilize uma senha diferente",
					}
				}
			})
		],
		rateLimit: {
			enabled: true,
			max: 100,
			window: 60,
			storage: "secondary-storage",
		},
		logger: {
			level: "error",
			console: true,
		},
		hooks: {
			after: createAuthMiddleware(async (mdCtx) => {
				if (mdCtx.path.includes("get-full-organization")) {
					return await getFullOrganizationMiddleware(mdCtx)
				}
			})
		}
	});
