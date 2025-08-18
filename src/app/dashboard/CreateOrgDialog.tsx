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
import { Check, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
		contactInfo: z.object({
			mainMail: z.email().optional(),
			hrMail: z.email().optional(),
			phones: z.map(z.string(), z.string()).optional(),
			websiteUrl: z.url().optional(),
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
	}),
});

export type CreateOrganizationSchema = z.infer<typeof createOrganizationSchema>;

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
				contactInfo: { mainMail: "", hrMail: "", websiteUrl: "" },
			},
		},
	});

	const [isCreatingOrg, setIsCreatingOrg] = useState(false);

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
		});

		setIsCreatingOrg(false);
		onClose();
	}

	const handleNext = async () => {
		const fieldsToValidate = formSteps[step - 1].fields.map((f) => f.name);
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
								<div className="flex-1 h-1.5 bg-muted absolute top-5 left-1/2 w-full -translate-x-0" />
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
