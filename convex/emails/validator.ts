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
	orgAvatar: z.string(),
	inviteLink: z.url(),
})

export const resetPasswordSchema = z.object({
	email: z.email(),
	url: z.url(),
	token: z.string(),
})

export const resetPasswordSuccessSchema = z.object({
	email: z.email(),
})

export function validateEmailConfig(type: "change_email" | "email_verification" | "reset_password" | "reset_password_success", data: z.infer<typeof changeEmailSchema> | z.infer<typeof resetPasswordSchema> | z.infer<typeof resetPasswordSuccessSchema>): Result<z.infer<typeof changeEmailSchema> | z.infer<typeof resetPasswordSchema> | z.infer<typeof resetPasswordSuccessSchema>, EmailError> {
	if (!process.env.RESEND_API_KEY) {
		return err({
			type: 'CONFIG_ERROR',
			message: 'Resend API key or from email is missing. Please check your environment variables.'
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
		case "reset_password": {
			const result = resetPasswordSchema.safeParse(data)

			if (!result.success) {
				return err({
					type: 'INVALID_EMAIL',
					message: 'Invalid email or OTP',
					errors: result.error.issues
				})
			}

			return ok(result.data);
		}
		case "reset_password_success": {
			const result = resetPasswordSuccessSchema.safeParse(data)

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