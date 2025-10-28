"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, CheckCircle2, Info, Loader2, MapPin, Navigation, Search } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";

export default function CreateOrganizationDialog({
	open,
	onClose,
	hasNoOrgs,
}: {
	open: boolean;
	onClose: () => void;
	hasNoOrgs: boolean;
}) {
	const [action, setAction] = useState<"create" | "join">("create");

	return (
		<Dialog open={open} onOpenChange={onClose} modal={true}>
			<DialogContent
				showCloseButton={false}
				className="overflow-hidden p-0 max-h-[90vh] flex flex-col"
			>
				{/* Decorative gradient top bar */}
				<div className="h-1 w-full bg-linear-to-r from-primary/80 via-accent to-primary shrink-0" />
				<ScrollArea className="flex-1 overflow-y-auto">
					<div className="p-6">
						<DialogHeader>
							<DialogTitle>
								{action === "create" ? "Create Organization" : "Join Organization"}
							</DialogTitle>
							<DialogDescription>
								{hasNoOrgs
									? "You don't have any organizations yet. Create or join an organization to get started."
									: action === "create"
										? "Create a new organization to get started."
										: "Join an existing organization using an invitation ID."}
							</DialogDescription>
						</DialogHeader>

						<div className="mt-4">
							<ToggleGroup
								type="single"
								defaultValue="create"
								onValueChange={(value) => {
									if (value) setAction(value as "create" | "join");
								}}
								className="grid grid-cols-2 gap-2"
							>
								<ToggleGroupItem
									value="create"
									className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
								>
									Create
								</ToggleGroupItem>
								<ToggleGroupItem
									value="join"
									className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
								>
									Join
								</ToggleGroupItem>
							</ToggleGroup>
						</div>

						<div className="relative mt-6">
							<AnimatePresence mode="wait">
								{action === "create" ? (
									<motion.div
										key="create"
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
									>
										<CreateOrganizationForm onClose={onClose} />
									</motion.div>
								) : (
									<motion.div
										key="join"
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.2, ease: "easeOut" }}
									>
										<JoinOrganizationForm onClose={onClose} />
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}

const joinOrganizationSchema = z.object({
	invitationId: z.string().min(1, "Invitation ID is required"),
});

function JoinOrganizationForm({ onClose }: { onClose: () => void }) {
	const form = useForm<z.infer<typeof joinOrganizationSchema>>({
		resolver: zodResolver(joinOrganizationSchema),
		defaultValues: {
			invitationId: "",
		},
	});

	const [isJoiningOrg, setIsJoiningOrg] = useState(false);

	async function onSubmit(values: z.infer<typeof joinOrganizationSchema>) {
		setIsJoiningOrg(true);
		try {
			await authClient.organization.acceptInvitation({
				invitationId: values.invitationId,
			});
			toast.success("Successfully joined organization!");
			onClose();
		} catch (error) {
			toast.error("Failed to join organization. Please check the invitation ID.");
		} finally {
			setIsJoiningOrg(false);
		}
	}

	return (
		<div className="space-y-4">
			<motion.div
				initial={{ opacity: 0, y: -6 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-md"
				role="alert"
			>
				<p className="font-bold">Warning</p>
				<p className="text-sm">
					If you join an organization, you won&apos;t be able to create or join another one until
					you&apos;re either kicked out of it or leave by your own volition.
				</p>
			</motion.div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="invitationId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Invitation ID</FormLabel>
								<FormControl>
									<Input placeholder="Enter invitation ID" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={isJoiningOrg}>
						{isJoiningOrg ? (
							<Loader2 className="animate-spin" />
						) : (
							"Join Organization"
						)}
					</Button>
				</form>
			</Form>
		</div>
	);
}

const createOrganizationSchema = z.object({
	name: z.string().min(3, "Organization name must be at least 3 characters"),
	slug: z.string().min(3, "Slug must be at least 3 characters"),
	logo: z.union([z.url("Please enter a valid URL"), z.instanceof(File)]).optional(),
	metadata: z.object({
		orgDescription: z.string().optional(),
		strictLunchTime: z.boolean().optional(),
		contactInfo: z.object({
			mainMail: z.string().min(1, "Main email is required").email("Please enter a valid email"),
			hrMail: z.string().min(1, "HR email is required").email("Please enter a valid email"),
			phones: z.map(z.string(), z.string()).optional(),
			websiteUrl: z.union([z.url("Please enter a valid URL"), z.literal("")]).optional(),
		}),
		hours: z
			.object({
				open: z.iso.time({ precision: -1 }),
				close: z.iso.time({ precision: -1 }),
				timezone: z.string(),
				gracePeriod: z.number().min(0, "Grace period must be at least 0 minutes"),
			})
			.superRefine((data, ctx) => {
				if (dayjs(data.open, "HH:mm").isAfter(dayjs(data.close, "HH:mm"))) {
					ctx.addIssue({
						code: "custom",
						message: "Open time must be before close time",
						path: ["open"],
					});
					ctx.addIssue({
						code: "custom",
						message: "Close time must be after open time",
						path: ["close"],
					});
				}
			}),
		location: z.object({
			address: z.string(),
			city: z.string(),
			state: z.string(),
			postalCode: z.string(),
			country: z.string(),
			latitude: z.number(),
			longitude: z.number(),
			formattedAddress: z.string().optional(),
		}).optional(),
	}),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

interface GeocodeResult {
	formattedAddress: string;
	latitude: number;
	longitude: number;
	city?: string;
	state?: string;
	postalCode?: string;
	country?: string;
	score?: number;
}

function ImageUploader({ field }: { field: any }) {
	const [imagePreview, setImagePreview] = useState<string | null>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			field.onChange(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		field.onChange(url);
		setImagePreview(url);
	};

	return (
		<div className="space-y-2">
			<Input
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
			/>
			<div className="relative flex items-center">
				<div className="grow border-t border-border"></div>
				<span className="shrink mx-4 text-muted-foreground text-xs">OR</span>
				<div className="grow border-t border-border"></div>
			</div>
			<Input
				type="text"
				placeholder="Or enter an image URL"
				onChange={handleUrlChange}
			/>
			{imagePreview && (
				<div className="mt-4">
					<Image
						src={imagePreview}
						alt="Logo Preview"
						width={100}
						height={100}
						className="rounded-lg object-cover"
					/>
				</div>
			)}
		</div>
	);
}

const formSteps = [
	{
		id: 1,
		name: "Org Info",
		fields: [
			{
				name: "name",
				label: "Organization Name",
				optional: false,
				type: "text",
				placeholder: "Jelli Inc.",
				tooltip: "The official name of your organization.",
			},
			{
				name: "slug",
				label: "Slug",
				optional: false,
				type: "text",
				placeholder: "jelli-inc",
				tooltip: "A unique, URL-friendly identifier for your organization.",
			},
			{
				name: "metadata.orgDescription",
				label: "Description",
				optional: true,
				type: "text",
				placeholder: "A short description of your organization.",
				tooltip: "A brief summary of what your organization does.",
			},
		],
	},
	{
		id: 2,
		name: "Org Hours",
		fields: [
			{
				name: "metadata.hours.open",
				label: "Opening Time",
				optional: false,
				type: "time",
				placeholder: "",
				tooltip: "The time your organization opens.",
			},
			{
				name: "metadata.hours.close",
				label: "Closing Time",
				optional: false,
				type: "time",
				placeholder: "",
				tooltip: "The time your organization closes.",
			},
			{
				name: "metadata.hours.gracePeriod",
				label: "Grace Period (minutes)",
				optional: false,
				type: "number",
				placeholder: "15",
				tooltip: "Minutes after the scheduled start that a late clock-in is auto-accepted. Beyond this, a request is required.",
				className: "md:col-span-2",
			},
		],
	},
	{
		id: 3,
		name: "Org Contact",
		fields: [
			{
				name: "metadata.contactInfo.mainMail",
				label: "Main Email",
				optional: false,
				type: "email",
				placeholder: "contact@jelli.app",
				tooltip: "The primary contact email for your organization.",
				className: "md:col-span-2",
			},
			{
				name: "metadata.contactInfo.hrMail",
				label: "HR Email",
				optional: false,
				type: "email",
				placeholder: "hr@jelli.app",
				tooltip: "The email for your organization's HR department.",
				className: "md:col-span-2",
			},
			{
				name: "metadata.contactInfo.websiteUrl",
				label: "Website",
				optional: true,
				type: "url",
				placeholder: "https://jelli.app",
				tooltip: "Your organization's official website.",
				className: "md:col-span-2",
			},
			{
				name: "logo",
				label: "Logo",
				optional: true,
				type: "image",
				placeholder: "",
				tooltip: "Upload a logo for your organization.",
				className: "md:col-span-2",
			},
		],
	},
	{
		id: 4,
		name: "Org Location",
		fields: [], // Location will use custom UI
	},
];

function CreateOrganizationForm({ onClose }: { onClose: () => void }) {
	const [step, setStep] = useState(1);
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const form = useForm<z.infer<typeof createOrganizationSchema>>({
		resolver: zodResolver(createOrganizationSchema),
		defaultValues: {
			name: "",
			slug: "",
			logo: undefined,
			metadata: {
				hours: { open: "", close: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, gracePeriod: 15 },
				strictLunchTime: false,
				contactInfo: { mainMail: "", hrMail: "", websiteUrl: "" },
				location: {},
			},
		},
	});

	const [isCreatingOrg, setIsCreatingOrg] = useState(false);

	// Location-related state
	const [searchQuery, setSearchQuery] = useState("");
	const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isGeocoding, setIsGeocoding] = useState(false);
	const [addressVerified, setAddressVerified] = useState<boolean | null>(null);
	const [isGettingLocation, setIsGettingLocation] = useState(false);
	const searchTimeout = useRef<NodeJS.Timeout | null>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	// Close suggestions when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setShowSuggestions(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Geocode address using Nominatim
	const geocodeAddress = useCallback(async (address: string): Promise<GeocodeResult[]> => {
		try {
			const houseNumberMatch = address.match(/^\s*(\d+)\s*[,\s]/);
			const queryHouseNumber = houseNumberMatch ? houseNumberMatch[1] : null;

			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?` +
				new URLSearchParams({
					q: address,
					format: "json",
					addressdetails: "1",
					limit: "15",
					"accept-language": "en",
				}),
				{ headers: { "User-Agent": "Jelli-App" } }
			);

			if (!response.ok) throw new Error("Geocoding failed");
			const data = await response.json();

			const filteredResults: GeocodeResult[] = data
				.filter((item: any) => {
					const type = item.type;
					return (
						type === "house" || type === "building" || type === "residential" ||
						type === "commercial" || type === "retail" || type === "office" ||
						type === "industrial" || type === "amenity" || item.class === "building" ||
						item.class === "place" || item.address?.road || item.address?.house_number
					);
				})
				.map((item: any): GeocodeResult => {
					const parts = [];
					if (item.address?.house_number) parts.push(item.address.house_number);
					if (item.address?.road) parts.push(item.address.road);
					if (item.address?.suburb) parts.push(item.address.suburb);
					if (item.address?.city || item.address?.town || item.address?.village) {
						parts.push(item.address.city || item.address.town || item.address.village);
					}
					if (item.address?.state) parts.push(item.address.state);
					if (item.address?.country) parts.push(item.address.country);

					const cleanAddress = parts.join(", ");

					let score = 0;
					if (queryHouseNumber && item.address?.house_number === queryHouseNumber) score += 100;
					if (item.address?.house_number) score += 50;
					if (item.address?.postcode) score += 10;
					if (item.type === "house" || item.type === "building") score += 20;

					return {
						formattedAddress: cleanAddress || item.display_name,
						latitude: parseFloat(item.lat),
						longitude: parseFloat(item.lon),
						city: item.address?.city || item.address?.town || item.address?.village || "",
						state: item.address?.state || "",
						postalCode: item.address?.postcode || "",
						country: item.address?.country || "",
						score,
					};
				});

			filteredResults.sort((a, b) => (b.score || 0) - (a.score || 0));
			return filteredResults.slice(0, 5);
		} catch (error) {
			console.error("Geocoding error:", error);
			return [];
		}
	}, []);

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
				{ headers: { "User-Agent": "Jelli-App" } }
			);

			if (!response.ok) throw new Error("Reverse geocoding failed");
			const data = await response.json();

			const parts = [];
			if (data.address?.house_number) parts.push(data.address.house_number);
			if (data.address?.road) parts.push(data.address.road);
			if (data.address?.suburb) parts.push(data.address.suburb);
			if (data.address?.city || data.address?.town || data.address?.village) {
				parts.push(data.address.city || data.address.town || data.address.village);
			}
			if (data.address?.state) parts.push(data.address.state);
			if (data.address?.country) parts.push(data.address.country);

			const cleanAddress = parts.join(", ");

			return {
				formattedAddress: cleanAddress || data.display_name,
				latitude: parseFloat(data.lat),
				longitude: parseFloat(data.lon),
				city: data.address?.city || data.address?.town || data.address?.village || "",
				state: data.address?.state || "",
				postalCode: data.address?.postcode || "",
				country: data.address?.country || "",
			};
		} catch (error) {
			console.error("Reverse geocoding error:", error);
			return null;
		}
	}, []);

	// Search for addresses with debounce
	const searchAddress = useCallback(
		async (query: string) => {
			if (query.length < 3) {
				setSuggestions([]);
				return;
			}

			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current);
			}

			searchTimeout.current = setTimeout(async () => {
				setIsGeocoding(true);
				const results = await geocodeAddress(query);
				setSuggestions(results);
				setShowSuggestions(results.length > 0);
				setIsGeocoding(false);
			}, 500);
		},
		[geocodeAddress]
	);

	// Handle search input change
	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setAddressVerified(null);
		searchAddress(value);
	};

	// Handle suggestion selection
	const handleSuggestionSelect = (result: GeocodeResult) => {
		setSearchQuery(result.formattedAddress);
		form.setValue("metadata.location.address", result.formattedAddress);
		form.setValue("metadata.location.formattedAddress", result.formattedAddress);
		form.setValue("metadata.location.city", result.city || "");
		form.setValue("metadata.location.state", result.state || "");
		form.setValue("metadata.location.postalCode", result.postalCode || "");
		form.setValue("metadata.location.country", result.country || "");
		form.setValue("metadata.location.latitude", result.latitude);
		form.setValue("metadata.location.longitude", result.longitude);
		setAddressVerified(true);
		setShowSuggestions(false);
		setSuggestions([]);
	};

	// Get user's current location
	const handleUseCurrentLocation = useCallback(async () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser");
			return;
		}

		setIsGettingLocation(true);

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				try {
					const { latitude, longitude } = position.coords;
					const result = await reverseGeocode(latitude, longitude);

					if (result) {
						handleSuggestionSelect(result);
						toast.success("Location detected successfully!");
					} else {
						toast.error("Could not find address for your location");
					}
				} catch (error) {
					console.error("Error processing location:", error);
					toast.error("Failed to process your location");
				} finally {
					setIsGettingLocation(false);
				}
			},
			(error) => {
				setIsGettingLocation(false);

				switch (error.code) {
					case error.PERMISSION_DENIED:
						toast.error("Location permission denied. Please enable location access.");
						break;
					case error.POSITION_UNAVAILABLE:
						toast.error("Location information is unavailable");
						break;
					case error.TIMEOUT:
						toast.error("Location request timed out");
						break;
					default:
						toast.error("An unknown error occurred");
				}
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	}, [reverseGeocode]);

	const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const name = e.target.value;
		const slug = name
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			// Limits it to 2 words max
			.split("-")
			.slice(0, 2)
			.join("-");

		form.setValue("name", name);
		form.setValue("slug", slug);

		const isSlugAvailable = await authClient.organization.checkSlug({
			slug: slug,
		});

		if (!isSlugAvailable) {
			toast.error("Slug is already taken");
		}
	};

	async function onSubmit(values: z.infer<typeof createOrganizationSchema>) {
		setIsCreatingOrg(true);
		let logo: string | undefined = undefined;

		if (values.logo) {
			if (typeof values.logo === "string") {
				logo = values.logo;
			} else {
				const postUrl = await generateUploadUrl();
				const result = await fetch(postUrl, {
					method: "POST",
					headers: { "Content-Type": values.logo.type },
					body: values.logo,
				});
				const { storageId } = await result.json();
				logo = storageId;
			}
		}

		await authClient.organization.create({
			name: values.name,
			slug: values.slug,
			logo: logo,
			metadata: values.metadata,
		}, {
			onSuccess: () => {
				toast.success("Organization created successfully");
				setIsCreatingOrg(false);
				onClose();
			},
			onError: (error) => {
				toast.error("Failed to create organization");
				console.error(error);
			},
		});
	}

	const handleNext = async () => {
		// Step 4 (location) has no required fields and uses custom UI, so skip validation
		if (step === 4) {
			setStep(step + 1);
			return;
		}

		const fieldsToValidate = formSteps[step - 1].fields.map((f) => f.name);
		// Only trigger validation if there are fields to validate
		if (fieldsToValidate.length === 0) {
			setStep(step + 1);
			return;
		}

		const isValid = await form.trigger(fieldsToValidate as any);
		if (isValid) {
			setStep(step + 1);
		}
	};

	return (
		<TooltipProvider>
			<div className="space-y-6 p-2">
				<motion.div
					initial={{ opacity: 0, y: -6 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-destructive/10 border-l-4 border-destructive text-destructive p-4 rounded-r-lg"
					role="alert"
				>
					<p className="font-bold">Heads up!</p>
					<p className="text-sm">
						Once you create an organization, you won&apos;t be able to join another
						until you either delete it or are removed.
					</p>
				</motion.div>

				<div className="flex items-start justify-center px-4">
					{formSteps.map((s, index) => (
						<div
							key={s.id}
							className="flex items-center justify-center w-full relative"
						>
							<div className="flex flex-col items-center relative z-10">
								<div
									className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-extrabold transition-all duration-300 transform scale-${step === s.id ? "110" : "100"
										} ${step > s.id
											? "bg-green-500 text-white shadow-lg"
											: step === s.id
												? "bg-primary text-primary-foreground shadow-xl"
												: "bg-muted text-muted-foreground"
										}`}
								>
									{step > s.id ? <Check size={20} /> : s.id}
								</div>
								<p
									className={`mt-3 text-xs text-center font-semibold transition-colors duration-300 w-20 ${step >= s.id ? "text-foreground" : "text-muted-foreground"
										}`}
								>
									{s.name}
								</p>
							</div>
							{index < formSteps.length - 1 && (
								<div className="flex-1 h-1.5 bg-muted absolute top-5 left-1/2 w-full translate-x-0" />
							)}
						</div>
					))}
				</div>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<AnimatePresence mode="wait">
							<motion.div
								key={step}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: 20 }}
								transition={{ duration: 0.3 }}
								className="space-y-6"
							>
								{step === 4 ? (
									// Custom location step UI
									<div className="space-y-4">
										<div className="bg-muted/30 p-4 rounded-lg border border-border/50">
											<div className="flex items-start gap-2">
												<MapPin className="h-5 w-5 text-primary mt-0.5" />
												<div>
													<h4 className="text-sm font-semibold text-foreground">Set Organization Location</h4>
													<p className="text-xs text-muted-foreground mt-1">
														This will be used for attendance verification. Search for your address or use your current location.
													</p>
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<FormLabel className="text-sm font-medium">Search Address</FormLabel>
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
											</div>
											<div className="relative" ref={wrapperRef}>
												<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
												<Input
													value={searchQuery}
													onChange={(e) => handleSearchChange(e.target.value)}
													placeholder="Start typing an address..."
													className="pl-9 pr-10 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
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

										{/* Display parsed address details */}
										{addressVerified && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">City</p>
													<p className="text-sm text-foreground">{form.watch("metadata.location.city") || "—"}</p>
												</div>
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">State/Province</p>
													<p className="text-sm text-foreground">{form.watch("metadata.location.state") || "—"}</p>
												</div>
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">Postal Code</p>
													<p className="text-sm text-foreground">{form.watch("metadata.location.postalCode") || "—"}</p>
												</div>
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-1">Country</p>
													<p className="text-sm text-foreground">{form.watch("metadata.location.country") || "—"}</p>
												</div>
												<div className="md:col-span-2">
													<p className="text-xs font-medium text-muted-foreground mb-1">Coordinates</p>
													<p className="text-sm text-foreground font-mono">
														{form.watch("metadata.location.latitude")?.toFixed(6)}, {form.watch("metadata.location.longitude")?.toFixed(6)}
													</p>
												</div>
											</div>
										)}
									</div>
								) : (
									// Regular form fields for other steps
									<div
										className={`grid gap-6 p-1 ${formSteps[step - 1].name === "Org Hours" ||
											formSteps[step - 1].name === "Org Contact"
											? "md:grid-cols-2"
											: "md:grid-cols-1"
											}`}
									>
										{formSteps[step - 1].fields.map((field) => (
											<FormField
												key={field.name}
												control={form.control}
												name={field.name as any}
												render={({ field: formField }) => (
													<FormItem className={field.className}>
														<div className="flex items-center gap-2 mb-1">
															<FormLabel>
																{field.label}
															</FormLabel>
															{!field.optional && (
																<span className="text-xs text-red-500 font-bold">
																	*
																</span>
															)}
															<Tooltip>
																<TooltipTrigger asChild>
																	<span role="button" tabIndex={0}>
																		<Info
																			size={14}
																			className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
																		/>
																	</span>
																</TooltipTrigger>
																<TooltipContent>
																	<p>{field.tooltip}</p>
																</TooltipContent>
															</Tooltip>
														</div>
														<FormControl>
															{field.type === "image" ? (
																<ImageUploader field={formField} />
															) : field.type === "number" ? (
																<Input
																	type="number"
																	placeholder={field.placeholder}
																	value={formField.value !== undefined ? formField.value : ''}
																	onChange={(e) => formField.onChange(e.currentTarget.valueAsNumber)}
																/>
															) : (
																<Input
																	type={field.type}
																	placeholder={field.placeholder}
																	{...formField}
																	onChange={field.name === "name" ? handleNameChange : formField.onChange}
																/>
															)}
														</FormControl>
														<FormMessage />
													</FormItem>
												)}
											/>
										))}
									</div>
								)}
							</motion.div>
						</AnimatePresence>

						<div className="flex justify-end gap-4 pt-4 border-t border-border">
							{step > 1 && (
								<Button variant="outline" type="button" onClick={() => setStep(step - 1)}>
									Back
								</Button>
							)}
							{step < formSteps.length && (
								<Button type="button" onClick={handleNext}>
									Next
								</Button>
							)}
							{step === formSteps.length && (
								<Button type="submit" disabled={isCreatingOrg}>
									{isCreatingOrg ? (
										<Loader2 className="animate-spin" />
									) : (
										"Create Organization"
									)}
								</Button>
							)}
						</div>
					</form>
				</Form>
			</div>
		</TooltipProvider>
	);
}
