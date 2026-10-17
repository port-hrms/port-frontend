// @ts-nocheck
import LeaveStatsWidget from "../components/employee/dashboard/sections/LeaveStatsWidget";

const EMP_STATUS_TONES = {
    Active: "bg-emerald-500/20 text-emerald-400",
    "On Leave": "bg-ocean-500/20 text-ocean-400",
    Inactive: "bg-slate-500/20 text-slate-400",
};

export default function EmployeeProfileCard({ empProfile, employeeId, onLogout, onViewAllLeaves }) {
    return (
        <>
            <div className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-ocean-400 to-navy-600 text-white text-xs font-bold flex items-center justify-center shrink-0 select-none">
                        {empProfile.firstName?.[0]}{empProfile.lastName?.[0]}
                    </div>
                    <div className="overflow-hidden flex-1 min-w-0">
                        <p className="text-white text-[13px] font-semibold truncate">{empProfile.firstName} {empProfile.lastName}</p>
                        <p className="text-ocean-100/60 text-[11px] truncate">{empProfile.designation}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${EMP_STATUS_TONES[empProfile.status] || "bg-slate-500/20 text-slate-400"}`}>
                        {empProfile.status}
                    </span>
                    <button onClick={onLogout} className="text-xs text-ocean-100/50 hover:text-port-red font-semibold transition-colors">
                        Sign out
                    </button>
                </div>
            </div>

            {/* Leave Stats Widget */}
            <LeaveStatsWidget
                employeeId={employeeId}
                onViewAll={onViewAllLeaves}
            />
        </>
    );
}
