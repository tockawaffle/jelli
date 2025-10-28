"use client"

import { motion } from "framer-motion"
import { InvitationManagement } from "./InvitationManagement"
import { LocationSettings } from "./LocationSettings"
import { MemberManagement } from "./MemberManagement"
import { OrganizationDetails } from "./OrganizationDetails"
import type { OrganizationSettingsProps } from "./types"
import { fadeInUp } from "./utils"

export default function OrganizationSettings({ currentOrg, session, activeMember, refetchOrg }: OrganizationSettingsProps) {
	if (!currentOrg || !activeMember) {
		return null
	}

	return (
		<motion.div
			className="max-w-4xl mx-auto space-y-6 p-4 md:p-6 pb-24 md:pb-16"
			{...fadeInUp(0)}
		>
			<OrganizationDetails
				currentOrg={currentOrg}
				session={session}
				activeMember={activeMember}
				refetchOrg={refetchOrg}
			/>
			<LocationSettings
				currentOrg={currentOrg}
				session={session}
				activeMember={activeMember}
				refetchOrg={refetchOrg}
			/>
			<MemberManagement
				currentOrg={currentOrg}
				session={session}
				activeMember={activeMember}
				refetchOrg={refetchOrg}
			/>
			<InvitationManagement
				currentOrg={currentOrg}
				session={session}
				activeMember={activeMember}
				refetchOrg={refetchOrg}
			/>
		</motion.div>
	)
}

// Re-export types for convenience
export type { OrganizationSettingsProps } from "./types"

