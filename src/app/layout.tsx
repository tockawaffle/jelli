import { ConvexClientProvider } from "@/lib/providers/Convex";
import { ThemeProvider } from "@/lib/providers/Theme";
import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
	title: "Jelli",
	description: "time is yours, not theirs.",
	icons: {
		icon: "/images/logos/jelli.svg",
		apple: "/images/logos/jelli.svg",
		shortcut: "/images/logos/jelli.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ConvexClientProvider>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<NextIntlClientProvider>
							{children}
						</NextIntlClientProvider>
						<Toaster richColors />
					</ThemeProvider>
				</ConvexClientProvider>
			</body>
		</html>
	);
}
