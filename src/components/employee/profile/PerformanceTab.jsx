// @ts-nocheck
import { TrendingUp } from "lucide-react";
import { Card, Empty, Pill } from "./shared";
import { fmtDate } from "./format";

const GRADE_TONE = { Excellent: "Paid", Good: "Processed", Average: "Pending", "Needs Improvement": "Half Day", Poor: "Rejected" };

export default function PerformanceTab({ reviews }) {
    if (reviews.length === 0) {
        return <Card title="Performance reviews"><Empty icon={TrendingUp} title="No reviews yet" text="Reviews added under Performance will show here." /></Card>;
    }
    return (
        <div className="space-y-4">
            {reviews.map((r) => (
                <Card key={r._id}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-navy-900">{r.reviewCycle} {r.year} review</p>
                            <p className="text-xs text-slate-500">By {r.reviewerName || "HR"} · {fmtDate(r.reviewDate)}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold tabular-nums text-navy-900">{r.overallScore}<span className="text-sm font-medium text-slate-400">/100</span></span>
                            {r.grade && <Pill tone={GRADE_TONE[r.grade]}>{r.grade}</Pill>}
                        </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-linear-to-r from-navy-700 to-ocean-400" style={{ width: `${Math.min(r.overallScore || 0, 100)}%` }} />
                    </div>
                    {r.kpis?.length > 0 && (
                        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                            {r.kpis.map((k) => (
                                <li key={k._id || k.title} className="rounded-lg bg-slate-50 px-3 py-2">
                                    <p className="truncate text-xs text-slate-500">{k.title}</p>
                                    <p className="text-sm font-semibold text-navy-900">{k.achieved}/{k.target}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    {(r.strengths || r.areasOfImprovement || r.managerComments) && (
                        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                            {[["Strengths", r.strengths], ["To improve", r.areasOfImprovement], ["Manager comments", r.managerComments]].filter(([, v]) => v).map(([label, v]) => (
                                <div key={label}>
                                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                                    <dd className="mt-0.5 text-slate-700">{v}</dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </Card>
            ))}
        </div>
    );
}
