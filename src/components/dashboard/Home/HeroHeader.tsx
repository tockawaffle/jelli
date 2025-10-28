import { motion } from "framer-motion";
import { Activity, Sparkles, Users } from "lucide-react";
import { GreetingData } from "./types";

type HeroHeaderProps = {
	currentGreeting: GreetingData;
	organizationName: string;
	memberCount: number;
};

export function HeroHeader({ currentGreeting, organizationName, memberCount }: HeroHeaderProps) {
	return (
		<motion.div
			className="relative overflow-hidden bg-linear-to-br from-primary/5 via-background to-accent/5 border-b border-border/50"
			initial={{ opacity: 0, y: -20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
		>
			<div className="absolute inset-0 bg-grid-pattern opacity-5" />
			<div className="relative max-w-6xl mx-auto p-4 py-6">
				<motion.div
					className="flex flex-col md:flex-row md:items-center justify-between gap-6"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.1 }}
				>
					<div className="space-y-2">
						<div className="flex items-center gap-3">
							<motion.div
								className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20"
								whileHover={{ scale: 1.05, rotate: 5 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<currentGreeting.icon className="h-6 w-6 text-primary" />
							</motion.div>
							<div>
								<motion.h1
									className="text-2xl md:text-3xl font-bold text-foreground"
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.6, delay: 0.2 }}
								>
									{currentGreeting.greeting}
								</motion.h1>
								<motion.p
									className="text-sm md:text-base text-muted-foreground flex items-center gap-2"
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ duration: 0.6, delay: 0.3 }}
								>
									<Sparkles className="h-4 w-4 text-accent" />
									{currentGreeting.description}
								</motion.p>
							</div>
						</div>
					</div>

					{/* Organization Info Card */}
					<motion.div
						className="bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						whileHover={{ scale: 1.02 }}
					>
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Activity className="h-5 w-5 text-primary" />
							</div>
							<div>
								<h3 className="font-semibold text-foreground text-sm">{organizationName}</h3>
								<p className="text-xs text-muted-foreground flex items-center gap-1">
									<Users className="h-3 w-3" />
									{memberCount} member{memberCount !== 1 ? 's' : ''}
								</p>
							</div>
						</div>
					</motion.div>
				</motion.div>
			</div>
		</motion.div>
	);
}

