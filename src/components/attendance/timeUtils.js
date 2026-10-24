// Date/time helpers for attendance screens (India time)

// Statuses that have check-in / check-out times
export const WORKING_STATUSES = ["Present", "Late", "Half Day"];

/** Today as YYYY-MM-DD in India time (not the browser's or UTC date). */
export const todayIST = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
/** Current time as "HH:mm" (24h) in India time — for <input type="time">. */
export const nowTimeIST = () => new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false });

/** "10:05 AM" → "10:05", "6:30 PM" → "18:30" (what <input type="time"> needs). */
export const to24h = (time) => {
    if (!time) return "";
    const m = String(time).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!m) return "";
    let h = Number(m[1]);
    const mer = m[3]?.toUpperCase();
    if (mer === "PM" && h !== 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2, "0")}:${m[2]}`;
};

/** Minutes since midnight for "10:05 AM" / "18:30"; null if unreadable. */
export const minutesOf = (time) => {
    const t = to24h(time);
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

/**
 * The one way attendance times are shown: "10:05 AM".
 * Accepts stored "10:05 AM", 24h "18:30" or an old ISO timestamp (shown in IST). Empty → "—".
 */
export const formatClockTime = (time) => {
    if (!time) return "—";
    const value = String(time).trim();
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
        const d = new Date(value);
        return Number.isNaN(d.getTime())
            ? "—"
            : d.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
    }
    const mins = minutesOf(value);
    if (mins === null) return value;
    const h24 = Math.floor(mins / 60);
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${h12}:${String(mins % 60).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
};

/** "7h 45m" from minutes. */
export const formatDuration = (minutes) => {
    const m = Math.max(0, Math.round(minutes || 0));
    return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};
