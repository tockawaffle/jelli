"use node"

import { Resend } from "@convex-dev/resend";
import { render } from "@react-email/render";
import { User } from "better-auth";
import { v } from "convex/values";
import { err, ok, Result } from "neverthrow";
import { z } from "zod";
import { components } from "../_generated/api";
import { action } from "../_generated/server";
import EmailVerificationTemplate from "./templates/email_verification";
import { changeEmailSchema, validateEmailConfig } from "./validator";

export const resend: Resend = new Resend(components.resend, {
	testMode: false
});

// EMAIL_OUT_TEST is used to test emails that are outside of the same domain
const isDev = (process.env.EMAIL_OUT_TEST !== "true") && (process.env.IS_DEV === "true" || process.env.TEST === "true")
const email = isDev ? "onboarding@resend.dev" : "no-reply@noreply.tockanest.ch"
const from = `Tocka's Nest <${email}>`

type EmailSuccess = { success: true; message: string };
type EmailError = { type: string; message: string };
type EmailResult = Result<EmailSuccess, EmailError>;

export async function EmailVerification(user: User, url: string, token: string, ctx: any): Promise<EmailResult> {
	// Validate email configuration first
	const configResult = validateEmailConfig("email_verification", { email: user.email, url, token });
	if (configResult.isErr()) {
		return err(configResult.error);
	}

	const { email: validatedEmail, url: validatedUrl, token: validatedToken } = configResult.value as z.infer<typeof changeEmailSchema>

	try {

		const emailHtml = await render(EmailVerificationTemplate({
			url: validatedUrl,
			token: validatedToken,
			user
		})).catch((error) => {
			console.error("[Email verification] Error rendering email template:", error)
			throw error
		})

		await resend.sendEmail(ctx, {
			from,
			to: validatedEmail,
			subject: "Verify your email address for your account",
			html: emailHtml
		})

		return ok({
			success: true,
			message: 'Email verification email sent successfully'
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
		user: v.any(),
		url: v.string(),
		token: v.string(),
	}),
	returns: v.object({
		success: v.boolean(),
		message: v.string(),
	}),
	handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
		const { user, url, token } = args
		const result = await EmailVerification(user, url, token, ctx)
		if (result.isErr()) {
			console.error("[Email verification - Mutation] Error sending email:", result.error)
			throw new Error(result.error.message);
		}
		return result.value
	}
})