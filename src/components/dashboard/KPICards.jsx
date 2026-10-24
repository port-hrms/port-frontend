// @ts-nocheck
// client/src/components/dashboard/KPICards.jsx
// ─────────────────────────────────────────────────────────────
// Any of the inputs can be null when its dashboard section failed to load;
// that card then shows "—" instead of breaking the row. Each card opens its module.

import { CalendarCheck, TrendingUp, Users, Wallet } from "lucide-react";
import { StatCard } from "./StatCard";

const fmt = (n) => (n || 0).toLocaleString("en-IN");
const fmtCurrency = (n) =>
    "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const UNAVAILABLE = { value: "—", sub: "Couldn't load" };

// "absent · 3 not marked", or the reason nobody is expected today
const attendanceDetail = (attendance, attention) => {
    const parts = [`${attendance.absent} absent`];
    const day = attention?.attendance;
    if (day && !day.isWorkingDay) parts.push(day.offReason);
    else if (day) parts.push(`${Math.max(day.expected - day.marked, 0)} not marked`);
    return parts.join(" · ");
};

const headcountChange = ({ joinedThisMonth = 0, leftThisMonth = 0 }) =>
    `+${joinedThisMonth} joined · ${leftThisMonth} left this month`;

export default function KPICards({ employees, attendance, payroll, performance, attention, setActiveTab, className = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" }) {
    const open = (tab) => (setActiveTab ? () => setActiveTab(tab) : undefined);

    return (
        <div className={`grid gap-4 ${className}`}>
            <StatCard
                icon={Users}
                label="Active Employees"
                onClick={open("employees")}
                {...(employees ? {
                    value: fmt(employees.active),
                    sub: headcountChange(employees),
                } : UNAVAILABLE)}
            />
            <StatCard
                icon={CalendarCheck}
                label="Today's Attendance"
                onClick={open("attendance")}
                {...(attendance ? {
                    value: fmt(attendance.present + attendance.late),
                    sub: attendanceDetail(attendance, attention),
                } : UNAVAILABLE)}
            />
            <StatCard
                icon={Wallet}
                label="Monthly Payroll"
                onClick={open("payroll")}
                {...(payroll ? {
                    value: fmtCurrency(payroll.totalExpense),
                    sub: `${payroll.paid} paid · ${payroll.pending} pending`,
                } : UNAVAILABLE)}
            />
            <StatCard
                icon={TrendingUp}
                label="Avg Performance"
                onClick={open("performance")}
                {...(performance ? {
                    value: `${performance.avgScore}%`,
                    sub: `${performance.totalReviews} reviews this year`,
                } : UNAVAILABLE)}
            />
        </div>
    );
}
