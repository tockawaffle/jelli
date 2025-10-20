import { attendanceSchema } from "@/lib/helpers/plugins/server/attendance/schemas/zod";
import { z } from "zod";

export type Attendance = z.infer<typeof attendanceSchema>;

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
	todayAttendance: Attendance[];
	userRole?: string;
};

