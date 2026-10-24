// @ts-nocheck
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CalendarCheck2 } from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmployeeAvatar from "@/components/employee/EmployeeAvatar";

const MAX_REASON = 300;
const shortDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const STATUS_STYLES = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  Approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  Rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
  Cancelled: "bg-slate-100 text-slate-700",
};

// onUpdateStatus(leaveId, status, managerNotes) — rejecting always asks for a reason,
// which the employee sees with the decision.
export default function RecentLeaveRequests({
  requests,
  onUpdateStatus,
  id,
  title = "Recent Leave Requests",
  subtitle = "Latest leave applications by employees",
  emptyMessage = "No leave requests yet",
  showWaiting = false,
}) {
  const [updatingId, setUpdatingId] = useState(null);
  const [rejecting, setRejecting] = useState(null); // the request being rejected
  const [reason, setReason] = useState("");

  const handleStatusUpdate = async (leaveId, status, managerNotes) => {
    if (typeof onUpdateStatus !== "function") return false;
    try {
      setUpdatingId(leaveId);
      await onUpdateStatus(leaveId, status, managerNotes);
      return true;
    } catch {
      return false; // the caller already showed the error
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmReject = async () => {
    const done = await handleStatusUpdate(rejecting._id, "Rejected", reason.trim());
    if (done) setRejecting(null);
  };

  return (
    <div id={id} className="panel overflow-hidden scroll-mt-6">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-navy-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        {showWaiting && requests?.length > 0 && (
          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 tabular-nums">{requests.length} waiting</span>
        )}
      </div>

      {requests && requests.length > 0 ? (
        <ul className="divide-y divide-slate-100">
          {requests.map((request) => {
            const employee = request.employee || {};
            const employeeName = `${employee.firstName || ""} ${employee.lastName || ""}`.trim() || "Unknown employee";
            const busy = updatingId === request._id;
            const start = shortDate(request.startDate);
            const end = shortDate(request.endDate);

            return (
              <li key={request._id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4 hover:bg-ocean-50/40 transition-colors">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <EmployeeAvatar employee={employee} className="h-9 w-9 text-xs" />
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-semibold text-navy-900">{employeeName}</span>
                      <span className="text-xs text-slate-500">{employee.department}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700">
                      <span className="font-medium">{request.leaveType}</span>
                      <span className="text-slate-500"> · {start === end ? start : `${start} – ${end}`} · {request.numberOfDays} day{request.numberOfDays > 1 ? "s" : ""}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-2" title={request.reason || undefined}>
                      {request.reason || <span className="italic">No reason given</span>}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Applied {shortDate(request.createdAt)}
                      {showWaiting && request.status === "Pending" && (
                        <span className="font-medium text-amber-700"> · waiting {formatDistanceToNow(new Date(request.createdAt))}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 pl-12 sm:pl-0">
                  {request.status === "Pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(request._id, "Approved")}
                        disabled={busy}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReason(""); setRejecting(request); }}
                        disabled={busy}
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${STATUS_STYLES[request.status] || "bg-slate-100 text-slate-700"}`}>
                      {request.status}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <CalendarCheck2 className="mb-2 h-9 w-9 text-slate-300" />
          <p className="text-sm font-medium">{emptyMessage}</p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(rejecting)}
        title="Reject leave request?"
        message={rejecting && `${rejecting.employee?.firstName || "This employee"}'s ${rejecting.leaveType} (${rejecting.numberOfDays} day${rejecting.numberOfDays > 1 ? "s" : ""}) will be rejected. They'll see your reason.`}
        confirmLabel="Reject"
        busy={updatingId === rejecting?._id}
        confirmDisabled={!reason.trim()}
        onConfirm={confirmReject}
        onCancel={() => setRejecting(null)}
      >
        <label className="block text-xs font-semibold text-slate-600 mb-1" htmlFor="reject-reason">Reason</label>
        <textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON))}
          rows={3}
          placeholder="e.g. Release week — please pick dates after the 15th"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-ocean-400 focus:outline-none focus:ring-2 focus:ring-ocean-100"
        />
        <p className="mt-1 text-right text-xs text-slate-500">{reason.length}/{MAX_REASON}</p>
      </ConfirmDialog>
    </div>
  );
}
