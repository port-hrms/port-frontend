// @ts-nocheck
// client/src/components/payroll/StatsCards.jsx

import { FaCheckCircle, FaClock, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import { MONTHS, fmt } from "./constants";

export default function StatsCards({ stats, selectedMonth, selectedYear }) {
    if (!stats) return null;

    const cards = [
        { label: "Total Payroll", value: fmt(stats.totalPayroll), icon: <FaMoneyBillWave className="text-2xl" />, style: "bg-ocean-50 border-ocean-200 text-ocean-700" },
        { label: "Total Paid", value: fmt(stats.totalPaid), icon: <FaCheckCircle className="text-2xl" />, style: "bg-emerald-50 border-emerald-200 text-emerald-700" },
        { label: "Pending", value: fmt(stats.totalPending), icon: <FaClock className="text-2xl" />, style: "bg-amber-50 border-amber-200 text-amber-700" },
        { label: "Employees Paid", value: `${stats.paidCount} / ${stats.totalRecords}`, icon: <FaUsers className="text-2xl" />, style: "bg-navy-50 border-navy-200 text-navy-700" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => (
                <div key={c.label} className={`rounded-2xl border p-5 ${c.style} shadow-sm`}>
                    <div className="mb-2">{c.icon}</div>
                    <div className="text-2xl font-bold">{c.value}</div>
                    <div className="text-xs font-bold opacity-80 mt-1">{c.label}</div>
                    <div className="text-xs opacity-60 mt-0.5">{MONTHS[selectedMonth - 1]} {selectedYear}</div>
                </div>
            ))}
        </div>
    );
}
