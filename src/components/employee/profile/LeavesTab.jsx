// @ts-nocheck
import { Laptop, Plane } from "lucide-react";
import { Card, Empty, Pill, Table } from "./shared";
import { fmtDate } from "./format";

const range = (r) => {
    const s = fmtDate(r.startDate, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
    const e = fmtDate(r.endDate, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
    return s === e ? s : `${s} → ${e}`;
};

export default function LeavesTab({ leaves, wfh }) {
    return (
        <div className="space-y-5">
            <Card title={`Leave requests (${leaves.items.length})`}>
                {leaves.items.length === 0 ? (
                    <Empty icon={Plane} title="No leave requests yet" />
                ) : (
                    <Table
                        rowKey={(r) => r._id}
                        rows={leaves.items}
                        columns={[
                            { label: "Dates", render: range },
                            { label: "Type", render: (r) => r.leaveType },
                            { label: "Days", align: "right", render: (r) => r.numberOfDays },
                            { label: "Reason", render: (r) => <span className="line-clamp-1 max-w-56" title={r.reason}>{r.reason}</span> },
                            { label: "Status", render: (r) => <Pill>{r.status}</Pill> },
                            { label: "Decided by", render: (r) => r.approvedBy?.name || "—" },
                        ]}
                    />
                )}
            </Card>
            <Card title={`Work from home (${wfh.length})`}>
                {wfh.length === 0 ? (
                    <Empty icon={Laptop} title="No WFH requests yet" />
                ) : (
                    <Table
                        rowKey={(r) => r._id}
                        rows={wfh}
                        columns={[
                            { label: "Dates", render: range },
                            { label: "Days", align: "right", render: (r) => r.numberOfDays },
                            { label: "Reason", render: (r) => <span className="line-clamp-1 max-w-72" title={r.reason}>{r.reason}</span> },
                            { label: "Status", render: (r) => <Pill>{r.status}</Pill> },
                        ]}
                    />
                )}
            </Card>
        </div>
    );
}
