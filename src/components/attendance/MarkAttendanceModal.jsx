// @ts-nocheck
// client/src/components/attendance/MarkAttendanceModal.jsx

import { useMemo, useState } from "react";
import { STATUS_OPTIONS, LEAVE_TYPES, WORKING_STATUSES, formatDate, to24h } from "./constants";
import StatusIcon from "./StatusIcon";
import useAttendancePolicy from "../../hooks/useAttendancePolicy";

// Status the shift rules give for a check-in time ("HH:mm")
const statusForCheckIn = (time24, policy) => {
    if (!time24) return null;
    if (time24 >= to24h(policy.halfDayCheckInAfter)) return "Half Day";
    if (time24 > to24h(policy.lateAfter)) return "Late";
    return "Present";
};

export default function MarkAttendanceModal({ form, setForm, employees, selectedDate, onSubmit, onClose }) {
    const policy = useAttendancePolicy();
    const [search, setSearch] = useState("");
    const [statusTouched, setStatusTouched] = useState(false);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = q
            ? employees.filter((e) => `${e.firstName} ${e.lastName} ${e.employeeId} ${e.department}`.toLowerCase().includes(q))
            : employees;
        // keep the chosen employee visible even if it doesn't match the search
        const chosen = employees.find((e) => e._id === form.employee);
        return chosen && !list.includes(chosen) ? [chosen, ...list] : list;
    }, [employees, search, form.employee]);

    const suggested = statusForCheckIn(form.checkIn, policy);

    const onCheckInChange = (value) => {
        setForm((p) => {
            const next = { ...p, checkIn: value };
            // Follow the shift rules unless the admin picked a status themselves
            const auto = statusForCheckIn(value, policy);
            if (auto && !statusTouched && WORKING_STATUSES.includes(p.status)) next.status = auto;
            return next;
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-navy-900">Mark Attendance</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{formatDate(selectedDate)}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-lg font-bold transition-colors">✕</button>
                </div>

                <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
                    {/* Employee Select */}
                    <div>
                        <label htmlFor="mark-employee" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Employee <span className="text-red-500">*</span></label>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={`Search ${employees.length} unmarked employee${employees.length === 1 ? "" : "s"}…`}
                            aria-label="Search employees"
                            className="mb-2 w-full px-3.5 py-2 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 placeholder-slate-400"
                        />
                        <select
                            id="mark-employee"
                            required
                            value={form.employee}
                            onChange={(e) => setForm((p) => ({ ...p, employee: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none cursor-pointer focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors"
                        >
                            <option value="">-- Select Employee --</option>
                            {filtered.map((emp) => (
                                <option key={emp._id} value={emp._id}>
                                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-3 gap-2">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    type="button"
                                    key={s}
                                    onClick={() => { setStatusTouched(true); setForm((p) => ({ ...p, status: s })); }}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all
                                        ${form.status === s
                                            ? "border-ocean-500 bg-ocean-50 text-ocean-700 shadow-sm"
                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                        }`}
                                >
                                    <span className="inline-flex items-center justify-center gap-1"><StatusIcon status={s} /> {s}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Check In / Out */}
                    {["Present", "Late", "Half Day"].includes(form.status) && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Check In</label>
                                <input type="time" value={form.checkIn}
                                    onChange={(e) => onCheckInChange(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Check Out</label>
                                <input type="time" value={form.checkOut}
                                    onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors" />
                            </div>
                        </div>
                    )}

                    {WORKING_STATUSES.includes(form.status) && suggested && (
                        <p className={`-mt-2 text-xs ${suggested === form.status ? "text-slate-400" : "text-amber-700"}`}>
                            {suggested === form.status
                                ? `Status set from the check-in time (late after ${policy.lateAfter}, half day from ${policy.halfDayCheckInAfter}).`
                                : `Shift rules say “${suggested}” for this check-in time — you've chosen “${form.status}”.`}
                        </p>
                    )}

                    {/* Leave Type */}
                    {form.status === "On Leave" && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Leave Type</label>
                            <select value={form.leaveType}
                                onChange={(e) => setForm((p) => ({ ...p, leaveType: e.target.value }))}
                                className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none cursor-pointer focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors">
                                {LEAVE_TYPES.map((l) => <option key={l} value={l}>{l || "-- Select Leave Type --"}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Remarks */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Remarks</label>
                        <input type="text" placeholder="Optional note..." value={form.remarks}
                            onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
                            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none placeholder-slate-300 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors" />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-bold transition-colors">Cancel</button>
                        <button type="submit" className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-ocean-600 to-navy-600 hover:from-ocean-700 hover:to-navy-700 text-white text-sm font-bold shadow-md shadow-ocean-200 transition-all">Save Attendance</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
