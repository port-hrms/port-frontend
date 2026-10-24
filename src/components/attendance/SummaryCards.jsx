// @ts-nocheck
// client/src/components/attendance/SummaryCards.jsx
// Summary for the selected date (not always "today").

import { FaCheckCircle, FaTimesCircle, FaUmbrellaBeach, FaClock, FaChartPie, FaUserClock } from "react-icons/fa";

export default function SummaryCards({ summary, isToday }) {
    if (!summary) return null;

    const when = isToday
        ? "today"
        : new Date(`${summary.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    const cards = [
        { label: "Present", value: summary.present + summary.halfDay, sub: summary.halfDay ? `${summary.halfDay} half day` : null, icon: <FaCheckCircle className="text-2xl" />, style: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        { label: "Late", value: summary.late, icon: <FaClock className="text-2xl" />, style: "bg-navy-50 border-navy-200 text-navy-700" },
        { label: "Absent", value: summary.absent, icon: <FaTimesCircle className="text-2xl" />, style: "bg-red-50 border-red-200 text-red-600" },
        { label: "On Leave", value: summary.onLeave, icon: <FaUmbrellaBeach className="text-2xl" />, style: "bg-amber-50 border-amber-200 text-amber-700" },
        { label: "Not marked", value: summary.notMarked, icon: <FaUserClock className="text-2xl" />, style: summary.notMarked > 0 ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-slate-50 border-slate-200 text-slate-500" },
        { label: "Attendance", value: summary.isOffDay ? "—" : `${summary.attendanceRate}%`, sub: `of ${summary.totalEmployees} employees`, icon: <FaChartPie className="text-2xl" />, style: "bg-ocean-50 border-ocean-200 text-ocean-700" },
    ];

    return (
        <div className="space-y-3">
            {summary.isOffDay && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                    <span className="font-semibold">{summary.offDayReason}.</span> Nobody is expected to work, so unmarked employees aren't counted.
                </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {cards.map((c) => (
                    <div key={c.label} className={`rounded-2xl border p-4 ${c.style} shadow-sm`}>
                        <div className="mb-1">{c.icon}</div>
                        <div className="text-2xl font-bold tabular-nums">{c.value}</div>
                        <div className="text-xs font-bold opacity-80 mt-0.5">{c.label} {when}</div>
                        {c.sub && <div className="text-[11px] opacity-70">{c.sub}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
}
