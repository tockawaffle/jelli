import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { Attendance } from "@/lib/helpers/plugins/server/attendance";
import dayjs from "dayjs";
import { Clock, Coffee, LogIn, LogOut, Timer } from "lucide-react";
import { formatDuration, isValidDate } from "./helpers";
import type { Member } from "./types";

type AttendanceDetailModalProps = {
	isOpen: boolean;
	onClose: () => void;
	attendance: Omit<Attendance, "_id"> | null;
	member: Member | null;
};

export function AttendanceDetailModal({ isOpen, onClose, attendance, member }: AttendanceDetailModalProps) {
	if (!attendance || !member) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<Avatar className="h-12 w-12">
							{member.image ? (
								<AvatarImage src={member.image} alt={member.name || "Avatar"} />
							) : (
								<AvatarImage alt="Avatar" />
							)}
							<AvatarFallback>
								{(member.name || "").split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "AB"}
							</AvatarFallback>
						</Avatar>
						<div>
							<DialogTitle>{member.name || "User"}</DialogTitle>
							<DialogDescription>
								Attendance details for {dayjs(attendance.date).format("MMMM D, YYYY")}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6 mt-4">
					{/* Status Badge */}
					<div className="flex items-center justify-between">
						<span className="text-sm font-medium text-muted-foreground">Status</span>
						<Badge variant={attendance.status === "CLOCKED_OUT" ? "outline" : "default"}>
							{attendance.status.replace(/_/g, " ")}
						</Badge>
					</div>

					<Separator />

					{/* Time Entries */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold flex items-center gap-2">
							<Clock className="h-4 w-4" />
							Time Entries
						</h4>

						{/* Clock In */}
						<div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
							<div className="flex items-center gap-2">
								<LogIn className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium">Clock In</span>
								{attendance.wasLate && (
									<Badge variant="destructive" className="text-xs">Late</Badge>
								)}
							</div>
							<span className="text-sm font-mono">{dayjs(attendance.clockIn).format("h:mm A")}</span>
						</div>

						{/* Lunch Break */}
						{isValidDate(attendance.lunchBreakOut) && (
							<div className="space-y-2">
								<div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
									<div className="flex items-center gap-2">
										<Coffee className="h-4 w-4 text-accent" />
										<span className="text-sm font-medium">Lunch Break Start</span>
									</div>
									<span className="text-sm font-mono">{dayjs(attendance.lunchBreakOut).format("h:mm A")}</span>
								</div>
								{isValidDate(attendance.lunchBreakReturn) && (
									<div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
										<div className="flex items-center gap-2">
											<Coffee className="h-4 w-4 text-accent" />
											<span className="text-sm font-medium">Lunch Break End</span>
										</div>
										<span className="text-sm font-mono">{dayjs(attendance.lunchBreakReturn).format("h:mm A")}</span>
									</div>
								)}
							</div>
						)}

						{/* Clock Out */}
						{isValidDate(attendance.clockOut) && (
							<div className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
								<div className="flex items-center gap-2">
									<LogOut className="h-4 w-4 text-destructive" />
									<span className="text-sm font-medium">Clock Out</span>
									{attendance.earlyOut && (
										<Badge variant="outline" className="text-xs">Early</Badge>
									)}
								</div>
								<span className="text-sm font-mono">{dayjs(attendance.clockOut).format("h:mm A")}</span>
							</div>
						)}
					</div>

					<Separator />

					{/* Summary */}
					<div className="space-y-4">
						<h4 className="text-sm font-semibold flex items-center gap-2">
							<Timer className="h-4 w-4" />
							Time Summary
						</h4>

						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
								<p className="text-xs text-muted-foreground mb-1">Total Work Time</p>
								<p className="text-2xl font-bold text-primary">{formatDuration(attendance.totalWorkSeconds)}</p>
							</div>
							<div className="p-4 bg-accent/5 rounded-lg border border-accent/10">
								<p className="text-xs text-muted-foreground mb-1">Break Time</p>
								<p className="text-2xl font-bold text-accent">{formatDuration(attendance.totalBreakSeconds)}</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* Additional Info */}
					<div className="space-y-3">
						<h4 className="text-sm font-semibold">Additional Information</h4>
						<div className="grid grid-cols-2 gap-3 text-sm">
							<div>
								<span className="text-muted-foreground">Role:</span>
								<span className="ml-2 font-medium">{attendance.role}</span>
							</div>
							<div>
								<span className="text-muted-foreground">Updates:</span>
								<span className="ml-2 font-medium">{attendance.timesUpdated}</span>
							</div>
						</div>
					</div>

					{/* Operations Log */}
					{attendance.operation.length > 0 && (
						<>
							<Separator />
							<div className="space-y-3">
								<h4 className="text-sm font-semibold">Operation Log</h4>
								<div className="space-y-2">
									{attendance.operation.map((op, idx) => (
										<div key={idx} className="flex items-center justify-between text-xs py-2 px-3 bg-muted/30 rounded">
											<Badge variant="outline" className="text-xs">
												{op.type.toUpperCase()}
											</Badge>
											<span className="text-muted-foreground font-mono">
												{dayjs(op.createdAt).format("h:mm:ss A")}
											</span>
										</div>
									))}
								</div>
							</div>
						</>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}

