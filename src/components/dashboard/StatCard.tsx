import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, LucideIcon, Minus } from "lucide-react";

type StatCardProps = {
	title: string;
	value: string;
	description: string;
	icon: LucideIcon;
	className?: string;
	trend?: "up" | "down" | "neutral";
};

const trendIcons = {
	up: ArrowUp,
	down: ArrowDown,
	neutral: Minus,
};

const trendColors = {
	up: "text-green-500",
	down: "text-red-500",
	neutral: "text-muted-foreground",
};

export default function StatCard({
	title,
	value,
	description,
	icon: Icon,
	className,
	trend = "neutral",
}: StatCardProps) {
	const TrendIcon = trendIcons[trend];
	const trendColor = trendColors[trend];

	return (
		<Card className={cn("flex flex-col justify-between", className)}>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="w-4 h-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div className="text-2xl font-bold flex items-center gap-2">
					{value}
					<TrendIcon className={cn("w-5 h-5", trendColor)} />
				</div>
				<p className="text-xs text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	);
}

export function StatCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<Skeleton className="h-4 w-2/3" />
				<Skeleton className="h-4 w-4" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-7 w-1/3 mb-2" />
				<Skeleton className="h-3 w-full" />
			</CardContent>
		</Card>
	);
}
