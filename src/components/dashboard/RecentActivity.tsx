import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Button } from "../ui/button";
dayjs.extend(customParseFormat);

/**
 * @description The status of the user's activity. Check the user's card for more detailed information such as the time of the activity, if it's a late clock-in, etc.
 * @enum {string}
 */
enum ActivityStatus {
	/** @description The default status for all users. Indicates that the user has not clocked in/out today and has no attendance record for today. Different from "Unknown" status which means there is an attendance record but no activity logged. */
	TBR = "To be reported",
	/** @description Means that the user has clocked in late */
	LATE = "Clocked in late",
	/** @description Means that the user has clocked in */
	CLOCKED_IN = "Clocked in",
	/** @description Means that the user has started lunch break */
	LUNCH_BREAK_STARTED = "Started lunch break",
	/** @description Means that the user has returned from lunch break */
	LUNCH_BREAK_ENDED = "Returned from lunch break",
	/** 
	 * @description Indicates the user is absent from work. This status appears in two cases:
	 * 1. The user has not clocked in for the day after the configured clock-in time + the configured clock-in grace period
	 * 2. The user started but did not return from lunch break within the configured time limit
	 * Note: This status only applies when lunch break times are strictly configured. It won't appear if lunch breaks are set to dynamic/flexible timing.
	 */
	ABSENT = "Absent",
	/** @description Means that the user has clocked out */
	CLOCKED_OUT = "Clocked out",
	/** @description Means that the user has clocked out early */
	EARLY_OUT = "Clocked out early",
	/** 
	 * @description Indicates the user is on approved vacation leave. This status remains active until one of:
	 * 1. The vacation period ends
	 * 2. The user manually clocks in
	 * 3. An admin updates the organization's vacation policy affecting this user
	 */
	VACATION = "On vacation",
	/** @description Means that the user has a pending request (e.g. vacation, sick leave, etc.) */
	PENDING_REQUEST = "Has request(s)",
	/** 
	 * @description Indicates the user is on approved sick leave. This status remains active until one of:
	 * 1. The sick leave period ends
	 * 2. The user manually clocks in
	 * 3. An admin updates the organization's sick leave policy affecting this user
	 */
	SICK_LEAVE = "On sick leave",
	/** 
	 * @description Indicates the user is on approved paid time off (PTO). This status remains active until:
	 * 1. The PTO period ends
	 * 2. The user manually clocks in
	 * 3. An admin modifies the PTO policy or revokes the PTO
	 * 
	 * PTO allows employees to take paid leave for vacation, personal time, etc. while receiving their normal salary.
	 */
	PTO = "On paid time off",
	/** @description Means that the user has a table entry for the current day but no activity (If you see this happens, please go take a look at the database entry and look for the user's last activity and logs). */
	UNKNOWN = "Unknown",
}


// Chip styles closer to the reference
const chipStyles: Record<string, string> = {
	onTime: "rounded-full px-2.5 py-0.5 text-xs font-medium border text-muted-foreground",
	approved: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-foreground text-background",
	break: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-foreground",
	late: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500 text-white",
	pending: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground",
};

type RecentActivityProps = {
	orgInfo?: OrgInfo | null,
	orgMembers?: { userId: string; name: string | null; image?: string | null }[]
}

export default function RecentActivity({ orgInfo, orgMembers }: RecentActivityProps) {
	const attendance = orgInfo?.attendance ?? [];
	const members = orgMembers ?? [];

	const getTodayAttendance = () => {
		// Return the attendance for the current day (dates in DD/MM/YYYY)
		return attendance.filter((row) =>
			dayjs(row.date, "DD/MM/YYYY").isSame(dayjs(), "day")
		);
	};

	const todayRows = getTodayAttendance();
	const attendanceByUserId = new Map<string, typeof todayRows[number]>();
	for (const row of todayRows) attendanceByUserId.set(row.id, row);

	type Attendance = NonNullable<OrgInfo["attendance"]>[number];
	const deriveStatus = (row: Attendance): { status: ActivityStatus; when?: string } => {
		switch (row.status) {
			case "CLOCKED_OUT":
				return { status: row.early_out ? ActivityStatus.EARLY_OUT : ActivityStatus.CLOCKED_OUT, when: row.clocked_out || undefined };
			case "LUNCH_BREAK_ENDED":
				return { status: ActivityStatus.LUNCH_BREAK_ENDED, when: row.lunch_break_return || undefined };
			case "LUNCH_BREAK_STARTED":
				return { status: ActivityStatus.LUNCH_BREAK_STARTED, when: row.lunch_break_out || undefined };
			case "CLOCKED_IN":
				return { status: row.was_late ? ActivityStatus.LATE : ActivityStatus.CLOCKED_IN, when: row.clock_in || undefined };
			case "TBR":
			default:
				return { status: ActivityStatus.TBR };
		}
	};

	const to12h = (hhmmss?: string) => (hhmmss ? dayjs(hhmmss, "HH:mm:ss").format("h:mm A") : undefined);

	type ViewItem = {
		key: string;
		name: string;
		subtitle: string;
		chipLabel: string;
		chipClass: string;
		timeText?: string;
		sortKey: number;
		image?: string | null;
	};

	const buildViewFromRow = (row: Attendance, nameFallback?: string, image?: string | null): ViewItem => {
		const s = deriveStatus(row);
		let subtitle = "";
		let chipLabel = "";
		let chipClass = chipStyles.onTime;
		let timeText: string | undefined;

		switch (s.status) {
			case ActivityStatus.CLOCKED_OUT:
				subtitle = "Clocked out";
				chipLabel = row.early_out ? "approved" : "on-time";
				chipClass = row.early_out ? chipStyles.approved : chipStyles.onTime;
				timeText = to12h(row.clocked_out);
				break;
			case ActivityStatus.LUNCH_BREAK_ENDED:
				subtitle = "Returned from break";
				chipLabel = "on-time";
				chipClass = chipStyles.onTime;
				timeText = to12h(row.lunch_break_return);
				break;
			case ActivityStatus.LUNCH_BREAK_STARTED:
				subtitle = "Break started";
				chipLabel = "break";
				chipClass = chipStyles.break;
				timeText = to12h(row.lunch_break_out);
				break;
			case ActivityStatus.LATE:
				subtitle = "Clocked in";
				chipLabel = "late";
				chipClass = chipStyles.late;
				timeText = to12h(row.clock_in);
				break;
			case ActivityStatus.CLOCKED_IN:
				subtitle = "Clocked in";
				chipLabel = "on-time";
				chipClass = chipStyles.onTime;
				timeText = to12h(row.clock_in);
				break;
			case ActivityStatus.TBR:
			default:
				subtitle = "No activity yet";
				chipLabel = "pending";
				chipClass = chipStyles.pending;
				break;
		}

		return {
			key: `${row.org_id}-${row.id}`,
			name: row.name || nameFallback || "",
			subtitle,
			chipLabel,
			chipClass,
			timeText,
			sortKey: row.updated_at_ms ?? 0,
			image,
		};
	};
	return (
		<Card className="min-h-[180px] h-full">
			<CardHeader>
				<CardTitle>Recent Team Activity</CardTitle>
			</CardHeader>
			<CardContent>
				<ScrollArea className="max-h-64 md:max-h-80 pr-1 gap-2">
					<div className="divide-y">
						{(() => {
							const items: ViewItem[] = [];
							if (members.length > 0) {
								for (const m of members) {
									const row = attendanceByUserId.get(m.userId);
									if (row) items.push(buildViewFromRow(row, m.name ?? undefined, m.image));
									else
										items.push({
											key: m.userId,
											name: m.name ?? "",
											subtitle: "No activity yet",
											chipLabel: "No activity",
											chipClass: chipStyles.pending,
											timeText: undefined,
											sortKey: 0,
											image: m.image,
										});
								}
							} else {
								for (const row of todayRows) items.push(buildViewFromRow(row));
							}
							items.sort((a, b) => b.sortKey - a.sortKey);
							return items.map((it) => (
								<Button variant="ghost" key={it.key} className={`flex items-center justify-between h-full w-full py-2 ${it.chipLabel === "pending" ? "cursor-pointer" : "cursor-not-allowed"}`}>
									<div className="flex items-center">
										<Avatar className="h-9 w-9">
											{it.image ? (
												<AvatarImage alt={it.name || "Avatar"} src={it.image || undefined} />
											) : (
												<AvatarImage alt="Avatar" />
											)}
											<AvatarFallback>{(it.name || "").split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "AB"}</AvatarFallback>
										</Avatar>
										<div className="ml-4 space-y-0.5 text-start">
											<p className="text-sm font-medium leading-none">{it.name}</p>
											<p className="text-xs text-muted-foreground">{it.subtitle}</p>
										</div>
									</div>
									<div className="flex items-center gap-3 text-right shrink-0">
										<span className={it.chipClass}>{it.chipLabel}</span>
										{it.timeText && <p className="hidden xs:block text-sm text-muted-foreground w-16 text-right">{it.timeText}</p>}
									</div>
								</Button>
							));
						})()}
					</div>
				</ScrollArea>
			</CardContent>
		</Card>
	);
}
