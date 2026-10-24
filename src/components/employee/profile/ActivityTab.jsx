// @ts-nocheck
import { CalendarClock, CheckCircle2, ClipboardList, LogIn, Plane, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { Card, Empty } from "./shared";
import { fmtDate, fmtMoney, MONTHS } from "./format";

// Builds a timeline from the employee's records (there is no separate audit log)
function buildEvents({ employee, leaves, wfh, payroll, reviews, tasks }) {
    const ev = [];
    if (employee.joiningDate) ev.push({ at: employee.joiningDate, icon: UserPlus, text: `Joined as ${employee.designation} in ${employee.department}` });
    if (employee.lastLogin) ev.push({ at: employee.lastLogin, icon: LogIn, text: "Signed in to HRMS" });
    leaves.items.forEach((l) => {
        ev.push({ at: l.createdAt, icon: Plane, text: `Requested ${l.numberOfDays} day${l.numberOfDays === 1 ? "" : "s"} of ${l.leaveType}`, tag: l.status });
    });
    wfh.forEach((w) => ev.push({ at: w.createdAt, icon: CalendarClock, text: `Requested work from home for ${w.numberOfDays} day${w.numberOfDays === 1 ? "" : "s"}`, tag: w.status }));
    payroll.forEach((p) => {
        if (p.payment?.status === "Paid" && p.payment?.date) {
            ev.push({ at: p.payment.date, icon: Wallet, text: `Salary for ${MONTHS[p.month - 1]} ${p.year} paid · ${fmtMoney(p.netPay)}` });
        }
    });
    reviews.forEach((r) => ev.push({ at: r.reviewDate, icon: TrendingUp, text: `${r.reviewCycle} ${r.year} review: ${r.overallScore}/100 (${r.grade})` }));
    tasks.forEach((t) => ev.push({
        at: t.createdAt,
        icon: t.status === "Completed" ? CheckCircle2 : ClipboardList,
        text: `Task “${t.title}”${t.assignedBy?.name ? ` from ${t.assignedBy.name}` : ""}`,
        tag: t.status,
    }));
    return ev.filter((e) => e.at).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 40);
}

export default function ActivityTab({ data }) {
    const events = buildEvents(data);
    return (
        <Card title="Recent activity">
            {events.length === 0 ? (
                <Empty icon={ClipboardList} title="No activity yet" />
            ) : (
                <ol className="relative space-y-5 border-l border-slate-200 pl-6">
                    {events.map((e, i) => {
                        const Icon = e.icon;
                        return (
                            <li key={i} className="relative">
                                <span className="absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full bg-white text-ocean-600 ring-1 ring-slate-200">
                                    <Icon size={13} />
                                </span>
                                <p className="text-sm text-navy-900">
                                    {e.text}
                                    {e.tag && <span className="ml-2 text-xs font-medium text-slate-500">· {e.tag}</span>}
                                </p>
                                <p className="text-xs text-slate-500">{fmtDate(e.at, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                            </li>
                        );
                    })}
                </ol>
            )}
        </Card>
    );
}
