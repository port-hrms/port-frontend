// @ts-nocheck
// client/src/components/dashboard/RecentEmployees.jsx
// ─────────────────────────────────────────────────────────────
// Latest additions as a compact list (no sideways scrolling on small screens).

import { ArrowRight, UserPlus } from "lucide-react";
import EmployeeAvatar from "@/components/employee/EmployeeAvatar";

const STATUS_STYLES = {
    Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    "On Leave": "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    Inactive: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
};

const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function RecentEmployees({ employees, setActiveTab }) {
    return (
        <div className="panel overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-[15px] font-bold text-navy-900">Recent Employees</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Latest additions to the organization</p>
                </div>
                {setActiveTab && (
                    <button
                        type="button"
                        onClick={() => setActiveTab("employees")}
                        className="text-xs font-semibold text-ocean-700 hover:text-navy-800 bg-ocean-50 hover:bg-ocean-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                        View all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {employees && employees.length > 0 ? (
                <ul className="divide-y divide-slate-100">
                    {employees.map((emp) => (
                        <li key={emp._id} className="flex items-center gap-3 px-5 py-3 hover:bg-ocean-50/40 transition-colors">
                            <EmployeeAvatar employee={emp} className="h-9 w-9 text-xs" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-navy-900">{emp.firstName} {emp.lastName}</p>
                                <p className="truncate text-xs text-slate-500">
                                    {[emp.designation, emp.department].filter(Boolean).join(" · ")}
                                </p>
                            </div>
                            <div className="hidden shrink-0 text-right sm:block">
                                <p className="text-xs text-slate-500">Joined</p>
                                <p className="text-xs font-medium text-slate-700">{formatDate(emp.joiningDate || emp.createdAt)}</p>
                            </div>
                            <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${STATUS_STYLES[emp.status] || "bg-slate-100 text-slate-600"}`}>
                                {emp.status}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <UserPlus className="mb-2 h-9 w-9 text-slate-300" />
                    <p className="text-sm font-medium">No employees added yet</p>
                </div>
            )}
        </div>
    );
}
