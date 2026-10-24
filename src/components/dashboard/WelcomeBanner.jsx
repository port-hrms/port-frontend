// client/src/components/dashboard/WelcomeBanner.jsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const greetingFor = (hour) => {
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

// Minimal harbour skyline: cranes, stacked containers and a ship on the water line
function HarbourSilhouette() {
    return (
        <svg viewBox="0 0 520 140" className="h-full w-full" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" opacity=".55">
                <path d="M300 118V48M322 118V48M300 48H322M300 70L322 92M322 70L300 92" />
                <path d="M276 44H400M311 44V22L380 44M311 22L280 44" />
                <path d="M420 118V62M440 118V62M420 62H440M420 82L440 102M440 82L420 102" />
                <path d="M398 58H500M430 58V40L488 58M430 40L402 58" />
            </g>

            {/* Crane hooks lifting containers */}
            <g className="wb-hook" fill="currentColor">
                <path className="wb-cable" d="M370 44V62" stroke="currentColor" strokeWidth="1.5" opacity=".55" />
                <rect className="wb-load" x="363" y="62" width="14" height="9" rx="1" opacity=".5" />
            </g>
            <g className="wb-hook wb-hook-2" fill="currentColor">
                <path className="wb-cable" d="M478 58V76" stroke="currentColor" strokeWidth="1.5" opacity=".55" />
                <rect className="wb-load" x="471" y="76" width="14" height="9" rx="1" opacity=".5" />
            </g>

            <g fill="currentColor">
                {/* Container stacks on the quay */}
                {[0, 1, 2, 3].map((i) => (
                    <rect key={`a${i}`} x={340 + i * 20} y="104" width="18" height="14" rx="1" opacity={i % 2 ? 0.35 : 0.22} />
                ))}
                {[0, 1, 2].map((i) => (
                    <rect key={`b${i}`} x={350 + i * 20} y="89" width="18" height="13" rx="1" opacity={i % 2 ? 0.22 : 0.35} />
                ))}
            </g>

            {/* Ship — drifts slowly and bobs on the water */}
            <g className="wb-ship-drift">
                <g className="wb-ship" fill="currentColor">
                    <path d="M60 112H246L232 130H82Z" opacity=".45" />
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <rect key={`s${i}`} x={88 + i * 22} y={i % 2 ? 94 : 98} width="20" height={i % 2 ? 17 : 13} rx="1" opacity=".3" />
                    ))}
                    <path d="M222 112V86H240V112Z" opacity=".4" />
                    <rect x="227" y="76" width="6" height="10" opacity=".4" />
                    {/* Funnel smoke */}
                    <circle className="wb-smoke" cx="230" cy="70" r="4" opacity=".35" />
                    <circle className="wb-smoke wb-smoke-2" cx="230" cy="70" r="4" opacity=".35" />
                </g>
            </g>

            {/* Flowing water lines */}
            <path className="wb-water" d="M-260 132 Q-195 126 -130 132 T0 132 T130 132 T260 132 T390 132 T520 132 T650 132 T780 132" fill="none" stroke="currentColor" strokeWidth="1.5" opacity=".35" />
            <path className="wb-water wb-water-2" d="M-260 137 Q-195 133 -130 137 T0 137 T130 137 T260 137 T390 137 T520 137 T650 137 T780 137" fill="none" stroke="currentColor" strokeWidth="1" opacity=".2" />
        </svg>
    );
}

export default function WelcomeBanner() {
    const { user } = useAuth();
    const [now, setNow] = useState(new Date());

    // Tick on each minute boundary — the clock shows no seconds
    useEffect(() => {
        let interval;
        const timeout = setTimeout(() => {
            setNow(new Date());
            interval = setInterval(() => setNow(new Date()), 60_000);
        }, 60_000 - (Date.now() % 60_000));
        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, []);

    const date = now.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const time = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-navy-800 via-navy-700 to-ocean-600 text-white shadow-[0_10px_30px_-12px_rgba(11,59,94,0.55)]">
            {/* Soft light + skyline */}
            <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-ocean-400/20 blur-3xl" />
            <div className="wb-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-white/[0.07] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] text-ocean-100 md:block">
                <HarbourSilhouette />
            </div>

            <div className="relative px-6 py-5 sm:px-8">
                <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                    {greetingFor(now.getHours())}, {user?.name?.split(" ")[0]}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ocean-100/85">
                    <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-ocean-200" />
                        {date}
                    </span>
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Clock size={14} className="text-ocean-200" />
                        {time}
                    </span>
                </div>
            </div>
        </section>
    );
}
