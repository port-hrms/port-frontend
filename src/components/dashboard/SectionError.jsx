// client/src/components/dashboard/SectionError.jsx
// ─────────────────────────────────────────────────────────────
// Stand-in for a dashboard panel whose data failed to load.

import { AlertTriangle, RotateCw } from "lucide-react";

export default function SectionError({ title, onRetry, retrying = false, compact = false }) {
    return (
        <div className={`panel ${compact ? "px-5 py-4" : "p-6"} flex flex-col`}>
            <h3 className="text-[15px] font-bold text-navy-900">{title}</h3>
            <div className={`flex items-center gap-3 ${compact ? "mt-3" : "flex-1 flex-col justify-center py-8 text-center"}`}>
                <AlertTriangle size={compact ? 16 : 28} className="shrink-0 text-amber-500" />
                <p className="text-sm text-slate-500">Couldn't load this section.</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        disabled={retrying}
                        className={`${compact ? "ml-auto" : ""} inline-flex items-center gap-1.5 rounded-lg bg-ocean-50 px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-100 disabled:opacity-60`}
                    >
                        <RotateCw size={13} className={retrying ? "animate-spin" : ""} />
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}
