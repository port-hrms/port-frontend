// @ts-nocheck
import { Cake } from "lucide-react";

function Header({ count }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
                <span className="h-8 w-8 rounded-lg bg-rose-50 text-port-red ring-1 ring-rose-100 flex items-center justify-center">
                    <Cake size={16} />
                </span>
                <h3 className="text-[15px] font-bold text-navy-900">Birthdays Today</h3>
            </div>
            {count > 0 && (
                <span className="min-w-7 rounded-md bg-rose-50 px-2 py-0.5 text-center text-xs font-bold text-port-red tabular-nums">{count}</span>
            )}
        </div>
    );
}

export default function BirthdayTodayCard({ employees = [] }) {
    if (!employees || employees.length === 0) {
        return (
            <div className="panel px-5 py-4">
                <Header count={0} />
                <p className="mt-3 text-sm text-slate-400">No birthdays today</p>
            </div>
        );
    }

    return (
        <div className="panel px-5 py-4">
            <Header count={employees.length} />

            <div className="mt-4 space-y-2.5">
                {employees.map((emp) => {
                    const initials = `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`.toUpperCase();
                    const age = emp.dateOfBirth
                        ? new Date().getFullYear() - new Date(emp.dateOfBirth).getFullYear()
                        : null;

                    return (
                        <div
                            key={emp._id || emp.employeeId}
                            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition-colors hover:bg-white hover:border-slate-200"
                        >
                            {emp.avatar ? (
                                <img
                                    src={emp.avatar}
                                    alt={`${emp.firstName} ${emp.lastName}`}
                                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-rose-100"
                                />
                            ) : (
                                <div className="h-10 w-10 shrink-0 rounded-full bg-ocean-50 text-navy-700 ring-2 ring-rose-100 font-bold text-xs flex items-center justify-center">
                                    {initials}
                                </div>
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-navy-900 truncate">
                                    {emp.firstName} {emp.lastName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {emp.designation}{emp.department ? ` · ${emp.department}` : ""}
                                </p>
                            </div>

                            {age && (
                                <span className="shrink-0 rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-port-red">
                                    Turns {age}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
