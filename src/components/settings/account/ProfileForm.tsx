"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "convex/react"
import { motion } from "framer-motion"
import { Camera, Loader2, Pencil } from "lucide-react"
import { useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { PHOTO_UPLOAD_CONFIG } from "./constants"
import { type ProfileFormValues, profileFormSchema } from "./schemas"
import { fadeInUp, getUserInitials } from "./utils"

interface ProfileFormProps {
	currentOrg: OrganizationType;
	refetchSession: () => void;
}

export function ProfileForm({ currentOrg, refetchSession }: ProfileFormProps) {
	const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
	const [photoPreview, setPhotoPreview] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const generateUploadUrl = useMutation(api.files.generateUploadUrl)

	// Get the photo URL if storageId exists
	const photoStorageId = currentOrg.currentUser.image as Id<"_storage"> | undefined
	const photoUrl = useQuery(api.files.get, photoStorageId ? { storageId: photoStorageId } : "skip")

	const profileForm = useForm<ProfileFormValues>({
		resolver: zodResolver(profileFormSchema),
		defaultValues: {
			firstName: currentOrg.currentUser.metadata?.name?.firstName || "",
			lastName: currentOrg.currentUser.metadata?.name?.lastName || "",
			bio: currentOrg.currentUser.metadata?.bio || "",
		},
	})

	async function onProfileSubmit(values: ProfileFormValues) {
		const newValues = {
			firstName: values.firstName,
			lastName: values.lastName,
			bio: values.bio,
		}

		await authClient.updateUserUtility(newValues, {
			onSuccess: () => {
				refetchSession()
				toast.success("Profile updated successfully")
			},
			onError: (error) => {
				toast.error("Failed to update profile")
				console.error(error)
			},
		})
	}

	const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		// Check file size
		if (file.size > PHOTO_UPLOAD_CONFIG.maxSizeBytes) {
			toast.error(`File size must be less than ${PHOTO_UPLOAD_CONFIG.maxSizeMB}MB`)
			return
		}

		// Check file type
		if (!file.type.startsWith(PHOTO_UPLOAD_CONFIG.acceptedMimePrefix)) {
			toast.error("Please upload an image file")
			return
		}

		setIsUploadingPhoto(true)

		try {
			// Create preview
			const reader = new FileReader()
			reader.onloadend = () => {
				setPhotoPreview(reader.result as string)
			}
			reader.readAsDataURL(file)

			// Upload to Convex
			const postUrl = await generateUploadUrl()
			const result = await fetch(postUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			})
			const { storageId } = await result.json()

			// Update user profile with storageId
			await authClient.updateProfilePhoto(storageId, {
				onSuccess: () => {
					toast.success("Profile photo updated!")
					refetchSession()
				},
				onError: (error) => {
					console.error("Error uploading photo:", error)
					toast.error("Failed to upload photo")
					setPhotoPreview(null)
				},
			})
		} catch (error) {
			console.error("Error uploading photo:", error)
			toast.error("Failed to upload photo")
			setPhotoPreview(null)
		} finally {
			setIsUploadingPhoto(false)
		}
	}

	const userInitials = getUserInitials(
		currentOrg.currentUser.metadata?.name?.firstName,
		currentOrg.currentUser.metadata?.name?.lastName,
		currentOrg.currentUser.name
	)

	return (
		<motion.div
			{...fadeInUp(0.2)}
			className="bg-card/50 border border-border/50 rounded-xl backdrop-blur-sm"
		>
			<div className="p-4 md:p-6 border-b border-border/50">
				<h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
				<p className="text-sm text-muted-foreground">Update your personal information and profile picture.</p>
			</div>

			<div className="p-4 md:p-6">
				{profileForm.formState.isSubmitting ? (
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<Skeleton className="h-16 w-16 rounded-full" />
							<div className="space-y-2">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-24" />
							</div>
						</div>
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
					</div>
				) : (
					<Form {...profileForm}>
						<form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
							<div className="flex flex-col sm:flex-row sm:items-center gap-4">
								<Avatar className="h-16 w-16 ring-2 ring-border/50">
									<AvatarImage
										loading="lazy"
										src={photoPreview || photoUrl?.url || "/placeholder-user.jpg"}
										alt="Profile"
									/>
									<AvatarFallback className="bg-primary/10 text-primary font-semibold">
										{userInitials}
									</AvatarFallback>
								</Avatar>
								<div className="space-y-2">
									<input
										ref={fileInputRef}
										type="file"
										accept={PHOTO_UPLOAD_CONFIG.acceptedTypes}
										onChange={handlePhotoUpload}
										className="hidden"
									/>
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="hover:bg-muted/50"
										onClick={() => fileInputRef.current?.click()}
										disabled={isUploadingPhoto}
									>
										{isUploadingPhoto ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												<Camera className="h-4 w-4 mr-2" />
												Change Photo
											</>
										)}
									</Button>
									<p className="text-xs text-muted-foreground">
										JPG, PNG or GIF. Max size {PHOTO_UPLOAD_CONFIG.maxSizeMB}MB.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<FormField
									control={profileForm.control}
									name="firstName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium">First Name</FormLabel>
											<FormControl>
												<Input
													placeholder="First Name"
													className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={profileForm.control}
									name="lastName"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-medium">Last Name</FormLabel>
											<FormControl>
												<Input
													placeholder="Last Name"
													className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div>
								<div className="space-y-2">
									<Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
									<Input
										id="email"
										type="email"
										defaultValue={currentOrg.currentUser.email}
										disabled
										className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
									/>
								</div>
								<Button type="button" variant="outline" size="sm" className="hover:bg-muted/50 mt-2">
									<Pencil className="h-4 w-4 mr-2" />
									Change Email
								</Button>
							</div>

							<FormField
								control={profileForm.control}
								name="bio"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="text-sm font-medium">Bio</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Tell us about yourself..."
												className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 resize-none"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								type="submit"
								disabled={
									profileForm.formState.isSubmitting ||
									!profileForm.formState.isValid ||
									!profileForm.getValues().firstName?.trim() ||
									!profileForm.getValues().lastName?.trim() ||
									JSON.stringify(profileForm.getValues()) === JSON.stringify(currentOrg.currentUser.metadata)
								}
								className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
							>
								{profileForm.formState.isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</form>
					</Form>
				)}
			</div>
		</motion.div>
	)
}

