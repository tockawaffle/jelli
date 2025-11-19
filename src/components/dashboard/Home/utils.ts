import type { Attendance } from "@/lib/helpers/plugins/server/attendance";
import { User } from "better-auth";
import dayjs from "dayjs";
import { BarChart, Calendar, Clock, Moon, Sun, SunDim, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { GreetingData, StatItem } from "./types";

export function getUserName(user: User & { metadata?: { name?: { firstName: string; lastName: string } } }, type: "firstNameOnly" | "lastNameOnly" | "fullName" | "username" | "initials" = "fullName"): string {

	const metadata = user.metadata;
	if (!metadata) {
		return user.name;
	}

	const name = metadata.name;
	if (!name) {
		return user.name;
	}

	const firstName = name.firstName;
	const lastName = name.lastName;
	if (!firstName || !lastName) {
		return user.name;
	}

	switch (type) {
		case "firstNameOnly":
			return firstName;
		case "lastNameOnly":
			return lastName;
		case "fullName":
			return `${firstName} ${lastName}`;
		case "username":
			return user.name;
		case "initials":
			return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
	}
}

export function getGreeting(
	user: User & { metadata: { name: { firstName: string; lastName: string } } },
	todayAttendance: Omit<Attendance, "_id">[] | null,
	totalMembers: number,
	locale: ReturnType<typeof useTranslations<"DashboardHome">>
): GreetingData {
	const attendanceRate = (todayAttendance?.length ?? 0) / (totalMembers || 1);
	const description = attendanceRate < 0.5
		? locale("Header.NoActivityYet")
		: locale("Header.EverythingIsGoingWell");

	const name = getUserName(user, "fullName");

	const currentHour = dayjs().hour();
	if (currentHour < 12) {
		return {
			greeting: locale("Header.Greeting.Morning", { name }),
			description,
			icon: Sun,
		};
	}
	if (currentHour < 18) {
		return {
			greeting: locale("Header.Greeting.Afternoon", { name }),
			description,
			icon: SunDim,
		};
	}
	return {
		greeting: locale("Header.Greeting.Evening", { name }),
		description,
		icon: Moon,
	};
}

export function calculateStats(
	todayAttendance: Omit<Attendance, "_id">[] | null,
	yesterdayAttendance: Omit<Attendance, "_id">[] | null,
	totalMembers: number,
	scheduledTimeOff: any[] | undefined,
	locale: ReturnType<typeof useTranslations<"DashboardHome">>
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
			title: locale("Stats.ActiveMembersCard.Title"),
			value: `${todayAttendanceCount} / ${totalMembers}`,
			description: locale("Stats.ActiveMembersCard.MoreThanYesterday", { amount: Math.abs(attendanceDifference), moreOrLess: attendanceDifference >= 0 ? locale("Stats.ActiveMembersCard.More") : locale("Stats.ActiveMembersCard.Less") }),
			icon: Users,
			trend:
				attendanceDifference > 0
					? ("up" as const)
					: attendanceDifference <= 0
						? ("down" as const)
						: ("neutral" as const),
		},
		{
			id: "average-hours-today",
			title: locale("Stats.AverageHoursTodayCard.Title"),
			value: `${averageHoursToday.toFixed(1)}h`,
			description: locale("Stats.AverageHoursTodayCard.Description", { amount: todayAttendanceCount }),
			icon: Clock,
			trend: attendanceDifference > 0 ? "up" as const : attendanceDifference <= 0 ? "down" as const : "neutral" as const,
		},
		{
			id: "attendance-rate",
			title: locale("Stats.AttendanceRateCard.Title"),
			value: `${attendanceRate.toFixed(1)}%`,
			description: locale("Stats.AttendanceRateCard.Description", { amount: Math.abs(attendanceDifference), moreOrLess: attendanceDifference >= 0 ? locale("Stats.AttendanceRateCard.More") : locale("Stats.AttendanceRateCard.Less") }),
			icon: BarChart,
			trend:
				attendanceDifference > 0
					? ("up" as const)
					: attendanceDifference <= 0
						? ("down" as const)
						: ("neutral" as const),
		},
		{
			id: "scheduled-today",
			title: locale("Stats.ScheduledTodayCard.Title"),
			value: `${scheduledTimeOff?.length ?? 0}`,
			description: locale("Stats.ScheduledTodayCard.Description", { amount: scheduledTimeOff?.length ?? 0 }),
			icon: Calendar,
			trend: scheduledTimeOff?.length ?? 0 > 0 ? "up" as const : scheduledTimeOff?.length ?? 0 <= 0 ? "down" as const : "neutral" as const,
		},
	];
}

