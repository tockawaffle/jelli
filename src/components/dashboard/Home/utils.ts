import type { Attendance } from "@/lib/helpers/plugins/server/attendance";
import { User } from "better-auth";
import dayjs from "dayjs";
import { BarChart, Calendar, Clock, Moon, Sun, SunDim, Users } from "lucide-react";
import { GreetingData, StatItem } from "./types";

export function getUserName(user: User & { metadata: { name: { firstName: string; lastName: string } } }, type: "firstNameOnly" | "lastNameOnly" | "fullName" | "username" | "initials" = "fullName"): string {

	const nameExists = user.metadata.name.firstName && user.metadata.name.lastName;
	if (!nameExists) {
		return user.name;
	}

	switch (type) {
		case "firstNameOnly":
			return user.metadata.name.firstName;
		case "lastNameOnly":
			return user.metadata.name.lastName;
		case "fullName":
			return `${user.metadata.name.firstName} ${user.metadata.name.lastName}`;
		case "username":
			return user.name;
		case "initials":
			return `${user.metadata.name.firstName.charAt(0)}${user.metadata.name.lastName.charAt(0)}`;
	}
}

export function getGreeting(
	user: User & { metadata: { name: { firstName: string; lastName: string } } },
	todayAttendance: Omit<Attendance, "_id">[] | null,
	totalMembers: number
): GreetingData {
	const attendanceRate = (todayAttendance?.length ?? 0) / (totalMembers || 1);
	const description = attendanceRate < 0.5
		? "No activity yet, stay productive!"
		: "Everything's going well, keep it up!";

	const name = getUserName(user, "fullName");

	const currentHour = dayjs().hour();
	if (currentHour < 12) {
		return {
			greeting: `Good morning, ${name}`,
			description,
			icon: Sun,
		};
	}
	if (currentHour < 18) {
		return {
			greeting: `Good afternoon, ${name}!`,
			description,
			icon: SunDim,
		};
	}
	return {
		greeting: `Good evening, ${name}!`,
		description,
		icon: Moon,
	};
}

export function calculateStats(
	todayAttendance: Omit<Attendance, "_id">[] | null,
	yesterdayAttendance: Omit<Attendance, "_id">[] | null,
	totalMembers: number,
	scheduledTimeOff: any[] | undefined
): StatItem[] {
	const todayAttendanceCount = todayAttendance?.length ?? 0;
	const yesterdayAttendanceCount = yesterdayAttendance?.length ?? 0;

	const averageHoursToday =
		((todayAttendance ?? []) as Attendance[]).reduce((acc: number, member: Attendance) => {
			if (!member.clockIn) return acc;
			const clockIn = dayjs(member.clockIn);
			const clockOut = member.clockOut ? dayjs(member.clockOut) : dayjs();
			const hours = clockOut.diff(clockIn, "hour", true);
			// Only count valid positive hours (ignore invalid dates)
			return hours > 0 && hours < 24 ? acc + hours : acc;
		}, 0) / (todayAttendanceCount || 1);

	const attendanceDifference = todayAttendanceCount - yesterdayAttendanceCount;
	const attendanceRate = (todayAttendanceCount / (totalMembers || 1)) * 100;

	return [
		{
			id: "team-members-active",
			title: "Team Members Active",
			value: `${todayAttendanceCount} / ${totalMembers}`,
			description: `${Math.abs(attendanceDifference)} ${attendanceDifference >= 0 ? "more" : "less"
				} than yesterday`,
			icon: Users,
			trend:
				attendanceDifference > 0
					? ("up" as const)
					: attendanceDifference < 0
						? ("down" as const)
						: ("neutral" as const),
		},
		{
			id: "average-hours-today",
			title: "Average Hours Today",
			value: `${averageHoursToday.toFixed(1)}h`,
			description: `${todayAttendanceCount} members clocked in today`,
			icon: Clock,
			trend: "neutral" as const,
		},
		{
			id: "attendance-rate",
			title: "Attendance Rate",
			value: `${attendanceRate.toFixed(1)}%`,
			description: `${Math.abs(attendanceDifference)}% ${attendanceDifference >= 0 ? "increase" : "decrease"
				} from yesterday`,
			icon: BarChart,
			trend:
				attendanceDifference > 0
					? ("up" as const)
					: attendanceDifference < 0
						? ("down" as const)
						: ("neutral" as const),
		},
		{
			id: "scheduled-today",
			title: "Scheduled Today",
			value: `${scheduledTimeOff?.length ?? 0} time-off requests`,
			description: "",
			icon: Calendar,
			trend: "neutral" as const,
		},
	];
}

