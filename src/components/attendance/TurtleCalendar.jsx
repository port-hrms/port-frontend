// @ts-nocheck
import { useMemo } from "react";
import { isHalfDay, isLateEntry } from "./attendanceHelpers";

/* ─── Status → cell background ─── */
const CELL_BG = {
    Present: "bg-emerald-50 border-emerald-200",
    Late: "bg-amber-50 border-amber-200",
    "Late Entry": "bg-amber-50 border-amber-200",
    "Half Day": "bg-orange-50 border-orange-200",
    Absent: "bg-rose-50 border-rose-100",
    "On Leave": "bg-sky-50 border-sky-200",
    Weekend: "bg-slate-100/40 border-transparent opacity-50",
    Holiday: "bg-violet-50 border-violet-200",
};

/* ─── Status → label colour ─── */
const LABEL_COLOR = {
    Present: "text-emerald-600",
    Late: "text-amber-600",
    "Late Entry": "text-amber-600",
    "Half Day": "text-orange-600",
    Absent: "text-rose-400",
    "On Leave": "text-sky-600",
    Holiday: "text-violet-600",
};

/* ─── Get holiday for a dateStr (YYYY-MM-DD) ─── */
function getHolidayForDate(dateStr, holidays) {
    if (!holidays?.length) return null;
    return holidays.find(h => {
        const hDate = new Date(h.date);
        const hStr = `${hDate.getFullYear()}-${String(hDate.getMonth() + 1).padStart(2, "0")}-${String(hDate.getDate()).padStart(2, "0")}`;
        return hStr === dateStr;
    }) || null;
}

/* ─── Derive status from a calendar day ─── */
function deriveStatus(calDay) {
    const calDateObj = new Date(calDay.dateStr);
    const todayObj = new Date();
    todayObj.setHours(0, 0, 0, 0);

    if (calDay.record) {
        if (calDay.record.checkIn) {
            if (isHalfDay(calDay.record.checkIn))   return "Half Day";
            if (isLateEntry(calDay.record.checkIn)) return "Late";
        }
        return calDay.record.status;
    }

    if (calDateObj < todayObj) {
        const d = calDateObj.getDay();
        return d === 0 || d === 6 ? "Weekend" : "Absent";
    }

    return "Future";
}

/* ─── Status abbreviations for mobile ─── */
const LABEL_SHORT = {
    Present: "P",
    Late: "Lt",
    "Late Entry": "Lt",
    "Half Day": "½",
    Absent: "A",
    "On Leave": "Lv",
};

/* ─── Single calendar cell ─── */
function CalendarCell({ calDay, idx, showTurtle, holiday }) {
    const status = holiday ? "Holiday" : deriveStatus(calDay);
    const showLabel = status !== "Future" && status !== "Weekend";
    const fullLabel = status === "Late Entry" ? "Late" : status;
    const shortLabel = LABEL_SHORT[status] ?? (holiday ? "H" : "");

    return (
        <div
            className={`cal-cell relative flex flex-col items-center justify-center h-16 sm:h-24 rounded-xl sm:rounded-2xl border transition-all ${
                calDay.isToday ? "today-glow ring-2 ring-indigo-400 z-10" : "z-0"
            } ${CELL_BG[status] ?? "bg-white border-slate-100"}`}
            style={{ animationDelay: `${idx * 0.035}s` }}
        >
            <span className={`absolute top-1 left-1.5 text-[9px] sm:text-xs font-bold ${
                calDay.isToday ? "text-indigo-600" : "text-slate-400"
            }`}>{calDay.dayNumber}</span>

            {/* Turtle icon — hidden on mobile to save space */}
            {showTurtle && (
                <img
                    src="/turtle.png"
                    alt="Late"
                    className="hidden sm:block absolute bottom-1 right-1 w-7 h-7 object-contain drop-shadow-md"
                    title="Late check-in 🐢"
                />
            )}

            {/* Holiday name badge */}
            {holiday && (
                <div className="flex flex-col items-center gap-0.5 px-1 w-full">
                    <span className="hidden sm:block text-[9px] font-extrabold text-violet-500 uppercase tracking-wide text-center leading-tight line-clamp-2">
                        🎉 {holiday.name}
                    </span>
                    <span className="block sm:hidden text-[9px] font-extrabold text-violet-500">H</span>
                </div>
            )}

            {/* Status label (only when no holiday) */}
            {!holiday && showLabel && (
                <div className="flex flex-col items-center mt-2">
                    {/* Mobile: short label */}
                    <span className={`block sm:hidden text-[10px] font-extrabold ${LABEL_COLOR[status] ?? "text-slate-400"}`}>
                        {shortLabel}
                    </span>
                    {/* Desktop: full label */}
                    <span className={`hidden sm:block text-xs font-extrabold tracking-wide ${LABEL_COLOR[status] ?? "text-slate-400"}`}>
                        {fullLabel}
                    </span>
                </div>
            )}
        </div>
    );
}

/* ─── Build the grid matrix from records ─── */
function useCalendarDays(selectedMonth, records) {
    return useMemo(() => {
        if (!selectedMonth) return [];
        const [year, month] = selectedMonth.split("-").map(Number);
        const firstDay = new Date(year, month - 1, 1);
        const daysInMonth = new Date(year, month, 0).getDate();

        // Leading blank cells (previous month's days)
        const prevMonthDays = new Date(year, month - 1, 0).getDate();
        const days = Array(firstDay.getDay()).fill(null).map((_, i) => ({
            isBlank: true,
            dayNumber: prevMonthDays - firstDay.getDay() + i + 1,
        }));

        const todayObj = new Date();
        const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, "0")}-${String(todayObj.getDate()).padStart(2, "0")}`;

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
            const record = records.find(r => {
                const d = new Date(r.date);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` === dateStr;
            });
            days.push({ dayNumber: i, dateStr, record, isToday: todayStr === dateStr, isBlank: false });
        }

        // Trailing blank cells (next month's days)
        let trailingDayNum = 1;
        while (days.length % 7 !== 0) {
            days.push({ isBlank: true, dayNumber: trailingDayNum++ });
        }

        return days;
    }, [selectedMonth, records]);
}

/* ─── Public component ─── */
export default function TurtleCalendar({ selectedMonth, records, holidays = [] }) {
    const calendarDays = useCalendarDays(selectedMonth, records);

    // Find ALL cells where the employee was Late (past or today)
    const lateDayIndices = new Set(
        calendarDays
            .map((d, idx) => ({ d, idx }))
            .filter(({ d }) => {
                if (d.isBlank) return false;
                const status = deriveStatus(d);
                return status === "Late" || status === "Late Entry";
            })
            .map(({ idx }) => idx)
    );
    const hasLateDays = lateDayIndices.size > 0;

    return (
        <section className="rounded-3xl bg-white/80 border border-slate-200 shadow-sm p-5 md:p-6 backdrop-blur-[1px]">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                    <img src="/turtle.png" alt="Turtle" className="w-6 h-6 object-contain" />
                </div>
                <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Turtle Tracker</h3>
                    <p className="text-sm text-slate-500">
                        {hasLateDays
                            ? "🐢 The turtle is sitting on your late day(s)!"
                            : "Your monthly attendance at a glance."}
                    </p>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4 text-[10px] font-semibold text-slate-500">
                {[
                    { label: "Present",  color: "bg-emerald-200" },
                    { label: "Absent",   color: "bg-rose-200" },
                    { label: "Holiday",  color: "bg-violet-200" },
                    { label: "On Leave", color: "bg-sky-200" },
                    { label: "Late",     color: "bg-amber-200" },
                ].map(({ label, color }) => (
                    <span key={label} className="flex items-center gap-1">
                        <span className={`inline-block w-2.5 h-2.5 rounded-sm ${color}`} />
                        {label}
                    </span>
                ))}
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                    <div key={d} className="text-center text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest py-1">{d}</div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((calDay, idx) =>
                    calDay.isBlank ? (
                        <div
                            key={`blank-${idx}`}
                            className="cal-cell h-16 sm:h-24 rounded-xl sm:rounded-2xl bg-slate-100/40 border-transparent opacity-50 relative"
                        >
                            <span className="absolute top-1 left-1.5 text-[9px] sm:text-xs font-bold text-slate-400 opacity-60">
                                {calDay.dayNumber}
                            </span>
                        </div>
                    ) : (
                        <CalendarCell
                                key={calDay.dateStr}
                                calDay={calDay}
                                idx={idx}
                                showTurtle={lateDayIndices.has(idx)}
                                holiday={getHolidayForDate(calDay.dateStr, holidays)}
                            />
                    )
                )}
            </div>
        </section>
    );
}
