// @ts-nocheck
// "Today's voyage" — a ship that sails from check-in to the end of the shift.

import { useEffect, useState } from "react";
import { Anchor } from "lucide-react";
import { parseMinutes, SHIFT_END, SHIFT_START, SHIFT_TOTAL_MINUTES } from "@/components/attendance/attendanceHelpers";

const fmtDuration = (mins) => {
    const m = Math.max(0, Math.round(mins));
    return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
};



function getVoyage(record, status, now) {
    if (status === "On Leave") {
        return { progress: 0, worked: 0, state: "anchored", label: "In harbour", detail: "On leave today — enjoy your day off" };
    }
    if (status === "Absent") {
        return { progress: 0, worked: 0, state: "anchored", label: "In harbour", detail: "Marked absent — no voyage today" };
    }

    const checkIn = parseMinutes(record?.checkIn);
    if (checkIn === null) {
        return { progress: 0, worked: 0, state: "anchored", label: "At anchor", detail: `Check in to set sail · shift starts ${SHIFT_START}` };
    }

    const checkOut = parseMinutes(record?.checkOut);
    if (checkOut !== null) {
        const worked = record?.hoursWorked ? Number(record.hoursWorked) * 60 : checkOut - checkIn;
        const progress = Math.min(1, worked / SHIFT_TOTAL_MINUTES);
        return progress >= 1
            ? { progress: 1, worked, state: "docked", label: "Docked", detail: `Voyage complete · checked out at ${record.checkOut}` }
            : { progress, worked, state: "ended", label: "Voyage ended", detail: `Checked out at ${record.checkOut} · ${fmtDuration(SHIFT_TOTAL_MINUTES - worked)} short of port` };
    }

    const worked = Math.max(0, now.getHours() * 60 + now.getMinutes() - checkIn);
    const progress = Math.min(1, worked / SHIFT_TOTAL_MINUTES);
    return progress >= 1
        ? { progress: 1, worked, state: "arrived", label: "Arrived", detail: "Shift complete — you can check out" }
        : { progress, worked, state: "sailing", label: "Sailing", detail: `Set sail at ${record.checkIn} · ${fmtDuration(SHIFT_TOTAL_MINUTES - worked)} to port` };
}

// Tileable wave: two identical 600-wide segments, so translateX(-50%) loops seamlessly
const wave = (y, amp) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < 1200; x += 150) d += ` Q${x + 37.5} ${y - amp} ${x + 75} ${y} T${x + 150} ${y}`;
    return `${d} V60 H0Z`;
};

function Ship() {
    return (
        <svg viewBox="0 0 160 70" className="w-full h-auto" aria-hidden="true">
            {/* Smoke trails behind */}
            <circle className="wb-smoke" cx="26" cy="8" r="4" fill="#e2ebf2" />
            <circle className="wb-smoke wb-smoke-2" cx="26" cy="8" r="4" fill="#e2ebf2" />
            {/* Bridge at the stern */}
            <path d="M10 22H34V46H10Z" fill="#f4f8fb" />
            <rect x="8" y="19" width="28" height="4" rx="1" fill="#dfe9f1" />
            {[0, 1, 2].map((i) => <rect key={i} x={13 + i * 7} y="26" width="4" height="4" rx=".5" fill="#4a8fbb" />)}
            {[0, 1, 2].map((i) => <rect key={i} x={13 + i * 7} y="34" width="4" height="3" rx=".5" fill="#8fb7d2" />)}
            <path d="M22 19V10H30V19Z" fill="#e85e4a" />
            <rect x="22" y="12" width="8" height="2" fill="#0b3b5e" />
            {/* Containers */}
            <g stroke="#ffffff55" strokeWidth=".6">
                {["#e85e4a", "#f2a33a", "#2b8aaf", "#2f9e6e", "#e85e4a", "#2b8aaf"].map((c, i) => (
                    <rect key={`l${i}`} x={38 + i * 16} y="34" width="15" height="12" rx="1" fill={c} />
                ))}
                {["#2b8aaf", "#e85e4a", "#f2a33a", "#2b8aaf", "#f2a33a"].map((c, i) => (
                    <rect key={`u${i}`} x={38 + i * 16} y="23" width="15" height="10.5" rx="1" fill={c} />
                ))}
            </g>
            {/* Hull — bow points right */}
            <path d="M4 46H148L158 46L144 64H18Q9 62 4 46Z" fill="#0b3b5e" />
            <path d="M5 46H157L154 51H7Z" fill="#e85e4a" />
            <path d="M14 57H140" stroke="#ffffff22" strokeWidth="1.5" />
        </svg>
    );
}

function Port() {
    return (
        <svg viewBox="0 0 150 90" className="h-full w-full" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round">
                <path d="M30 80V30M48 80V30M30 30H48M30 48L48 66M48 48L30 66" />
                <path d="M10 26H120M39 26V8L105 26M39 8L14 26" />
                <path d="M96 26V40" className="wb-cable" strokeWidth="1.4" />
            </g>
            <rect className="wb-load" x="90" y="40" width="12" height="8" rx="1" fill="currentColor" opacity=".7" />
            <g fill="currentColor" opacity=".55">
                <rect x="60" y="66" width="18" height="12" rx="1" />
                <rect x="80" y="66" width="18" height="12" rx="1" />
                <rect x="100" y="66" width="18" height="12" rx="1" />
                <rect x="70" y="53" width="18" height="12" rx="1" />
                <rect x="90" y="53" width="18" height="12" rx="1" />
            </g>
            <rect x="0" y="78" width="150" height="12" fill="currentColor" opacity=".35" />
        </svg>
    );
}

export default function VoyageTracker({ record, status }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);

    const voyage = getVoyage(record, status, now);

    return (
        <div className="relative mt-5">
            {/* Sea scene — bleeds to the banner's edges */}
            <div className="relative -mx-8 -mb-8 h-24 overflow-hidden">
                {/* Destination port */}
                <div className="absolute right-4 bottom-6 h-16 w-28 text-ocean-100/50">
                    <Port />
                </div>

                {/* Back wave */}
                <svg className="voyage-wave absolute bottom-0 left-0 h-10 w-[200%]" style={{ animationDuration: "14s" }} viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
                    <path d={wave(22, 6)} fill="#4aa8de" fillOpacity=".25" />
                </svg>

                {/* Ship: sails in from the left and docks under the cranes, on a loop */}
                <div
                    title={`${voyage.label} · ${voyage.detail}`}
                    className="voyage-sail absolute bottom-2.5 w-24 sm:w-28"
                >
                    <div className="voyage-bob">
                        <Ship />
                    </div>
                    {/* Wake trailing behind the stern */}
                    <svg className="absolute -left-8 bottom-1 h-3 w-10 text-white/50" viewBox="0 0 40 12" aria-hidden="true">
                        <path className="voyage-wake" d="M40 6 Q30 2 20 6 T0 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>

                {/* Front wave + wake */}
                <svg className="voyage-wave absolute -bottom-1 left-0 h-7 w-[200%]" style={{ animationDuration: "9s" }} viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
                    <path d={wave(26, 5)} fill="#0b3b5e" fillOpacity=".55" />
                </svg>

                {/* Route markers */}
                <div className="absolute bottom-2 left-8 flex items-center gap-1.5 text-[10px] font-semibold text-ocean-100/80">
                    <Anchor size={11} />
                    {record?.checkIn ? `Check-in ${record.checkIn}` : SHIFT_START}
                </div>
                <div className="absolute bottom-2 right-8 text-[10px] font-semibold text-ocean-100/80">
                    Port · {SHIFT_END}
                </div>
            </div>
        </div>
    );
}
