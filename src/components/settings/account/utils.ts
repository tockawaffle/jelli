export const fadeInUp = (delay: number = 0) => ({
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.5, delay, ease: "easeOut" as const },
})

export const fadeInLeft = (delay: number = 0) => ({
	initial: { opacity: 0, x: -20 },
	animate: { opacity: 1, x: 0 },
	transition: { duration: 0.3, delay, ease: "easeOut" as const },
})

export const getUserInitials = (firstName?: string, lastName?: string, fallbackName?: string): string => {
	if (firstName && lastName) {
		return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
	}
	return fallbackName?.charAt(0).toUpperCase() || "?"
}

export const isAdminOrOwner = (role: string | undefined): boolean => {
	return ["admin", "owner"].includes(role || "")
}

