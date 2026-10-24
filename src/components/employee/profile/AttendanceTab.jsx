// @ts-nocheck
import { useEffect, useState } from "react";
import { CalendarX2 } from "lucide-react";
import API from "../../../api/axios";
import { Card, Empty, Pill, Table } from "./shared";
import { fmtDate } from "./format";

const thisMonth = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);

export default function AttendanceTab({ employeeId }) {
    const [month, setMonth] = useState(thisMonth);
    // Result is tagged with the month it belongs to; a mismatch means "still loading"
    const [result, setResult] = useState({ month: null, report: null, failed: false });

    useEffect(() => {
        let cancelled = false;
        const [y, m] = month.split("-").map(Number);
        API.get(`/attendance/report/${employeeId}`, { params: { month: m, year: y } })
            .then(({ data }) => { if (!cancelled) setResult({ month, report: data.data, failed: false }); })
            .catch(() => { if (!cancelled) setResult({ month, report: null, failed: true }); });
        return () => { cancelled = true; };
    }, [employeeId, month]);

    const loading = result.month !== month;
    const failed = !loading && result.failed;
    const report = loading ? null : result.report;

    const s = report?.summary || {};
    const records = [...(report?.records || [])].reverse(); // newest first

    return (
        <Card
            title="Attendance"
            action={(
                <input
                    type="month"
                    value={month}
                    max={thisMonth()}
                    onChange={(e) => e.target.value && setMonth(e.target.value)}
                    aria-label="Month"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-ocean-400"
                />
            )}
        >
            <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {[["Present", s.present], ["Late", s.late], ["Half day", s.halfDay], ["Absent", s.absent], ["On leave", s.onLeave], ["Hours", s.totalHours]].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-[11px] font-medium text-slate-500">{label}</p>
                        <p className="text-lg font-bold tabular-nums text-navy-900">{loading ? "–" : value ?? 0}</p>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-9 animate-pulse rounded bg-slate-100" />)}</div>
            ) : failed ? (
                <Empty icon={CalendarX2} title="Couldn't load attendance" text="Please try again." />
            ) : records.length === 0 ? (
                <Empty icon={CalendarX2} title="No attendance marked this month" />
            ) : (
                <Table
                    rowKey={(r) => r._id}
                    rows={records}
                    columns={[
                        { label: "Date", render: (r) => fmtDate(r.date, { weekday: "short", day: "2-digit", month: "short", timeZone: "UTC" }) },
                        { label: "Status", render: (r) => <Pill>{r.status}</Pill> },
                        { label: "In", render: (r) => r.checkIn || "—" },
                        { label: "Out", render: (r) => r.checkOut || "—" },
                        { label: "Mode", render: (r) => r.workMode || "Office" },
                        { label: "Hours", align: "right", render: (r) => (r.hoursWorked ? Number(r.hoursWorked).toFixed(1) : "—") },
                    ]}
                />
            )}
        </Card>
    );
}
