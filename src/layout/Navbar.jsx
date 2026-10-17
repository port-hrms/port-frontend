// @ts-nocheck

import { useEffect, useRef, useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const ROLE_STYLES = {
    admin: "bg-ocean-50 text-ocean-700 ring-ocean-200",
    hr: "bg-ocean-50 text-ocean-700 ring-ocean-200",
    employee: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const ICON_BTN = "p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-ocean-50 hover:text-ocean-700 hover:border-ocean-200 transition-colors";

// Pure utility — no component state dependency, defined outside to avoid rebuild on every render
const formatTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    });
};

export default function Navbar({ activeLabel, onToggleSidebar }) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const containerRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const { data } = await API.get("/notifications", { params: { limit: 6 } });
            setNotifications(Array.isArray(data?.data) ? data.data : []);
        } catch {
            // silent
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await API.patch("/notifications/read-all");
            fetchNotifications();
        } catch {
            // silent
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter((note) => !note.isRead).length;

    return (
        <header className="bg-white/90 backdrop-blur border-b border-slate-200/70 px-4 lg:px-7 py-3 flex items-center gap-3 lg:gap-4 shrink-0">
            <button
                onClick={onToggleSidebar}
                aria-label="Toggle sidebar"
                className={ICON_BTN}
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div className="flex-1 min-w-0">
                <nav className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <span>HR Management</span>
                    <ChevronRight size={12} />
                    <span className="text-ocean-600">{activeLabel}</span>
                </nav>
                <h1 className="text-base lg:text-lg font-bold text-navy-900 truncate leading-tight">{activeLabel}</h1>
            </div>

            {/* Location tag */}
            <span className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-semibold tracking-wide text-slate-500">
                <MapPin size={13} className="text-ocean-500" />
                Paradeep Port · Odisha
            </span>

            {/* Role badge */}
            <span className={`hidden sm:inline-flex px-2.5 py-1 rounded-lg ring-1 text-xs font-semibold capitalize ${ROLE_STYLES[user?.role] || ROLE_STYLES.admin}`}>
                {user?.role}
            </span>

            {/* Notification Bell */}
            <div className="relative" ref={containerRef}>
                <button
                    onClick={() => {
                        const nextOpen = !open;
                        setOpen(nextOpen);
                        if (!open) fetchNotifications();
                    }}
                    aria-label="Notifications"
                    className={ICON_BTN}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                </button>
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-port-red rounded-full border-2 border-white" />
                )}

                {open && (
                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-navy-900">Notifications</p>
                                <p className="text-xs text-slate-400">Latest updates</p>
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs font-bold text-ocean-600 hover:text-ocean-700 transition-colors"
                                >
                                    Mark all
                                </button>
                            )}
                        </div>

                        {notifications.length > 0 ? (
                            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                {notifications.map((note) => (
                                    <div key={note._id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{note.title}</p>
                                                <p className="text-xs text-slate-500 mt-1 leading-5 line-clamp-2">{note.message}</p>
                                                <p className="text-[11px] text-slate-400 mt-2">{formatTime(note.createdAt)}</p>
                                            </div>
                                            {!note.isRead && (
                                                <span className="mt-1 h-2 w-2 rounded-full bg-ocean-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center text-slate-400">
                                <div className="text-2xl mb-2">🔔</div>
                                <p className="text-sm font-medium">No notifications</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}
