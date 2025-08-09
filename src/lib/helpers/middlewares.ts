import { type AuthContext, type MiddlewareContext, type MiddlewareOptions, } from "better-auth";
import { APIError, getSessionFromCtx } from "better-auth/api";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";

/**
 * Ensures the requester is authorized and sanitizes the returned organization.
 *
 * Custom response behavior applied here:
 * - If the active member role is "member":
 *   - `returned.members` is filtered to only include the current user
 *   - `returned.teams` is set to `null`
 *   - `returned.invitations` is cleared (`[]`)
 *
 * Notes
 * - This function does not change the public types. It only shapes the actual
 *   runtime payload for member-level access.
 * - Errors are thrown with `APIError` when the session is missing or the user
 *   is not a member of the active organization.
 */
export async function getFullOrganizationMiddleware(mdCtx: MiddlewareContext<MiddlewareOptions, AuthContext & {
	returned?: unknown;
	responseHeaders?: Headers;
}>) {
	const session = await getSessionFromCtx(mdCtx)

	if (!session) {
		throw new APIError("UNAUTHORIZED", { message: "You are not authorized to access this resource", code: "401A" })
	}

	const member = await fetchQuery(api.orgs.get.getMember, {
		orgId: session.session.activeOrganizationId as string,
		userId: session.user.id
	})

	if (!member) {
		throw new APIError("UNAUTHORIZED", { message: "You are not authorized to access this resource", code: "401A" })
	}

	// Sanitize data.
	const returned = mdCtx.context.returned as FullOrganization;
	if (!returned) {
		console.error("[Auth] No returned data from the query:", mdCtx.context)
		throw new APIError("INTERNAL_SERVER_ERROR", { message: "Internal server error", code: "500A" })
	}

	// If a member, return the organization without much details.
	if (member.role === "member") {
		// Omit all members except the current user.
		returned.members = returned.members.filter((m) => m.userId === session.user.id)
		// There are no team support for now, so we'll just return null.
		returned.teams = null
		// Members should not see who was invited to the organization.
		returned.invitations = []

		// Return the organization without much details.
		return returned;
	}
}