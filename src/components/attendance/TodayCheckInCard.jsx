// @ts-nocheck
import { useEffect, useState } from "react";
import { formatCheckInTime } from "./constants";
import { STATUS_TONE, parseMinutes } from "./attendanceHelpers";
import { formatHours } from "../../utils/dateUtils";

export default function TodayCheckInCard({
    todayRecord,
    displayStatus,
    todayStatus,
    canCheckIn,
    canCheckOut,
    actionLoading,
    onCheckIn,
    onCheckOut,
}) {
    const [, setTick] = useState(0);

    // Re-render periodically to update elapsed hours while checked in
    useEffect(() => {
        if (!todayRecord?.checkIn || todayRecord?.checkOut) return;
        const interval = setInterval(() => setTick((t) => t + 1), 30000);
        return () => clearInterval(interval);
    }, [todayRecord?.checkIn, todayRecord?.checkOut]);

    const getTodayHours = () => {
        if (todayRecord?.hoursWorked && todayRecord.hoursWorked > 0) {
            return todayRecord.hoursWorked;
        }
        if (!todayRecord?.checkIn) return 0;

        const checkInMin = parseMinutes(todayRecord.checkIn);
        if (checkInMin === null) return 0;

        if (todayRecord?.checkOut) {
            const checkOutMin = parseMinutes(todayRecord.checkOut);
            if (checkOutMin !== null && checkOutMin > checkInMin) {
                return (checkOutMin - checkInMin) / 60;
            }
            return 0;
        }

        const now = new Date();
        const currentMin = now.getHours() * 60 + now.getMinutes();
        if (currentMin > checkInMin) {
            return (currentMin - checkInMin) / 60;
        }
        return 0;
    };

    const hoursWorked = getTodayHours();

    return (
        <section className="rounded-2xl bg-white/80 border border-slate-200 shadow-sm p-5 backdrop-blur-[1px]">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-navy-900">Today</h3>
                    <p className="text-sm text-slate-500 mt-1">Check in and check out for today only</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${STATUS_TONE[displayStatus] ?? STATUS_TONE[todayStatus]}`}>
                    {displayStatus}
                </span>
            </div>

            {/* Time info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {[
                    ["Check In",  formatCheckInTime(todayRecord?.checkIn)],
                    ["Check Out", formatCheckInTime(todayRecord?.checkOut)],
                    ["Hours",     formatHours(hoursWorked)],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold">{label}</p>
                        <p className="text-lg font-bold text-navy-900 mt-2">{value}</p>
                    </div>
                ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 mt-5">
                <button
                    onClick={onCheckIn}
                    disabled={!canCheckIn || actionLoading === "check-in"}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                    {actionLoading === "check-in"
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Checking in...</>
                        : "Check In"}
                </button>
                <button
                    onClick={onCheckOut}
                    disabled={!canCheckOut || actionLoading === "check-out"}
                    className="flex items-center gap-2 bg-ocean-600 hover:bg-ocean-700 disabled:bg-slate-300 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
                >
                    {actionLoading === "check-out"
                        ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Checking out...</>
                        : "Check Out"}
                </button>
            </div>
        </section>
    );
}
