// @ts-nocheck
// Change history of one attendance record: who, when, why, what changed.
import { useEffect, useState } from "react";
import { History, X } from "lucide-react";
import API from "@/api/axios";
import { formatDate } from "./constants";

const ACTION_LABEL = {
    created: "Marked manually",
    updated: "Edited",
    deleted: "Deleted",
    restored: "Restored",
    leave: "Leave",
    "missed-check-out": "Missed check-out flagged",
};
const ACTION_TONE = {
    created: "bg-ocean-50 text-ocean-700",
    updated: "bg-amber-50 text-amber-700",
    deleted: "bg-rose-50 text-rose-700",
    restored: "bg-emerald-50 text-emerald-700",
    leave: "bg-navy-50 text-navy-700",
    "missed-check-out": "bg-slate-100 text-slate-600",
};
const FIELD_LABEL = { status: "Status", checkIn: "Check in", checkOut: "Check out", hoursWorked: "Hours", leaveType: "Leave type", remarks: "Remarks" };
const SOURCE_LABEL = { self: "Employee check-in", admin: "Marked by admin", leave: "Created from approved leave", system: "System" };

export default function AttendanceHistoryModal({ recordId, onClose }) {
    const [data, setData] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let alive = true;
        API.get(`/attendance/${recordId}/history`)
            .then(({ data: res }) => { if (alive) setData(res.data); })
            .catch(() => { if (alive) setFailed(true); });
        const onKey = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => { alive = false; document.removeEventListener("keydown", onKey); };
    }, [recordId, onClose]);

    const entries = [...(data?.history || [])].reverse(); // newest first

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div role="dialog" aria-modal="true" aria-labelledby="att-history-title" className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 id="att-history-title" className="flex items-center gap-2 text-lg font-bold text-navy-900"><History size={18} /> Change history</h2>
                        {data && (
                            <p className="mt-0.5 text-xs text-slate-500">
                                {data.employee?.firstName} {data.employee?.lastName} · {formatDate(data.date)} · {SOURCE_LABEL[data.source] || "Employee check-in"}
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {failed ? (
                        <p className="text-sm text-red-600">Couldn't load the history.</p>
                    ) : !data ? (
                        <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}</div>
                    ) : entries.length === 0 ? (
                        <p className="text-sm text-slate-500">No manual changes. This record came from the employee's own check-in.</p>
                    ) : (
                        <ol className="relative space-y-5 border-l border-slate-200 pl-5">
                            {entries.map((h, i) => (
                                <li key={i} className="relative">
                                    <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-navy-600 ring-1 ring-slate-200" />
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ACTION_TONE[h.action] || "bg-slate-100 text-slate-600"}`}>{ACTION_LABEL[h.action] || h.action}</span>
                                        <span className="text-xs text-slate-500">
                                            {h.by?.name || h.byName || "System"} · {new Date(h.at).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                    {h.reason && <p className="mt-1 text-sm text-slate-700">“{h.reason}”</p>}
                                    {h.changes?.length > 0 && (
                                        <ul className="mt-1.5 space-y-0.5 text-xs text-slate-600">
                                            {h.changes.map((c) => (
                                                <li key={c.field}>
                                                    <span className="font-medium text-slate-500">{FIELD_LABEL[c.field] || c.field}:</span>{" "}
                                                    <span className="line-through decoration-slate-300">{c.from || "—"}</span> → <span className="font-semibold text-navy-900">{c.to || "—"}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </div>
        </div>
    );
}
