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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
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
			<DialogContent showCloseButton={false} className="overflow-hidden p-0">
				{/* Decorative gradient top bar */}
				<div className="h-1 w-full bg-gradient-to-r from-primary/80 via-accent to-primary" />
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
							<ToggleGroupItem value="create" className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary">Create</ToggleGroupItem>
							<ToggleGroupItem value="join" className="data-[state=on]:bg-primary/10 data-[state=on]:text-primary">Join</ToggleGroupItem>
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
});

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
				<div className="flex-grow border-t border-border"></div>
				<span className="flex-shrink mx-4 text-muted-foreground text-xs">OR</span>
				<div className="flex-grow border-t border-border"></div>
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

function CreateOrganizationForm({ onClose }: { onClose: () => void }) {
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);
	const form = useForm<z.infer<typeof createOrganizationSchema>>({
		resolver: zodResolver(createOrganizationSchema),
		defaultValues: {
			name: "",
			slug: "",
			logo: undefined,
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
		});

		setIsCreatingOrg(false);
		onClose();
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
					If you create an organization, you won&apos;t be able to join another one
					until you delete that org.
				</p>
			</motion.div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Organization Name</FormLabel>
								<FormControl>
									<Input
										placeholder="Acme Inc."
										{...field}
										onChange={handleNameChange}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="slug"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Slug</FormLabel>
								<FormControl>
									<Input placeholder="acme-inc" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="logo"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Logo</FormLabel>
								<FormControl>
									<ImageUploader field={field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full" disabled={isCreatingOrg}>
						{isCreatingOrg ? (
							<Loader2 className="animate-spin" />
						) : (
							"Create Organization"
						)}
					</Button>
				</form>
			</Form>
		</div>
	);
}
