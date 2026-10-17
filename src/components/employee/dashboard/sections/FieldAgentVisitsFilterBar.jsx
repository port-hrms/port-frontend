// @ts-nocheck
export default function FieldAgentVisitsFilterBar({
    searchTerm,
    setSearchTerm,
    leadTypeFilter,
    setLeadTypeFilter,
    selectedDate,
    setSelectedDate,
    loading,
    onRefresh,
}) {
    return (
        <div className="bg-slate-50/50 rounded-2xl border border-slate-100/50 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full items-center">
                {/* Search Input */}
                <div className="flex-1 w-full relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 text-xs">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by client or student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100 transition-all font-medium"
                    />
                </div>

                {/* Lead Type Filter */}
                <select
                    value={leadTypeFilter}
                    onChange={(e) => setLeadTypeFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 text-xs text-slate-600 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 font-bold cursor-pointer"
                >
                    <option value="All">🎯 All Lead Types</option>
                    <option value="Client">🤝 Client Leads</option>
                    <option value="Internship">🎓 Student Leads</option>
                </select>

                {/* Date Filter */}
                <div className="w-full sm:w-auto relative flex items-center">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 text-xs text-slate-600 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-500 font-bold cursor-pointer"
                    />
                    {selectedDate && (
                        <button
                            onClick={() => setSelectedDate("")}
                            className="absolute -right-1.5 -top-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center cursor-pointer shadow-xs hover:bg-rose-600"
                            title="Clear date filter"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <button
                onClick={onRefresh}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-navy-800 hover:bg-navy-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0"
            >
                {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
        </div>
    );
}
