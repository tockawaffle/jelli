"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { authClient } from "@/lib/auth-client"
import { User } from "better-auth"
import { Organization } from "better-auth/plugins/organization"
import { useQuery } from "convex/react"
import { BellIcon, CommandIcon, LogOutIcon, MoonIcon, Search, SearchIcon, SunIcon, User2Icon } from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getUserName } from "./dashboard/Home/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

type MinimalHeaderProps = {
	user: User | null
	organization: Organization | null
}

export default function MinimalHeader({ user, organization }: MinimalHeaderProps) {
	const { theme, setTheme } = useTheme()
	const router = useRouter()

	const [latestProfileImage, setLatestProfileImage] = useState<string | null>(user ? user.image || null : null)

	// Sign out handler
	const handleSignOut = async () => {
		await authClient.signOut()
		router.refresh()
	}

	const photoStorageId = user?.image as Id<"_storage"> | undefined ?? undefined;
	if (photoStorageId) {
		const photoUrl = useQuery(api.files.get, photoStorageId ? { storageId: photoStorageId } : "skip")
		useEffect(() => {
			if (photoUrl) {
				setLatestProfileImage(photoUrl.url)
			}
		}, [photoUrl])
	}

	useEffect(() => {
		if (!user) return

		const handleUserUpdate = (e: Event) => {
			const event = e as CustomEvent<{
				type: "metadata" | "profile-photo"
				value: {
					previousValue: string | null
					newValue: string | null
				}
			}>

			if (event.detail.type === "profile-photo") {
				setLatestProfileImage(event.detail.value.newValue || null)
			}
		}

		window.addEventListener("user-updated", handleUserUpdate)
		return () => window.removeEventListener("user-updated", handleUserUpdate)
	}, [])

	return (
		<header id="minimal-header" className="mx-auto z-50 w-full border-b border-border bg-background h-16 flex items-center justify-between px-4">
			{/* Logo - always available */}
			<div className="flex items-center min-w-0">
				<Link href="/" className="flex items-center">
					<Image src="/images/logos/jelli.svg" alt="Logo" width={54} height={54} />
				</Link>
				<span className="text-lg font-bold items-center truncate">
					Jelli <span className="text-sm font-normal text-muted-foreground">• {organization?.name?.split(" ")[0]}</span>
				</span>
			</div>

			<div className="hidden flex-1 md:flex items-center justify-center px-6">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
					<Input placeholder="Search team members, schedules..." className="pl-10 bg-muted/50" type="text" />
				</div>
			</div>

			<div className="flex items-center gap-2 sm:gap-4">
				{/* Search mobile */}
				<Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 transition-colors duration-150 hover:text-primary md:hidden">
					<SearchIcon className="size-4" />
				</Button>

				{/* Notifications */}
				<Button variant="outline" size="icon" className="rounded-full hover:bg-primary/10 transition-colors duration-150 hover:text-primary">
					<BellIcon className="size-4" />
				</Button>

				{/* User Avatar and Dropdown - loading state */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Avatar className="size-8 cursor-pointer">
							<AvatarImage src={latestProfileImage || ""} alt={user?.name || ""} />
							<AvatarFallback>
								<div className="h-full w-full rounded-full flex items-center justify-center">
									<User2Icon className="size-4 text-muted-foreground" />
								</div>
							</AvatarFallback>
						</Avatar>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-56 p-1 md:w-62 bg-card/80 backdrop-blur-md border border-primary/20 rounded-lg shadow-lg"
						side="bottom"
						align="end"
					>
						<DropdownMenuLabel className="font-normal">
							<div className="flex flex-col space-y-1 p-2">
								<p className="text-sm font-medium leading-none">{getUserName(user as User & { metadata: { name: { firstName: string; lastName: string } } }, "fullName")}</p>
								<p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
							</div>
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							className="h-[40px] cursor-pointer text-muted-foreground hover:text-primary w-full hover:bg-primary/10 transition-colors duration-150 rounded-md"
							asChild
						>
							<Link className="w-full pl-2" href="/dashboard" prefetch={true}>
								Dashboard
							</Link>
						</DropdownMenuItem>
						<DropdownMenuItem
							className="h-[40px] cursor-pointer text-muted-foreground hover:text-primary w-full hover:bg-primary/10 transition-colors duration-150 rounded-md"
							asChild
						>
							<Link className="w-full pl-2" href={`/${user?.name}/settings`} prefetch={true}>
								Settings
							</Link>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="h-[40px] cursor-pointer text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150 rounded-md flex flex-row items-center justify-between px-2">
							<span>Keyboard Shortcuts</span>
							<CommandIcon className="size-4 ml-2" />
						</DropdownMenuItem>
						{/* Theme Selector */}
						<DropdownMenuItem className="h-[40px] cursor-pointer text-muted-foreground! transition-colors duration-150 rounded-md flex flex-row items-center justify-between px-2 hover:bg-transparent! hover:cursor-default">
							<span>Theme</span>
							<ToggleGroup
								type="single"
								value={theme}
								className="flex flex-row items-center border border-primary/50 rounded-md h-6 "
								onValueChange={(value) => value && setTheme(value)}
							>
								<ToggleGroupItem
									className={`h-full px-2 ${theme === "light" ? "bg-primary text-primary-foreground hover:bg-primary/90!" : "hover:bg-primary/20 hover:cursor-pointer"}`}
									value="light"
									disabled={theme === "light"}
								>
									<SunIcon className="size-3" />
								</ToggleGroupItem>
								<ToggleGroupItem
									className={`h-full px-2 ${theme === "dark" ? "bg-primary text-primary-foreground hover:bg-primary/90!" : "hover:bg-primary/20 hover:cursor-pointer"}`}
									value="dark"
									disabled={theme === "dark"}
								>
									<MoonIcon className="size-3" />
								</ToggleGroupItem>
							</ToggleGroup>
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={handleSignOut}
							className="h-[40px] cursor-pointer text-muted-foreground hover:text-primary bg-destructive/50 hover:bg-destructive/80! transition-colors duration-150 rounded-md flex flex-row items-center justify-between px-2"
						>
							Sign Out
							<LogOutIcon className="size-4 ml-2" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</header>
	)
}