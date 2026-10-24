// client/src/components/dashboard/DashboardSkeleton.jsx
// ─────────────────────────────────────────────────────────────
// Placeholder with the dashboard's shape while the first load is in flight.

const Block = ({ className = "" }) => <div className={`rounded bg-slate-200/70 ${className}`} />;

function PanelSkeleton({ rows = 4 }) {
    return (
        <div className="panel p-6 space-y-4">
            <Block className="h-4 w-40" />
            <Block className="h-3 w-24" />
            <div className="space-y-3 pt-2">
                {Array.from({ length: rows }, (_, i) => <Block key={i} className="h-3 w-full" />)}
            </div>
        </div>
    );
}

export default function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
            <div className="h-24 rounded-2xl bg-slate-200/70" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="panel p-5 space-y-4 lg:order-2 lg:col-span-2">
                    <Block className="h-4 w-44" />
                    {Array.from({ length: 4 }, (_, i) => <Block key={i} className="h-9 w-full rounded-lg" />)}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:order-1 lg:col-span-3">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="panel p-5 space-y-3">
                            <Block className="h-3 w-24" />
                            <Block className="h-7 w-20" />
                            <Block className="h-3 w-32" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PanelSkeleton rows={5} />
                <PanelSkeleton rows={5} />
            </div>
        </div>
    );
}
