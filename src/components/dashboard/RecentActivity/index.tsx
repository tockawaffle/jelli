import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "convex/react";
import { useMemo, useState } from "react";
import { api } from "../../../../convex/_generated/api";
import { ActivityListItem } from "./ActivityListItem";
import { AttendanceDetailModal } from "./AttendanceDetailModal";
import { chipStyles } from "./constants";
import { buildViewFromRow } from "./helpers";
import type { Attendance, Member, RecentActivityProps, ViewItem } from "./types";

export default function RecentActivity({ orgInfo, orgMembers, todayAttendance, userRole }: RecentActivityProps) {
	const members = orgMembers ?? [];
	const [selectedUser, setSelectedUser] = useState<{ attendance: Attendance; member: Member } | null>(null);

	const isAdmin = ["admin", "owner"].includes(userRole || "");

	// Fetch image URLs for all members with storage IDs
	const memberImagesQueries = members.map(m => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		return useQuery(api.files.get, m.image && m.image !== "" ? { storageId: m.image as any } : "skip");
	});

	// Create a map of userId to image URL
	const imageUrlMap = useMemo(() => {
		const map = new Map<string, string>();
		members.forEach((m, index) => {
			const imageData = memberImagesQueries[index];
			if (imageData?.url) {
				map.set(m.userId, imageData.url);
			}
		});
		return map;
	}, [members, memberImagesQueries]);

	const attendanceByUserId = new Map<string, Attendance>();
	for (const row of todayAttendance) attendanceByUserId.set(row.userId, row);

	const handleUserClick = (member: Member) => {
		if (!isAdmin) return;
		const attendance = attendanceByUserId.get(member.userId);
		if (attendance) {
			// Use the resolved image URL instead of storage ID
			const memberWithImageUrl = {
				...member,
				image: imageUrlMap.get(member.userId) || member.image
			};
			setSelectedUser({ attendance, member: memberWithImageUrl });
		}
	};

	const items: ViewItem[] = [];
	if (members.length > 0) {
		for (const m of members) {
			const row = attendanceByUserId.get(m.userId);
			const imageUrl = imageUrlMap.get(m.userId) || null;
			if (row) items.push(buildViewFromRow(row, m.name ?? undefined, imageUrl));
			else
				items.push({
					key: m.userId,
					name: m.name ?? "",
					subtitle: "No activity yet",
					chipLabel: "No activity",
					chipClass: chipStyles.pending,
					timeText: undefined,
					sortKey: 0,
					image: imageUrl,
				});
		}
	} else {
		for (const row of todayAttendance) {
			const member = members.find(m => m.userId === row.userId);
			const imageUrl = member ? imageUrlMap.get(member.userId) || null : null;
			items.push(buildViewFromRow(row, member?.name ?? undefined, imageUrl));
		}
	}

	items.sort((a, b) => b.sortKey - a.sortKey);

	return (
		<>
			<AttendanceDetailModal
				isOpen={!!selectedUser}
				onClose={() => setSelectedUser(null)}
				attendance={selectedUser?.attendance || null}
				member={selectedUser?.member || null}
			/>

			<Card className="min-h-[180px] h-full">
				<CardHeader>
					<CardTitle>Recent Team Activity</CardTitle>
				</CardHeader>
				<CardContent>
					<ScrollArea className="max-h-64 md:max-h-80 pr-1 gap-2">
						<div className="divide-y">
							{items.map((it) => {
								const member = members.find(m => m.userId === it.key);
								const hasAttendance = member && attendanceByUserId.has(member.userId);
								return (
									<ActivityListItem
										key={it.key}
										item={it}
										isClickable={isAdmin && !!hasAttendance}
										onClick={() => member && hasAttendance && handleUserClick(member)}
									/>
								);
							})}
						</div>
					</ScrollArea>
				</CardContent>
			</Card>
		</>
	);
}

