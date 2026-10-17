// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import API from "../../api/axios";
import VoyageCalendar from "../../components/attendance/VoyageCalendar";
import TodayCheckInCard from "../../components/attendance/TodayCheckInCard";
import {
    monthInputFromDate,
    formatDate,
    STATUS_TONE,
    isLateEntry,
    isHalfDay,
    deriveStatus,
} from "../../components/attendance/attendanceHelpers";
import { formatHours } from "../../utils/dateUtils";

/* ─────────────────────────────────────────────────────────
   Summary stat card
───────────────────────────────────────────────────────── */
function StatCard({ label, value }) {
    return (
        <article className="rounded-2xl bg-white/75 border border-slate-200 shadow-sm p-5 backdrop-blur-[1px]">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">{label}</p>
            <p className="text-2xl font-bold text-navy-900 mt-3">{value}</p>
        </article>
    );
}

/* ─────────────────────────────────────────────────────────
   Attendance log row
───────────────────────────────────────────────────────── */
function LogRow({ record }) {
    const status = deriveStatus(record.checkIn, record.status);
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-slate-200 p-4">
            <div>
                <p className="text-sm font-bold text-slate-900">{formatDate(record.date)}</p>
                <p className="text-xs text-slate-500 mt-1">
                    {record.checkIn || "--"} to {record.checkOut || "--"} · {formatHours(record.hoursWorked)}
                </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${STATUS_TONE[status] ?? "bg-slate-100 text-slate-600"}`}>
                {status}
            </span>
        </div>
    );
}

import useEmployeeAttendance from "../../hooks/useEmployeeAttendance";

/* ─────────────────────────────────────────────────────────
   Main page
───────────────────────────────────────────────────────── */
export default function EmployeeAttendance() {
    const {
        selectedMonth,
        setSelectedMonth,
        profile,
        todayRecord,
        summary,
        records,
        holidays,
        loading,
        actionLoading,
        monthLabel,
        handleCheckIn,
        handleCheckOut,
        todayStatus,
        displayStatus,
        canCheckIn,
        canCheckOut,
        STATS
    } = useEmployeeAttendance();

    // ── Pagination ──────────────────────────────────────────────
    const PAGE_SIZE = 7;
    const [page, setPage] = useState(1);

    // Reset to page 1 when month changes
    useEffect(() => { setPage(1); }, [selectedMonth]);

    const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
    const pagedRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    /* ── Loading / no-profile guards ── */
    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none">
            <div className="w-12 h-12 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Loading your attendance...</p>
        </div>
    );

    if (!profile) return (
        <div className="panel max-w-3xl mx-auto p-8 lg:p-10">
            <h2 className="text-2xl font-bold text-navy-900">Attendance is not available yet</h2>
            <p className="text-slate-500 mt-3 leading-7">
                Your account is not linked to an employee profile yet. Ask an administrator to connect your profile.
            </p>
        </div>
    );

    /* ── Main render ── */
    return (
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5">
            <div className="relative z-10 space-y-6">

                {/* Page header + month picker */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-2xl font-bold text-navy-900 tracking-tight">My Attendance</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Track your monthly attendance and work hours</p>
                    </div>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                        className="bg-white/85 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none cursor-pointer shadow-sm focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors"
                    />
                </div>

                {/* Voyage calendar */}
                <VoyageCalendar selectedMonth={selectedMonth} records={records} holidays={holidays} />

                {/* Today check-in card */}
                <TodayCheckInCard
                    todayRecord={todayRecord}
                    displayStatus={displayStatus}
                    todayStatus={todayStatus}
                    canCheckIn={canCheckIn}
                    canCheckOut={canCheckOut}
                    actionLoading={actionLoading}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                />

                {/* Summary stats */}
                <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                    {STATS.map(([label, value]) => <StatCard key={label} label={label} value={value} />)}
                </section>

                {/* Attendance log */}
                <section className="rounded-2xl bg-white/78 border border-slate-200 shadow-sm p-6 backdrop-blur-[1px]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                        <div>
                            <h3 className="text-lg font-bold text-navy-900">Attendance Log</h3>
                            <p className="text-sm text-slate-500 mt-1">{monthLabel}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-500">{formatHours(summary?.totalHours ?? 0)} total</span>
                    </div>

                    {records.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 bg-slate-50">
                            No attendance records were found for this month.
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                {pagedRecords.map(record => <LogRow key={record._id} record={record} />)}
                            </div>

                            {/* Pagination controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        ← Prev
                                    </button>

                                    <span className="text-xs font-bold text-slate-400">
                                        Page {page} of {totalPages}
                                        <span className="ml-2 text-slate-300">·</span>
                                        <span className="ml-2 text-slate-500">{records.length} records</span>
                                    </span>

                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>

            </div>
        </div>
    );
}