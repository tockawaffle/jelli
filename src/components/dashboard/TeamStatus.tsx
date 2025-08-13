import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import dayjs from "dayjs";

type TeamStatusProps = {
	orgInfo?: OrgInfo | null;
	orgMembers?: { userId: string; name: string | null; role?: string | null; image?: string | null }[];
};

type StatusKey = "active" | "break" | "offline";

const statusMeta: Record<StatusKey, { label: string; dot: string; badgeClass: string }> = {
	active: { label: "Active", dot: "bg-primary", badgeClass: "bg-primary/10 text-primary border-primary/20" },
	break: { label: "Break", dot: "bg-accent", badgeClass: "bg-accent text-accent-foreground border-transparent" },
	offline: { label: "Offline", dot: "bg-muted", badgeClass: "bg-muted text-foreground border-border" },
};

export default function TeamStatus({ orgInfo, orgMembers = [] }: TeamStatusProps) {
	const todayRows = (orgInfo?.attendance ?? []).filter((row) =>
		dayjs(row.date, "DD/MM/YYYY").isSame(dayjs(), "day")
	);

	const attendanceByUserId = new Map<string, (typeof todayRows)[number]>();
	for (const row of todayRows) attendanceByUserId.set(row.id, row);

	const to12h = (hhmmss?: string) => (hhmmss ? dayjs(hhmmss, "HH:mm:ss").format("h:mm A") : undefined);

	const derive = (row?: (typeof todayRows)[number]): { status: StatusKey; when?: string; timeLabel?: string } => {
		if (!row) return { status: "offline", timeLabel: "Not clocked in" };
		switch (row.status) {
			case "CLOCKED_IN":
				return { status: "active", when: row.clock_in, timeLabel: to12h(row.clock_in) };
			case "LUNCH_BREAK_STARTED":
				return { status: "break", when: row.lunch_break_out, timeLabel: to12h(row.lunch_break_out) };
			case "LUNCH_BREAK_ENDED":
				return { status: "active", when: row.lunch_break_return, timeLabel: to12h(row.lunch_break_return) };
			case "CLOCKED_OUT":
				return { status: "offline", when: row.clocked_out, timeLabel: to12h(row.clocked_out) };
			case "TBR":
			default:
				return { status: "offline", timeLabel: "Not clocked in" };
		}
	};

	const items = orgMembers.map((m) => {
		const row = attendanceByUserId.get(m.userId);
		const d = derive(row);
		return {
			key: m.userId,
			name: m.name ?? "",
			role: m.role ?? "",
			status: d.status as StatusKey,
			timeText: d.timeLabel,
			image: m.image,
			sortKey: row?.updated_at_ms ?? 0,
		};
	});

	const counts = {
		active: items.filter((i) => i.status === "active").length,
		break: items.filter((i) => i.status === "break").length,
		offline: items.filter((i) => i.status === "offline").length,
	};

	items.sort((a, b) => {
		const order = (s: StatusKey) => (s === "active" ? 0 : s === "break" ? 1 : 2);
		const diff = order(a.status) - order(b.status);
		return diff !== 0 ? diff : b.sortKey - a.sortKey;
	});

	return (
		<Card className="min-h-[180px] h-full">
			<CardHeader>
				<div className="flex flex-col gap-2">
					<div className="flex items-center justify-between gap-3">
						<CardTitle>Team Status</CardTitle>
						{/* Desktop / medium+: inline chips with wrapping */}
						<div className="hidden md:flex items-center gap-2 flex-wrap justify-end">
							<Badge variant="outline" className={statusMeta.active.badgeClass}>
								{counts.active} {statusMeta.active.label}
							</Badge>
							<Badge variant="outline" className={statusMeta.break.badgeClass}>
								{counts.break} {statusMeta.break.label}
							</Badge>
							<Badge variant="outline" className={statusMeta.offline.badgeClass}>
								{counts.offline} {statusMeta.offline.label}
							</Badge>
						</div>
					</div>
					{/* Small screens: show chips below title in a 3-col grid */}
					<div className="grid grid-cols-3 gap-2 md:hidden">
						<Badge variant="outline" className={`w-full justify-center ${statusMeta.active.badgeClass}`}>
							{counts.active} {statusMeta.active.label}
						</Badge>
						<Badge variant="outline" className={`w-full justify-center ${statusMeta.break.badgeClass}`}>
							{counts.break} {statusMeta.break.label}
						</Badge>
						<Badge variant="outline" className={`w-full justify-center ${statusMeta.offline.badgeClass}`}>
							{counts.offline} {statusMeta.offline.label}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<ScrollArea className="max-h-64 md:max-h-80 pr-1">
					<div className="divide-y divide-border">
						{items.map((member) => (
							<div key={member.key} className="flex items-start sm:items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
								<div className="flex items-center min-w-0">
									<div className="relative">
										<Avatar className="h-9 w-9">
											{member.image ? (
												<AvatarImage src={member.image || undefined} alt={member.name || "Avatar"} />
											) : (
												<AvatarImage alt="Avatar" />
											)}
											<AvatarFallback>
												{(member.name || "").split(" ").map((n) => n[0]).slice(0, 2).join("") || "AB"}
											</AvatarFallback>
										</Avatar>
										<span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${statusMeta[member.status].dot} border-2 border-background rounded-full`} />
									</div>
									<div className="ml-3 min-w-0">
										<p className="text-sm font-medium leading-none truncate">{member.name}</p>
										<p className="text-xs text-muted-foreground truncate">{member.role}</p>
									</div>
								</div>
								<div className="ml-2 flex items-center gap-2 text-right shrink min-w-0">
									<Badge variant="outline" className={`text-xs ${statusMeta[member.status].badgeClass}`}>{statusMeta[member.status].label}</Badge>
									{member.timeText && <p className="hidden xs:block text-sm text-muted-foreground w-16 text-right">{member.timeText}</p>}
								</div>
							</div>
						))}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
