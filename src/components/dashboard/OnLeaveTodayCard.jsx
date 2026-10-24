// @ts-nocheck
import { PlaneTakeoff } from "lucide-react";
import EmployeeAvatar from "@/components/employee/EmployeeAvatar";

const MAX_SHOWN = 5;

// `leaves` is the server's list of approved leaves covering today, one per employee
export default function OnLeaveTodayCard({ leaves = [] }) {
    const shown = leaves.slice(0, MAX_SHOWN);
    const hiddenCount = leaves.length - shown.length;

    return (
        <div className="panel px-5 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className="h-8 w-8 rounded-lg bg-amber-50 text-port-amber ring-1 ring-amber-100 flex items-center justify-center">
                        <PlaneTakeoff size={16} />
                    </span>
                    <h3 className="text-[15px] font-bold text-navy-900">On Leave Today</h3>
                </div>
                <span className="min-w-7 rounded-md bg-slate-100 px-2 py-0.5 text-center text-xs font-bold text-slate-600 tabular-nums">{leaves.length}</span>
            </div>

            {shown.length > 0 ? (
                <div className="mt-4 flex items-start gap-4">
                    {shown.map((leave) => {
                        const employee = leave.employee || {};
                        const firstName = employee.firstName || "Employee";
                        const lastName = employee.lastName || "";

                        return (
                            <div key={leave._id} className="w-14 text-center" title={`${firstName} ${lastName} · ${leave.leaveType}`}>
                                <div className="relative mx-auto h-10 w-10">
                                    <EmployeeAvatar employee={employee} className="h-10 w-10 text-xs" />
                                    <span className="absolute -right-0.5 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-port-amber" aria-hidden="true" />
                                </div>
                                <p className="mt-1 text-xs font-semibold text-slate-500 truncate">
                                    {firstName}
                                </p>
                            </div>
                        );
                    })}
                    {hiddenCount > 0 && (
                        <div className="w-14 text-center">
                            <div className="mx-auto h-10 w-10 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                                +{hiddenCount}
                            </div>
                            <p className="mt-1 text-xs font-semibold text-slate-500">more</p>
                        </div>
                    )}
                </div>
            ) : (
                <p className="mt-3 text-sm text-slate-500">Everyone is in today — no approved leaves.</p>
            )}
        </div>
    );
}
