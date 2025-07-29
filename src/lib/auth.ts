import { convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { haveIBeenPwned, organization, twoFactor } from "better-auth/plugins";
import { fetchAction } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { type GenericCtx } from "../../convex/_generated/server";
import { betterAuthComponent } from "../../convex/auth";
import redis from "./helpers/redis";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const createAuth = (ctx: GenericCtx) =>
	betterAuth({
		baseURL: siteUrl,
		advanced: {
			ipAddress: {
				ipAddressHeaders: ["x-forwarded-for", "x-real-ip", "x-client-ip"],
				disableIpTracking: false
			}
		},
		database: convexAdapter(ctx, betterAuthComponent),
		secondaryStorage: {
			get: async (key): Promise<string | null> => {
				const value = await redis.get(key);

				if (value === null) {
					return null;
				}

				if (typeof value === "object") {
					const stringifiedValue = JSON.stringify(value);
					return stringifiedValue;
				}

				if (typeof value === "string") {
					return value;
				}

				return null;
			},
			set: async (key, value, ttl) => {
				if (ttl) {
					await redis.set(key, value, { ex: ttl });
				} else {
					await redis.set(key, value);
				}
			},
			delete: async (key) => {
				await redis.del(key);
			}
		},
		emailAndPassword: {
			enabled: true,
			requireEmailVerification: true,
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
				}
			}),
			haveIBeenPwned(),
			twoFactor()
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
	});