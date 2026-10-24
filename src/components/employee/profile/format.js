// Formatting helpers and status colours for the profile tabs
export const fmtDate = (d, opts = { day: "2-digit", month: "short", year: "numeric" }) =>
    d ? new Date(d).toLocaleDateString("en-IN", opts) : "—";
export const fmtMoney = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const TONES = {
    Present: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Late: "bg-amber-50 text-amber-700 ring-amber-200",
    Pending: "bg-amber-50 text-amber-700 ring-amber-200",
    "In Progress": "bg-ocean-50 text-ocean-700 ring-ocean-200",
    Processed: "bg-ocean-50 text-ocean-700 ring-ocean-200",
    "On Leave": "bg-ocean-50 text-ocean-700 ring-ocean-200",
    "Half Day": "bg-orange-50 text-orange-700 ring-orange-200",
    Absent: "bg-rose-50 text-rose-700 ring-rose-200",
    Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
    Hold: "bg-rose-50 text-rose-700 ring-rose-200",
    Draft: "bg-slate-100 text-slate-600 ring-slate-200",
    Cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
    Inactive: "bg-slate-100 text-slate-600 ring-slate-200",
};
