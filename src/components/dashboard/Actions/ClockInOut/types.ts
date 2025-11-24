import type { Attendance } from "@/lib/helpers/plugins/server/attendance";
export type ClockInOutMethod = "qr" | "request" | "nfc";

export type RequestType =
	| "ClockIn"
	| "ClockOut"
	| "LunchStart"
	| "LunchEnd"
	| "TimeOff";

export type LocationStatus = "idle" | "checking" | "granted" | "denied" | "error";

export type AttendanceStatus =
	| "NONE"
	| "TBR"
	| "CLOCKED_IN"
	| "LUNCH_BREAK_STARTED"
	| "LUNCH_BREAK_ENDED"
	| "CLOCKED_OUT";

export type ControlledProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Optional error message to render inside the modal/sheet */
	error?: string | null;
	userRole: string;
	hasRegisteredDevice?: boolean;
	attendance: Omit<Attendance, "_id">[];
};

export type AttendanceRow = {
	status?: AttendanceStatus;
	clock_in?: string;
	lunch_break_out?: string;
	clocked_out?: string;
} | null;

export type UserLocation = {
	latitude: number;
	longitude: number;
	accuracy: number;
} | null;

