// @ts-nocheck
// client/src/pages/Attendance.jsx
// Daily register (every employee for one day) + monthly register (employees × days).

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronLeft, ChevronRight, Search, UserX, X } from "lucide-react";
import API from "@/api/axios";

import AttendanceTable from "@/components/attendance/AttendanceTable";
import { WORKING_STATUSES, nowTimeIST, todayIST } from "@/components/attendance/constants";
import EditAttendanceModal from "@/components/attendance/EditAttendanceModal";
import MarkAttendanceModal from "@/components/attendance/MarkAttendanceModal";
import SummaryCards from "@/components/attendance/SummaryCards";
import DayAtAGlance from "@/components/attendance/DayAtAGlance";
import AttendanceHistoryModal from "@/components/attendance/AttendanceHistoryModal";
import MonthlyRegister from "@/components/attendance/MonthlyRegister";
import ConfirmDialog from "@/components/ConfirmDialog";
import { DEPARTMENTS } from "@/components/employee/form/constants";

const PAGE_SIZE = 15;
const STATUS_FILTERS = ["All", "Not marked", "Present", "Late", "Half Day", "Absent", "On Leave"];
const EMPTY_FILTERS = { search: "", department: "All", status: "All", mode: "All", missedOnly: false };

const shiftDate = (dateStr, days) => {
    const d = new Date(`${dateStr}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
};

export default function Attendance() {
    const today = todayIST();
    const navigate = useNavigate();

    const [view, setView] = useState("daily"); // daily | monthly
    const [selectedDate, setSelectedDate] = useState(today);
    const [records, setRecords] = useState([]); // includes "Not Marked" rows (no _id)
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);

    const [editRecord, setEditRecord] = useState(null);
    const [presetCheckOut, setPresetCheckOut] = useState("");
    const [historyId, setHistoryId] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null); // { id, name }
    const [deleteReason, setDeleteReason] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [deletedRecords, setDeletedRecords] = useState([]);
    const [quickBusy, setQuickBusy] = useState(null); // employee id being quick-marked
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkBusy, setBulkBusy] = useState(false);
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [markForm, setMarkForm] = useState({
        employee: "", status: "Present", checkIn: "", checkOut: "", leaveType: "", remarks: "",
    });

    // ─── Data Fetching ───────────────────────────────────────────
    const fetchSummary = useCallback(async () => {
        try {
            const { data } = await API.get("/attendance/today/summary", { params: { date: selectedDate } });
            setSummary(data.data);
        } catch { /* silent */ }
    }, [selectedDate]);

    const fetchAttendance = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/attendance", { params: { date: selectedDate, includeUnmarked: true } });
            setRecords(data.data);
        } catch {
            toast.error("Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    const fetchDeleted = useCallback(async () => {
        try {
            const { data } = await API.get("/attendance/deleted", { params: { date: selectedDate } });
            setDeletedRecords(data.data || []);
        } catch {
            toast.error("Failed to load deleted records");
        }
    }, [selectedDate]);

    // Summary and register both follow the selected date
    useEffect(() => { fetchAttendance(); fetchSummary(); }, [fetchAttendance, fetchSummary]);
    useEffect(() => { if (showDeleted) fetchDeleted(); }, [showDeleted, fetchDeleted]);
    useEffect(() => { setPage(1); }, [selectedDate, showDeleted, filters]);

    const refresh = () => { fetchAttendance(); fetchSummary(); if (showDeleted) fetchDeleted(); };

    // ─── Filtering ───────────────────────────────────────────────
    const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }));
    const hasFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

    const filteredRows = useMemo(() => {
        if (showDeleted) return deletedRecords;
        const q = filters.search.trim().toLowerCase();
        return records.filter((r) => {
            const e = r.employee || {};
            if (q && !`${e.firstName} ${e.lastName} ${e.employeeId}`.toLowerCase().includes(q)) return false;
            if (filters.department !== "All" && e.department !== filters.department) return false;
            if (filters.status === "Not marked" && !r.unmarked) return false;
            if (!["All", "Not marked"].includes(filters.status) && r.status !== filters.status) return false;
            if (filters.mode === "WFH" && r.workMode !== "WFH") return false;
            if (filters.mode === "Office" && (r.unmarked || r.workMode === "WFH")) return false;
            if (filters.missedOnly && !r.missedCheckOut) return false;
            return true;
        });
    }, [records, deletedRecords, filters, showDeleted]);

    const totalPages = Math.ceil(filteredRows.length / PAGE_SIZE);
    const unmarkedEmployees = records.filter((r) => r.unmarked).map((r) => r.employee);
    const missedCount = records.filter((r) => r.missedCheckOut).length;
    const isFuture = selectedDate > today;
    const canBulkAbsent = !isFuture && !summary?.isOffDay && unmarkedEmployees.length > 0;

    // ─── Actions ─────────────────────────────────────────────────
    const openMark = (employeeId = "") => {
        setMarkForm({ employee: employeeId, status: "Present", checkIn: "", checkOut: "", leaveType: "", remarks: "" });
        setShowMarkModal(true);
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        const working = WORKING_STATUSES.includes(markForm.status);
        if (working && markForm.checkOut && !markForm.checkIn) return toast.error("Add a check-in time before the check-out time");
        if (working && markForm.checkIn && markForm.checkOut && markForm.checkOut <= markForm.checkIn) return toast.error("Check-out must be later than check-in");
        try {
            await API.post("/attendance", {
                employee: markForm.employee,
                date: selectedDate,
                status: markForm.status,
                checkIn: working ? markForm.checkIn : "",
                checkOut: working ? markForm.checkOut : "",
                leaveType: markForm.status === "On Leave" ? markForm.leaveType : "",
                remarks: markForm.remarks,
            });
            toast.success("Attendance marked");
            setShowMarkModal(false);
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to mark attendance");
        }
    };

    // One-click marking from a "Not marked" row (no times — add them with Edit if needed)
    const handleQuickMark = async (employee, status) => {
        try {
            setQuickBusy(employee._id);
            await API.post("/attendance", { employee: employee._id, date: selectedDate, status, reason: "Quick-marked from the daily register" });
            toast.success(`${employee.firstName} marked ${status}`);
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to mark attendance");
        } finally {
            setQuickBusy(null);
        }
    };

    const handleBulkAbsent = async () => {
        try {
            setBulkBusy(true);
            const { data } = await API.post("/attendance/bulk", {
                date: selectedDate,
                reason: "Bulk-marked absent: no check-in or record for the day",
                records: unmarkedEmployees.map((e) => ({ employee: e._id, status: "Absent" })),
            });
            toast.success(data.message || "Marked absent");
            setBulkOpen(false);
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Bulk marking failed");
        } finally {
            setBulkBusy(false);
        }
    };

    // Errors are shown inside the edit popup (it re-throws)
    const handleUpdate = async (payload) => {
        await API.put(`/attendance/${editRecord._id}`, payload);
        toast.success("Attendance updated");
        setEditRecord(null);
        setPresetCheckOut("");
        refresh();
    };

    // Delete needs a reason; the record is kept and can be restored
    const handleDelete = (id) => {
        const rec = records.find((r) => r._id === id);
        setDeleteReason("");
        setPendingDelete({ id, name: `${rec?.employee?.firstName || ""} ${rec?.employee?.lastName || ""}`.trim() });
    };

    const confirmDelete = async () => {
        try {
            setDeleting(true);
            await API.delete(`/attendance/${pendingDelete.id}`, { data: { reason: deleteReason.trim() } });
            toast.success("Record deleted — you can restore it from “Show deleted”");
            setPendingDelete(null);
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete record");
        } finally {
            setDeleting(false);
        }
    };

    const handleRestore = async (rec) => {
        try {
            await API.put(`/attendance/${rec._id}/restore`, {});
            toast.success("Record restored");
            refresh();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to restore record");
        }
    };

    // Check-out is set through the edit popup so the admin confirms the exact time
    // (pre-filled with "now" only when looking at today)
    const handleCheckout = (rec) => {
        setPresetCheckOut(selectedDate === today ? nowTimeIST() : "");
        setEditRecord(rec);
    };

    const handleEdit = (rec) => {
        setPresetCheckOut("");
        setEditRecord(rec);
    };

    const openEmployee = (id) => id && navigate(`/admin/employees/${id}?tab=attendance`);
    const openDay = (date) => { setSelectedDate(date); setView("daily"); };

    // ─── UI ──────────────────────────────────────────────────────
    return (
        <div className="space-y-5">

            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Attendance</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Daily register and monthly overview for all employees</p>
                </div>
                <div className="flex rounded-xl border border-slate-200 bg-white p-1" role="tablist" aria-label="View">
                    {[["daily", "Daily register"], ["monthly", "Monthly register"]].map(([id, label]) => (
                        <button
                            key={id}
                            role="tab"
                            aria-selected={view === id}
                            onClick={() => setView(id)}
                            className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${view === id ? "bg-navy-800 text-white" : "text-slate-600 hover:text-navy-800"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {view === "monthly" ? (
                <MonthlyRegister onOpenDay={openDay} onOpenEmployee={openEmployee} />
            ) : (
                <>
                    {/* Date controls + actions */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                            <button onClick={() => setSelectedDate((d) => shiftDate(d, -1))} aria-label="Previous day" className="rounded-l-xl p-2.5 text-slate-500 hover:bg-slate-50"><ChevronLeft size={18} /></button>
                            <input type="date" value={selectedDate} max={today} aria-label="Date"
                                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                                className="border-x border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none cursor-pointer" />
                            <button onClick={() => setSelectedDate((d) => shiftDate(d, 1))} disabled={selectedDate >= today} aria-label="Next day" className="rounded-r-xl p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={18} /></button>
                        </div>
                        <button onClick={() => setSelectedDate(today)} disabled={selectedDate === today} className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">
                            Today
                        </button>
                        <div className="ml-auto flex flex-wrap gap-2">
                            <button
                                onClick={() => setBulkOpen(true)}
                                disabled={!canBulkAbsent}
                                title={summary?.isOffDay ? "Off day — nobody is expected to work" : unmarkedEmployees.length === 0 ? "Everyone is marked" : undefined}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <UserX size={15} /> Mark {unmarkedEmployees.length || ""} unmarked as Absent
                            </button>
                            <button onClick={() => openMark()} disabled={unmarkedEmployees.length === 0 || isFuture}
                                title={unmarkedEmployees.length === 0 ? "Everyone is marked for this date" : undefined}
                                className="flex items-center gap-2 bg-linear-to-r from-ocean-600 to-navy-600 hover:from-ocean-700 hover:to-navy-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-ocean-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                + Mark Attendance
                            </button>
                        </div>
                    </div>

                    <SummaryCards summary={summary} isToday={selectedDate === today} />
                    <DayAtAGlance records={records} isToday={selectedDate === today} />

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                            <Search size={15} className="text-slate-400" />
                            <input value={filters.search} onChange={(e) => setFilter("search", e.target.value)} disabled={showDeleted}
                                placeholder="Search name or employee ID" aria-label="Search employees"
                                className="w-full bg-transparent text-sm outline-none placeholder-slate-400" />
                        </label>
                        {[
                            ["department", "Department", ["All", ...DEPARTMENTS]],
                            ["status", "Status", STATUS_FILTERS],
                            ["mode", "Mode", ["All", "Office", "WFH"]],
                        ].map(([key, label, options]) => (
                            <label key={key} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                                <span className="hidden sm:inline">{label}</span>
                                <select value={filters[key]} onChange={(e) => setFilter(key, e.target.value)} disabled={showDeleted}
                                    className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer">
                                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </label>
                        ))}
                        {missedCount > 0 && !showDeleted && (
                            <button
                                onClick={() => setFilter("missedOnly", !filters.missedOnly)}
                                aria-pressed={filters.missedOnly}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${filters.missedOnly ? "bg-amber-600 text-white ring-amber-600" : "bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100"}`}
                            >
                                {missedCount} missed check-out{missedCount === 1 ? "" : "s"}
                            </button>
                        )}
                        {hasFilters && !showDeleted && (
                            <button onClick={() => setFilters(EMPTY_FILTERS)} className="inline-flex items-center gap-1 text-sm font-semibold text-ocean-700 hover:text-navy-800">
                                <X size={14} /> Clear
                            </button>
                        )}
                        <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
                            <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} className="h-4 w-4 accent-navy-700" />
                            Show deleted
                        </label>
                    </div>

                    <AttendanceTable
                        records={filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                        totalCount={filteredRows.length}
                        deletedMode={showDeleted}
                        onRestore={handleRestore}
                        onHistory={(id) => setHistoryId(id)}
                        loading={loading}
                        selectedDate={selectedDate}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onCheckout={handleCheckout}
                        onMark={(emp) => openMark(emp._id)}
                        onQuickMark={handleQuickMark}
                        quickMarkDisabled={isFuture}
                        busyEmployeeId={quickBusy}
                        onOpenEmployee={openEmployee}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-1">
                            <p className="text-sm text-slate-500">
                                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredRows.length)} of {filteredRows.length}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    Previous
                                </button>
                                <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {historyId && <AttendanceHistoryModal recordId={historyId} onClose={() => setHistoryId(null)} />}

            <ConfirmDialog
                open={bulkOpen}
                tone="primary"
                title={`Mark ${unmarkedEmployees.length} employee${unmarkedEmployees.length === 1 ? "" : "s"} absent?`}
                message={`Everyone without a record on ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })} will be marked Absent. Each record notes that it was bulk-marked, and you can still edit or delete any of them.`}
                confirmLabel="Mark absent"
                busy={bulkBusy}
                onConfirm={handleBulkAbsent}
                onCancel={() => setBulkOpen(false)}
            />

            <ConfirmDialog
                open={Boolean(pendingDelete)}
                title={`Delete ${pendingDelete?.name || "this"}'s attendance?`}
                message="It disappears from the register, reports and payroll, but is kept with your name and reason. You can restore it from “Show deleted”."
                confirmLabel="Delete record"
                busy={deleting}
                confirmDisabled={deleteReason.trim().length < 3}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            >
                <label htmlFor="att-delete-reason" className="mb-1 block text-xs font-semibold text-slate-600">Reason <span className="text-red-500">*</span></label>
                <input
                    id="att-delete-reason"
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="e.g. Marked for the wrong person"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"
                />
            </ConfirmDialog>

            {showMarkModal && (
                <MarkAttendanceModal
                    form={markForm}
                    setForm={setMarkForm}
                    employees={unmarkedEmployees}
                    selectedDate={selectedDate}
                    onSubmit={handleMarkAttendance}
                    onClose={() => setShowMarkModal(false)}
                />
            )}

            {editRecord && (
                <EditAttendanceModal
                    key={`${editRecord._id}-${presetCheckOut}`}
                    record={editRecord}
                    presetCheckOut={presetCheckOut}
                    onSubmit={handleUpdate}
                    onClose={() => { setEditRecord(null); setPresetCheckOut(""); }}
                />
            )}
        </div>
    );
}
