"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2, Loader2, MapPin, Navigation, Search } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"
import type { OrganizationSettingsProps } from "./types"
import { canEditOrganization, fadeInUp } from "./utils"

const locationSchema = z.object({
	address: z.string().min(1, "Address is required"),
	city: z.string().optional(),
	state: z.string().optional(),
	postalCode: z.string().optional(),
	country: z.string().optional(),
	latitude: z.number().optional(),
	longitude: z.number().optional(),
	formattedAddress: z.string().optional(),
})

type LocationFormValues = z.infer<typeof locationSchema>

interface GeocodeResult {
	formattedAddress: string
	latitude: number
	longitude: number
	city?: string
	state?: string
	postalCode?: string
	country?: string
	score?: number
}

export function LocationSettings({ currentOrg, activeMember, refetchOrg }: OrganizationSettingsProps) {
	const canEdit = canEditOrganization(activeMember?.role)
	const [isGeocoding, setIsGeocoding] = useState(false)
	const [addressVerified, setAddressVerified] = useState<boolean | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [suggestions, setSuggestions] = useState<GeocodeResult[]>([])
	const [showSuggestions, setShowSuggestions] = useState(false)
	const [isGettingLocation, setIsGettingLocation] = useState(false)
	const searchTimeout = useRef<NodeJS.Timeout | null>(null)
	const wrapperRef = useRef<HTMLDivElement>(null)

	// Parse existing location from metadata
	const metadata = typeof currentOrg.metadata === 'string'
		? JSON.parse(currentOrg.metadata)
		: currentOrg.metadata
	const existingLocation = metadata?.location || {}

	const locationForm = useForm<LocationFormValues>({
		resolver: zodResolver(locationSchema),
		defaultValues: {
			address: existingLocation.address || "",
			city: existingLocation.city || "",
			state: existingLocation.state || "",
			postalCode: existingLocation.postalCode || "",
			country: existingLocation.country || "",
			latitude: existingLocation.latitude,
			longitude: existingLocation.longitude,
			formattedAddress: existingLocation.formattedAddress || "",
		},
	})

	// Close suggestions when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setShowSuggestions(false)
			}
		}
		document.addEventListener("mousedown", handleClickOutside)
		return () => document.removeEventListener("mousedown", handleClickOutside)
	}, [])

	// Initialize search query with existing address
	useEffect(() => {
		if (existingLocation.address) {
			setSearchQuery(existingLocation.formattedAddress || existingLocation.address)
			setAddressVerified(existingLocation.latitude ? true : null)
		}
	}, [existingLocation])

	// Geocode address using Nominatim (OpenStreetMap - free, no API key needed)
	const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult[]> => {
		try {
			// Extract house number from query if present
			const houseNumberMatch = address.match(/^\s*(\d+)\s*[,\s]/)
			const queryHouseNumber = houseNumberMatch ? houseNumberMatch[1] : null

			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?` +
				new URLSearchParams({
					q: address,
					format: "json",
					addressdetails: "1",
					limit: "15", // Get more results to filter and rank
					"accept-language": "en", // Prefer English results for consistency
				}),
				{
					headers: {
						"User-Agent": "Jelli-App",
					},
				}
			)

			if (!response.ok) throw new Error("Geocoding failed")

			const data = await response.json()

			// Filter and rank results
			const filteredResults: GeocodeResult[] = data
				.filter((item: any) => {
					// Only show results that are actual addresses (not just regions or countries)
					const type = item.type
					return (
						type === "house" ||
						type === "building" ||
						type === "residential" ||
						type === "commercial" ||
						type === "retail" ||
						type === "office" ||
						type === "industrial" ||
						type === "amenity" ||
						item.class === "building" ||
						item.class === "place" ||
						item.address?.road || // Has a street name
						item.address?.house_number // Has a house number
					)
				})
				.map((item: any): GeocodeResult => {
					// Build a cleaner formatted address
					const parts = []

					if (item.address?.house_number) parts.push(item.address.house_number)
					if (item.address?.road) parts.push(item.address.road)
					if (item.address?.suburb) parts.push(item.address.suburb)
					if (item.address?.city || item.address?.town || item.address?.village) {
						parts.push(item.address.city || item.address.town || item.address.village)
					}
					if (item.address?.state) parts.push(item.address.state)
					if (item.address?.country) parts.push(item.address.country)

					const cleanAddress = parts.join(", ")

					// Calculate relevance score
					let score = 0

					// Exact house number match gets highest priority
					if (queryHouseNumber && item.address?.house_number === queryHouseNumber) {
						score += 100
					}

					// Has house number at all
					if (item.address?.house_number) {
						score += 50
					}

					// Has postal code
					if (item.address?.postcode) {
						score += 10
					}

					// Specific building types score higher
					if (item.type === "house" || item.type === "building") {
						score += 20
					}

					return {
						formattedAddress: cleanAddress || item.display_name,
						latitude: parseFloat(item.lat),
						longitude: parseFloat(item.lon),
						city: item.address?.city || item.address?.town || item.address?.village || "",
						state: item.address?.state || "",
						postalCode: item.address?.postcode || "",
						country: item.address?.country || "",
						score,
					}
				})

			// Sort by relevance score
			filteredResults.sort((a: GeocodeResult, b: GeocodeResult) => (b.score || 0) - (a.score || 0))

			// Return top 5
			return filteredResults.slice(0, 5)
		} catch (error) {
			console.error("Geocoding error:", error)
			return []
		}
	}, [])

	// Search for addresses with debounce
	const searchAddress = useCallback(
		async (query: string) => {
			if (query.length < 3) {
				setSuggestions([])
				return
			}

			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current)
			}

			searchTimeout.current = setTimeout(async () => {
				setIsGeocoding(true)
				const results = await geocodeAddress(query)
				setSuggestions(results)
				setShowSuggestions(results.length > 0)
				setIsGeocoding(false)
			}, 500)
		},
		[geocodeAddress]
	)

	// Handle search input change
	const handleSearchChange = (value: string) => {
		setSearchQuery(value)
		setAddressVerified(null)
		searchAddress(value)
	}

	// Handle suggestion selection
	const handleSuggestionSelect = (result: GeocodeResult) => {
		setSearchQuery(result.formattedAddress)
		locationForm.setValue("address", result.formattedAddress)
		locationForm.setValue("formattedAddress", result.formattedAddress)
		locationForm.setValue("city", result.city || "")
		locationForm.setValue("state", result.state || "")
		locationForm.setValue("postalCode", result.postalCode || "")
		locationForm.setValue("country", result.country || "")
		locationForm.setValue("latitude", result.latitude)
		locationForm.setValue("longitude", result.longitude)
		setAddressVerified(true)
		setShowSuggestions(false)
		setSuggestions([])
	}

	// Reverse geocode coordinates to get address
	const reverseGeocode = useCallback(async (lat: number, lon: number): Promise<GeocodeResult | null> => {
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?` +
				new URLSearchParams({
					lat: lat.toString(),
					lon: lon.toString(),
					format: "json",
					addressdetails: "1",
				}),
				{
					headers: {
						"User-Agent": "Jelli-App",
					},
				}
			)

			if (!response.ok) throw new Error("Reverse geocoding failed")

			const data = await response.json()

			// Build a cleaner formatted address
			const parts = []

			if (data.address?.house_number) parts.push(data.address.house_number)
			if (data.address?.road) parts.push(data.address.road)
			if (data.address?.suburb) parts.push(data.address.suburb)
			if (data.address?.city || data.address?.town || data.address?.village) {
				parts.push(data.address.city || data.address.town || data.address.village)
			}
			if (data.address?.state) parts.push(data.address.state)
			if (data.address?.country) parts.push(data.address.country)

			const cleanAddress = parts.join(", ")

			return {
				formattedAddress: cleanAddress || data.display_name,
				latitude: parseFloat(data.lat),
				longitude: parseFloat(data.lon),
				city: data.address?.city || data.address?.town || data.address?.village || "",
				state: data.address?.state || "",
				postalCode: data.address?.postcode || "",
				country: data.address?.country || "",
			}
		} catch (error) {
			console.error("Reverse geocoding error:", error)
			return null
		}
	}, [])

	// Get user's current location
	const handleUseCurrentLocation = useCallback(async () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser")
			return
		}

		setIsGettingLocation(true)

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const { latitude, longitude } = position.coords

					// Reverse geocode to get address
					const result = await reverseGeocode(latitude, longitude)

					if (result) {
						handleSuggestionSelect(result)
						toast.success("Location detected successfully!")
					} else {
						toast.error("Could not find address for your location")
					}
				} catch (error) {
					console.error("Error processing location:", error)
					toast.error("Failed to process your location")
				} finally {
					setIsGettingLocation(false)
				}
			},
			(error) => {
				setIsGettingLocation(false)

				switch (error.code) {
					case error.PERMISSION_DENIED:
						toast.error("Location permission denied. Please enable location access.")
						break
					case error.POSITION_UNAVAILABLE:
						toast.error("Location information is unavailable")
						break
					case error.TIMEOUT:
						toast.error("Location request timed out")
						break
					default:
						toast.error("An unknown error occurred")
				}
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0,
			}
		)
	}, [reverseGeocode])

	async function onLocationSubmit(values: LocationFormValues) {
		if (!canEdit) {
			toast.error("You don't have permission to edit organization location")
			return
		}

		try {
			// Merge with existing metadata
			const currentMetadata = typeof currentOrg.metadata === 'string'
				? JSON.parse(currentOrg.metadata)
				: (currentOrg.metadata || {})

			const updatedMetadata = {
				...currentMetadata,
				location: {
					...values
				},
			}

			// Update the organization with new metadata using Better Auth client
			await authClient.organization.update({
				organizationId: currentOrg.id,
				data: {
					metadata: updatedMetadata,
				}
			}, {
				onSuccess: () => {
					refetchOrg()
					toast.success("Location updated successfully")
				},
				onError: (error) => {
					toast.error("Failed to update location")
					console.error(error)
				}
			})
		}
		catch (error) {
			toast.error("Failed to update location")
			console.error(error)
		}
	}

	return (
		<motion.div
			{...fadeInUp(0.3)}
			className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm relative z-10"
		>
			<div className="p-4 md:p-6 border-b border-border/50">
				<div className="flex items-center gap-2">
					<MapPin className="h-5 w-5 text-primary" />
					<div>
						<h3 className="text-lg font-semibold text-foreground">Physical Location</h3>
						<p className="text-sm text-muted-foreground">
							Set the address of your organization's physical location.
						</p>
						<p className="text-xs text-muted-foreground/80 mt-2 bg-muted/30 px-2 py-1.5 rounded border border-border/30">
							<strong>Note:</strong> Address data comes from OpenStreetMap and may not always be complete or exact
							(especially house numbers). If the suggested address is close to your actual location, it's acceptable to use.
						</p>
					</div>
				</div>
			</div>

			<div className="p-4 md:p-6">
				<Form {...locationForm}>
					<form onSubmit={locationForm.handleSubmit(onLocationSubmit)} className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<FormLabel className="text-sm font-medium">Search Address</FormLabel>
								{canEdit && (
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={handleUseCurrentLocation}
										disabled={isGettingLocation}
										className="h-8 text-xs"
									>
										{isGettingLocation ? (
											<>
												<Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
												Getting location...
											</>
										) : (
											<>
												<Navigation className="h-3 w-3 mr-1.5" />
												Use my location
											</>
										)}
									</Button>
								)}
							</div>
							<div className="relative" ref={wrapperRef}>
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									value={searchQuery}
									onChange={(e) => handleSearchChange(e.target.value)}
									placeholder="Start typing an address..."
									className="pl-9 pr-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
									disabled={!canEdit}
								/>
								{isGeocoding && (
									<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
								)}
								{!isGeocoding && addressVerified === true && (
									<CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
								)}
								{!isGeocoding && addressVerified === false && (
									<AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
								)}
							</div>

							{/* Suggestions dropdown */}
							{showSuggestions && suggestions.length > 0 && (
								<div className="absolute left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-72 overflow-y-auto">
									{suggestions.map((suggestion, index) => (
										<button
											key={index}
											type="button"
											className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0 focus:bg-muted/50 focus:outline-none"
											onClick={() => handleSuggestionSelect(suggestion)}
										>
											<div className="flex items-start gap-3">
												<MapPin className="h-4 w-4 text-primary mt-1 shrink-0" />
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-foreground leading-relaxed">
														{suggestion.formattedAddress}
													</p>
													{suggestion.postalCode && (
														<p className="text-xs text-muted-foreground mt-1">
															Postal Code: {suggestion.postalCode}
														</p>
													)}
												</div>
											</div>
										</button>
									))}
								</div>
							)}

							{searchQuery && !isGeocoding && suggestions.length === 0 && showSuggestions && (
								<p className="text-xs text-muted-foreground mt-1">
									No addresses found. Try a different search.
								</p>
							)}

							{addressVerified === true && (
								<p className="text-xs text-green-600 dark:text-green-500 flex items-center gap-1">
									<CheckCircle2 className="h-3 w-3" />
									Address verified with coordinates
								</p>
							)}
						</div>

						<FormField
							control={locationForm.control}
							name="address"
							render={({ field }) => (
								<FormItem className="hidden">
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Display parsed address details (read-only) */}
						{addressVerified && (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
								<div>
									<p className="text-xs font-medium text-muted-foreground mb-1">City</p>
									<p className="text-sm text-foreground">{locationForm.watch("city") || "—"}</p>
								</div>
								<div>
									<p className="text-xs font-medium text-muted-foreground mb-1">State/Province</p>
									<p className="text-sm text-foreground">{locationForm.watch("state") || "—"}</p>
								</div>
								<div>
									<p className="text-xs font-medium text-muted-foreground mb-1">Postal Code</p>
									<p className="text-sm text-foreground">{locationForm.watch("postalCode") || "—"}</p>
								</div>
								<div>
									<p className="text-xs font-medium text-muted-foreground mb-1">Country</p>
									<p className="text-sm text-foreground">{locationForm.watch("country") || "—"}</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-xs font-medium text-muted-foreground mb-1">Coordinates</p>
									<p className="text-sm text-foreground font-mono">
										{locationForm.watch("latitude")?.toFixed(6)}, {locationForm.watch("longitude")?.toFixed(6)}
									</p>
								</div>
							</div>
						)}

						{canEdit && (
							<Button
								type="submit"
								disabled={
									locationForm.formState.isSubmitting ||
									!addressVerified ||
									currentOrg.metadata.location?.address === locationForm.watch("address") &&
									currentOrg.metadata.location?.latitude === locationForm.watch("latitude") &&
									currentOrg.metadata.location?.longitude === locationForm.watch("longitude")
								}
								className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
							>
								{
									locationForm.formState.isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										<>
											<MapPin className="mr-2 h-4 w-4" />
											Save Location
										</>
									)
								}
							</Button>
						)}
					</form>
				</Form>
			</div>
		</motion.div >
	)
}

