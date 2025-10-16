"use client"

import { motion } from "framer-motion"
import { ConnectedAccounts } from "./ConnectedAccounts"
import { DangerZone } from "./DangerZone"
import { OrganizationOverview } from "./OrganizationOverview"
import { ProfileForm } from "./ProfileForm"
import type { AccountSettingsProps } from "./types"
import { fadeInUp } from "./utils"

export default function AccountSettings({ currentOrg, refetchSession }: AccountSettingsProps) {
	const memberRole = currentOrg.members.find((member) => member.user.id === currentOrg.currentUser.id)?.role

	if (!memberRole) {
		return null
	}

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-6"
			{...fadeInUp(0)}
		>
			<OrganizationOverview currentOrg={currentOrg} />
			<ProfileForm currentOrg={currentOrg} refetchSession={refetchSession} />
			<ConnectedAccounts />
			<DangerZone />
		</motion.div>
	)
}

// Re-export types for convenience
export type { AccountSettingsProps } from "./types"

