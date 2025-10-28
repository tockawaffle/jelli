import { z } from "zod"

export const organizationFormSchema = z.object({
	name: z.string().min(1, "Organization name is required").min(3, "Organization name must be at least 3 characters"),
	slug: z.string().min(1, "Slug is required").min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
})

export type OrganizationFormValues = z.infer<typeof organizationFormSchema>

export const inviteMemberSchema = z.object({
	email: z.string().email("Invalid email address"),
	role: z.enum(["admin", "member"]),
})

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>

