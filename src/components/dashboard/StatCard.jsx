// client/src/components/dashboard/StatCard.jsx
// ─────────────────────────────────────────────────────────────
// Shared metric tile + section heading for the dashboard.

// With onClick the tile becomes a button that opens the related module
export function StatCard({ icon, label, value, sub, compact = false, onClick }) {
    const Icon = icon;
    const Tag = onClick ? "button" : "div";
    return (
        <Tag
            {...(onClick ? { type: "button", onClick } : {})}
            className={`panel group relative block w-full overflow-hidden text-left ${compact ? "p-4" : "p-5"} transition-shadow duration-300 hover:shadow-[0_10px_28px_-12px_rgba(11,59,94,0.25)] ${onClick ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ocean-300" : ""}`}
        >
            {/* Accent line on hover */}
            <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-linear-to-r from-navy-700 to-ocean-400 transition-transform duration-300 group-hover:scale-x-100" />

            <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <span className={`${compact ? "h-8 w-8" : "h-9 w-9"} shrink-0 rounded-lg bg-ocean-50 text-navy-700 ring-1 ring-ocean-100 flex items-center justify-center`}>
                    <Icon size={compact ? 16 : 18} strokeWidth={2} />
                </span>
            </div>
            <p className={`${compact ? "mt-1 text-xl" : "mt-2 text-[26px]"} font-bold leading-none tracking-tight text-navy-900 tabular-nums truncate`}>
                {value}
            </p>
            {sub && <p className="mt-2 text-xs text-slate-500 truncate">{sub}</p>}
        </Tag>
    );
}

export function SectionHeader({ title, subtitle, action }) {
    return (
        <div className="mb-3 flex items-end justify-between gap-3">
            <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 rounded-full bg-linear-to-b from-ocean-400 to-navy-700" />
                <div>
                    <h3 className="text-[15px] font-bold text-navy-900">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                </div>
            </div>
            {action}
        </div>
    );
}
