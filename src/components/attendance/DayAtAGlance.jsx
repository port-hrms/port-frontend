// @ts-nocheck
// Real figures for the selected day — nothing is filled in when there's no data.
import { useMemo } from "react";
import { AlarmClockOff, Clock3, Home, LogIn, LogOut, Timer } from "lucide-react";
import useAttendancePolicy from "../../hooks/useAttendancePolicy";
import { WORKING_STATUSES, formatClockTime, formatDuration, minutesOf } from "./timeUtils";

function Figure({ icon, label, value, sub, tone = "text-navy-900" }) {
    const Icon = icon;
    return (
        <div className="min-w-0 rounded-xl border border-slate-200 px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Icon size={14} className="text-ocean-600" /> {label}</p>
            <p className={`mt-1 truncate text-lg font-bold tabular-nums ${tone}`}>{value}</p>
            {sub && <p className="truncate text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

export default function DayAtAGlance({ records = [], isToday }) {
    const policy = useAttendancePolicy();

    const stats = useMemo(() => {
        const working = records.filter((r) => !r.unmarked && WORKING_STATUSES.includes(r.status) && r.checkIn);
        const ins = working.map((r) => minutesOf(r.checkIn)).filter((m) => m !== null);
        const outs = working.map((r) => minutesOf(r.checkOut)).filter((m) => m !== null);
        const completed = working.filter((r) => r.checkOut && r.hoursWorked > 0);
        const late = working.filter((r) => r.status === "Late");
        const shiftStart = minutesOf(policy.shiftStart);
        const lateMinutes = late
            .map((r) => minutesOf(r.checkIn) - shiftStart)
            .filter((m) => Number.isFinite(m) && m > 0);

        const earliest = working.find((r) => minutesOf(r.checkIn) === Math.min(...ins));
        const latest = working.find((r) => minutesOf(r.checkOut) === Math.max(...outs));

        return {
            count: working.length,
            firstIn: ins.length ? formatClockTime(earliest.checkIn) : null,
            firstInBy: earliest ? `${earliest.employee?.firstName || ""} ${earliest.employee?.lastName || ""}`.trim() : "",
            lastOut: outs.length ? formatClockTime(latest.checkOut) : null,
            lastOutBy: latest ? `${latest.employee?.firstName || ""} ${latest.employee?.lastName || ""}`.trim() : "",
            avgMinutes: completed.length ? (completed.reduce((s, r) => s + Number(r.hoursWorked), 0) / completed.length) * 60 : null,
            completed: completed.length,
            late: late.length,
            avgLate: lateMinutes.length ? lateMinutes.reduce((a, b) => a + b, 0) / lateMinutes.length : 0,
            wfh: working.filter((r) => r.workMode === "WFH").length,
            stillIn: working.filter((r) => !r.checkOut && !r.missedCheckOut).length,
            missed: records.filter((r) => r.missedCheckOut).length,
        };
    }, [records, policy.shiftStart]);

    return (
        <section className="panel p-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-bold text-navy-900">Day at a glance</h3>
                <p className="text-xs text-slate-500">Shift {policy.shiftStart} – {policy.shiftEnd} · late after {policy.lateAfter}</p>
            </div>

            {stats.count === 0 ? (
                <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                    Nobody has checked in on this date yet.
                </p>
            ) : (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    <Figure icon={LogIn} label="First in" value={stats.firstIn || "—"} sub={stats.firstInBy} />
                    <Figure icon={LogOut} label="Last out" value={stats.lastOut || "—"} sub={stats.lastOut ? stats.lastOutBy : isToday ? "No one has left yet" : "No check-outs"} />
                    <Figure
                        icon={Timer}
                        label="Average hours"
                        value={stats.avgMinutes != null ? formatDuration(stats.avgMinutes) : "—"}
                        sub={`${stats.completed} completed day${stats.completed === 1 ? "" : "s"}`}
                    />
                    <Figure
                        icon={Clock3}
                        label="Late"
                        value={stats.late}
                        sub={stats.late ? `avg ${Math.round(stats.avgLate)} min after ${policy.shiftStart}` : "Everyone on time"}
                        tone={stats.late ? "text-amber-700" : "text-navy-900"}
                    />
                    <Figure icon={Home} label="Working from home" value={stats.wfh} sub={`of ${stats.count} checked in`} />
                    <Figure
                        icon={AlarmClockOff}
                        label={isToday ? "Still checked in" : "Missed check-outs"}
                        value={isToday ? stats.stillIn : stats.missed}
                        sub={isToday ? "Haven't checked out yet" : stats.missed ? "Need fixing" : "None"}
                        tone={!isToday && stats.missed ? "text-amber-700" : "text-navy-900"}
                    />
                </div>
            )}
        </section>
    );
}
