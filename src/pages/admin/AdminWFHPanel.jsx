// @ts-nocheck
import { useEffect, useState } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  Approved:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  Pending:   "bg-amber-100 text-amber-700 border-amber-200",
  Rejected:  "bg-red-100 text-red-700 border-red-200",
  Cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function AdminWFHPanel() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("Pending");
  const [notesModal, setNotesModal] = useState(null); // { id, action }
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = filter !== "All" ? { status: filter } : {};
      const { data } = await API.get("/wfh", { params });
      setRequests(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      console.error("AdminWFHPanel fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openNotesModal = (id, action) => {
    setNotes("");
    setNotesModal({ id, action });
  };

  const handleAction = async () => {
    if (!notesModal) return;
    try {
      setSubmitting(true);
      await API.put(`/wfh/${notesModal.id}`, {
        status: notesModal.action,
        managerNotes: notes,
      });
      toast.success(`WFH request ${notesModal.action.toLowerCase()} successfully`);
      setNotesModal(null);
      fetchRequests();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const pending   = requests.filter(r => r.status === "Pending").length;
  const approved  = requests.filter(r => r.status === "Approved").length;
  const rejected  = requests.filter(r => r.status === "Rejected").length;

  return (
    <div className="space-y-5">
      {/* Header + Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-700 to-port-teal p-6 shadow-lg">
        <div className="absolute -top-6 -right-6 w-40 h-40 bg-white/10 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            
            <div>
              <h2 className="text-xl font-bold text-white">WFH Requests</h2>
              <p className="text-teal-100 text-xs mt-0.5">Review and approve employee Work From Home requests</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pending",  val: pending,  bg: "bg-amber-50/90 text-amber-700" },
              { label: "Approved", val: approved, bg: "bg-emerald-50/90 text-emerald-700" },
              { label: "Rejected", val: rejected, bg: "bg-red-50/90 text-red-700" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl px-4 py-3 backdrop-blur-sm ${s.bg}`}>
                <p className="text-xl font-bold">{s.val}</p>
                <p className="text-xs font-bold opacity-70 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="panel overflow-hidden">
        <div className="flex items-center gap-1 px-5 py-3 border-b border-slate-100 overflow-x-auto">
          {["All", "Pending", "Approved", "Rejected", "Cancelled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === tab
                  ? "bg-teal-500 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {tab}
              {tab === "Pending" && pending > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold">
                  {pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm font-bold text-slate-500">No {filter !== "All" ? filter.toLowerCase() : ""} WFH requests</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {requests.map((req) => {
              const style = STATUS_STYLES[req.status] || STATUS_STYLES.Pending;
              const startDate = new Date(req.startDate);
              const endDate   = new Date(req.endDate);
              const empName   = req.employee
                ? `${req.employee.firstName || ""} ${req.employee.lastName || ""}`.trim()
                : "—";

              return (
                <div
                  key={req._id}
                  className="px-6 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                    {/* Employee info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-teal-700">
                          {req.employee?.firstName?.[0] || "?"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800">{empName}</p>
                        <p className="text-xs text-slate-400">
                          {req.employee?.employeeId} · {req.employee?.department}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 {startDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {req.numberOfDays > 1 && ` → ${endDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`}
                          <span className="ml-1.5 font-bold text-teal-600">
                            ({req.numberOfDays} day{req.numberOfDays > 1 ? "s" : ""})
                          </span>
                        </p>
                        {req.reason && (
                          <p className="text-xs text-slate-500 mt-1 italic max-w-xs leading-4">"{req.reason}"</p>
                        )}
                        {req.managerNotes && (
                          <p className="text-xs text-slate-400 mt-1">Note: {req.managerNotes}</p>
                        )}
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
                        {req.status}
                      </span>
                      {req.status === "Pending" && (
                        <>
                          <button
                            onClick={() => openNotesModal(req._id, "Approved")}
                            className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openNotesModal(req._id, "Rejected")}
                            className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {notesModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-slate-800 mb-1">
              {notesModal.action === "Approved" ? "✅ Approve" : "❌ Reject"} WFH Request
            </h3>
            <p className="text-xs text-slate-400 mb-4">Add an optional note to the employee</p>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional note for the employee..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-400 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setNotesModal(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={submitting}
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-50 ${
                  notesModal.action === "Approved"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {submitting ? "..." : `Confirm ${notesModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
