// @ts-nocheck
export const AVATAR_COLORS = ["bg-navy-700", "bg-ocean-600", "bg-navy-600", "bg-ocean-500", "bg-port-teal", "bg-navy-500"];

export const STATUS_STYLES = {
    "Travelling": "bg-ocean-100 text-ocean-700",
    "At Client": "bg-emerald-100 text-emerald-700",
    "Break": "bg-amber-100 text-amber-700",
    "Checked In": "bg-navy-100 text-navy-700",
    "Checked Out": "bg-slate-100 text-slate-600",
    "Unknown": "bg-slate-100 text-slate-500",
};

export const STATUS_ICONS = {
    "Travelling": "🚗",
    "At Client": "🤝",
    "Break": "☕",
    "Checked In": "📍",
    "Checked Out": "🏠",
    "Unknown": "❓",
};

export const getAvatarColor = (name = "") =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

export const toDateInput = (d) => new Date(d).toISOString().split("T")[0];

export const timeAgo = (date) => {
    if (!date) return "Never";
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
};

export const formatTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
};
