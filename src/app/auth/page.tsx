"use client";

import IntegratedBackground from "@/components/animations/splash-cursor/integrated-background";
import { SettingsDropdown } from "@/components/settings-dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useConvexAuth } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AuthPage() {

	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	const { isAuthenticated, isLoading } = useConvexAuth();
	const { theme } = useTheme();
	const router = useRouter();
	const [view, setView] = useState<"signIn" | "signUp" | "forgotPassword">(
		"signIn"
	);
	const [animationsEnabled, setAnimationsEnabled] = useState(true);
	const [colors, setColors] = useState({
		primary: "#131a22",
		secondary: "#475569",
		accent: "#a0e7e5",
	})

	useEffect(() => {
		const handleStorageChange = () => {
			const storedAnimations = localStorage.getItem("animationsEnabled");
			if (storedAnimations !== null) {
				setAnimationsEnabled(JSON.parse(storedAnimations));
			}
		};

		handleStorageChange();

		window.addEventListener("storage", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
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
		if (isLoading) return;
		if (isAuthenticated) {
			if (redirect) {
				router.push(redirect);
			} else {
				router.push("/dashboard");
			}
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-background">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
			</div>
		)
	}

	return (
		<>
			<div className="absolute inset-0 z-0">
				{animationsEnabled && <IntegratedBackground primaryColor={colors.primary} secondaryColor={colors.secondary} accentColor={colors.accent} />}
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
									<SignInForm setView={setView} />
								) : view === "signUp" ? (
									<SignUpForm setView={setView} />
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

import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

function SignInForm({
	setView,
}: {
	setView: (view: "signIn" | "signUp" | "forgotPassword") => void;
}) {
	const router = useRouter();
	const [isVerifyEmailModalOpen, setVerifyEmailModalOpen] = useState(false);
	const [emailToVerify, setEmailToVerify] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const formSchema = z.object({
		email: z.email("Please enter a valid email"),
		password: z.string().min(8, "Password must be at least 8 characters"),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	})

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.debug(`[SignInForm] submitting login for ${values.email}`);
		const { email, password } = values;

		authClient.signIn.email({
			email,
			password,
		}, {
			onSuccess: () => {
				console.debug(`[SignInForm] login successful for ${email}`);
				toast.success("Login successful");
				router.push("/dashboard");
				// Clean up the form
				form.reset();
				return;
			},
			onError: (error) => {
				console.debug(`[SignInForm] login failed for ${email}: ${JSON.stringify(error)}`);
				form.setError("root", { message: error.error.message });
				if (error.error.code === "EMAIL_NOT_VERIFIED") {
					setEmailToVerify(email);
					toast.error("Please verify your email before logging in", {
						action: {
							label: "Verify email",
							onClick: () => {
								setVerifyEmailModalOpen(true);
							},
						},
					});
				} else {
					toast.error(error.error.message);
				}
				// Clean up the form
				form.reset();
				return;
			}
		})
	}

	return (
		<>
			<VerifyEmailModal
				isOpen={isVerifyEmailModalOpen}
				setIsOpen={setVerifyEmailModalOpen}
				email={emailToVerify}
			/>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-muted-foreground uppercase">Email</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter your email"
										type="email"
										className="h-11 text-base bg-background border-border/50"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-muted-foreground uppercase">Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											placeholder="Enter your password"
											type={showPassword ? "text" : "password"}
											className="h-11 text-base bg-background border-border/50 pr-10"
											{...field}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
										>
											{showPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={() => setView("forgotPassword")}
							className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
						>
							Forgot password?
						</button>
					</div>

					<Button
						type="submit"
						className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Continue
					</Button>

					<div className="text-center text-sm text-muted-foreground">
						Don't have an account?{" "}
						<button
							type="button"
							onClick={() => setView("signUp")}
							className="text-primary hover:underline underline-offset-4 font-semibold"
						>
							Sign up
						</button>
					</div>
				</form>
			</Form>
		</>
	)
}

const signUpFormSchema = z.object({
	email: z.email("Please enter a valid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"],
});

function SignUpForm({
	setView,
}: {
	setView: (view: "signIn" | "signUp" | "forgotPassword") => void;
}) {
	const [isVerifyEmailModalOpen, setVerifyEmailModalOpen] = useState(false);
	const [emailToVerify, setEmailToVerify] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const form = useForm<z.infer<typeof signUpFormSchema>>({
		resolver: zodResolver(signUpFormSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	function onSubmit(values: z.infer<typeof signUpFormSchema>) {
		console.debug(`[SignUpForm] submitting registration for ${values.email}`);
		const { email, password, confirmPassword } = values;

		if (password !== confirmPassword) {
			form.setError("confirmPassword", { message: "Passwords don't match" });
			return;
		}

		authClient.signUp.email({
			email,
			password,
			name: email.split("@")[0],
		}, {
			onSuccess: () => {
				console.debug(`[SignUpForm] registration successful for ${email}`);
				toast.success("Registration successful, please check your email for the verification link!");
				setEmailToVerify(email);
				setVerifyEmailModalOpen(true);
				return;
			},
			onError: (error) => {
				console.debug(`[SignUpForm] registration failed for ${email}: ${JSON.stringify(error)}`);
				if (error.error.code === "PASSWORD_COMPROMISED") {
					toast.error("Password is compromised, please use a different password", {
						action: {
							label: "More details",
							onClick: () => {
								window.open("https://haveibeenpwned.com/Passwords", "_blank");
							},
						},
						duration: 10000,
					});
					return;
				} else {
					form.setError("root", { message: error.error.message });
					toast.error(error.error.message);
				}
				// Clean up the form
				form.reset();
				return;
			}
		})
	}

	const generatePassword = () => {
		// Between 8 and 12 characters
		const length = Math.floor(Math.random() * 5) + 8;
		const lower = "abcdefghijklmnopqrstuvwxyz";
		const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const numbers = "0123456789";
		const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

		const allChars = lower + upper + numbers + symbols;

		const getRandom = (max: number) => {
			const randomValues = new Uint32Array(1);
			window.crypto.getRandomValues(randomValues);
			return randomValues[0] % max;
		}

		let password = "";
		// Ensure at least one of each character type
		password += lower[getRandom(lower.length)];
		password += upper[getRandom(upper.length)];
		password += numbers[getRandom(numbers.length)];
		password += symbols[getRandom(symbols.length)];

		for (let i = 4; i < length; i++) {
			password += allChars[getRandom(allChars.length)];
		}

		// Fisher-Yates (aka Knuth) Shuffle
		let passwordArray = password.split('');
		for (let i = passwordArray.length - 1; i > 0; i--) {
			const j = getRandom(i + 1);
			[passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
		}
		const shuffledPassword = passwordArray.join('');

		form.setValue("password", shuffledPassword, { shouldValidate: true });
		form.setValue("confirmPassword", shuffledPassword, { shouldValidate: true });
		toast.info("Generated a secure password. Make sure to save it somewhere safe!", {
			action: {
				label: "Copy",
				onClick: () => {
					navigator.clipboard.writeText(shuffledPassword);
					toast.success("Password copied to clipboard", {
						closeButton: true,
					});
				},
			},
			closeButton: true,
			duration: 10000,
		});
	};

	return (
		<>
			<VerifyEmailModal
				isOpen={isVerifyEmailModalOpen}
				setIsOpen={setVerifyEmailModalOpen}
				email={emailToVerify}
			/>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-muted-foreground uppercase">Email</FormLabel>
								<FormControl>
									<Input
										placeholder="Enter your email"
										type="email"
										className="h-11 text-base bg-background border-border/50"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-muted-foreground uppercase">Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											placeholder={showPassword ? "Enter your password" : "********"}
											type={showPassword ? "text" : "password"}
											className="h-11 text-base bg-background border-border/50 pr-10"
											{...field}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
										>
											{showPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs font-semibold text-muted-foreground uppercase">Confirm Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											placeholder={showConfirmPassword ? "Confirm your password" : "********"}
											type={showConfirmPassword ? "text" : "password"}
											className="h-11 text-base bg-background border-border/50 pr-10"
											{...field}
										/>
										<button
											type="button"
											onClick={() =>
												setShowConfirmPassword(!showConfirmPassword)
											}
											className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
										>
											{showConfirmPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className="flex justify-end">
						<button
							type="button"
							onClick={generatePassword}
							className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline flex items-center gap-1"
						>
							<Sparkles className="w-3 h-3" />
							<span>Generate Password</span>
						</button>
					</div>

					<Button
						type="submit"
						className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
					>
						Create Account
					</Button>

					<div className="text-center text-sm text-muted-foreground">
						Already have an account?{" "}
						<button
							type="button"
							onClick={() => setView("signIn")}
							className="text-primary hover:underline underline-offset-4 font-semibold"
						>
							Sign in
						</button>
					</div>
				</form>
			</Form>
		</>
	);
}

const forgotPasswordSchema = z.object({
	email: z.email("Please enter a valid email"),
});

function ForgotPasswordForm({
	setView,
}: {
	setView: (view: "signIn" | "signUp" | "forgotPassword") => void;
}) {
	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
		console.debug(`[ForgotPasswordForm] submitting reset request for ${values.email}`);
		const { email } = values;

		authClient.requestPasswordReset({
			email,
		}, {
			onSuccess: () => {
				console.debug(`[ForgotPasswordForm] reset request successful for ${email}`);
				toast.success("Reset link sent to your email");
				// Clean up the form
				form.reset();
				return;
			},
			onError: (error) => {
				console.debug(`[ForgotPasswordForm] reset request failed for ${email}: ${JSON.stringify(error)}`);
				form.setError("root", { message: error.error.message });
				toast.error(error.error.message);
				// Clean up the form
				form.reset();
				return;
			}
		})
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel className="text-xs font-semibold text-muted-foreground uppercase">
								Email
							</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter your email"
									type="email"
									className="h-11 text-base bg-background border-border/50"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="w-full h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
				>
					Send reset link
				</Button>

				<div className="text-center text-sm text-muted-foreground">
					<button
						type="button"
						onClick={() => setView("signIn")}
						className="text-primary hover:underline underline-offset-4 font-semibold"
					>
						Back to Sign In
					</button>
				</div>
			</form>
		</Form>
	);
}

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

const verifyEmailSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

function VerifyEmailModal({
	isOpen,
	setIsOpen,
	email,
}: {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	email: string;
}) {
	const form = useForm<z.infer<typeof verifyEmailSchema>>({
		resolver: zodResolver(verifyEmailSchema),
		defaultValues: {
			token: "",
		},
	});

	function onSubmit(values: z.infer<typeof verifyEmailSchema>) {
		console.debug(`[VerifyEmailModal] submitting verification for ${email}`);
		const { token } = values;

		authClient.verifyEmail(
			{ query: { token } },
			{
				onSuccess: () => {
					toast.success("Email verified successfully! You will now be redirected to the dashboard.");
					setIsOpen(false);
					form.reset();
				},
				onError: (error) => {
					console.debug(`[VerifyEmailModal] verification failed for ${email}: ${JSON.stringify(error)}`);
					form.setError("token", { message: error.error.message });
					toast.error(error.error.message);
				},
			}
		);
	}

	const handleResendVerification = () => {
		authClient.sendVerificationEmail(
			{ email },
			{
				onSuccess: () => {
					toast.success("A new verification email has been sent.");
				},
				onError: (error) => {
					toast.error(error.error.message);
				},
			}
		);
	};

	if (!isOpen) {
		return null;
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Verify Your Email</DialogTitle>
					<DialogDescription>
						A verification code has been sent to{" "}
						<span className="font-semibold">{email}</span>. Please enter it
						below.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="token"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Verification Code</FormLabel>
									<FormControl>
										<Input placeholder="Enter your code" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between items-center pt-2">
							<div className="text-sm text-muted-foreground pt-2 sm:pt-0">
								<span>No code? </span>
								<button
									type="button"
									onClick={handleResendVerification}
									className="text-primary hover:underline underline-offset-4 font-semibold"
									disabled={form.formState.isSubmitting}
								>
									Resend
								</button>
							</div>
							<Button type="submit" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : null}
								Verify
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}