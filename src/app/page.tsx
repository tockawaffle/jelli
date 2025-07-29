"use client";

import {
	useConvexAuth
} from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function App() {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useConvexAuth();


	useEffect(() => {
		if (isLoading) return;
		if (isAuthenticated) {
			router.push("/dashboard");
		} else {
			router.push("/auth");
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return (
			<div className="flex h-screen w-screen items-center justify-center bg-background">
				<Loader2 className="h-10 w-10 animate-spin text-primary" />
			</div>
		)
	}

}