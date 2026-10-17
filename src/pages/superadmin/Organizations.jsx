// @ts-nocheck
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SuperAdminAPI from "../../api/superadminAxios";

const STATUS_BADGE = {
    Active: "bg-emerald-100 text-emerald-700",
    Trial: "bg-amber-100 text-amber-700",
    Suspended: "bg-rose-100 text-rose-700",
};

const FILTERS = ["All", "Active", "Trial", "Suspended"];

function NewOrgModal({ plans, onClose, onCreated }) {
    const [form, setForm] = useState({
        orgName: "",
        industry: "",
        city: "",
        planId: "",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
    });
    const [saving, setSaving] = useState(false);
    const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

    const generatePassword = () => {
        const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
        set("adminPassword", Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await SuperAdminAPI.post("/superadmin/organizations", form);
            toast.success(res.data.message || "Organization created!");
            if (res.data.generatedPassword) toast.success(`Auto-generated password: ${res.data.generatedPassword}`, { duration: 8000 });
            onCreated();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create organization");
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-colors";

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Onboard New Organization</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Organization</p>
                        <div className="space-y-2.5">
                            <input
                                className={inputClass}
                                placeholder="Organization name"
                                value={form.orgName}
                                onChange={e => set("orgName", e.target.value)}
                                required
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <input
                                    className={inputClass}
                                    placeholder="Industry"
                                    value={form.industry}
                                    onChange={e => set("industry", e.target.value)}
                                />
                                <input
                                    className={inputClass}
                                    placeholder="City"
                                    value={form.city}
                                    onChange={e => set("city", e.target.value)}
                                />
                            </div>
                            <select
                                className={`${inputClass} cursor-pointer`}
                                value={form.planId}
                                onChange={e => set("planId", e.target.value)}
                            >
                                <option value="">Free Trial — Free</option>
                                {plans.map(p => (
                                    <option key={p._id} value={p._id}>
                                        {p.name} — {p.price === 0 ? "Free" : `₹${p.price}/mo`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">Organization Admin</p>
                        <div className="space-y-2.5">
                            <input
                                className={inputClass}
                                placeholder="Admin full name"
                                value={form.adminName}
                                onChange={e => set("adminName", e.target.value)}
                                required
                            />
                            <input
                                className={inputClass}
                                type="email"
                                placeholder="Admin email — used to log in"
                                value={form.adminEmail}
                                onChange={e => set("adminEmail", e.target.value)}
                                required
                            />
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <input
                                    className={`${inputClass} pl-9 pr-24`}
                                    placeholder="Leave blank to auto-generate"
                                    value={form.adminPassword}
                                    onChange={e => set("adminPassword", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md transition-colors"
                                >
                                    ↻ Generate
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-[2] py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 disabled:opacity-60 transition-all"
                        >
                            {saving ? "Creating..." : "Create Organization"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Mobile org card (shown on small screens)
function OrgCard({ org, onSuspend }) {
    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                        {org.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900 truncate">{org.name}</div>
                        <div className="text-xs text-slate-400 truncate">{org.adminEmail || "—"}</div>
                    </div>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[org.status] || "bg-slate-100 text-slate-600"}`}>
                    {org.status}
                </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-50">
                <div className="flex gap-4 text-xs text-slate-500">
                    <span><strong className="text-slate-700">Plan:</strong> {org.plan?.name || "Free Trial"}</span>
                    <span><strong className="text-slate-700">Employees:</strong> {org.employeeCount || 0}</span>
                </div>
                <button
                    onClick={() => onSuspend(org._id)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        org.status === "Suspended"
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                    }`}
                >
                    {org.status === "Suspended" ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
}

export default function Organizations() {
    const [orgs, setOrgs] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);

    const fetchAll = async () => {
        try {
            const [orgRes, planRes] = await Promise.all([
                SuperAdminAPI.get("/superadmin/organizations"),
                SuperAdminAPI.get("/superadmin/plans"),
            ]);
            setOrgs(orgRes.data.data || []);
            setPlans(planRes.data.data || []);
        } catch {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleSuspend = async (id) => {
        try {
            const res = await SuperAdminAPI.patch(`/superadmin/organizations/${id}/suspend`);
            toast.success(res.data.message);
            fetchAll();
        } catch {
            toast.error("Failed to update status");
        }
    };

    const filtered = orgs.filter(o => {
        const matchFilter = filter === "All" || o.status === filter;
        const q = search.toLowerCase();
        const matchSearch = !q || o.name.toLowerCase().includes(q) || (o.adminEmail || "").toLowerCase().includes(q);
        return matchFilter && matchSearch;
    });

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start sm:items-center flex-wrap gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Organizations</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{orgs.length} registered organizations</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-500/25 transition-all"
                >
                    <span>+</span> New Organization
                </button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {/* Filter pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                                filter === f
                                    ? "bg-slate-900 border-slate-900 text-white"
                                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search org or email..."
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-600 transition-colors"
                    />
                </div>
            </div>

            {/* Content: Cards on mobile, Table on desktop */}
            {loading ? (
                <div className="text-center py-12 text-slate-400 text-sm">Loading organizations...</div>
            ) : (
                <>
                    {/* Mobile Cards */}
                    <div className="block md:hidden space-y-3">
                        {filtered.map(org => (
                            <OrgCard key={org._id} org={org} onSuspend={handleSuspend} />
                        ))}
                        {filtered.length === 0 && (
                            <p className="text-center text-slate-400 py-10 text-sm">No organizations found.</p>
                        )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50">
                                        {["ORGANIZATION", "PLAN", "EMPLOYEES", "STATUS", "ACTIONS"].map(h => (
                                            <th
                                                key={h}
                                                className={`px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider uppercase ${
                                                    h === "ACTIONS" ? "text-right" : "text-left"
                                                }`}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map(org => (
                                        <tr key={org._id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                                        {org.name[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-900">{org.name}</div>
                                                        <div className="text-xs text-slate-400">{org.adminEmail || "—"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">
                                                {org.plan?.name || "Free Trial"}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                                    {org.employeeCount || 0}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[org.status] || "bg-slate-100 text-slate-600"}`}>
                                                    {org.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleSuspend(org._id)}
                                                        title={org.status === "Suspended" ? "Activate organization" : "Suspend organization"}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                                            org.status === "Suspended"
                                                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                                : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                        }`}
                                                    >
                                                        {org.status === "Suspended" ? (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                                                        ) : (
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-10 text-center text-slate-400 text-sm">
                                                No organizations found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {showModal && <NewOrgModal plans={plans} onClose={() => setShowModal(false)} onCreated={fetchAll} />}
        </div>
    );
}
