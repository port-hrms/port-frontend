// @ts-nocheck
// client/src/components/attendance/SummaryCards.jsx

import { FaCheckCircle, FaTimesCircle, FaUmbrellaBeach, FaClock, FaChartPie } from "react-icons/fa";

export default function SummaryCards({ summary }) {
    if (!summary) return null;

    const cards = [
        { label: "Present", value: summary.present, icon: <FaCheckCircle className="text-2xl" />, style: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        { label: "Absent", value: summary.absent, icon: <FaTimesCircle className="text-2xl" />, style: "bg-red-50 border-red-200 text-red-600" },
        { label: "On Leave", value: summary.onLeave, icon: <FaUmbrellaBeach className="text-2xl" />, style: "bg-amber-50 border-amber-200 text-amber-700" },
        { label: "Late", value: summary.late, icon: <FaClock className="text-2xl" />, style: "bg-navy-50 border-navy-200 text-navy-700" },
        { label: "Attendance", value: `${summary.attendanceRate}%`, icon: <FaChartPie className="text-2xl" />, style: "bg-ocean-50 border-ocean-200 text-ocean-700" },
    ];

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((c) => (
                <div key={c.label} className={`rounded-2xl border p-4 ${c.style} shadow-sm`}>
                    <div className="mb-1">{c.icon}</div>
                    <div className="text-2xl font-bold">{c.value}</div>
                    <div className="text-xs font-bold opacity-80 mt-0.5">{c.label} Today</div>
                </div>
            ))}
        </div>
    );
}
