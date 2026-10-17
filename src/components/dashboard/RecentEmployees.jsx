// @ts-nocheck
// client/src/components/dashboard/RecentEmployees.jsx
// ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = ["bg-navy-700", "bg-ocean-600", "bg-navy-600", "bg-ocean-500", "bg-port-teal"];

const STATUS_STYLES = {
    Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    "On Leave": "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    Inactive: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
};

const getAvatarColor = (name = "") =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
const getInitials = (first = "", last = "") =>
    `${first[0] || ""}${last[0] || ""}`.toUpperCase();

export default function RecentEmployees({ employees }) {
    return (
        <div className="panel overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                    <h3 className="text-[15px] font-bold text-navy-900">Recent Employees</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Latest additions to the organization</p>
                </div>
            </div>

            {employees && employees.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-180">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                {["Employee", "Department", "Designation", "Status", "Joined"].map((h) => (
                                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {employees.map((emp) => (
                                <tr key={emp._id} className="hover:bg-ocean-50/50 transition-colors duration-150">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full ${getAvatarColor(emp.firstName)} text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-sm`}>
                                                {getInitials(emp.firstName, emp.lastName)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-navy-900">{emp.firstName} {emp.lastName}</p>
                                                <p className="text-xs text-slate-400">{emp.employeeId} · {emp.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{emp.department}</td>
                                    <td className="px-5 py-4 text-sm text-slate-600">{emp.designation}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${STATUS_STYLES[emp.status] || "bg-slate-100 text-slate-600"}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500">
                                        {new Date(emp.createdAt).toLocaleDateString("en-IN", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <div className="text-4xl mb-3 opacity-60">👤</div>
                    <p className="text-sm font-medium">No employees added yet</p>
                </div>
            )}
        </div>
    );
}
