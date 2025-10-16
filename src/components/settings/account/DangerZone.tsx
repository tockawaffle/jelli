"use client"

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { AlertTriangle, Trash2 } from "lucide-react"
import { fadeInUp } from "./utils"

export function DangerZone() {
	return (
		<motion.div
			{...fadeInUp(0.4)}
			className="bg-card/50 border border-destructive/20 rounded-xl backdrop-blur-sm"
		>
			<div className="p-4 md:p-6 border-b border-destructive/20">
				<div className="flex items-center gap-2">
					<AlertTriangle className="h-5 w-5 text-destructive" />
					<h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
				</div>
				<p className="text-sm text-muted-foreground">Irreversible and destructive actions.</p>
			</div>

			<div className="p-4 md:p-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-destructive/20 rounded-lg bg-destructive/5 dark:bg-destructive/10">
					<div>
						<h4 className="font-medium text-destructive">Delete Account</h4>
						<p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
					</div>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" size="sm" className="shrink-0">
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Account
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete your account and remove all your data
									from our servers.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction className="bg-destructive hover:bg-destructive/90">Delete Account</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
			</div>
		</motion.div>
	)
}

