import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ViewItem } from "./types";

type ActivityListItemProps = {
	item: ViewItem;
	isClickable: boolean;
	onClick: () => void;
};

export function ActivityListItem({ item, isClickable, onClick }: ActivityListItemProps) {
	return (
		<Button
			variant="ghost"
			className={`flex items-center justify-between h-full w-full py-2 ${isClickable ? "cursor-pointer hover:bg-accent/50" : "cursor-default"}`}
			onClick={onClick}
			disabled={!isClickable}
		>
			<div className="flex items-center">
				<Avatar className="h-9 w-9">
					{item.image ? (
						<AvatarImage alt={item.name || "Avatar"} src={item.image || undefined} />
					) : (
						<AvatarImage alt="Avatar" />
					)}
					<AvatarFallback>{(item.name || "").split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "AB"}</AvatarFallback>
				</Avatar>
				<div className="ml-4 space-y-0.5 text-start">
					<p className="text-sm font-medium leading-none">{item.name}</p>
					<p className="text-xs text-muted-foreground">{item.subtitle}</p>
				</div>
			</div>
			<div className="flex items-center gap-3 text-right shrink-0">
				<span className={item.chipClass}>{item.chipLabel}</span>
				{item.timeText && <p className="hidden xs:block text-sm text-muted-foreground w-16 text-right">{item.timeText}</p>}
			</div>
		</Button>
	);
}

