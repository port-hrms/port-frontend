// @ts-nocheck
// client/src/components/dashboard/AttentionPanel.jsx
// ─────────────────────────────────────────────────────────────
// "Needs your attention": a to-do list of things an admin should act on, each
// row opening the place where it is handled. Shows an all-clear when there is nothing.

import { formatDistanceToNow } from "date-fns";
import {
    BriefcaseBusiness, CalendarClock, CalendarDays, CheckCircle2, ChevronRight, FileWarning,
    Laptop, ReceiptIndianRupee, RotateCw, UserRoundX, Wallet,
} from "lucide-react";

const TONES = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    ocean: "bg-ocean-50 text-ocean-700 ring-ocean-100",
};

const monthName = (month, year) =>
    new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-IN", { month: "long", timeZone: "UTC" });
const inr = (n) => "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
const shortDate = (d) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

function buildItems(attention, billing, setActiveTab, onOpenPendingLeaves) {
    const { pendingLeaves, pendingWfh, attendance, payroll, newApplications, contractsEnding } = attention;
    const open = (tab) => () => setActiveTab?.(tab);
    const items = [];

    if (pendingLeaves.count > 0) {
        items.push({
            key: "leaves", icon: CalendarClock, tone: "amber", count: pendingLeaves.count,
            label: `Leave ${pendingLeaves.count === 1 ? "request" : "requests"} to review`,
            detail: pendingLeaves.oldestAt && `Oldest waiting ${formatDistanceToNow(new Date(pendingLeaves.oldestAt))}`,
            onClick: onOpenPendingLeaves,
        });
    }
    if (pendingWfh.count > 0) {
        items.push({
            key: "wfh", icon: Laptop, tone: "amber", count: pendingWfh.count,
            label: `WFH ${pendingWfh.count === 1 ? "request" : "requests"} to review`,
            detail: pendingWfh.oldestAt && `Oldest waiting ${formatDistanceToNow(new Date(pendingWfh.oldestAt))}`,
            onClick: open("wfh"),
        });
    }
    if (attendance.isWorkingDay && attendance.marked < attendance.expected) {
        items.push({
            key: "attendance", icon: UserRoundX, tone: "rose", count: attendance.expected - attendance.marked,
            label: "Attendance not marked today",
            detail: `${attendance.marked} of ${attendance.expected} active employees marked`,
            onClick: open("attendance"),
        });
    }
    const month = monthName(payroll.month, payroll.year);
    const missingPayroll = Math.max(payroll.headcount - payroll.generated, 0);
    if (missingPayroll > 0) {
        items.push({
            key: "payroll", icon: Wallet, tone: "rose", count: missingPayroll,
            label: `Missing ${month} ${missingPayroll === 1 ? "payslip" : "payslips"}`,
            detail: `${payroll.generated} of ${payroll.headcount} generated`,
            onClick: open("payroll"),
        });
    } else if (payroll.unpaid > 0) {
        items.push({
            key: "payroll", icon: Wallet, tone: "amber", count: payroll.unpaid,
            label: `${month} ${payroll.unpaid === 1 ? "payslip" : "payslips"} not paid`,
            detail: `${payroll.generated - payroll.unpaid} of ${payroll.generated} paid`,
            onClick: open("payroll"),
        });
    }
    if (billing?.overdueCount > 0) {
        items.push({
            key: "invoices", icon: ReceiptIndianRupee, tone: "rose", count: billing.overdueCount,
            label: `Overdue ${billing.overdueCount === 1 ? "invoice" : "invoices"}`,
            detail: `${inr(billing.overdueAmount)} past due`,
            onClick: open("invoices"),
        });
    }
    if (newApplications > 0) {
        items.push({
            key: "applications", icon: BriefcaseBusiness, tone: "ocean", count: newApplications,
            label: `New job ${newApplications === 1 ? "application" : "applications"}`,
            detail: "Not reviewed yet",
            onClick: open("recruitment"),
        });
    }
    if (contractsEnding.length > 0) {
        const first = contractsEnding[0];
        items.push({
            key: "contracts", icon: FileWarning, tone: "ocean", count: contractsEnding.length,
            label: "Contracts ending in 30 days",
            detail: `${first.firstName} ${first.lastName} on ${shortDate(first.endingDate)}${contractsEnding.length > 1 ? ` + ${contractsEnding.length - 1} more` : ""}`,
            onClick: open("employees"),
        });
    }
    return items;
}

export default function AttentionPanel({ attention, billing, setActiveTab, onOpenPendingLeaves, updatedAt, onRefresh, refreshing }) {
    const items = buildItems(attention, billing, setActiveTab, onOpenPendingLeaves);
    const { attendance, nextHoliday } = attention;
    const updatedLabel = updatedAt?.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });

    return (
        <section className="panel flex h-full flex-col p-5" aria-labelledby="attention-title">
            <div className="flex items-center justify-between gap-3">
                <h3 id="attention-title" className="flex items-center gap-2 text-[15px] font-bold text-navy-900">
                    Needs your attention
                    {items.length > 0 && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 tabular-nums">{items.length}</span>
                    )}
                </h3>
                <div className="flex items-center gap-2">
                    {updatedLabel && <span className="text-xs text-slate-500">Updated {updatedLabel}</span>}
                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={refreshing}
                        aria-label="Refresh dashboard"
                        title="Refresh"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-ocean-50 text-ocean-700 hover:bg-ocean-100 disabled:opacity-60"
                    >
                        <RotateCw size={14} className={refreshing ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {items.length > 0 ? (
                <ul className="mt-3 flex-1 divide-y divide-slate-100">
                    {items.map(({ key, icon, tone, count, label, detail, onClick }) => {
                        const Icon = icon;
                        return (
                            <li key={key}>
                                <button
                                    type="button"
                                    onClick={onClick}
                                    className="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300"
                                >
                                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1 ${TONES[tone]}`}>
                                        <Icon size={16} />
                                    </span>
                                    <span className="w-6 shrink-0 text-right text-base font-bold text-navy-900 tabular-nums">{count}</span>
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate text-sm font-semibold text-slate-700">{label}</span>
                                        {detail && <span className="block truncate text-xs text-slate-500">{detail}</span>}
                                    </span>
                                    <ChevronRight size={16} className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ocean-600" aria-hidden="true" />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <div className="mt-3 flex flex-1 items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                    <CheckCircle2 size={18} className="shrink-0" />
                    All caught up. Nothing needs your attention right now.
                </div>
            )}

            {(!attendance.isWorkingDay || nextHoliday) && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    {!attendance.isWorkingDay && (
                        <span>Today: <span className="font-semibold text-slate-700">{attendance.offReason}</span>, so no attendance expected</span>
                    )}
                    {nextHoliday && (
                        <button type="button" onClick={() => setActiveTab?.("holidays")} className="inline-flex items-center gap-1.5 hover:text-ocean-700">
                            <CalendarDays size={13} />
                            Next holiday: <span className="font-semibold text-slate-700">{nextHoliday.name}</span> · {shortDate(nextHoliday.date)}
                        </button>
                    )}
                </div>
            )}
        </section>
    );
}
