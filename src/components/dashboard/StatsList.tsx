"use client";

import { LucideIcon } from "lucide-react";
import StatCard, { StatCardSkeleton } from "./StatCard";

type StatsListProps = {
	stats: {
		id: string;
		title: string;
		value: string;
		description: string;
		icon: LucideIcon;
		trend: "up" | "down" | "neutral";
	}[];
};

export function StatsList({ stats }: StatsListProps) {


	if (!stats) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<StatCardSkeleton key={i} />
				))}
			</div>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
			{stats.map((stat) => (
				<StatCard
					key={stat.id}
					title={stat.title}
					value={stat.value?.toString() ?? "N/A"}
					description={stat.description}
					icon={stat.icon}
					trend={stat.trend as "up" | "down" | "neutral" | undefined}
				/>
			))}
		</div>
	);
}
