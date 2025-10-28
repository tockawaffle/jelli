"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { Building2, CheckCircle2, Loader2, Upload, XCircle } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { LOGO_UPLOAD_CONFIG } from "./constants"
import { type OrganizationFormValues, organizationFormSchema } from "./schemas"
import type { OrganizationSettingsProps } from "./types"
import { canEditOrganization, fadeInUp, formatDate } from "./utils"

export function OrganizationDetails({ currentOrg, activeMember, refetchOrg }: OrganizationSettingsProps) {
	const [isUploadingLogo, setIsUploadingLogo] = useState(false)
	const [logoPreview, setLogoPreview] = useState<string | null>(null)
	const [isCheckingSlug, setIsCheckingSlug] = useState(false)
	const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const slugCheckTimeout = useRef<NodeJS.Timeout | null>(null)

	const canEdit = canEditOrganization(activeMember?.role)

	const organizationForm = useForm<OrganizationFormValues>({
		resolver: zodResolver(organizationFormSchema),
		defaultValues: {
			name: currentOrg.name,
			slug: currentOrg.slug,
		},
	})

	const checkSlugAvailability = useCallback(async (slug: string) => {
		// Don't check if it's the current organization's slug
		if (slug === currentOrg.slug) {
			setSlugAvailable(true)
			return
		}

		// Clear any existing timeout
		if (slugCheckTimeout.current) {
			clearTimeout(slugCheckTimeout.current)
		}

		// Debounce the check
		slugCheckTimeout.current = setTimeout(async () => {
			setIsCheckingSlug(true)
			setSlugAvailable(null)

			try {
				const { data, error } = await authClient.organization.checkSlug({
					slug,
				})

				if (error) {
					console.error("Error checking slug:", error)
					setSlugAvailable(null)
				} else {
					// data.status is true if the slug is available
					setSlugAvailable(data?.status ?? false)
				}
			} catch (error) {
				console.error("Error checking slug:", error)
				setSlugAvailable(null)
			} finally {
				setIsCheckingSlug(false)
			}
		}, 500) // 500ms debounce
	}, [currentOrg.slug])

	// Watch for slug changes
	const watchedSlug = organizationForm.watch("slug")

	useEffect(() => {
		if (watchedSlug && watchedSlug.length >= 3) {
			checkSlugAvailability(watchedSlug)
		} else {
			setSlugAvailable(null)
		}
	}, [watchedSlug, checkSlugAvailability])

	async function onOrganizationSubmit(values: OrganizationFormValues) {
		if (!canEdit) {
			toast.error("You don't have permission to edit organization details")
			return
		}

		await authClient.organization.update({
			data: {
				name: values.name,
				slug: values.slug,
			},
			organizationId: currentOrg.id,
		}, {
			onSuccess: () => {
				refetchOrg()
				toast.success("Organization updated successfully")
			},
			onError: (error) => {
				toast.error("Failed to update organization")
				console.error(error)
			},
		})
	}

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!canEdit) {
			toast.error("You don't have permission to change the organization logo")
			return
		}

		const file = e.target.files?.[0]
		if (!file) return

		// Check file size
		if (file.size > LOGO_UPLOAD_CONFIG.maxSizeBytes) {
			toast.error(`File size must be less than ${LOGO_UPLOAD_CONFIG.maxSizeMB}MB`)
			return
		}

		// Check file type
		if (!file.type.startsWith(LOGO_UPLOAD_CONFIG.acceptedMimePrefix)) {
			toast.error("Please upload an image file")
			return
		}

		setIsUploadingLogo(true)

		try {
			// Create preview
			const reader = new FileReader()
			reader.onloadend = () => {
				setLogoPreview(reader.result as string)
			}
			reader.readAsDataURL(file)

			// TODO: Implement logo upload to Convex storage
			// For now, just show preview
			toast.info("Logo upload feature coming soon")
		} catch (error) {
			console.error("Error uploading logo:", error)
			toast.error("Failed to upload logo")
			setLogoPreview(null)
		} finally {
			setIsUploadingLogo(false)
		}
	}

	return (
		<motion.div
			{...fadeInUp(0)}
			className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
		>
			<div className="p-4 md:p-6 border-b border-border/50">
				<h3 className="text-lg font-semibold text-foreground">Organization Details</h3>
				<p className="text-sm text-muted-foreground">
					Manage your organization information and settings.
				</p>
			</div>

			<div className="p-4 md:p-6">
				{organizationForm.formState.isSubmitting ? (
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<Skeleton className="h-16 w-16 rounded-lg" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : (
					<Form {...organizationForm}>
						<form onSubmit={organizationForm.handleSubmit(onOrganizationSubmit)} className="space-y-6">
							<div className="flex flex-col sm:flex-row sm:items-center gap-4">
								<Avatar className="h-16 w-16 rounded-lg ring-2 ring-border/50">
									<AvatarImage
										loading="lazy"
										src={logoPreview || currentOrg.logo || "/placeholder.svg"}
										alt={currentOrg.name}
									/>
									<AvatarFallback className="bg-primary/10 text-primary font-semibold rounded-lg">
										<Building2 className="h-8 w-8" />
									</AvatarFallback>
								</Avatar>
								<div className="space-y-2">
									<input
										ref={fileInputRef}
										type="file"
										accept={LOGO_UPLOAD_CONFIG.acceptedTypes}
										onChange={handleLogoUpload}
										className="hidden"
										disabled={!canEdit}
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="hover:bg-muted/50"
										onClick={() => fileInputRef.current?.click()}
										disabled={isUploadingLogo || !canEdit}
									>
										{isUploadingLogo ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												<Upload className="h-4 w-4 mr-2" />
												Change Logo
											</>
										)}
									</Button>
									<p className="text-xs text-muted-foreground">
										PNG, JPG, or SVG. Max size {LOGO_UPLOAD_CONFIG.maxSizeMB}MB.
									</p>
								</div>
							</div>

							<FormField
								control={organizationForm.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">Organization Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Acme Inc."
												className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
												disabled={!canEdit}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={organizationForm.control}
								name="slug"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">Organization Slug</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													placeholder="acme-inc"
													className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
													disabled={!canEdit}
													{...field}
												/>
												{field.value && field.value.length >= 3 && (
													<div className="absolute right-3 top-1/2 -translate-y-1/2">
														{isCheckingSlug ? (
															<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
														) : slugAvailable === true ? (
															<CheckCircle2 className="h-4 w-4 text-green-500" />
														) : slugAvailable === false ? (
															<XCircle className="h-4 w-4 text-destructive" />
														) : null}
													</div>
												)}
											</div>
										</FormControl>
										<FormMessage />
										{field.value && field.value.length >= 3 && !isCheckingSlug && (
											<>
												{slugAvailable === true && (
													<p className="text-xs text-green-600 dark:text-green-500">
														✓ This slug is available
													</p>
												)}
												{slugAvailable === false && (
													<p className="text-xs text-destructive">
														✗ This slug is already taken
													</p>
												)}
											</>
										)}
										<p className="text-xs text-muted-foreground">
											Used in URLs and integrations. Only lowercase letters, numbers, and hyphens.
										</p>
									</FormItem>
								)}
							/>

							<div className="space-y-2">
								<Label className="text-sm font-medium">Organization ID</Label>
								<Input
									value={currentOrg.id}
									disabled
									className="bg-background/50 border-border/50 font-mono text-xs"
								/>
								<p className="text-xs text-muted-foreground">
									This is your unique organization identifier.
								</p>
							</div>

							<div className="space-y-2">
								<Label className="text-sm font-medium">Created</Label>
								<Input
									value={formatDate(currentOrg.createdAt)}
									disabled
									className="bg-background/50 border-border/50"
								/>
							</div>

							{canEdit && (
								<Button
									type="submit"
									disabled={
										organizationForm.formState.isSubmitting ||
										!organizationForm.formState.isValid ||
										!organizationForm.formState.isDirty ||
										slugAvailable === false ||
										isCheckingSlug
									}
									className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
								>
									{organizationForm.formState.isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							)}
						</form>
					</Form>
				)}
			</div>
		</motion.div>
	)
}

