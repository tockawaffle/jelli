/**
 * @description The status of the user's activity. Check the user's card for more detailed information such as the time of the activity, if it's a late clock-in, etc.
 * @enum {string}
 */
export enum ActivityStatus {
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
export const chipStyles: Record<string, string> = {
	onTime: "rounded-full px-2.5 py-0.5 text-xs font-medium border text-muted-foreground",
	approved: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-foreground text-background",
	break: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-foreground",
	late: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-500 text-white",
	pending: "rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground",
};

