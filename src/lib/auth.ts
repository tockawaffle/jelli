import { convex } from "@convex-dev/better-auth/plugins";
import { APIError, betterAuth } from "better-auth";
import { localization as errorLocalization } from "better-auth-localization";
import { createAuthMiddleware, deviceAuthorization, haveIBeenPwned, lastLoginMethod, openAPI, organization, twoFactor } from "better-auth/plugins";
import { fetchAction, fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { type GenericCtx } from "../../convex/_generated/server";
import { authComponent } from "../../convex/auth";
import { getFullOrganizationMiddleware } from "./helpers/middlewares";
import { attendancePlugin } from "./helpers/plugins/server/attendance";
import { auditLogsPlugin } from "./helpers/plugins/server/audit_logs";
import { userHelpersPlugin } from "./helpers/plugins/server/user_helpers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const createAuth = (ctx: GenericCtx) =>
	betterAuth({
		baseURL: siteUrl,
		secret: process.env.BETTER_AUTH_SECRET,
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
		socialProviders: {
			github: {
				clientId: process.env.GITHUB_CLIENT_ID as string,
				clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
			},
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID as string,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
			},
		},
		account: {
			accountLinking: {
				enabled: true,
				trustedProviders: ["github", "google"],
				allowDifferentEmails: true,
				allowUnlinkingAll: false
			}
		},
		user: {
			additionalFields: {
				metadata: {
					type: "json",
					properties: {
						name: {
							type: "json",
							properties: {
								firstName: {
									required: false,
									defaultValue: "",
									type: "string",
								},
								lastName: {
									required: false,
									defaultValue: "",
									type: "string",
								}
							}
						},
						bio: {
							required: false,
							defaultValue: "",
							type: "string",
						},
						lunchTimeStart: {
							required: false,
							type: "string",
						}
					},
					input: false,
					additionalProperties: true
				}
			}
		},

		session: {
			// Convex plugin is bugged, it cannot retrieve the session if
			// the session is being stored on the secondary storage.
			storeSessionInDatabase: true,
		},
		plugins: [
			convex(),
			userHelpersPlugin(),
			organization({
				allowUserToCreateOrganization: (user) => {
					return true
				},
				organizationLimit: 2,
				organizationHooks: {
					beforeCreateOrganization: async ({ organization, user }) => {
						const canCreate = await fetchQuery(api.orgs.get.canUserCreateOrganization, {
							userId: user.id
						}) as boolean;

						if (!canCreate) {
							throw new APIError("FORBIDDEN", { message: "You are not allowed to create organizations", code: "403A" })
						}

						if (organization.logo && organization.logo.startsWith("storage_")) {
							const url = await ctx.storage.getUrl(organization.logo as any);
							organization.logo = url as string;
						}

						return {
							data: {
								...organization,
								metadata: typeof organization.metadata === "string" ? JSON.parse(organization.metadata) : organization.metadata
							}
						}
					},
				},
				async sendInvitationEmail(data) {
					const inviteLink = `${siteUrl}/orgs/invite?id=${data.id}&invited=${data.email}`

					// Gets the org avatar from the organization
					const orgAvatar = await ctx.storage.getUrl(data.organization.logo as any)

					await fetchAction(api.emails.orgs.send, {
						email: data.email,
						invitedByUsername: data.inviter.user.name,
						invitedByEmail: data.inviter.user.email,
						orgName: data.organization.name,
						orgAvatar: orgAvatar || "",
						inviteLink
					})
				},
			}),
			haveIBeenPwned(),
			twoFactor(),
			openAPI(),
			lastLoginMethod(),
			deviceAuthorization({
				expiresIn: "1h",
				interval: "5s"
			}),
			auditLogsPlugin(
				{
					mergeDefaultIgnoredActions: true,
					mergeDefaultSeverityMap: true,
					ignoredActions: [
						"organization-get-full-organization",
						"convex-token",
						"attendance-get-auto",
						"attendance-get"
					],
					customSeverityMap: {
						"attendance-clock-in": "info",
						"attendance-clock-out": "info",
						"attendance-lunch-start": "info",
						"attendance-lunch-end": "info",
					}

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
			}),
			attendancePlugin()
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
		},
	});