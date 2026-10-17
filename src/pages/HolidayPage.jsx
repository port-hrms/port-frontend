import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import HolidayCalendarView from "../components/holidays/HolidayCalendarView";
import HolidayManagement from "../components/holidays/HolidayManagement";
import { Gift, Calendar as CalendarIcon, Settings } from "lucide-react";

export default function HolidayPage() {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState("calendar"); // calendar | manage
    // const isAdmin = user?.role === "admin" || user?.role === "hr";
    const isAdmin = user?.role === "admin" || user?.role === "employee" && (
        user?.department?.toLowerCase() === "hr" ||
        user?.designation?.toLowerCase() === "hr"
    );
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="panel relative overflow-hidden p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative z-10 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-50 border border-ocean-100 text-ocean-600 text-xs font-bold uppercase tracking-wider mb-4">
                        <Gift className="w-3.5 h-3.5" />
                        Company Holidays
                    </div>
                    <h1 className="text-2xl sm:text-2xl font-bold text-navy-900 tracking-tight leading-tight">
                        Holiday Calendar
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm sm:text-base font-medium">
                        View company holidays and plan your time off accordingly.
                    </p>
                </div>

                {isAdmin && (
                    <div className="relative z-10 flex bg-slate-100 p-1.5 rounded-2xl shadow-sm border border-slate-200">
                        <button
                            onClick={() => setViewMode("calendar")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === "calendar"
                                    ? "bg-white text-ocean-600 shadow-md shadow-slate-200"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}
                        >
                            <CalendarIcon className="w-4 h-4" />
                            Calendar
                        </button>
                        <button
                            onClick={() => setViewMode("manage")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${viewMode === "manage"
                                    ? "bg-white text-ocean-600 shadow-md shadow-slate-200"
                                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                                }`}
                        >
                            <Settings className="w-4 h-4" />
                            Manage
                        </button>
                    </div>
                )}

                {/* Decorative background element */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-bl from-ocean-100/50 to-transparent pointer-events-none" />
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full" />
                <div className="absolute right-20 -bottom-12 w-32 h-32 bg-ocean-500/10 blur-2xl rounded-full" />
            </div>

            {/* Content */}
            <div className="transition-all">
                {viewMode === "calendar" ? (
                    <div className="panel overflow-hidden">
                        <HolidayCalendarView onNavigateToForm={isAdmin ? () => setViewMode("manage") : null} />
                    </div>
                ) : (
                    <div className="panel p-6 sm:p-8">
                        <HolidayManagement />
                    </div>
                )}
            </div>
        </div>
    );
}
