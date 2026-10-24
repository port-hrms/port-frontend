// @ts-nocheck
// Monthly register: employees × days, with totals and CSV export.
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import API from "@/api/axios";
import EmployeeAvatar from "../employee/EmployeeAvatar";
import { downloadCSV, toCSV } from "@/utils/csv";
import { DEPARTMENTS } from "../employee/form/constants";
import { todayIST } from "./timeUtils";

const CELL = {
    Present: { code: "P", cls: "bg-emerald-100 text-emerald-800" },
    Late: { code: "L", cls: "bg-amber-100 text-amber-800" },
    "Half Day": { code: "H", cls: "bg-orange-100 text-orange-800" },
    Absent: { code: "A", cls: "bg-rose-100 text-rose-700" },
    "On Leave": { code: "LV", cls: "bg-ocean-100 text-ocean-800" },
};
const LEGEND = [["P", "Present", CELL.Present.cls], ["L", "Late", CELL.Late.cls], ["H", "Half day", CELL["Half Day"].cls], ["A", "Absent", CELL.Absent.cls], ["LV", "On leave", CELL["On Leave"].cls]];

const monthLabel = (m, y) => new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" });

export default function MonthlyRegister({ onOpenDay, onOpenEmployee }) {
    const [ty, tm] = todayIST().split("-").map(Number);
    const [period, setPeriod] = useState({ month: tm, year: ty });
    const [department, setDepartment] = useState("All");
    const [search, setSearch] = useState("");
    const [result, setResult] = useState({ key: null, data: null, failed: false });
    const key = `${period.year}-${period.month}-${department}`;
    const loading = result.key !== key;

    useEffect(() => {
        let alive = true;
        API.get("/attendance/register", { params: { month: period.month, year: period.year, department } })
            .then(({ data }) => { if (alive) setResult({ key, data: data.data, failed: false }); })
            .catch(() => { if (alive) setResult({ key, data: null, failed: true }); });
        return () => { alive = false; };
    }, [key, period.month, period.year, department]);

    const data = loading ? null : result.data;
    const isCurrentMonth = period.month === tm && period.year === ty;
    const shift = (delta) => setPeriod(({ month, year }) => {
        const d = new Date(Date.UTC(year, month - 1 + delta, 1));
        return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() };
    });

    const rows = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = data?.employees || [];
        return q ? list.filter((e) => `${e.name} ${e.employeeId}`.toLowerCase().includes(q)) : list;
    }, [data, search]);

    const exportCSV = () => {
        if (!data) return;
        const columns = [
            { label: "Employee ID", key: "employeeId" },
            { label: "Name", key: "name" },
            { label: "Department", key: "department" },
            ...data.days.map((d) => ({
                label: `${d.day} ${d.weekday}`,
                value: (e) => (e.cells[d.date] ? CELL[e.cells[d.date].status]?.code || e.cells[d.date].status : d.isOffDay ? "OFF" : ""),
            })),
            { label: "Present", value: (e) => e.totals.present },
            { label: "Late", value: (e) => e.totals.late },
            { label: "Half day", value: (e) => e.totals.halfDay },
            { label: "Absent", value: (e) => e.totals.absent },
            { label: "On leave", value: (e) => e.totals.onLeave },
            { label: "Not marked", value: (e) => e.totals.notMarked },
            { label: "WFH days", value: (e) => e.totals.wfh },
            { label: "Missed check-outs", value: (e) => e.totals.missedCheckOut },
            { label: "Hours", value: (e) => e.totals.hours },
        ];
        downloadCSV(`attendance-${period.year}-${String(period.month).padStart(2, "0")}.csv`, toCSV(rows, columns));
        toast.success(`Exported ${rows.length} employee${rows.length === 1 ? "" : "s"}`);
    };

    return (
        <section className="panel overflow-hidden">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-1">
                    <button onClick={() => shift(-1)} aria-label="Previous month" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><ChevronLeft size={18} /></button>
                    <h3 className="min-w-36 text-center text-sm font-bold text-navy-900">{monthLabel(period.month, period.year)}</h3>
                    <button onClick={() => shift(1)} disabled={isCurrentMonth} aria-label="Next month" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ChevronRight size={18} /></button>
                </div>
                <label className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
                    <Search size={15} className="text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or ID" aria-label="Search employees" className="w-full bg-transparent text-sm outline-none placeholder-slate-400" />
                </label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Department" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none">
                    <option value="All">All departments</option>
                    {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <button onClick={exportCSV} disabled={!data || rows.length === 0} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                    <Download size={15} /> Export CSV
                </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-2 text-[11px] text-slate-500">
                {LEGEND.map(([code, label, cls]) => (
                    <span key={code} className="inline-flex items-center gap-1"><span className={`rounded px-1 font-bold ${cls}`}>{code}</span>{label}</span>
                ))}
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-slate-200" /> Off day</span>
                <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded ring-2 ring-amber-400" /> Missed check-out</span>
                {data && <span className="ml-auto">{data.workingDays} working days</span>}
            </div>

            {result.failed && !loading ? (
                <p className="px-4 py-10 text-center text-sm text-red-600">Couldn't load the register.</p>
            ) : loading ? (
                <div className="space-y-2 p-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-9 animate-pulse rounded bg-slate-100" />)}</div>
            ) : rows.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-slate-500">No employees match.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="border-separate border-spacing-0 text-xs">
                        <thead>
                            <tr className="bg-slate-50/80">
                                <th className="sticky left-0 z-10 min-w-52 border-b border-slate-100 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Employee</th>
                                {data.days.map((d) => (
                                    <th key={d.date} title={d.offDayReason || undefined} className={`min-w-8 border-b border-slate-100 px-0.5 py-1.5 text-center font-semibold ${d.isOffDay ? "bg-slate-100 text-slate-400" : "text-slate-500"}`}>
                                        <button type="button" onClick={() => !d.isFuture && onOpenDay?.(d.date)} disabled={d.isFuture} className="w-full disabled:cursor-default" aria-label={`Open ${d.date}`}>
                                            <span className="block text-[10px] font-medium">{d.weekday.slice(0, 2)}</span>
                                            <span className={d.date === todayIST() ? "rounded bg-navy-800 px-1 text-white" : ""}>{d.day}</span>
                                        </button>
                                    </th>
                                ))}
                                {["P", "L", "H", "A", "LV", "NM", "Hrs"].map((h) => (
                                    <th key={h} title={{ P: "Present", L: "Late", H: "Half day", A: "Absent", LV: "On leave", NM: "Not marked (working days so far)", Hrs: "Hours" }[h]} className="border-b border-l border-slate-100 bg-slate-50 px-2 py-2 text-center text-[11px] font-semibold text-slate-500">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((e) => (
                                <tr key={e._id} className="hover:bg-ocean-50/30">
                                    <td className="sticky left-0 z-10 border-b border-slate-100 bg-white px-3 py-1.5">
                                        <button type="button" onClick={() => onOpenEmployee?.(e._id)} className="flex items-center gap-2 text-left" title="Open profile">
                                            <EmployeeAvatar employee={e} className="h-7 w-7 text-[10px]" />
                                            <span className="min-w-0">
                                                <span className="block truncate text-xs font-semibold text-navy-900 hover:underline">{e.name}</span>
                                                <span className="block text-[10px] text-slate-400">{e.employeeId}</span>
                                            </span>
                                        </button>
                                    </td>
                                    {data.days.map((d) => {
                                        const c = e.cells[d.date];
                                        const style = c ? CELL[c.status] : null;
                                        return (
                                            <td key={d.date} className={`border-b border-slate-100 p-0.5 text-center ${d.isOffDay ? "bg-slate-100" : ""}`}>
                                                {c ? (
                                                    <span
                                                        title={`${d.date}: ${c.status}${c.wfh ? " · WFH" : ""}${c.hours ? ` · ${c.hours} h` : ""}${c.missedCheckOut ? " · missed check-out" : ""}`}
                                                        className={`inline-block min-w-6 rounded px-0.5 py-0.5 text-[10px] font-bold ${style?.cls || "bg-slate-100 text-slate-600"} ${c.missedCheckOut ? "ring-2 ring-amber-400" : ""}`}
                                                    >
                                                        {style?.code || "?"}{c.wfh ? "·" : ""}
                                                    </span>
                                                ) : !d.isOffDay && !d.isFuture ? (
                                                    <span title={`${d.date}: not marked`} className="text-slate-300">–</span>
                                                ) : null}
                                            </td>
                                        );
                                    })}
                                    {[e.totals.present, e.totals.late, e.totals.halfDay, e.totals.absent, e.totals.onLeave, e.totals.notMarked, e.totals.hours].map((v, i) => (
                                        <td key={i} className={`border-b border-l border-slate-100 px-2 text-center font-semibold tabular-nums ${i === 5 && v > 0 ? "text-amber-700" : "text-slate-700"}`}>{v}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
