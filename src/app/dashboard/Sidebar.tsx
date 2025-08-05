import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger } from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { Session, User } from "better-auth";
import { Invitation, Member, Organization } from "better-auth/plugins";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChartIcon, BookIcon, CalendarIcon, Check, ClockIcon, HomeIcon, LogOutIcon, Plus, SettingsIcon, UsersIcon, Zap } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import React from "react";
import { SidebarActions } from "./page";

type SidebarProps = {
	userOrgs: Organization[] | null,
	currentOrg: {
		id: string;
		name: string;
		createdAt: Date;
		slug: string;
		metadata?: any;
		logo?: string | null | undefined;
	} & {
		members: (Member & {
			user: {
				id: string;
				name: string;
				email: string;
				image: string | undefined;
			};
		})[];
		invitations: Invitation[];
	} | null,
	session: {
		user: User,
		session: Session,
	} | null,
	setOpen: (open: boolean) => void,
	selectedAction: string,
	setSelectedAction: React.Dispatch<React.SetStateAction<SidebarActions>>,
	router: AppRouterInstance,
	children: React.ReactNode,
	activeMember: Member | null,
}


export default function DashboardSidebar({ userOrgs, currentOrg, session, setOpen, selectedAction, setSelectedAction, router, children, activeMember }: SidebarProps) {
	const navigationItems = [
		{
			label: "Home",
			id: "home",
			necessaryRole: null,
			icon: <HomeIcon className="w-4 h-4" />,
			action: () => { }
		},
		{
			label: "Time Tracking",
			id: "time-tracking",
			necessaryRole: null,
			icon: <ClockIcon className="w-4 h-4" />,
			action: () => { }
		},
		{
			label: "Schedule",
			id: "schedule",
			necessaryRole: ["admin", "owner"],
			icon: <CalendarIcon className="w-4 h-4" />,
			action: () => { }
		},
		{
			label: "Team",
			id: "team",
			necessaryRole: ["admin", "owner"],
			icon: <UsersIcon className="w-4 h-4" />,
			action: () => { }
		},
		{
			label: "Reports",
			id: "reports",
			necessaryRole: null,
			icon: <BarChartIcon className="w-4 h-4" />,
			action: () => { }
		},
		{
			label: "Quick Actions",
			id: "quick-actions",
			necessaryRole: null,
			icon: <Zap className="w-4 h-4" />,
			action: () => { }
		}
	];

	const systemItems = [
		{
			label: "Settings",
			icon: <SettingsIcon className="w-4 h-4" />,
			action: () => {
				router.push("/settings");
			}
		},
		{
			label: "Documentation",
			icon: <BookIcon className="w-4 h-4" />,
			action: () => {
				router.push("/docs");
			}
		},
		{
			label: "Logout",
			className: "hover:!bg-destructive/90 text-destructive",
			icon: <LogOutIcon className="w-4 h-4" />,
			action: () => {
				authClient.signOut();
			}
		}
	];

	const logoUrl = currentOrg && currentOrg.logo ? `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/getImage?storageId=${currentOrg.logo}` : "/placeholder.svg";
	const orgName = currentOrg?.name;
	const displayName = orgName ? (orgName.length > 16 ? `${orgName.slice(0, 16)}...` : orgName) : "Select Organization";

	return (
		<SidebarProvider className="border-none">
			<motion.div
				initial={{ x: -10, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				transition={{ duration: 0.2, ease: "easeOut" }}
			>
				<SidebarTrigger className="p-2">
					<motion.div
						whileHover={{ scale: 1.1, x: 2 }}
						transition={{ duration: 0.2 }}
					>
						<ArrowRight className="size-12 text-muted-foreground" />
					</motion.div>
				</SidebarTrigger>
			</motion.div>

			<motion.div
				initial={{ x: -300, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: -300, opacity: 0 }}
				transition={{ duration: 0.3, ease: "easeOut" }}
			>
				<Sidebar className="h-auto top-16 border-none" collapsible="icon">
					<SidebarContent className="bg-muted/10">
						<motion.div
							initial={{ y: -20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.4, delay: 0.1 }}
						>
							<SidebarHeader className="p-4">
								<Select>
									<SelectTrigger className="w-full flex items-center">
										<div className="flex items-center gap-2">
											<motion.div
												whileHover={{ scale: 1.1 }}
												transition={{ duration: 0.2 }}
											>
												<Image src={logoUrl} alt={orgName || "Organization"} width={20} height={20} className="rounded-full" priority={false} />
											</motion.div>
											<span className="flex flex-col items-start">
												<span className="text-sm font-medium ">{displayName}</span>
												<span className="text-xs text-muted-foreground">
													{(() => {
														const userRole = currentOrg?.members.find((member) => member.user.email === session?.user.email)?.role;
														return userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : "";
													})()}
												</span>
											</span>
										</div>
									</SelectTrigger>
									<SelectContent>
										<SelectItem disabled className="font-bold" value="switch-org">Switch Organization</SelectItem>
										<SelectSeparator />
										{userOrgs?.map((org, index) => (
											<motion.div
												key={org.id}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ duration: 0.2, delay: index * 0.05 }}
											>
												<SelectItem className="flex items-center gap-4 p-3 dark:hover:bg-accent/50" value={org.id}>
													<Image className="rounded-full" src={logoUrl} alt={org.name} width={20} height={20} />
													{org.name.slice(0, 16) + "..."} {currentOrg?.id === org.id ? <Check className="w-4 h-4 ml-auto" /> : null}
												</SelectItem>
											</motion.div>
										))}
										<SelectSeparator />
										<motion.div
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
										>
											<Button type="button" variant="ghost" className="flex items-center gap-2 font-bold w-full" onClick={() => {
												setOpen(true);
											}}>
												<motion.div
													whileHover={{ rotate: 90 }}
													transition={{ duration: 0.2 }}
												>
													<Plus className="w-4 h-4" />
												</motion.div>
												Create Organization
											</Button>
										</motion.div>
									</SelectContent>
								</Select>
							</SidebarHeader>
						</motion.div>

						<div className="flex flex-col gap-2">
							<SidebarGroup>
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.2 }}
								>
									<SidebarGroupLabel>Navigation</SidebarGroupLabel>
								</motion.div>

								<SidebarGroupContent>
									<motion.div
										className="flex flex-col gap-2"
										initial="hidden"
										animate="visible"
										variants={{
											hidden: { opacity: 0 },
											visible: {
												opacity: 1,
												transition: {
													delayChildren: 0.3,
													staggerChildren: 0.05
												}
											}
										}}
									>
										{navigationItems.filter((item) => item.necessaryRole === null || item.necessaryRole?.includes(activeMember?.role!)).map((item, index) => (
											<motion.div
												key={item.label}
												variants={{
													hidden: { x: -20, opacity: 0 },
													visible: { x: 0, opacity: 1 }
												}}
												whileHover={{ x: 4 }}
												whileTap={{ scale: 0.98 }}
												transition={{ duration: 0.2 }}
											>
												<Button
													className={`flex items-center gap-4 w-full justify-start hover:bg-muted/90 cursor-pointer ${selectedAction === item.id ? "bg-muted/90" : ""}`}
													variant="ghost"
													onClick={() => {
														setSelectedAction(item.id as SidebarActions);
														item.action();
													}}
												>
													<motion.div
														whileHover={{ scale: 1.2 }}
														transition={{ duration: 0.2 }}
													>
														{item.icon}
													</motion.div>
													<span className="text-sm font-medium">{item.label}</span>
													<AnimatePresence>
														{selectedAction === item.id && (
															<motion.div
																className="ml-auto w-1 h-6 bg-primary rounded-full"
																initial={{ opacity: 0, scale: 0 }}
																animate={{ opacity: 1, scale: 1 }}
																exit={{ opacity: 0, scale: 0 }}
																transition={{ duration: 0.2 }}
															/>
														)}
													</AnimatePresence>
												</Button>
											</motion.div>
										))}
									</motion.div>
								</SidebarGroupContent>
							</SidebarGroup>

							<SidebarGroup>
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: 0.5 }}
								>
									<SidebarGroupLabel>System</SidebarGroupLabel>
								</motion.div>

								<SidebarGroupContent>
									<motion.div
										className="flex flex-col gap-2"
										initial="hidden"
										animate="visible"
										variants={{
											hidden: { opacity: 0 },
											visible: {
												opacity: 1,
												transition: {
													delayChildren: 0.6,
													staggerChildren: 0.05
												}
											}
										}}
									>
										{systemItems.map((item) => (
											<motion.div
												key={item.label}
												variants={{
													hidden: { x: -20, opacity: 0 },
													visible: { x: 0, opacity: 1 }
												}}
												whileHover={{ x: 4 }}
												whileTap={{ scale: 0.98 }}
												transition={{ duration: 0.2 }}
											>
												<Button
													className={`flex items-center gap-4 w-full justify-start hover:bg-muted/90 cursor-pointer ${item.className}`}
													variant="ghost"
													onClick={item.action}
												>
													<motion.div
														whileHover={{
															scale: item.label === "Logout" ? [1, 1.2, 1] : 1.2,
															rotate: item.label === "Settings" ? 180 : 0
														}}
														transition={{ duration: 0.2 }}
													>
														{item.icon}
													</motion.div>
													<span className="text-sm font-medium">{item.label}</span>
												</Button>
											</motion.div>
										))}
									</motion.div>
								</SidebarGroupContent>
							</SidebarGroup>
						</div>
					</SidebarContent>
				</Sidebar>
			</motion.div>
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	)
}