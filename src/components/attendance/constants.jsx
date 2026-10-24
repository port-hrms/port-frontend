// @ts-nocheck
// client/src/components/attendance/constants.jsx
// Shared constants, style maps, and helpers for the Attendance module

export const STATUS_OPTIONS = ["Present", "Absent", "On Leave", "Half Day", "Late"];
// Same leave types as leave requests
export const LEAVE_TYPES = ["", "Sick Leave", "Casual Leave", "Earned Leave", "Maternity Leave", "Special Leave", "Unpaid Leave"];
export { WORKING_STATUSES, todayIST, nowTimeIST, to24h, formatClockTime } from "./timeUtils";

export const STATUS_STYLES = {
    Present: "bg-emerald-100 text-emerald-700",
    Absent: "bg-red-100 text-red-600",
    "On Leave": "bg-amber-100 text-amber-700",
    "Half Day": "bg-ocean-100 text-ocean-600",
    Late: "bg-navy-100 text-navy-600",
};


export const toDateInput = (d) => new Date(d).toISOString().split("T")[0];
export const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

// ─── Reusable field label ──────────────────────────────────────
export const FieldLabel = ({ label, required }) => (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
    </label>
);
