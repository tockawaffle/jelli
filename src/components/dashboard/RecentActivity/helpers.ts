import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { ActivityStatus, chipStyles } from "./constants";
import type { Attendance, ViewItem } from "./types";

dayjs.extend(duration);

export const isValidDate = (dateString?: string) => {
	if (!dateString || dateString === "" || dateString === "0") return false;
	const date = dayjs(dateString);
	return date.isValid() && date.year() > 1970; // Check it's a real date, not epoch
};

export const to12h = (isoString?: string) => {
	if (!isValidDate(isoString)) return undefined;
	return dayjs(isoString).format("h:mm A");
};

export const formatDuration = (seconds: number) => {
	const dur = dayjs.duration(seconds, 'seconds');
	const hours = Math.floor(dur.asHours());
	const mins = dur.minutes();
	return `${hours}h ${mins}m`;
};

export const deriveStatus = (row: Attendance): { status: ActivityStatus; when?: string } => {
	switch (row.status) {
		case "CLOCKED_OUT":
			return { status: row.earlyOut ? ActivityStatus.EARLY_OUT : ActivityStatus.CLOCKED_OUT, when: row.clockOut || undefined };
		case "LUNCH_BREAK_ENDED":
			return { status: ActivityStatus.LUNCH_BREAK_ENDED, when: row.lunchBreakReturn || undefined };
		case "LUNCH_BREAK_STARTED":
			return { status: ActivityStatus.LUNCH_BREAK_STARTED, when: row.lunchBreakOut || undefined };
		case "CLOCKED_IN":
			return { status: row.wasLate ? ActivityStatus.LATE : ActivityStatus.CLOCKED_IN, when: row.clockIn || undefined };
		case "TBR":
		default:
			return { status: ActivityStatus.TBR };
	}
};

export const buildViewFromRow = (row: Attendance, nameFallback?: string, image?: string | null): ViewItem => {
	const s = deriveStatus(row);
	let subtitle = "";
	let chipLabel = "";
	let chipClass = chipStyles.onTime;
	let timeText: string | undefined;

	switch (s.status) {
		case ActivityStatus.CLOCKED_OUT:
			subtitle = "Clocked out";
			chipLabel = row.earlyOut ? "approved" : "on-time";
			chipClass = row.earlyOut ? chipStyles.approved : chipStyles.onTime;
			timeText = to12h(row.clockOut);
			break;
		case ActivityStatus.LUNCH_BREAK_ENDED:
			subtitle = "Returned from break";
			chipLabel = "on-time";
			chipClass = chipStyles.onTime;
			timeText = to12h(row.lunchBreakReturn);
			break;
		case ActivityStatus.LUNCH_BREAK_STARTED:
			subtitle = "Break started";
			chipLabel = "break";
			chipClass = chipStyles.break;
			timeText = to12h(row.lunchBreakOut);
			break;
		case ActivityStatus.LATE:
			subtitle = "Clocked in";
			chipLabel = "late";
			chipClass = chipStyles.late;
			timeText = to12h(row.clockIn);
			break;
		case ActivityStatus.CLOCKED_IN:
			subtitle = "Clocked in";
			chipLabel = "on-time";
			chipClass = chipStyles.onTime;
			timeText = to12h(row.clockIn);
			break;
		case ActivityStatus.TBR:
		default:
			subtitle = "No activity yet";
			chipLabel = "pending";
			chipClass = chipStyles.pending;
			break;
	}

	return {
		key: row.userId,
		name: nameFallback || "",
		subtitle,
		chipLabel,
		chipClass,
		timeText,
		sortKey: row.timesUpdated ?? 0,
		image,
	};
};

