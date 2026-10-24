// @ts-nocheck
// client/src/pages/Attendance.jsx
// Slim orchestrator — all UI is delegated to sub-components

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "@/api/axios";

import AttendanceTable from "@/components/attendance/AttendanceTable";
import { WORKING_STATUSES, nowTimeIST, todayIST } from "@/components/attendance/constants";
import EditAttendanceModal from "@/components/attendance/EditAttendanceModal";
import MarkAttendanceModal from "@/components/attendance/MarkAttendanceModal";
import SummaryCards from "@/components/attendance/SummaryCards";
import DayAtAGlance from "@/components/attendance/DayAtAGlance";
import AttendanceHistoryModal from "@/components/attendance/AttendanceHistoryModal";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function Attendance() {
    const today = todayIST();

    const [selectedDate, setSelectedDate] = useState(today);
    const [records, setRecords] = useState([]); // includes "Not Marked" rows (no _id)
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editRecord, setEditRecord] = useState(null);
    const [presetCheckOut, setPresetCheckOut] = useState("");
    const [historyId, setHistoryId] = useState(null);
    const [pendingDelete, setPendingDelete] = useState(null); // { id, name }
    const [deleteReason, setDeleteReason] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [deletedRecords, setDeletedRecords] = useState([]);
    const [onlyMissed, setOnlyMissed] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [markForm, setMarkForm] = useState({
        employee: "", status: "Present", checkIn: "", checkOut: "", leaveType: "", remarks: "",
    });

    // ─── Data Fetching ───────────────────────────────────────────
    const fetchSummary = async () => {
        try {
            const { data } = await API.get("/attendance/today/summary", { params: { date: selectedDate } });
            setSummary(data.data);
        } catch { /* silent */ }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/attendance", { params: { date: selectedDate, includeUnmarked: true } });
            setRecords(data.data);
        } catch {
            toast.error("Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    // Summary and register both follow the selected date
    useEffect(() => { setPage(1); fetchAttendance(); fetchSummary(); }, [selectedDate]);

    const fetchDeleted = useCallback(async () => {
        try {
            const { data } = await API.get("/attendance/deleted", { params: { date: selectedDate } });
            setDeletedRecords(data.data || []);
        } catch {
            toast.error("Failed to load deleted records");
        }
    }, [selectedDate]);
    useEffect(() => { if (showDeleted) fetchDeleted(); }, [showDeleted, fetchDeleted]);
    useEffect(() => { setPage(1); }, [showDeleted, onlyMissed]);

    const refresh = () => { fetchAttendance(); fetchSummary(); if (showDeleted) fetchDeleted(); };
    const missedCount = records.filter((r) => r.missedCheckOut).length;
    const visibleRows = showDeleted ? deletedRecords : onlyMissed ? records.filter((r) => r.missedCheckOut) : records;
    const totalPages = Math.ceil(visibleRows.length / PAGE_SIZE);
    const unmarkedEmployees = records.filter((r) => r.unmarked).map((r) => r.employee);

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

    // ─── UI ──────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Attendance</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Track daily attendance for all employees</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <input type="date" value={selectedDate} max={today} aria-label="Date"
                        onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                        className="panel px-4 py-2.5 text-sm text-slate-700 outline-none cursor-pointer focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors" />
                    <button onClick={() => openMark()} disabled={unmarkedEmployees.length === 0}
                        title={unmarkedEmployees.length === 0 ? "Everyone is marked for this date" : undefined}
                        className="flex items-center gap-2 bg-linear-to-r from-ocean-600 to-navy-600 hover:from-ocean-700 hover:to-navy-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-ocean-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        + Mark Attendance
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards summary={summary} isToday={selectedDate === today} />

            {/* Real figures for the selected day */}
            <DayAtAGlance records={records} isToday={selectedDate === today} />

            {/* Register filters */}
            <div className="flex flex-wrap items-center gap-2">
                {!showDeleted && missedCount > 0 && (
                    <button
                        onClick={() => setOnlyMissed((v) => !v)}
                        aria-pressed={onlyMissed}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors ${onlyMissed ? "bg-amber-600 text-white ring-amber-600" : "bg-amber-50 text-amber-800 ring-amber-200 hover:bg-amber-100"}`}
                    >
                        {onlyMissed ? "Showing" : "Show"} {missedCount} missed check-out{missedCount === 1 ? "" : "s"}
                    </button>
                )}
                <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-600">
                    <input type="checkbox" checked={showDeleted} onChange={(e) => { setShowDeleted(e.target.checked); setOnlyMissed(false); }} className="h-4 w-4 accent-navy-700" />
                    Show deleted records
                </label>
            </div>

            {/* Attendance Table */}
            <AttendanceTable
                records={visibleRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                deletedMode={showDeleted}
                onRestore={handleRestore}
                onHistory={(id) => setHistoryId(id)}
                loading={loading}
                selectedDate={selectedDate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCheckout={handleCheckout}
                onMark={(emp) => openMark(emp._id)}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-slate-400">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => p - 1)}
                            disabled={page === 1}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page === totalPages}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {historyId && <AttendanceHistoryModal recordId={historyId} onClose={() => setHistoryId(null)} />}

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

            {/* Mark Attendance Modal */}
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

            {/* Edit Attendance Modal */}
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