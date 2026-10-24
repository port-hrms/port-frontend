// @ts-nocheck
// client/src/components/dashboard/CelebrationsCard.jsx
// ─────────────────────────────────────────────────────────────
// Birthdays and work anniversaries for today and the next 6 days.

import { Award, Cake, PartyPopper } from "lucide-react";
import EmployeeAvatar from "@/components/employee/EmployeeAvatar";

const MAX_SHOWN = 5;

const whenLabel = (event) => {
    if (event.daysAway === 0) return "Today";
    if (event.daysAway === 1) return "Tomorrow";
    return new Date(event.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
};

const whatLabel = (event) =>
    event.type === "birthday"
        ? `Turns ${event.years}`
        : `${event.years} year${event.years === 1 ? "" : "s"} at work`;

export default function CelebrationsCard({ events = [] }) {
    const shown = events.slice(0, MAX_SHOWN);
    const hiddenCount = events.length - shown.length;

    return (
        <div className="panel px-5 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-lg bg-rose-50 text-port-red ring-1 ring-rose-100 flex items-center justify-center">
                        <PartyPopper size={16} />
                    </span>
                    <h3 className="text-[15px] font-bold text-navy-900">Celebrations This Week</h3>
                </div>
                {events.length > 0 && (
                    <span className="min-w-7 rounded-md bg-rose-50 px-2 py-0.5 text-center text-xs font-bold text-port-red tabular-nums">{events.length}</span>
                )}
            </div>

            {shown.length > 0 ? (
                <ul className="mt-4 space-y-2">
                    {shown.map((event) => {
                        const Icon = event.type === "birthday" ? Cake : Award;
                        const isToday = event.daysAway === 0;
                        return (
                            <li
                                key={`${event.type}-${event.employee._id}`}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${isToday ? "border-rose-100 bg-rose-50/60" : "border-slate-100 bg-slate-50/60"}`}
                            >
                                <EmployeeAvatar employee={event.employee} className="h-9 w-9 text-xs" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-navy-900">
                                        {event.employee.firstName} {event.employee.lastName}
                                    </p>
                                    <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                                        <Icon size={12} className={event.type === "birthday" ? "text-port-red" : "text-ocean-600"} />
                                        {whatLabel(event)}
                                    </p>
                                </div>
                                <span className={`shrink-0 text-xs font-semibold ${isToday ? "text-port-red" : "text-slate-500"}`}>
                                    {whenLabel(event)}
                                </span>
                            </li>
                        );
                    })}
                    {hiddenCount > 0 && <li className="text-center text-xs text-slate-500">+{hiddenCount} more this week</li>}
                </ul>
            ) : (
                <p className="mt-3 text-sm text-slate-500">No birthdays or work anniversaries this week.</p>
            )}
        </div>
    );
}
