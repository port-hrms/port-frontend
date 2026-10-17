// @ts-nocheck
import { useEffect, useState } from "react";
import SuperAdminAPI from "../../api/superadminAxios";

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n || 0);

const STAT_CARDS = (d) => [
    {
        label: "Total Revenue",
        value: `₹${fmt(d.totalRevenue)}`,
        sub: "All-time collected",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
                <text x="12" y="16" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">₹</text>
            </svg>
        ),
        bgClass: "bg-indigo-600",
    },
    {
        label: "Monthly Recurring",
        value: `₹${fmt(d.mrr)}`,
        sub: "Active + trial orgs",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
            </svg>
        ),
        bgClass: "bg-sky-500",
    },
    {
        label: "Organizations",
        value: d.totalOrgs,
        sub: `${d.activeCount || 0} active · ${d.suspendedCount || 0} suspended · ${d.trialCount || 0} trial`,
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
        ),
        bgClass: "bg-purple-600",
    },
    {
        label: "Total Employees",
        value: d.totalEmployees,
        sub: "Across all organizations",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        bgClass: "bg-orange-500",
    },
];

function BarChart({ data }) {
    const max = Math.max(...data.map(d => d.amount), 1);
    const W = 600, H = 200, pad = { left: 30, right: 10, top: 20, bottom: 36 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;
    const barW = Math.floor(innerW / data.length) - 10;

    return (
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
                const y = pad.top + innerH * (1 - t);
                return <line key={t} x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />;
            })}
            {data.map((d, i) => {
                const x = pad.left + (i * (innerW / data.length)) + (innerW / data.length / 2) - barW / 2;
                const barH = max > 0 ? (d.amount / max) * innerH : 0;
                const y = pad.top + innerH - barH;
                return (
                    <g key={i}>
                        {barH > 0 && (
                            <>
                                <defs>
                                    <linearGradient id={`bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4f46e5" />
                                        <stop offset="100%" stopColor="#818cf8" />
                                    </linearGradient>
                                </defs>
                                <rect x={x} y={y} width={barW} height={barH} rx="5" fill={`url(#bar-${i})`} />
                                <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize="10" fill="#4f46e5" fontWeight="600">
                                    ₹{d.amount >= 1000 ? `${(d.amount / 1000).toFixed(1)}k` : d.amount}
                                </text>
                            </>
                        )}
                        <text x={x + barW / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#94a3b8">{d.month}</text>
                    </g>
                );
            })}
        </svg>
    );
}

function DonutChart({ planDist }) {
    const total = Object.values(planDist).reduce((a, b) => a + b, 0) || 1;
    const COLORS = { "Free Trial": "#f97316", "Starter": "#64748b", "Growth": "#4f46e5", "Enterprise": "#8b5cf6" };
    const R = 55, cx = 70, cy = 70, stroke = 30;
    const circumference = 2 * Math.PI * R;
    let offset = 0;
    const slices = Object.entries(planDist).map(([name, count]) => {
        const pct = count / total;
        const dash = circumference * pct;
        const gap = circumference - dash;
        const slice = { name, count, dash, gap, offset, color: COLORS[name] || "#e2e8f0" };
        offset += dash;
        return slice;
    });

    return (
        <div className="flex items-center gap-5 flex-wrap">
            <svg width={140} height={140} viewBox="0 0 140 140" className="flex-shrink-0">
                {slices.length === 0 && <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />}
                {slices.map((s, i) => (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={R}
                        fill="none"
                        stroke={s.color}
                        strokeWidth={stroke}
                        strokeDasharray={`${s.dash} ${s.gap}`}
                        strokeDashoffset={-s.offset}
                        className="-rotate-90 origin-[70px_70px]"
                    />
                ))}
                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1e293b">{total}</text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#94a3b8">Orgs</text>
            </svg>
            <div className="flex flex-col gap-2">
                {Object.entries(planDist).map(([name, count]) => (
                    <div key={name} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[name] || "#e2e8f0" }} />
                        <span className="text-xs text-slate-500">{name} — {count} {count === 1 ? "org" : "orgs"}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const STATUS_BADGE = {
    Active: "bg-emerald-100 text-emerald-700",
    Trial: "bg-amber-100 text-amber-700",
    Suspended: "bg-rose-100 text-rose-700",
};

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        SuperAdminAPI.get("/superadmin/analytics")
            .then(res => setData(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
    );
    if (!data) return null;

    const statCards = STAT_CARDS(data);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Platform Overview</h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">Real-time snapshot across every organization on Nebolla</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((c) => (
                    <div key={c.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 truncate">{c.label}</div>
                                <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">{c.value}</div>
                            </div>
                            <div className={`w-10 h-10 rounded-xl ${c.bgClass} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                {c.icon}
                            </div>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-2.5 truncate">{c.sub}</div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Revenue — last 6 months</h3>
                    <BarChart data={data.revenueByMonth || []} />
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Plan Distribution</h3>
                    <DonutChart planDist={data.planDist || {}} />
                </div>
            </div>

            {/* Recent orgs + Attention */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Recent Organization Signups</h3>
                    <div className="space-y-3">
                        {(data.recentOrgs || []).map(org => (
                            <div key={org._id} className="flex items-center justify-between gap-3 py-1">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                        {org.name[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{org.name}</div>
                                        <div className="text-xs text-slate-400">{org.industry || "—"}</div>
                                    </div>
                                </div>
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[org.status] || "bg-slate-100 text-slate-600"}`}>
                                    {org.status}
                                </span>
                            </div>
                        ))}
                        {(!data.recentOrgs || data.recentOrgs.length === 0) && (
                            <p className="text-xs text-slate-400">No organizations yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Needs Attention</h3>
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                        <svg className="text-red-500 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <span className="text-xs font-semibold text-red-600">{data.suspendedCount || 0} suspended orgs</span>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                        <svg className="text-amber-500 flex-shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        <span className="text-xs font-semibold text-amber-600">{data.trialCount || 0} on trial</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
