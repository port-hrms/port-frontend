// @ts-nocheck
// client/src/components/dashboard/KPICards.jsx
// ─────────────────────────────────────────────────────────────

import { CalendarCheck, TrendingUp, Users, Wallet } from "lucide-react";
import { StatCard } from "./StatCard";

const fmt = (n) => (n || 0).toLocaleString("en-IN");
const fmtCurrency = (n) =>
    "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function KPICards({ employees, attendance, payroll, performance, leaves }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
                icon={Users}
                label="Total Employees"
                value={fmt(employees.total)}
                sub={`${employees.active} active · ${employees.onLeave} on leave`}
            />
            <StatCard
                icon={CalendarCheck}
                label="Today's Attendance"
                value={fmt(attendance.present + attendance.late)}
                sub={`${attendance.absent} absent · ${leaves?.pendingRequests || 0} leave requests`}
            />
            <StatCard
                icon={Wallet}
                label="Monthly Payroll"
                value={fmtCurrency(payroll.totalExpense)}
                sub={`${payroll.paid} paid · ${payroll.pending} pending`}
            />
            <StatCard
                icon={TrendingUp}
                label="Avg Performance"
                value={`${performance.avgScore}%`}
                sub={`${performance.totalReviews} reviews this year`}
            />
        </div>
    );
}
