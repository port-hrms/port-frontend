// @ts-nocheck
export default function TrackingHeader({ refreshing, onRefresh }) {
    return (
        <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
                <h2 className="text-2xl font-bold text-navy-900 tracking-tight">Field Tracking</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                    Live location of field agents
                    {refreshing && <span className="ml-2 text-ocean-500 text-xs animate-pulse">● Refreshing...</span>}
                </p>
            </div>
            <button
                onClick={onRefresh}
                className="panel flex items-center gap-2 hover:border-ocean-400 text-slate-600 text-sm font-bold px-4 py-2.5 transition-all"
            >
                🔄 Refresh
            </button>
        </div>
    );
}
