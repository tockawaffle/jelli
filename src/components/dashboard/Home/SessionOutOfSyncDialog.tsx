import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export function SessionOutOfSyncDialog() {
	return (
		<Dialog open={true} modal={true}>
			<DialogContent showCloseButton={false} className="overflow-hidden p-0">
				<div className="h-1 w-full bg-linear-to-r from-primary/80 via-accent to-primary" />
				<div className="p-6">
					<DialogHeader>
						<DialogTitle>Session out of sync</DialogTitle>
						<DialogDescription>
							We couldn't load your current organization or membership. This can happen after switching orgs or logging in. Please refresh to continue.
						</DialogDescription>
					</DialogHeader>

					<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="mt-4 space-y-4">
						<div className="bg-accent/30 border-l-4 border-accent text-foreground p-4 rounded-md" role="alert">
							<p className="font-bold">Tip</p>
							<p className="text-sm">Make sure pop-up blockers or aggressive extensions aren't interfering with org selection.</p>
						</div>
						<div className="flex items-center justify-end gap-2">
							<Button variant="secondary" onClick={() => (typeof window !== "undefined" ? window.history.back() : undefined)}>Go back</Button>
							<Button onClick={() => (typeof window !== "undefined" ? window.location.reload() : undefined)} className="gap-2">
								Reload page
							</Button>
						</div>
					</motion.div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

