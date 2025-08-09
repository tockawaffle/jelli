"use node"

import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/render";
import { v } from "convex/values";
import { err, ok, Result } from "neverthrow";
import { z } from "zod";
import { components } from "../_generated/api";
import { action } from "../_generated/server";
import { OrgInvitationTemplate } from "./templates/org_invitation";
import { orgInvitationSchema, validateOrgInvitation } from "./validator";

export const resend: Resend = new Resend(components.resend, {
	testMode: false
});

// EMAIL_OUT_TEST is used to test emails that are outside of the same domain
const isDev = (process.env.EMAIL_OUT_TEST !== "true") && (process.env.NODE_ENV === "development" || process.env.TEST === "true")
const email = isDev ? "onboarding@resend.dev" : "no-reply@noreply.tockanest.ch"
const from = `Tocka's Nest <${email}>`

type EmailSuccess = { success: true; message: string };
type EmailError = { type: string; message: string };
type EmailResult = Result<EmailSuccess, EmailError>;

export async function sendOrgInvitation(
	email: string,
	invitedByUsername: string,
	invitedByEmail: string,
	orgName: string,
	inviteLink: string,
	ctx: any
): Promise<EmailResult> {
	// Validate email configuration first
	const configResult = validateOrgInvitation({ email, invitedByUsername, invitedByEmail, orgName, inviteLink });
	if (configResult.isErr()) {
		return err(configResult.error);
	}

	console.log("[Org invitation] Sending email with the following data:", {
		from,
		email,
		invitedByUsername,
		invitedByEmail,
		orgName,
		inviteLink
	})

	const { email: validatedEmail, invitedByUsername: validatedInvitedByUsername, invitedByEmail: validatedInvitedByEmail, orgName: validatedOrgName, inviteLink: validatedInviteLink } = configResult.value as z.infer<typeof orgInvitationSchema>

	try {

		const emailHtml = await render(OrgInvitationTemplate({
			email: validatedEmail,
			invitedByUsername: validatedInvitedByUsername,
			invitedByEmail: validatedInvitedByEmail,
			orgName: validatedOrgName,
			inviteLink: validatedInviteLink
		})).catch((error) => {
			console.error("[Org invitation] Error rendering email template:", error)
			throw error
		})

		await resend.sendEmail(ctx, {
			from,
			to: validatedEmail,
			subject: `You're invited to join ${validatedOrgName} on Jelli`,
			html: emailHtml
		})

		return ok({
			success: true,
			message: 'Org invitation email sent successfully'
		})
	} catch (error) {
		return err({
			type: 'SEND_FAILED',
			message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`
		})
	}
}

export const send = action({
	args: v.object({
		email: v.string(),
		invitedByUsername: v.string(),
		invitedByEmail: v.string(),
		orgName: v.string(),
		inviteLink: v.string(),
	}),
	returns: v.object({
		success: v.boolean(),
		message: v.string(),
	}),
	handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
		const { email, invitedByUsername, invitedByEmail, orgName, inviteLink } = args
		const result = await sendOrgInvitation(email, invitedByUsername, invitedByEmail, orgName, inviteLink, ctx)
		if (result.isErr()) {
			console.error("[Org invitation - Mutation] Error sending email:", result.error)
			throw new Error(result.error.message);
		}
		return result.value
	}
})