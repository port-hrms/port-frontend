// @ts-nocheck
// Shared attendance utilities & constants

export const STATUS_TONE = {
    Present:      "bg-emerald-100 text-emerald-700",
    Late:         "bg-amber-100  text-amber-700",
    "Late Entry": "bg-amber-100  text-amber-700",
    Absent:       "bg-rose-100   text-rose-700",
    "On Leave":   "bg-ocean-100    text-ocean-700",
    "Half Day":   "bg-navy-100 text-navy-700",
    "Not Marked": "bg-slate-100  text-slate-600",
};

/**
 * Fallback shift values, used only until the real rules arrive from
 * GET /attendance/policy (see hooks/useAttendancePolicy). The server is the single source.
 */
export const SHIFT_START = "10:00 AM";
export const SHIFT_END = "5:30 PM";
export const SHIFT_TOTAL_MINUTES = 7 * 60 + 30;

export const monthInputFromDate = (date) => {
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

export const formatDate = (value) => {
    if (!value) return "--";
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    }).format(new Date(value));
};

/** Parse a time string and return total minutes since midnight */
export const parseMinutes = (timeString) => {
    if (!timeString) return null;
    const parts = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!parts) return null;
    let hours = parseInt(parts[1], 10);
    const minutes = parseInt(parts[2], 10);
    const period  = parts[3]?.toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
};

/**
 * Display status for a record. The status saved on the server is final
 * (it applies the shift rules at check-in, and admins may correct it),
 * so screens must not re-decide it from the check-in time.
 */
export const deriveStatus = (_checkIn, rawStatus) => (rawStatus === "Late Entry" ? "Late" : rawStatus);
