// @ts-nocheck
import { useEffect, useState } from "react";
import API from "../../api/axios";
import ApplyWFHModal from "../../components/employee/dashboard/sections/ApplyWFHModal";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_STYLES = {
  Approved:  { badge: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: "✓" },
  Pending:   { badge: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-400",   icon: "⏳" },
  Rejected:  { badge: "bg-red-100 text-red-700 border-red-200",             dot: "bg-red-500",     icon: "✕" },
  Cancelled: { badge: "bg-slate-100 text-slate-600 border-slate-200",       dot: "bg-slate-400",   icon: "—" },
};

export default function EmployeeWFH() {
  const { user } = useAuth();
  const employeeId = user?.employee?._id || user?.employee || null;

  const [loading, setLoading] = useState(true);
  const [wfhList, setWfhList] = useState([]);
  const [stats, setStats] = useState({ approved: 0, pending: 0, rejected: 0, totalDays: 0 });
  const [showModal, setShowModal] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (!employeeId) { setLoading(false); return; }
    let isMounted = true;
    fetchData(isMounted);
    return () => { isMounted = false; };
  }, [employeeId]);

  const fetchData = async (isMounted = true) => {
    try {
      setLoading(true);
      const [statsRes, listRes] = await Promise.allSettled([
        API.get("/wfh/stats", { params: { employeeId } }),
        API.get("/wfh", { params: { employeeId } }),
      ]);

      if (!isMounted) return;

      if (statsRes.status === "fulfilled" && statsRes.value?.data?.data) {
        setStats(statsRes.value.data.data);
      }
      if (listRes.status === "fulfilled" && Array.isArray(listRes.value?.data?.data)) {
        setWfhList(listRes.value.data.data);
      }
    } catch (err) {
      console.error("WFH fetch error:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this WFH request?")) return;
    try {
      setCancellingId(id);
      await API.delete(`/wfh/${id}`);
      toast.success("WFH request cancelled");
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading WFH records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* ── Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-6 shadow-lg">
        {/* Decorative blobs */}
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 left-16 w-32 h-32 bg-white/10 rounded-full" />

        <div className="relative flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
             
              <h2 className="text-xl font-extrabold text-white">Work From Home</h2>
            </div>
            <p className="text-teal-100 text-sm">Apply for WFH. Once approved, check-in from anywhere.</p>
          </div>
          <button
            id="apply-wfh-btn"
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-white text-teal-600 font-bold text-sm rounded-xl hover:bg-teal-50 transition-all shadow-sm whitespace-nowrap"
          >
            + Apply WFH
          </button>
        </div>

        {/* Stats row */}
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[
            { label: "Approved",     val: stats.approved,  style: "bg-emerald-50/90 text-emerald-700" },
            { label: "Pending",      val: stats.pending,   style: "bg-amber-50/90 text-amber-700" },
            { label: "Rejected",     val: stats.rejected,  style: "bg-red-50/90 text-red-700" },
            { label: "Total WFH Days", val: stats.totalDays, style: "bg-white/90 text-teal-700" },
          ].map((card) => (
            <div key={card.label} className={`rounded-xl px-4 py-3 backdrop-blur-sm ${card.style}`}>
              <p className="text-xl font-extrabold">{card.val}</p>
              <p className="text-xs font-bold opacity-70 mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── WFH Request List ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900">WFH History</h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
            {wfhList.length} request{wfhList.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="divide-y divide-slate-50">
          {wfhList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400">
              <p className="text-sm font-bold text-slate-600">No WFH requests yet</p>
              <p className="text-xs text-slate-400 mt-1">Click "Apply WFH" to get started</p>
            </div>
          ) : (
            wfhList.map((wfh) => {
              const style = STATUS_STYLES[wfh.status] || STATUS_STYLES.Pending;
              const startDate = new Date(wfh.startDate);
              const endDate   = new Date(wfh.endDate);
              const isPending  = wfh.status === "Pending";
              return (
                <div
                  key={wfh._id}
                  className="px-6 py-4 flex items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors flex-wrap sm:flex-nowrap"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Status dot */}
                    <div className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${style.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {startDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        {wfh.numberOfDays > 1 && (
                          <span className="text-slate-400 font-medium">
                            {" "}→ {endDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {wfh.numberOfDays} day{wfh.numberOfDays > 1 ? "s" : ""}
                      </p>
                      {wfh.reason && (
                        <p className="text-xs text-slate-500 mt-1.5 leading-5 max-w-xs truncate">{wfh.reason}</p>
                      )}
                      {wfh.managerNotes && (
                        <p className="text-xs text-slate-400 mt-1 italic">Note: {wfh.managerNotes}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style.badge}`}>
                      {style.icon} {wfh.status}
                    </span>
                    {isPending && (
                      <button
                        onClick={() => handleCancel(wfh._id)}
                        disabled={cancellingId === wfh._id}
                        className="text-xs font-bold text-red-500 hover:text-red-700 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
                      >
                        {cancellingId === wfh._id ? "..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
        <h4 className="font-bold text-teal-800 mb-3 text-sm">ℹ️ How WFH Works</h4>
        <ol className="space-y-2">
          {[
            "Submit a WFH request with your desired dates and reason.",
            "Admin/HR reviews and approves or rejects the request.",
            "On an approved WFH day, the geofencing restriction is removed — you can check in & out from home.",
            "Your attendance is recorded normally (hours worked, status) and tagged as WFH.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-teal-700">
              <span className="w-5 h-5 rounded-full bg-teal-200 text-teal-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {showModal && (
        <ApplyWFHModal
          employeeId={employeeId}
          onClose={() => {
            setShowModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
