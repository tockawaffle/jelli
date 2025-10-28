export const LOGO_UPLOAD_CONFIG = {
	maxSizeMB: 2,
	maxSizeBytes: 2 * 1024 * 1024,
	acceptedTypes: "image/png, image/jpeg, image/svg+xml",
	acceptedMimePrefix: "image/",
} as const

export const ORGANIZATION_ROLES = {
	OWNER: "owner",
	ADMIN: "admin",
	MEMBER: "member",
} as const

export const ROLE_LABELS = {
	owner: "Owner",
	admin: "Admin",
	member: "Member",
} as const

export const ROLE_DESCRIPTIONS = {
	owner: "Full access to all organization settings and data",
	admin: "Can manage members, invitations, and organization settings",
	member: "Can view organization information and use assigned features",
} as const

