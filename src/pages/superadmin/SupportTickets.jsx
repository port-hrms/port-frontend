// @ts-nocheck
import { useState } from "react";

const FILTERS = ["All", "Open", "In Progress", "Resolved", "Closed"];

export default function SupportTickets() {
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    return (
        <div className="space-y-5">
            {/* Header row */}
            <div className="flex justify-between items-start sm:items-center flex-wrap gap-3">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Support Tickets</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Requests raised by organizations across the platform</p>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search tickets..."
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:border-indigo-600 transition-colors"
                    />
                </div>
            </div>

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

            {/* Empty state card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 sm:p-16 text-center">
                <svg
                    width="40" height="40" viewBox="0 0 24 24" fill="none"
                    stroke="#cbd5e1" strokeWidth="1.5" className="mx-auto mb-3.5"
                >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                </svg>
                <p className="text-sm text-slate-400">No tickets match your filters.</p>
            </div>
        </div>
    );
}
