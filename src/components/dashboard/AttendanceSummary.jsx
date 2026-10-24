// @ts-nocheck
// client/src/components/dashboard/AttendanceSummary.jsx
// ─────────────────────────────────────────────────────────────

const STATUSES = [
    { key: "present", label: "Present", dot: "bg-port-green", text: "text-port-green" },
    { key: "late", label: "Late", dot: "bg-port-amber", text: "text-amber-600" },
    { key: "absent", label: "Absent", dot: "bg-port-red", text: "text-port-red" },
    { key: "onLeave", label: "On Leave", dot: "bg-ocean-500", text: "text-ocean-600" },
    { key: "halfDay", label: "Half Day", dot: "bg-navy-600", text: "text-navy-600" },
];

export default function AttendanceSummary({ attendance }) {
    const total = STATUSES.reduce((sum, s) => sum + (attendance[s.key] || 0), 0);

    return (
        <div className="panel p-6">
            <div className="mb-5">
                <h3 className="text-[15px] font-bold text-navy-900">Today's Attendance</h3>
                <p className="text-xs text-slate-500 mt-0.5">Status breakdown for today</p>
            </div>

            {/* Distribution bar */}
            <div
                className="mb-5 flex h-2 w-full overflow-hidden rounded-full bg-slate-100"
                role="img"
                aria-label={total > 0 ? STATUSES.map((s) => `${s.label} ${attendance[s.key] || 0}`).join(", ") : "No attendance marked yet"}
            >
                {total > 0 && STATUSES.map((s) => {
                    const count = attendance[s.key] || 0;
                    return count > 0 ? (
                        <div key={s.key} className={`${s.dot} h-full`} style={{ width: `${(count / total) * 100}%` }} title={`${s.label}: ${count}`} />
                    ) : null;
                })}
            </div>

            <div className="divide-y divide-slate-100">
                {STATUSES.map((s) => (
                    <div key={s.key} className="flex items-center gap-3 py-2.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                        <span className="text-sm font-medium text-slate-600">{s.label}</span>
                        <span className="ml-auto text-xs text-slate-500 tabular-nums">
                            {total > 0 ? `${Math.round(((attendance[s.key] || 0) / total) * 100)}%` : "—"}
                        </span>
                        <span className={`w-8 text-right text-sm font-bold tabular-nums ${s.text}`}>{attendance[s.key] || 0}</span>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Total marked today</span>
                <span className="text-sm font-bold text-navy-900 tabular-nums">{total}</span>
            </div>
        </div>
    );
}
