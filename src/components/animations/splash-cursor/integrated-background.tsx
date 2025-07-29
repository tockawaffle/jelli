"use client"

import { useEffect, useState } from "react"
import BreathingBg from "./breathing-bg"
import SplashCursor from "./splash-cursor-bg"

interface IntegratedBackgroundProps {
	primaryColor?: string
	secondaryColor?: string
	accentColor?: string
}

export default function IntegratedBackground({
	primaryColor = "#041E42",
	secondaryColor = "#0A2E5C",
	accentColor = "#4c9aff",
}: IntegratedBackgroundProps) {
	const [isBreathingLoaded, setIsBreathingLoaded] = useState(false)
	const [isSplashLoaded, setIsSplashLoaded] = useState(false)

	useEffect(() => {
		// First load the breathing background
		const breathingTimer = setTimeout(() => setIsBreathingLoaded(true), 300)

		// Then load the splash cursor with additional delay
		const splashTimer = setTimeout(() => setIsSplashLoaded(true), 1300)

		return () => {
			clearTimeout(breathingTimer)
			clearTimeout(splashTimer)
		}
	}, [])

	return (
		<div className="absolute inset-0 z-0 overflow-hidden bg-black">
			{/* Base breathing background */}
			<div className={`absolute inset-0 transition-opacity duration-1000 ${isBreathingLoaded ? "opacity-100" : "opacity-0"}`}>
				<BreathingBg
					primaryColor={primaryColor}
					secondaryColor={secondaryColor}
					accentColor={accentColor}
					breathSpeed={5}
				/>
			</div>

			{/* Splash cursor effect overlay - only render when ready */}
			{isSplashLoaded && (
				<div className="absolute inset-0">
					<SplashCursor
						BACK_COLOR={{ r: 0, g: 0, b: 0 }}
						TRANSPARENT={true}
						DENSITY_DISSIPATION={2.5}
						VELOCITY_DISSIPATION={1.5}
						PRESSURE={0.8}
						SPLAT_RADIUS={0.15}
						CURL={20}
						COLOR_UPDATE_SPEED={5}
					/>
				</div>
			)}
		</div>
	)
}

