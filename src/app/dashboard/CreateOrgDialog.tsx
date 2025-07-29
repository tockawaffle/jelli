import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../convex/_generated/api";

export default function CreateOrganizationDialog({ open, onClose, hasNoOrgs }: { open: boolean, onClose: () => void, hasNoOrgs: boolean }) {
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Organization</DialogTitle>
					<DialogDescription>
						{hasNoOrgs ? "You don't have any organizations yet. Create a new organization to get started." : "Create a new organization to get started."}
					</DialogDescription>
				</DialogHeader>
				<CreateOrganizationForm onClose={onClose} />
			</DialogContent>
		</Dialog>
	)
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
			<Input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
			<div className="relative flex items-center">
				<div className="flex-grow border-t border-gray-300"></div>
				<span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
				<div className="flex-grow border-t border-gray-300"></div>
			</div>
			<Input type="text" placeholder="Or enter an image URL" onChange={handleUrlChange} />
			{imagePreview && (
				<div className="mt-4">
					<Image src={imagePreview} alt="Logo Preview" width={100} height={100} className="rounded-lg object-cover" />
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
					{isCreatingOrg ? <Loader2 className="animate-spin" /> : "Create Organization"}
				</Button>
			</form>
		</Form>
	);
}