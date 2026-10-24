// @ts-nocheck
// client/src/components/attendance/EditAttendanceModal.jsx

import { useEffect, useRef, useState } from "react";
import { STATUS_OPTIONS, LEAVE_TYPES, WORKING_STATUSES, formatDate, to24h } from "./constants";
import StatusIcon from "./StatusIcon";

const inputCls = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-colors";

// presetCheckOut: "HH:mm" to pre-fill when the admin pressed "Check out"
export default function EditAttendanceModal({ record, presetCheckOut = "", onSubmit, onClose }) {
    const [form, setForm] = useState(() => ({
        status: record?.status || "Present",
        checkIn: to24h(record?.checkIn),
        checkOut: presetCheckOut || to24h(record?.checkOut),
        leaveType: record?.leaveType || "",
        remarks: record?.remarks || "",
        reason: presetCheckOut ? "Check-out recorded by admin" : "",
    }));
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const checkOutRef = useRef(null);

    useEffect(() => {
        if (presetCheckOut) checkOutRef.current?.focus();
    }, [presetCheckOut]);

    // Esc closes the popup (not while saving)
    useEffect(() => {
        const onKey = (e) => { if (e.key === "Escape" && !saving) onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose, saving]);

    if (!record) return null;

    const isWorking = WORKING_STATUSES.includes(form.status);
    const set = (k) => (e) => { setForm((p) => ({ ...p, [k]: e.target.value })); setError(""); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isWorking) {
            if (form.checkOut && !form.checkIn) return setError("Add a check-in time before the check-out time.");
            if (form.checkIn && form.checkOut && form.checkOut <= form.checkIn) return setError("Check-out must be later than check-in.");
        }
        // Send every field explicitly — an empty value clears it on the server
        if (form.reason.trim().length < 3) return setError("Please say why you're changing this record (it's kept in the history).");
        const payload = {
            reason: form.reason.trim(),
            status: form.status,
            checkIn: isWorking ? form.checkIn : "",
            checkOut: isWorking ? form.checkOut : "",
            leaveType: form.status === "On Leave" ? form.leaveType : "",
            remarks: form.remarks.trim(),
        };
        try {
            setSaving(true);
            await onSubmit(payload);
        } catch (err) {
            setError(err?.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const name = `${record.employee?.firstName || ""} ${record.employee?.lastName || ""}`.trim();

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-bold text-navy-900">Edit attendance</h2>
                        <p className="text-xs text-slate-500 mt-0.5">{name} · {formatDate(record.date)}</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-lg font-bold transition-colors">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Status */}
                    <div>
                        <p id="att-edit-status" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</p>
                        <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby="att-edit-status">
                            {STATUS_OPTIONS.map((s) => (
                                <button type="button" key={s} onClick={() => { setForm((p) => ({ ...p, status: s })); setError(""); }}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all
                                        ${form.status === s ? "border-ocean-500 bg-ocean-50 text-ocean-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
                                ><span className="inline-flex items-center justify-center gap-1"><StatusIcon status={s} /> {s}</span></button>
                            ))}
                        </div>
                    </div>

                    {/* Check In/Out — only for working statuses */}
                    {isWorking ? (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="att-edit-in" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Check in</label>
                                <input id="att-edit-in" type="time" value={form.checkIn} onChange={set("checkIn")} className={inputCls} />
                            </div>
                            <div>
                                <label htmlFor="att-edit-out" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Check out</label>
                                <input id="att-edit-out" ref={checkOutRef} type="time" value={form.checkOut} onChange={set("checkOut")} className={inputCls} />
                            </div>
                            <p className="col-span-2 -mt-1 text-xs text-slate-400">Clear a time to remove it.</p>
                        </div>
                    ) : (
                        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                            Check-in, check-out and hours are cleared for “{form.status}”.
                        </p>
                    )}

                    {/* Leave Type — only for On Leave */}
                    {form.status === "On Leave" && (
                        <div>
                            <label htmlFor="att-edit-leave" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Leave type</label>
                            <select id="att-edit-leave" value={form.leaveType} onChange={set("leaveType")} className={`${inputCls} cursor-pointer`}>
                                {LEAVE_TYPES.map((l) => <option key={l} value={l}>{l || "Not specified"}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Remarks */}
                    <div>
                        <label htmlFor="att-edit-remarks" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Remarks</label>
                        <input id="att-edit-remarks" type="text" value={form.remarks} placeholder="Optional note…" onChange={set("remarks")} className={`${inputCls} placeholder-slate-300`} />
                    </div>

                    {/* Reason — required, stored in the record's history */}
                    <div>
                        <label htmlFor="att-edit-reason" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            Reason for change <span className="text-red-500">*</span>
                        </label>
                        <input id="att-edit-reason" type="text" value={form.reason} onChange={set("reason")} placeholder="e.g. Forgot to check out — confirmed with manager" className={`${inputCls} placeholder-slate-300`} />
                        <p className="mt-1 text-xs text-slate-400">Saved with your name in this record's history.</p>
                    </div>

                    {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-sm font-bold transition-colors hover:bg-slate-100">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-[2] py-2.5 rounded-xl bg-gradient-to-r from-ocean-600 to-navy-600 text-white text-sm font-bold shadow-md shadow-ocean-200 transition-all hover:from-ocean-700 hover:to-navy-700 disabled:opacity-60">
                            {saving ? "Saving…" : "Update record"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
