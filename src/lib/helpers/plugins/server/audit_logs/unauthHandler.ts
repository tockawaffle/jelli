import { sessionValidationSchema, userValidationSchema } from "../../../schemas";

export type UnauthHandler = {
	test: (action: string) => boolean; //eslint-disable-line no-unused-vars
	getUserId: (ctx: any) => Promise<string | undefined>; //eslint-disable-line no-unused-vars
	formatAction?: (action: string, ctx: any) => string; //eslint-disable-line no-unused-vars
	severity: "info" | "warning" | "error" | "severe";
};

const unauthHandlers: UnauthHandler[] = [
	{
		test: (a) => a.includes("callback") && !a.includes("delete-user"),
		severity: "warning",
		formatAction: () => `sign-in (social)`,
		getUserId: async (ctx) => {
			const newSession = ctx.context.newSession;
			if (!newSession) {
				console.info("[Audit Logs] - No user session found on new session");
				return undefined;
			}

			const user = userValidationSchema.safeParse(newSession.user);
			if (user.error) {
				console.info(`[Audit Logs] - Invalid user session found on new session: ${user.error.message}`);
				return undefined;
			}

			const session = sessionValidationSchema.safeParse(newSession.session);
			if (session.error) {
				console.info(`[Audit Logs] - Invalid session found on new session: ${session.error.message}`);
				return undefined;
			}

			return (user.data.id === session.data.userId) ? user.data.id : undefined;
		}
	},
	{
		test: (a) => a === "send-verification-otp",
		severity: "info",
		formatAction: (a, ctx) => `${a} (${ctx.body.type})`,
		getUserId: async (ctx) => {
			try {
				const user = await ctx.context.adapter.findOne({
					model: "user",
					where: [{ operator: "eq", field: "email", value: ctx.body.email }]
				}) as { id: string } | null;
				return user?.id;
			} catch (error) {
				console.error("[Audit Logs] - Error fetching user for OTP verification:", error);
				return undefined;
			}
		}
	},
];

export {
	unauthHandlers
};

