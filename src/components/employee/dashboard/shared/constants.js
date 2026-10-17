// @ts-nocheck

export const STATUS_STYLES = {
  Present: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  Late: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  "Half Day": { bg: "bg-ocean-100", text: "text-ocean-700", dot: "bg-ocean-500" },
  "On Leave": { bg: "bg-navy-100", text: "text-navy-700", dot: "bg-navy-500" },
  Absent: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
  "Not Marked": { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  WFH: { bg: "bg-teal-100", text: "text-teal-700", dot: "bg-teal-500" },
};

export const GRADE_CONFIG = {
  Excellent: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", bar: "bg-emerald-500", emoji: "🌟" },
  Good: { color: "text-ocean-600", bg: "bg-ocean-50", border: "border-ocean-200", bar: "bg-ocean-500", emoji: "👍" },
  Average: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", bar: "bg-amber-500", emoji: "📊" },
  "Needs Improvement": { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", bar: "bg-orange-500", emoji: "📈" },
  Poor: { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", bar: "bg-red-500", emoji: "⚠️" },
};

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const QUICK_LINKS = [
  { icon: "📅", label: "My Attendance", path: "attendance", color: "hover:bg-ocean-50 hover:border-ocean-200 hover:text-ocean-600" },
  { icon: "📈", label: "My Reviews", path: "performance", color: "hover:bg-navy-50 hover:border-navy-200 hover:text-navy-600" },
  { icon: "👤", label: "My Profile", path: "profile", color: "hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600" },
  { icon: "🏠", label: "Work From Home", path: "wfh", color: "hover:bg-teal-50 hover:border-teal-200 hover:text-teal-600" },
];
