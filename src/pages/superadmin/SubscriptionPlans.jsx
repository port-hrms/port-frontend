// @ts-nocheck
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SuperAdminAPI from "../../api/superadminAxios";

const ACCENT_COLORS = [
    { label: "Violet", value: "#8b5cf6" },
    { label: "Indigo", value: "#4f46e5" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Sky", value: "#0ea5e9" },
    { label: "Emerald", value: "#10b981" },
    { label: "Amber", value: "#f59e0b" },
    { label: "Orange", value: "#f97316" },
    { label: "Rose", value: "#f43f5e" },
    { label: "Slate", value: "#64748b" },
];

function PlanModal({ plan, onClose, onSaved }) {
    const isEdit = !!plan?._id;
    const [form, setForm] = useState({
        name: plan?.name || "",
        price: plan?.price !== undefined ? plan.price : "",
        billingCycle: plan?.billingCycle || "monthly",
        trialDays: plan?.trialDays || 0,
        maxEmployees: plan?.maxEmployees !== undefined ? plan.maxEmployees : "",
        features: (plan?.features || []).join("\n"),
        color: plan?.color || "#8b5cf6",
    });
    const [saving, setSaving] = useState(false);

    const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                price: form.price === "" ? 0 : Number(form.price),
                maxEmployees: form.maxEmployees === "" ? 10 : Number(form.maxEmployees),
                features: form.features.split("\n").map(s => s.trim()).filter(Boolean),
            };
            if (isEdit) {
                await SuperAdminAPI.put(`/superadmin/plans/${plan._id}`, payload);
                toast.success("Plan updated!");
            } else {
                await SuperAdminAPI.post("/superadmin/plans", payload);
                toast.success("Plan created!");
            }
            onSaved();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to save plan");
        } finally {
            setSaving(false);
        }
    };

    const labelClass = "block text-xs font-bold text-slate-500 tracking-wider uppercase mb-1.5";
    const fieldClass = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-colors";

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        {isEdit ? "Edit Plan" : "Create New Plan"}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Plan Name */}
                    <div>
                        <label className={labelClass}>Plan Name</label>
                        <input
                            className={fieldClass}
                            placeholder="e.g. Growth"
                            value={form.name}
                            onChange={e => set("name", e.target.value)}
                            required
                        />
                    </div>

                    {/* Price & Billing Cycle */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Price (₹)</label>
                            <input
                                className={fieldClass}
                                type="number"
                                placeholder="e.g. 4999"
                                value={form.price}
                                onChange={e => set("price", e.target.value)}
                                min={0}
                                onWheel={e => e.target.blur()}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Billing Cycle</label>
                            <div className="relative">
                                <select
                                    className={`${fieldClass} appearance-none pr-8 cursor-pointer`}
                                    value={form.billingCycle}
                                    onChange={e => set("billingCycle", e.target.value)}
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="one-time">One-time / Lifetime</option>
                                </select>
                                <svg
                                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Max Employees & Accent Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelClass}>Max Employees</label>
                            <input
                                className={fieldClass}
                                type="number"
                                placeholder="e.g. 50"
                                value={form.maxEmployees}
                                onChange={e => set("maxEmployees", e.target.value)}
                                min={1}
                                onWheel={e => e.target.blur()}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Accent Color</label>
                            <div className="relative">
                                <select
                                    className={`${fieldClass} appearance-none pr-8 cursor-pointer`}
                                    value={form.color}
                                    onChange={e => set("color", e.target.value)}
                                >
                                    {ACCENT_COLORS.map(c => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                                <svg
                                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <label className={labelClass}>Features (one per line)</label>
                        <textarea
                            className={`${fieldClass} min-h-[96px] resize-y leading-relaxed`}
                            value={form.features}
                            onChange={e => set("features", e.target.value)}
                            placeholder={"Attendance & Leaves\nPayroll (basic)\nEmail support"}
                        />
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60"
                        >
                            {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Plan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function SubscriptionPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // null | 'new' | plan_object

    const fetchPlans = async () => {
        try {
            const res = await SuperAdminAPI.get("/superadmin/plans");
            setPlans(res.data.data || []);
        } catch {
            toast.error("Failed to load plans");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this plan?")) return;
        try {
            await SuperAdminAPI.delete(`/superadmin/plans/${id}`);
            toast.success("Plan deleted");
            fetchPlans();
        } catch {
            toast.error("Failed to delete plan");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start sm:items-center flex-wrap gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Subscription Plans</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Manage the plans organizations can subscribe to</p>
                </div>
                <button
                    onClick={() => setModal("new")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/25 transition-all"
                >
                    <span>+</span> New Plan
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-10">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {plans.map(plan => (
                        <div
                            key={plan._id}
                            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm relative flex flex-col justify-between"
                        >
                            {/* Actions */}
                            <div className="absolute top-4 right-4 flex gap-1.5">
                                <button
                                    onClick={() => setModal(plan)}
                                    title="Edit plan"
                                    className="w-7 h-7 bg-slate-50 hover:bg-slate-100 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(plan._id)}
                                    title="Delete plan"
                                    className="w-7 h-7 bg-rose-50 hover:bg-rose-100 rounded-md flex items-center justify-center text-rose-500 hover:text-rose-700 transition-colors"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                </button>
                            </div>

                            <div>
                                {/* Icon */}
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-white mb-3.5 shadow-sm"
                                    style={{ backgroundColor: plan.color || "#8b5cf6" }}
                                >
                                    {plan.name[0].toUpperCase()}
                                </div>

                                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                                <p className="text-sm text-slate-500 mt-0.5 mb-4">
                                    {plan.price === 0 ? `Free / ${plan.trialDays || 0} days` : `₹${new Intl.NumberFormat("en-IN").format(plan.price)} / ${plan.billingCycle || "monthly"}`}
                                </p>

                                {/* Max employees */}
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                    <span>Up to <strong>{plan.maxEmployees}</strong> employees</span>
                                </div>

                                {/* Features */}
                                <div className="space-y-1.5 mb-5">
                                    {(plan.features || []).map((f, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                                            <svg className="flex-shrink-0 text-emerald-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                                            <span className="truncate">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Subscribers */}
                            <div className="pt-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
                                <span className="text-indigo-600 font-semibold">Subscribers</span>
                                <span className="font-bold text-slate-900 text-sm">{plan.subscribers || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {modal && (
                <PlanModal
                    plan={modal === "new" ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={fetchPlans}
                />
            )}
        </div>
    );
}
