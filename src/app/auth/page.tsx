"use client";

import IntegratedBackground from "@/components/animations/splash-cursor/integrated-background";
import { Squares } from "@/components/animations/squares";
import { SettingsDropdown } from "@/components/settings-dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConvexAuth } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import { ResetPasswordModal, VerifyEmailModal } from "./components/Modals";
import SignInForm from "./components/SignInForm";
import SignUpForm from "./components/SignUpForm";

export default function AuthPage() {

	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	const { isAuthenticated, isLoading } = useConvexAuth();
	const { theme } = useTheme();
	const router = useRouter();
	const [view, setView] = useState<"signIn" | "signUp" | "forgotPassword">(
		"signIn"
	);
	const [isResetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);
	const [isVerifyEmailModalOpen, setVerifyEmailModalOpen] = useState(false);
	const [emailToVerify, setEmailToVerify] = useState("");
	const [animationsEnabled, setAnimationsEnabled] = useState(true);
	const [selectedAnimation, setSelectedAnimation] = useState<"squares" | "jelli" | "none">("jelli");
	const [colors, setColors] = useState({
		primary: "#131a22",
		secondary: "#475569",
		accent: "#a0e7e5",
	})

	useEffect(() => {
		const viewParam = searchParams.get("view");
		if (viewParam?.startsWith("resetPassword")) {
			setResetPasswordModalOpen(true);
		}
	}, [searchParams]);

	useEffect(() => {
		const handleStorageChange = () => {
			const enabledAnimations = localStorage.getItem("animationsEnabled");
			if (enabledAnimations !== null) {
				console.debug("[AuthPage] enabledAnimations", enabledAnimations);
				setAnimationsEnabled(JSON.parse(enabledAnimations));
			}
			const selectedAnimation = localStorage.getItem("selectedAnimation");
			if (selectedAnimation !== null) {
				setSelectedAnimation(selectedAnimation as "squares" | "jelli" | "none");
			}
		};

		handleStorageChange();

		window.addEventListener("storage-animation-state", handleStorageChange);
		window.addEventListener("storage-animation-which", handleStorageChange);

		return () => {
			window.removeEventListener("storage-animation-state", handleStorageChange);
			window.removeEventListener("storage-animation-which", handleStorageChange);
		};
	}, []);

	useEffect(() => {
		if (theme === "dark" || theme === "system") {
			setColors({
				primary: "#131a22",
				secondary: "#475569",
				accent: "#a0e7e5",
			})
		} else {
			setColors({
				primary: "#f1f5f9",
				secondary: "#e2e8f0",
				accent: "#94a3b8",
			})
		}
	}, [theme]);

	useEffect(() => {
		if (isLoading || isVerifyEmailModalOpen) return;
		if (isAuthenticated) {
			if (redirect) {
				router.push(redirect);
			} else {
				router.push("/dashboard");
			}
		}
	}, [isAuthenticated, isLoading, router, redirect, isVerifyEmailModalOpen]);

	if (isLoading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-background">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
			</div>
		)
	}

	return (
		<>
			<ResetPasswordModal
				isOpen={isResetPasswordModalOpen}
				setIsOpen={setResetPasswordModalOpen}
			/>
			<VerifyEmailModal
				isOpen={isVerifyEmailModalOpen}
				setIsOpen={setVerifyEmailModalOpen}
				email={emailToVerify}
			/>
			<div className="absolute inset-0 z-0">
				{animationsEnabled && selectedAnimation === "jelli" && <IntegratedBackground primaryColor={colors.primary} secondaryColor={colors.secondary} accentColor={colors.accent} />}
				{animationsEnabled && selectedAnimation === "squares" && <Squares borderColor={colors.primary} hoverFillColor={colors.secondary} />}
			</div>
			<div className="flex flex-col min-h-screen w-screen items-center justify-center bg-background gap-8 p-4 sm:p-0">
				<Card className="relative w-full max-w-md bg-card text-card-foreground p-6 sm:p-8 rounded-2xl shadow-2xl border-border/50">
					<div className="absolute top-4 left-4">
						<Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
							<ArrowLeft className="w-5 h-5" />
						</Button>
					</div>
					<div className="absolute top-4 right-4">
						<SettingsDropdown />
					</div>
					<CardHeader className="flex flex-col items-center space-y-6 pt-8 text-center">
						<Image
							src="images/logos/jelli.svg"
							alt="Logo"
							width={96}
							height={96}
							className="rounded-lg"
						/>
						<CardTitle className="text-2xl font-semibold">
							{view === "signIn" && "Sign In"}
							{view === "signUp" && "Create an account"}
							{view === "forgotPassword" && "Reset Password"}
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 mt-6 overflow-hidden">
						<AnimatePresence mode="wait" initial={false}>
							<motion.div
								key={view}
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -50 }}
								transition={{ duration: 0.3 }}
							>
								{view === "signIn" ? (
									<SignInForm
										setView={setView}
										redirectTo={redirect ?? undefined}
										onEmailNotVerified={(email) => {
											setEmailToVerify(email);
											setVerifyEmailModalOpen(true);
										}}
									/>
								) : view === "signUp" ? (
									<SignUpForm
										setView={setView}
										redirectTo={redirect ?? undefined}
										onSuccess={(email) => {
											setEmailToVerify(email);
											setVerifyEmailModalOpen(true);
										}}
									/>
								) : (
									<ForgotPasswordForm setView={setView} />
								)}
							</motion.div>
						</AnimatePresence>
					</CardContent>
				</Card>
			</div>
		</>
	);
}