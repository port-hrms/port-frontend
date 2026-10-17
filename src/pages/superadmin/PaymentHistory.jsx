// @ts-nocheck
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SuperAdminAPI from "../../api/superadminAxios";

const STATUS_BADGE = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-rose-100 text-rose-700",
};

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All statuses");

    const statuses = ["All statuses", "Paid", "Pending", "Failed"];

    const fetchPayments = async () => {
        try {
            const res = await SuperAdminAPI.get("/superadmin/payments");
            setPayments(res.data.data || []);
        } catch {
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filtered = payments.filter((p) => {
        const q = search.toLowerCase();
        const matchSearch = !q || p.org.toLowerCase().includes(q) || p.invoice.toLowerCase().includes(q);
        const matchStatus = statusFilter === "All statuses" || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const total = filtered.reduce((s, p) => s + (p.amount || 0), 0);

    const handleExportCSV = () => {
        if (!filtered.length) {
            toast.error("No transactions to export");
            return;
        }
        const headers = ["Invoice", "Organization", "Plan", "Amount", "Method", "Status", "Date"];
        const rows = filtered.map(p => [
            `"${p.invoice}"`,
            `"${p.org}"`,
            `"${p.plan}"`,
            p.amount,
            `"${p.method}"`,
            `"${p.status}"`,
            `"${p.date}"`
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payment_history_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Payment history exported as CSV");
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex justify-between items-start sm:items-center flex-wrap gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Payment History</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                        ₹{new Intl.NumberFormat("en-IN").format(total)} collected across {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} shown
                    </p>
                </div>
                {/* Export CSV */}
                <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 shadow-sm transition-all"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Export CSV
                </button>
            </div>

            {/* Search + Status filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by organization or invoice ID..."
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-600 transition-colors"
                    />
                </div>
                <div className="relative min-w-[140px]">
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 outline-none focus:border-indigo-600 cursor-pointer appearance-none pr-8 transition-colors"
                    >
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <svg
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-10 text-center text-slate-400 text-sm">Loading payment history...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[640px]">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    {["INVOICE", "ORGANIZATION", "PLAN", "AMOUNT", "METHOD", "STATUS", "DATE"].map(h => (
                                        <th
                                            key={h}
                                            className="px-5 py-3 text-[11px] font-bold text-slate-400 text-left tracking-wider uppercase whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filtered.map((p) => (
                                    <tr
                                        key={p.id || p.invoice}
                                        className="hover:bg-slate-50/60 transition-colors"
                                    >
                                        <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap font-mono">{p.invoice}</td>
                                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 whitespace-nowrap">{p.org}</td>
                                        <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{p.plan}</td>
                                        <td className="px-5 py-3.5 text-sm font-bold text-slate-900 whitespace-nowrap">₹{new Intl.NumberFormat("en-IN").format(p.amount)}</td>
                                        <td className="px-5 py-3.5 text-sm text-slate-600 whitespace-nowrap">{p.method}</td>
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_BADGE[p.status] || "bg-slate-100 text-slate-600"}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-slate-400 whitespace-nowrap">{p.date}</td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">
                                            No transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
