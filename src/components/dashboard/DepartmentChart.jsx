// @ts-nocheck
// client/src/components/dashboard/DepartmentChart.jsx
// ─────────────────────────────────────────────────────────────

function DepartmentBar({ name, count, maxCount }) {
    const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
    return (
        <li className="relative flex items-center gap-3 group">
            <span className="text-xs font-medium text-slate-600 w-24 text-right truncate">{name}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden" aria-hidden="true">
                <div
                    className={`h-full rounded-full bg-linear-to-r from-navy-700 to-ocean-400 transition-all duration-700 ease-out group-hover:opacity-80`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-bold text-navy-900 w-8 tabular-nums">
                {count}<span className="sr-only"> {count === 1 ? "employee" : "employees"}</span>
            </span>
        </li>
    );
}

export default function DepartmentChart({ departmentStats }) {
    const maxCount = departmentStats.length > 0
        ? Math.max(...departmentStats.map((d) => d.count))
        : 1;

    return (
        <div className="panel p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-[15px] font-bold text-navy-900">Department Distribution</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Employees by department</p>
                </div>
                <span className="text-xs font-semibold bg-ocean-50 text-ocean-700 px-2.5 py-1 rounded-md">
                    {departmentStats.length} depts
                </span>
            </div>
            {departmentStats.length > 0 ? (
                <ul className="space-y-3">
                    {departmentStats.map((dept) => (
                        <DepartmentBar
                            key={dept._id || "Unassigned"}
                            name={dept._id || "Unassigned"}
                            count={dept.count}
                            maxCount={maxCount}
                        />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-500 text-center py-8">No department data available</p>
            )}
        </div>
    );
}
