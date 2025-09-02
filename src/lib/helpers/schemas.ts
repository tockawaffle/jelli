import { z } from "zod";

// Image schema
export const imageSchema = z.object({
	url: z.url(),
	key: z.string(),
	timestamp: z.coerce.date(),
	type: z.enum(["profile", "banner"]),
	current: z.boolean()
});

// Link schema for metadata
export const linkSchema = z.object({
	label: z.string(),
	url: z.url()
});

// Log schema for account status
export const logSchema = z.object({
	createdBy: z.string(),
	message: z.string(),
	createdAt: z.coerce.date().default(new Date()),
	updatedAt: z.coerce.date().default(new Date())
});

// Account status schema
export const accountStatusSchema = z.object({
	label: z.enum(["verified", "unverified", "pending", "deactivated", "deleted", "suspended", "banned"]),
	logs: z.array(logSchema),
	userReason: z.string().optional().default(""),
	createdAt: z.coerce.date().default(new Date()),
	updatedAt: z.coerce.date().default(new Date())
}).refine((data) => {
	if (["deleted", "suspended", "banned"].includes(data.label) && !data.logs.some((log) => log.message && log.message.trim() !== "")) {
		return false; // Logs are required if the account status is deleted, suspended, or banned
	}

	return true;
}, {
	message: "At least one log with a non-empty message is required for deleted, suspended, or banned accounts"
});

// Metadata schema
export const metadataSchema = z.object({
	links: z.array(linkSchema).refine((data) => {
		if (data.length === 0) {
			return true;
		}
		return data.every((link) => {
			return link.label && link.url;
		});
	}, {
		message: "All links must have a label and URL"
	}).default([]),
	pronouns: z.string(),
	description: z.string().max(1000),
	accountStatus: z.array(accountStatusSchema),
});

// Main user validation schema
export const userValidationSchema = z.object({
	name: z.string(),
	email: z.email(),
	emailVerified: z.boolean(),
	id: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	image: z.array(imageSchema),
	metadata: metadataSchema
});

export const sessionValidationSchema = z.object({
	ipAddress: z.ipv4(),
	userAgent: z.string(),
	expiresAt: z.coerce.date(),
	userId: z.string(),
	token: z.string(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
})