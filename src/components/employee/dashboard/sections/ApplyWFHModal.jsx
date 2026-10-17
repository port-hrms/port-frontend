// @ts-nocheck
import { useState } from "react";
import API from "../../../../api/axios";
import toast from "react-hot-toast";

export default function ApplyWFHModal({ employeeId, onClose }) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    numberOfDays: 1,
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };

    // Auto-calculate days
    if ((name === "startDate" || name === "endDate") && updated.startDate && updated.endDate) {
      const start = new Date(updated.startDate);
      const end = new Date(updated.endDate);
      if (start <= end) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        updated.numberOfDays = Math.max(days, 1);
      }
    }

    setFormData(updated);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.startDate || !formData.endDate) {
      setError("Please select start and end dates");
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date cannot be after end date");
      return;
    }
    if (!formData.reason.trim()) {
      setError("Please provide a reason for WFH");
      return;
    }

    try {
      setLoading(true);
      await API.post("/wfh", { employee: employeeId, ...formData });
      toast.success("WFH request submitted! Awaiting admin approval ");
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to submit WFH request";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ animation: "slideUp 0.25s ease" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-ocean-600 to-port-teal px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">Apply for Work From Home</h2>
                <p className="text-xs text-teal-100 mt-0.5">Request will be sent for admin approval</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Date range row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={today}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || today}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Days badge */}
          {formData.startDate && formData.endDate && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-teal-50 border border-teal-100 rounded-xl">
              <span className="text-lg">📅</span>
              <span className="text-sm font-bold text-teal-700">
                {formData.numberOfDays} day{formData.numberOfDays > 1 ? "s" : ""} of WFH
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
              Reason
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={3}
              placeholder="Why do you need to work from home? (e.g., family emergency, health, etc.)"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">{formData.reason.length}/500 characters</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-red-500 mt-0.5">⚠</span>
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-ocean-600 to-port-teal text-white rounded-xl font-bold text-sm hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
