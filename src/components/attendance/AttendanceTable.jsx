// @ts-nocheck
// client/src/components/attendance/AttendanceTable.jsx

import { CalendarX2 } from "lucide-react";
import { STATUS_STYLES, WORKING_STATUSES, formatDate, formatClockTime } from "./constants";
import EmployeeAvatar from "../employee/EmployeeAvatar";
import StatusIcon from "./StatusIcon";
import { formatHours } from "../../utils/dateUtils";

const fmtDistance = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`);

// Where the check-in / check-out happened, relative to the office
function LocationTag({ loc, distance, radius, wfh }) {
    if (wfh) return <span className="text-[11px] font-medium text-teal-700">WFH · no location check</span>;
    if (loc?.lat == null || loc?.lng == null) return <span className="text-[11px] text-slate-400">No location</span>;
    const outside = distance != null && radius != null && distance > radius;
    const title = `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}${loc.accuracy != null ? ` · GPS accuracy ±${loc.accuracy} m` : ""}`;
    return (
        <a
            href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            title={title}
            className={`inline-flex items-center gap-1 text-[11px] font-medium hover:underline ${outside ? "text-port-red" : "text-emerald-700"}`}
        >
            {outside ? "Outside office" : "At office"}
            {distance != null && ` · ${fmtDistance(distance)}`}
            {loc.accuracy != null && <span className="text-slate-400">(±{loc.accuracy} m)</span>}
        </a>
    );
}

export default function AttendanceTable({ records, loading, selectedDate, onEdit, onDelete, onCheckout, onMark, onHistory, deletedMode = false, onRestore }) {
    const markedCount = records.filter((r) => !r.unmarked).length;
    return (
        <div className="panel overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">Attendance Log</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                        {deletedMode
                            ? `${formatDate(selectedDate)} · ${records.length} deleted record${records.length === 1 ? "" : "s"}`
                            : `${formatDate(selectedDate)} · ${markedCount} marked${records.length > markedCount ? ` · ${records.length - markedCount} not marked` : ""}`}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <div className="w-10 h-10 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin mb-4" />
                    <p className="text-sm font-medium">Loading attendance...</p>
                </div>
            ) : records.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <CalendarX2 size={40} className="mb-3 text-slate-300" />
                    <p className="text-base font-semibold text-slate-600">{deletedMode ? "Nothing deleted on this date" : "No employees to show"}</p>
                    <p className="text-sm mt-1">{deletedMode ? "Deleted records appear here and can be restored." : "Add employees to start tracking attendance"}</p>
                </div>
            ) : (
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100">
                            {["Employee", "Status", "Check In", "Check Out", "Hours", "Leave Type", "Actions"].map((h) => (
                                <th key={h} className="px-5 py-3.5 text-left uppercase text-[11px] font-semibold text-slate-500 tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {records.map((rec) => (
                            <tr key={rec._id || `unmarked-${rec.employee?._id}`} className={`transition-colors group ${rec.unmarked ? "bg-slate-50/50 hover:bg-slate-50" : "hover:bg-ocean-50/40"}`}>
                                {/* Employee */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <EmployeeAvatar employee={rec.employee} />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {rec.employee?.firstName} {rec.employee?.lastName}
                                            </p>
                                            <p className="text-xs text-slate-400">{rec.employee?.employeeId} · {rec.employee?.department}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Status Badge */}
                                <td className="px-5 py-4">
                                    <div className="flex flex-col gap-1.5 items-start">
                                        {deletedMode ? (
                                        <div className="flex flex-col items-start gap-1.5">
                                            <p className="max-w-56 text-xs text-slate-500">
                                                Deleted by <span className="font-semibold text-slate-700">{rec.deletedBy?.name || "admin"}</span>
                                                {rec.deleteReason && <> — “{rec.deleteReason}”</>}
                                            </p>
                                            <div className="flex gap-2">
                                                <button onClick={() => onRestore?.(rec)} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors">Restore</button>
                                                <button onClick={() => onHistory?.(rec._id)} className="px-3 py-1.5 text-slate-500 hover:text-navy-800 text-xs font-semibold">History</button>
                                            </div>
                                        </div>
                                    ) : rec.unmarked ? (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                                                Not marked
                                            </span>
                                        ) : (
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[rec.status]}`}>
                                                <StatusIcon status={rec.status} />
                                                {rec.status}
                                            </span>
                                        )}
                                        {rec.workMode === "WFH" && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700 border border-teal-200">
                                            WFH
                                            </span>
                                        )}
                                        {!deletedMode && rec.missedCheckOut && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 ring-1 ring-amber-200">
                                                Missed check-out
                                            </span>
                                        )}
                                        {!rec.unmarked && (rec.edited || rec.source === "admin" || rec.source === "leave") && (
                                            <button
                                                type="button"
                                                onClick={() => onHistory?.(rec._id)}
                                                className="text-[11px] font-semibold text-slate-500 underline decoration-dotted underline-offset-2 hover:text-navy-800"
                                                title="See who changed this and why"
                                            >
                                                {rec.edited ? "Edited · history" : rec.source === "leave" ? "From leave · history" : "Added by admin · history"}
                                            </button>
                                        )}
                                    </div>
                                </td>

                                <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                                    {formatClockTime(rec.checkIn)}
                                    {rec.checkIn && rec.source !== "admin" && (
                                        <div><LocationTag loc={rec.location} distance={rec.checkInDistance} radius={rec.officeRadius} wfh={rec.workMode === "WFH"} /></div>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-sm text-slate-600 font-medium">
                                    {formatClockTime(rec.checkOut)}
                                    {rec.checkOut && rec.checkOutLocation?.lat != null && (
                                        <div><LocationTag loc={rec.checkOutLocation} distance={rec.checkOutDistance} radius={rec.officeRadius} wfh={rec.workMode === "WFH"} /></div>
                                    )}
                                </td>
                                <td className="px-5 py-4 text-sm font-bold text-slate-800">
                                    {rec.hoursWorked > 0 ? formatHours(rec.hoursWorked) : "—"}
                                </td>
                                <td className="px-5 py-4 text-xs text-slate-500">{rec.leaveType || "—"}</td>

                                {/* Actions */}
                                <td className="px-5 py-4">
                                    {deletedMode ? (
                                        <div className="flex flex-col items-start gap-1.5">
                                            <p className="max-w-56 text-xs text-slate-500">
                                                Deleted by <span className="font-semibold text-slate-700">{rec.deletedBy?.name || "admin"}</span>
                                                {rec.deleteReason && <> — “{rec.deleteReason}”</>}
                                            </p>
                                            <div className="flex gap-2">
                                                <button onClick={() => onRestore?.(rec)} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors">Restore</button>
                                                <button onClick={() => onHistory?.(rec._id)} className="px-3 py-1.5 text-slate-500 hover:text-navy-800 text-xs font-semibold">History</button>
                                            </div>
                                        </div>
                                    ) : rec.unmarked ? (
                                        <button
                                            onClick={() => onMark(rec.employee)}
                                            className="px-3 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-700 text-xs font-bold rounded-lg transition-colors"
                                        >
                                            Mark
                                        </button>
                                    ) : (
                                    <div className="flex gap-2">
                                        {WORKING_STATUSES.includes(rec.status) && rec.checkIn && !rec.checkOut && (
                                            <button
                                                onClick={() => onCheckout(rec)}
                                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold rounded-lg transition-colors"
                                            >
                                                Check out
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onEdit(rec)}
                                            className="px-3 py-1.5 bg-ocean-50 hover:bg-ocean-100 text-ocean-600 text-xs font-bold rounded-lg transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(rec._id)}
                                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-bold rounded-lg transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            )}
        </div>
    );
}
