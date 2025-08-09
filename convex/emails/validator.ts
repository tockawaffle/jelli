import { err, ok, Result } from "neverthrow";
import { z } from "zod";

export const changeEmailSchema = z.object({
	email: z.email(),
	url: z.url(),
	token: z.string(),
})

export const orgInvitationSchema = z.object({
	email: z.email(),
	invitedByUsername: z.string(),
	invitedByEmail: z.email(),
	orgName: z.string(),
	inviteLink: z.string(),
})

export function validateEmailConfig(type: "change_email" | "email_verification", data: z.infer<typeof changeEmailSchema>): Result<z.infer<typeof changeEmailSchema>, EmailError> {
	if (!process.env.RESEND_API_KEY) {
		return err({
			type: 'CONFIG_ERROR',
			message: 'Resend API key is missing. Please check your environment variables.'
		});
	}

	switch (type) {

		case "change_email": {
			const result = changeEmailSchema.safeParse(data)

			if (!result.success) {
				console.log(result.error.message)
				return err({
					type: 'INVALID_EMAIL',
					message: 'Invalid configuration',
					errors: result.error.issues
				})
			}

			return ok(result.data);
		}
		case "email_verification": {
			console.log("Validating email verification", data)
			const result = changeEmailSchema.safeParse(data)

			if (!result.success) {
				return err({
					type: 'INVALID_EMAIL',
					message: 'Invalid email or OTP',
					errors: result.error.issues
				})
			}

			return ok(result.data);
		}
	}
}

export function validateOrgInvitation(data: z.infer<typeof orgInvitationSchema>): Result<z.infer<typeof orgInvitationSchema>, EmailError> {
	const result = orgInvitationSchema.safeParse(data)

	if (!result.success) {
		return err({
			type: 'INVALID_INVITATION',
			message: 'Invalid invitation',
			errors: result.error.issues
		})
	}

	return ok(result.data);
}