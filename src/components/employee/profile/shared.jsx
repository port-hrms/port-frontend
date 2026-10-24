// Small building blocks shared by the profile tabs
import { TONES } from "./format";

export function Pill({ children, tone }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${TONES[tone || children] || TONES.Draft}`}>
            {children}
        </span>
    );
}

export function Card({ title, action, children, className = "" }) {
    return (
        <section className={`panel p-5 ${className}`}>
            {(title || action) && (
                <div className="mb-4 flex items-center justify-between gap-3">
                    {title && <h3 className="text-sm font-bold text-navy-900">{title}</h3>}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}

export function InfoGrid({ items }) {
    return (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {items.filter(Boolean).map(([label, value]) => (
                <div key={label} className="min-w-0">
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="mt-0.5 truncate text-sm font-medium text-navy-900">{value || "—"}</dd>
                </div>
            ))}
        </dl>
    );
}

export function Empty({ icon, title, text }) {
    const Icon = icon;
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            {Icon && <Icon size={36} className="mb-3 text-slate-300" />}
            <p className="text-sm font-semibold text-slate-600">{title}</p>
            {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
        </div>
    );
}

export function Table({ columns, rows, rowKey }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
                <thead className="bg-slate-50/80 border-b border-slate-100">
                    <tr>
                        {columns.map((c) => (
                            <th key={c.label} className={`px-4 py-2.5 uppercase text-[11px] font-semibold text-slate-500 tracking-wider ${c.align === "right" ? "text-right" : "text-left"}`}>{c.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {rows.map((r) => (
                        <tr key={rowKey(r)} className="hover:bg-slate-50/60">
                            {columns.map((c) => (
                                <td key={c.label} className={`px-4 py-2.5 text-sm text-slate-700 ${c.align === "right" ? "text-right tabular-nums" : ""}`}>{c.render(r)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
