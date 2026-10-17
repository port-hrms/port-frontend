// @ts-nocheck
// client/src/pages/Attendance.jsx
// Slim orchestrator — all UI is delegated to sub-components

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "@/api/axios";

import AttendanceTable from "@/components/attendance/AttendanceTable";
import { formatDate, toDateInput } from "@/components/attendance/constants";
import EditAttendanceModal from "@/components/attendance/EditAttendanceModal";
import MarkAttendanceModal from "@/components/attendance/MarkAttendanceModal";
import SummaryCards from "@/components/attendance/SummaryCards";
import TimingsCard from "@/components/attendance/TimingsCard";

export default function Attendance() {
    const today = toDateInput(new Date());

    const [selectedDate, setSelectedDate] = useState(today);
    const [records, setRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editRecord, setEditRecord] = useState(null);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [markForm, setMarkForm] = useState({
        employee: "", status: "Present", checkIn: "", checkOut: "", leaveType: "", remarks: "",
    });

    // ─── Data Fetching ───────────────────────────────────────────
    const fetchSummary = async () => {
        try {
            const { data } = await API.get("/attendance/today/summary");
            setSummary(data.data);
        } catch { /* silent */ }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/attendance", { params: { date: selectedDate } });
            setRecords(data.data);
        } catch {
            toast.error("Failed to fetch attendance");
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const { data } = await API.get("/employees", { params: { status: "All" } });
            setEmployees((data.data || []).filter((emp) => emp.status !== "Inactive"));
        } catch {
            toast.error("Failed to fetch employees");
        }
    };

    useEffect(() => { fetchSummary(); fetchEmployees(); }, []);
    useEffect(() => { setPage(1); fetchAttendance(); }, [selectedDate]);

    // ─── Actions ─────────────────────────────────────────────────
    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        try {
            await API.post("/attendance", { ...markForm, date: selectedDate });
            toast.success("Attendance marked! ✅");
            setShowMarkModal(false);
            setMarkForm({ employee: "", status: "Present", checkIn: "", checkOut: "", leaveType: "", remarks: "" });
            fetchAttendance();
            fetchSummary();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to mark attendance");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/attendance/${editRecord._id}`, editRecord);
            toast.success("Attendance updated! ✅");
            setEditRecord(null);
            fetchAttendance();
            fetchSummary();
        } catch (err) {
            toast.error(err.response?.data?.message || "Update failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this attendance record?")) return;
        try {
            await API.delete(`/attendance/${id}`);
            toast.success("Record deleted");
            fetchAttendance();
            fetchSummary();
        } catch {
            toast.error("Failed to delete record");
        }
    };

    const handleCheckout = async (rec) => {
        try {
            const now = new Date();
            const updatedRecord = { ...rec, checkOut: now.toISOString() };
            await API.put(`/attendance/${rec._id}`, updatedRecord);
            toast.success("Checkout recorded! ✅");
            fetchAttendance();
            fetchSummary();
        } catch (err) {
            toast.error(err.response?.data?.message || "Checkout failed");
        }
    };

    const handleEdit = (rec) => {
        setEditRecord({ ...rec, employee: rec.employee?._id || rec.employee });
    };

    // ─── UI ──────────────────────────────────────────────────────
    return (
        <div className="space-y-6">

            {/* Page Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Track daily attendance for all employees</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <input type="date" value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 outline-none cursor-pointer shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
                    <button onClick={() => setShowMarkModal(true)}
                        className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all">
                        + Mark Attendance
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <SummaryCards summary={summary} />

            {/* Timings Card */}
            <TimingsCard selectedDate={selectedDate} records={records} />

            {/* Attendance Table */}
            <AttendanceTable
                records={records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)}
                loading={loading}
                selectedDate={selectedDate}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCheckout={handleCheckout}
            />

            {/* Pagination */}
            {Math.ceil(records.length / PAGE_SIZE) > 1 && (
                <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-slate-400">
                        Page {page} of {Math.ceil(records.length / PAGE_SIZE)}
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
                            disabled={page === Math.ceil(records.length / PAGE_SIZE)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {/* Mark Attendance Modal */}
            {showMarkModal && (
                <MarkAttendanceModal
                    form={markForm}
                    setForm={setMarkForm}
                    employees={employees}
                    selectedDate={selectedDate}
                    onSubmit={handleMarkAttendance}
                    onClose={() => setShowMarkModal(false)}
                />
            )}

            {/* Edit Attendance Modal */}
            {editRecord && (
                <EditAttendanceModal
                    record={editRecord}
                    setRecord={setEditRecord}
                    onSubmit={handleUpdate}
                    onClose={() => setEditRecord(null)}
                />
            )}
        </div>
    );
}