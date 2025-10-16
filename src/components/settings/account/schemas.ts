import { z } from "zod"

export const profileFormSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	bio: z.string().optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

