// @ts-nocheck
// client/src/components/attendance/SummaryCards.jsx
// One summary panel for the selected date: rate, distribution bar and counts.

const ITEMS = [
    { key: "present", label: "Present", status: "Present", dot: "bg-emerald-500", bar: "bg-emerald-500" },
    { key: "late", label: "Late", status: "Late", dot: "bg-amber-500", bar: "bg-amber-500" },
    { key: "halfDay", label: "Half day", status: "Half Day", dot: "bg-orange-400", bar: "bg-orange-400" },
    { key: "absent", label: "Absent", status: "Absent", dot: "bg-rose-500", bar: "bg-rose-500" },
    { key: "onLeave", label: "On leave", status: "On Leave", dot: "bg-ocean-500", bar: "bg-ocean-500" },
    { key: "notMarked", label: "Not marked", status: "Not marked", dot: "bg-slate-300", bar: "bg-slate-200" },
];

// onPick(status) filters the register; activeStatus highlights the chosen count
export default function SummaryCards({ summary, isToday, onPick, activeStatus }) {
    if (!summary) {
        return <div className="panel h-36 animate-pulse" aria-hidden="true" />;
    }

    const dateLabel = isToday
        ? "Today"
        : new Date(`${summary.date}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
    const total = summary.totalEmployees || 0;
    const attended = (summary.present || 0) + (summary.late || 0) + (summary.halfDay || 0);
    const pct = (v) => (total > 0 ? (v / total) * 100 : 0);

    return (
        <section className="panel p-5" aria-label="Attendance summary">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                {/* Headline */}
                <div className="shrink-0 lg:w-56 lg:border-r lg:border-slate-100 lg:pr-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Attendance · {dateLabel}</p>
                    {summary.isOffDay ? (
                        <>
                            <p className="mt-1 text-3xl font-bold text-slate-400">Off day</p>
                            <p className="mt-0.5 text-sm text-slate-500">{summary.offDayReason}</p>
                        </>
                    ) : (
                        <>
                            <p className="mt-1 text-3xl font-bold tabular-nums text-navy-900">
                                {summary.attendanceRate}<span className="text-xl text-slate-400">%</span>
                            </p>
                            <p className="mt-0.5 text-sm text-slate-500">{attended} of {total} employees came in</p>
                        </>
                    )}
                </div>

                {/* Distribution + counts */}
                <div className="min-w-0 flex-1">
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Attendance distribution">
                        {ITEMS.map((it) => (summary[it.key] > 0 ? (
                            <div key={it.key} className={`${it.bar} h-full`} style={{ width: `${pct(summary[it.key])}%` }} title={`${it.label}: ${summary[it.key]}`} />
                        ) : null))}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3 sm:grid-cols-6">
                        {ITEMS.map((it) => {
                            const value = summary[it.key] || 0;
                            const active = activeStatus === it.status;
                            return (
                                <button
                                    key={it.key}
                                    type="button"
                                    onClick={() => onPick?.(active ? "All" : it.status)}
                                    aria-pressed={active}
                                    title={active ? "Show everyone" : `Show only ${it.label.toLowerCase()}`}
                                    className={`rounded-lg px-2 py-1.5 text-left transition-colors ${active ? "bg-ocean-50 ring-1 ring-ocean-200" : "hover:bg-slate-50"}`}
                                >
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                        <span className={`h-2 w-2 rounded-full ${it.dot}`} /> {it.label}
                                    </span>
                                    <span className={`mt-0.5 block text-xl font-bold tabular-nums ${it.key === "notMarked" && value > 0 ? "text-slate-700" : "text-navy-900"}`}>
                                        {value}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {summary.isOffDay && (
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    Nobody is expected to work on an off day, so unmarked employees aren't counted.
                </p>
            )}
            {summary.missedCheckOut > 0 && !summary.isOffDay && (
                <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-amber-700">
                    {summary.missedCheckOut} missed check-out{summary.missedCheckOut === 1 ? "" : "s"} on this date need fixing.
                </p>
            )}
        </section>
    );
}
