"use client"

import * as React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

interface BreathingBgProps {
	primaryColor?: string
	secondaryColor?: string
	accentColor?: string
	breathSpeed?: number
	children?: React.ReactNode
}

const BreathingBg = React.memo(function BreathingBg({
	primaryColor = "#041E42",
	secondaryColor = "#0A2E5C",
	accentColor = "#4c9aff",
	breathSpeed = 5,
	children,
}: BreathingBgProps) {
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
	const [isLoaded, setIsLoaded] = useState(false)

	// Use useRef instead of useState for animation timing to avoid re-renders
	const timeRef = useRef(0)
	const animationRef = useRef<number | null>(null)
	const mouseUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	// Memoized gradient background with mouse position
	const backgroundGradient = useMemo(() => {
		const mouseX = 50 + mousePosition.x * 25
		const mouseY = 50 + mousePosition.y * 25
		return `radial-gradient(circle at ${mouseX}% ${mouseY}%, ${secondaryColor}, ${primaryColor} 65%)`
	}, [mousePosition.x, mousePosition.y, primaryColor, secondaryColor])

	// Animation values based on the current time
	const animationValues = useMemo(() => {
		const time = timeRef.current
		return {
			sin: Math.sin(time),
			cos: Math.cos(time),
			sin05: Math.sin(time * 0.5),
			cos07: Math.cos(time * 0.7),
			sin09: Math.sin(time * 0.9),
			sin13: Math.sin(time * 1.3),
			cos13: Math.cos(time * 1.3),
			sin17: Math.sin(time * 1.7),
			cos17: Math.cos(time * 1.7),
			sin02: Math.sin(time * 0.2),
			cos02: Math.cos(time * 0.2),
			gradient1: 45 + Math.sin(time * 0.5) * 30,
			gradient2: 135 + Math.cos(time * 0.5) * 30
		}
	}, [timeRef.current])

	// Debounced mouse move handler
	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (mouseUpdateTimeoutRef.current) {
			clearTimeout(mouseUpdateTimeoutRef.current)
		}

		mouseUpdateTimeoutRef.current = setTimeout(() => {
			setMousePosition({
				x: e.clientX / window.innerWidth,
				y: e.clientY / window.innerHeight,
			})
		}, 50) // 50ms debounce
	}, [])

	// Setup animation loop
	useEffect(() => {
		const animate = () => {
			timeRef.current += 0.01
			// Force a style update for specific elements without re-rendering the component
			if (containerRef.current) {
				const orbElements = containerRef.current.querySelectorAll('.animated-orb')
				const time = timeRef.current

				orbElements.forEach((orb) => {
					const orbElement = orb as HTMLElement
					const dataset = orbElement.dataset

					if (dataset.animateLeft) {
						const baseLeft = Number(dataset.baseLeft || 0)
						const mouseFactorX = Number(dataset.mouseFactorX || 0)
						const sinFactor = Number(dataset.sinFactor || 0)
						const sinSpeed = Number(dataset.sinSpeed || 1)

						orbElement.style.left = `${baseLeft + mousePosition.x * mouseFactorX + Math.sin(time * sinSpeed) * sinFactor}%`
					}

					if (dataset.animateTop) {
						const baseTop = Number(dataset.baseTop || 0)
						const mouseFactorY = Number(dataset.mouseFactorY || 0)
						const cosFactor = Number(dataset.cosFactor || 0)
						const cosSpeed = Number(dataset.cosSpeed || 1)

						orbElement.style.top = `${baseTop + mousePosition.y * mouseFactorY + Math.cos(time * cosSpeed) * cosFactor}%`
					}

					if (dataset.animateRight) {
						const baseRight = Number(dataset.baseRight || 0)
						const mouseFactorX = Number(dataset.mouseFactorX || 0)
						const cosFactor = Number(dataset.cosFactor || 0)
						const cosSpeed = Number(dataset.cosSpeed || 1)

						orbElement.style.right = `${baseRight + mousePosition.x * mouseFactorX + Math.cos(time * cosSpeed) * cosFactor}%`
					}

					if (dataset.animateBottom) {
						const baseBottom = Number(dataset.baseBottom || 0)
						const mouseFactorY = Number(dataset.mouseFactorY || 0)
						const sinFactor = Number(dataset.sinFactor || 0)
						const sinSpeed = Number(dataset.sinSpeed || 1)

						orbElement.style.bottom = `${baseBottom + mousePosition.y * mouseFactorY + Math.sin(time * sinSpeed) * sinFactor}%`
					}

					if (dataset.animateOpacity) {
						const baseOpacity = Number(dataset.baseOpacity || 0)
						const sinFactor = Number(dataset.opacitySinFactor || 0)
						const sinSpeed = Number(dataset.opacitySinSpeed || 1)

						orbElement.style.opacity = `${baseOpacity + Math.sin(time * sinSpeed) * sinFactor}`
					}
				})

				// Update grid position
				const gridElement = containerRef.current.querySelector('.grid-pattern') as HTMLElement | null
				if (gridElement) {
					gridElement.style.backgroundPosition = `${Math.sin(time * 0.2) * 10}px ${Math.cos(time * 0.2) * 10}px`
				}

				// Update particle positions
				const particlesElement = containerRef.current.querySelector('.particles-effect') as HTMLElement | null
				if (particlesElement) {
					particlesElement.style.backgroundPosition = `
            ${Math.sin(time * 0.3) * 20}px ${Math.cos(time * 0.3) * 20}px,
            ${Math.cos(time * 0.2) * 30}px ${Math.sin(time * 0.2) * 30}px,
            ${Math.sin(time * 0.4) * 15}px ${Math.cos(time * 0.4) * 15}px
          `
				}

				// Update light streaks
				const lightStreaksElement = containerRef.current.querySelector('.light-streaks') as HTMLElement | null
				if (lightStreaksElement) {
					lightStreaksElement.style.backgroundImage = `
            linear-gradient(${45 + Math.sin(time * 0.5) * 30}deg, transparent 0%, ${accentColor}30 45%, transparent 55%),
            linear-gradient(${135 + Math.cos(time * 0.5) * 30}deg, transparent 0%, ${accentColor}20 45%, transparent 55%)
          `
				}
			}

			animationRef.current = requestAnimationFrame(animate)
		}

		animationRef.current = requestAnimationFrame(animate)

		// Set loaded state after a short delay
		const timer = setTimeout(() => setIsLoaded(true), 100)

		// Add mouse move listener with debounce
		window.addEventListener("mousemove", handleMouseMove)

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
			if (mouseUpdateTimeoutRef.current) {
				clearTimeout(mouseUpdateTimeoutRef.current)
			}
			clearTimeout(timer)
			window.removeEventListener("mousemove", handleMouseMove)
		}
	}, [handleMouseMove, accentColor])

	return (
		<div
			ref={containerRef}
			className="absolute inset-0 overflow-hidden"
			style={{
				backgroundImage: backgroundGradient,
				transition: "background 0.3s ease",
			}}
		>
			{/* Primary large orb - now using data attributes for direct DOM manipulation */}
			<div
				className={`absolute transition-opacity duration-1000 animated-orb ${isLoaded ? "opacity-100" : "opacity-0"}`}
				data-animate-left="true"
				data-base-left="30"
				data-mouse-factor-x="20"
				data-sin-factor="5"
				data-sin-speed="1"
				data-animate-top="true"
				data-base-top="20"
				data-mouse-factor-y="20"
				data-cos-factor="5"
				data-cos-speed="1"
				data-animate-opacity="true"
				data-base-opacity="0.3"
				data-opacity-sin-factor="0.1"
				data-opacity-sin-speed="0.5"
				style={{
					left: `${30 + mousePosition.x * 20 + animationValues.sin * 5}%`,
					top: `${20 + mousePosition.y * 20 + animationValues.cos * 5}%`,
					width: "50vmax",
					height: "50vmax",
					borderRadius: "50%",
					filter: "blur(60px)",
					backgroundImage: `radial-gradient(circle, ${accentColor}, ${secondaryColor})`,
					opacity: 0.3 + animationValues.sin05 * 0.1,
					animation: `breatheUltra ${breathSpeed}s ease-in-out infinite alternate`,
					transformOrigin: "center",
					boxShadow: `0 0 80px 10px ${accentColor}30`,
					willChange: "transform, opacity",
				}}
			/>

			{/* Secondary orb - reduced number of orbs for better performance */}
			<div
				className={`absolute transition-opacity duration-1000 animated-orb ${isLoaded ? "opacity-100" : "opacity-0"}`}
				data-animate-right="true"
				data-base-right="20"
				data-mouse-factor-x="15"
				data-cos-factor="7"
				data-cos-speed="1"
				data-animate-bottom="true"
				data-base-bottom="30"
				data-mouse-factor-y="15"
				data-sin-factor="7"
				data-sin-speed="1"
				data-animate-opacity="true"
				data-base-opacity="0.35"
				data-opacity-sin-factor="0.1"
				data-opacity-sin-speed="0.7"
				style={{
					right: `${20 + mousePosition.x * 15 + animationValues.cos * 7}%`,
					bottom: `${30 + mousePosition.y * 15 + animationValues.sin * 7}%`,
					width: "45vmax",
					height: "45vmax",
					borderRadius: "50%",
					filter: "blur(80px)",
					backgroundImage: `radial-gradient(circle, ${accentColor}50, ${secondaryColor}90)`,
					opacity: 0.35 + animationValues.cos07 * 0.1,
					animation: `breatheExtremeReverse ${breathSpeed * 1.2}s ease-in-out infinite alternate-reverse`,
					transformOrigin: "center",
					mixBlendMode: "soft-light",
					willChange: "transform, opacity",
				}}
			/>

			{/* Subtle grid pattern */}
			<div
				className="absolute inset-0 opacity-5 grid-pattern"
				style={{
					backgroundImage: `linear-gradient(${primaryColor}22 1px, transparent 1px), linear-gradient(90deg, ${primaryColor}22 1px, transparent 1px)`,
					backgroundSize: "50px 50px",
					backgroundPosition: `${animationValues.sin02 * 10}px ${animationValues.cos02 * 10}px`,
					willChange: "background-position",
				}}
			/>

			{/* Enhanced particle effects */}
			<div
				className="absolute inset-0 opacity-15 particles-effect"
				style={{
					backgroundImage: `
            radial-gradient(circle, ${accentColor}30 1px, transparent 1px),
            radial-gradient(circle, ${accentColor}20 2px, transparent 2px),
            radial-gradient(circle, ${accentColor}10 0.5px, transparent 0.5px)
          `,
					backgroundSize: "30px 30px, 80px 80px, 40px 40px",
					willChange: "background-position",
				}}
			/>

			{/* Light streaks for dynamic effect */}
			<div
				className={`absolute inset-0 transition-opacity duration-1000 light-streaks ${isLoaded ? "opacity-20" : "opacity-0"}`}
				style={{
					backgroundSize: "200% 200%",
					animation: "moveGradient 15s ease infinite",
					mixBlendMode: "soft-light",
					willChange: "background-image",
				}}
			/>

			{/* Children content */}
			{children}

			{/* Optimized animation keyframes */}
			<style>{`
        @keyframes breatheUltra {
          0% { transform: scale(0.6); opacity: 0.1; }
          100% { transform: scale(1.3); opacity: 0.4; }
        }
        
        @keyframes breatheExtremeReverse {
          0% { transform: scale(0.7); opacity: 0.2; }
          100% { transform: scale(1.3); opacity: 0.5; }
        }
        
        @keyframes moveGradient {
          0% { background-position: 0% 50%, 100% 50%; }
          50% { background-position: 100% 50%, 0% 50%; }
          100% { background-position: 0% 50%, 100% 50%; }
        }
      `}</style>
		</div>
	)
})

export default BreathingBg

