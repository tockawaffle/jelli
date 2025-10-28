import type { Attendance } from "@/lib/helpers/plugins/server/attendance";
export type { Attendance };
export type Member = {
	userId: string;
	name: string | null;
	image?: string | null;
};

export type ViewItem = {
	key: string;
	name: string;
	subtitle: string;
	chipLabel: string;
	chipClass: string;
	timeText?: string;
	sortKey: number;
	image?: string | null;
};

export type RecentActivityProps = {
	orgInfo?: OrgInfo | null;
	orgMembers?: Member[];
	todayAttendance: Omit<Attendance, "_id">[];
	userRole?: string;
};

