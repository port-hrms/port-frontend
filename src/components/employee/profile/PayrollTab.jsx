// @ts-nocheck
import { Wallet } from "lucide-react";
import { Card, Empty, Pill, Table } from "./shared";
import { fmtDate, fmtMoney, MONTHS } from "./format";

const gross = (p) => (p.earnings?.basic || 0) + (p.earnings?.hra || 0) + (p.earnings?.bonus || 0);

export default function PayrollTab({ payroll }) {
    return (
        <Card title="Payroll history">
            {payroll.length === 0 ? (
                <Empty icon={Wallet} title="No payroll records yet" text="Records appear here once payroll is generated." />
            ) : (
                <Table
                    rowKey={(r) => r._id}
                    rows={payroll}
                    columns={[
                        { label: "Month", render: (r) => <span className="font-medium text-navy-900">{MONTHS[r.month - 1]} {r.year}</span> },
                        { label: "Days", align: "right", render: (r) => `${r.attendance?.presentDays ?? "—"}/${r.attendance?.workingDays ?? "—"}` },
                        { label: "Gross", align: "right", render: (r) => fmtMoney(gross(r)) },
                        { label: "Deductions", align: "right", render: (r) => fmtMoney(gross(r) - r.netPay) },
                        { label: "Net pay", align: "right", render: (r) => <span className="font-semibold text-navy-900">{fmtMoney(r.netPay)}</span> },
                        { label: "Status", render: (r) => <Pill>{r.payment?.status || "Draft"}</Pill> },
                        { label: "Paid on", render: (r) => (r.payment?.status === "Paid" ? `${fmtDate(r.payment?.date)}${r.payment?.mode ? ` · ${r.payment.mode}` : ""}` : "—") },
                    ]}
                />
            )}
        </Card>
    );
}
