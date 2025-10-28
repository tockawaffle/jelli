import { authClient } from "@/lib/auth-client";
import type { Attendance } from "@/lib/helpers/plugins/server/attendance";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export function useAttendanceData() {
	const [todayAttendance, setTodayAttendance] = useState<Omit<Attendance, "_id">[] | null>(null);
	const [yesterdayAttendance, setYesterdayAttendance] = useState<Omit<Attendance, "_id">[] | null>(null);

	const { data: attendance, error: attendanceError, isPending: isLoadingAttendance, refetch: refetchAttendance } = authClient.useGetAttendance();

	useEffect(() => {
		if (isLoadingAttendance) return;
		if (attendanceError) {
			console.error("Failed to fetch attendance:", attendanceError);
			return;
		}

		if (!attendance) return;

		const today = dayjs().startOf('day');
		const todayRecords = attendance.filter(a => dayjs(a.date).isSame(today.toISOString(), 'day'));
		const yesterdayRecords = attendance.filter(a => dayjs(a.date).isSame(today.subtract(1, 'day').toISOString(), 'day'));

		console.log("attendance", attendance);
		console.log("today", today.toISOString());
		console.log("yesterday", today.subtract(1, 'day').toISOString());
		console.log("todayRecords", todayRecords);
		console.log("yesterdayRecords", yesterdayRecords);

		setTodayAttendance(todayRecords);
		setYesterdayAttendance(yesterdayRecords);
	}, [
		attendance,
		attendanceError,
		isLoadingAttendance,
		refetchAttendance,
	])

	return { todayAttendance, yesterdayAttendance };
}

