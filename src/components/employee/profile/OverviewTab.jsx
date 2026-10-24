// @ts-nocheck
import { useState } from "react";
import toast from "react-hot-toast";
import { CalendarCheck, Clock, Plane, Wallet } from "lucide-react";
import API from "../../../api/axios";
import { Card, InfoGrid, Pill } from "./shared";
import { fmtDate, fmtMoney, MONTHS } from "./format";

function Stat({ icon, label, value, sub }) {
    const Icon = icon;
    return (
        <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <Icon size={16} className="text-ocean-600" />
            </div>
            <p className="mt-1.5 text-xl font-bold tabular-nums text-navy-900">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

export default function OverviewTab({ data, onSendInvite, sendingInvite }) {
    const { employee: emp, attendance, leaves, payroll, reviews } = data;
    const [sensitive, setSensitive] = useState(null);
    const [revealing, setRevealing] = useState(false);

    const toggleReveal = async () => {
        if (sensitive) { setSensitive(null); return; }
        try {
            setRevealing(true);
            const { data: res } = await API.get(`/employees/${emp._id}/sensitive`);
            setSensitive(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load details");
        } finally {
            setRevealing(false);
        }
    };

    const bank = sensitive?.bankInfo || emp.bankInfo || {};
    const aadhaar = sensitive ? sensitive.aadharNumber : emp.aadharNumber;
    const latestPay = payroll[0];
    const latestReview = reviews[0];
    const daysWorked = attendance.present + attendance.late + attendance.halfDay;

    return (
        <div className="space-y-5">
            {/* This month */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat icon={CalendarCheck} label="Days worked this month" value={daysWorked} sub={`${attendance.late} late · ${attendance.absent} absent`} />
                <Stat icon={Clock} label="Hours logged this month" value={attendance.hours} sub={attendance.wfh ? `${attendance.wfh} WFH day${attendance.wfh === 1 ? "" : "s"}` : "No WFH days"} />
                <Stat icon={Plane} label="Leave taken this year" value={`${leaves.approvedDaysThisYear} d`} sub={leaves.pending ? `${leaves.pending} request${leaves.pending === 1 ? "" : "s"} pending` : "No pending requests"} />
                <Stat
                    icon={Wallet}
                    label="Latest net pay"
                    value={latestPay ? fmtMoney(latestPay.netPay) : "—"}
                    sub={latestPay ? `${MONTHS[latestPay.month - 1]} ${latestPay.year} · ${latestPay.payment?.status || "Draft"}` : "No payroll yet"}
                />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Card title="Personal">
                    <InfoGrid items={[
                        ["Full name", `${emp.firstName} ${emp.lastName}`],
                        ["Work email", emp.email],
                        ["Mobile", emp.phone ? `+91 ${emp.phone}` : ""],
                        ["Date of birth", fmtDate(emp.dateOfBirth)],
                        ["Gender", emp.gender],
                        ["Address", emp.address],
                    ]} />
                </Card>

                <Card title="Job">
                    <InfoGrid items={[
                        ["Employee ID", emp.employeeId],
                        ["Department", emp.department],
                        ["Designation", emp.designation],
                        ["Employment type", emp.employmentType],
                        ["Joined", fmtDate(emp.joiningDate)],
                        emp.endingDate && ["End date", fmtDate(emp.endingDate)],
                        ["Monthly salary", fmtMoney(emp.salary)],
                        ["Latest review", latestReview ? `${latestReview.reviewCycle} ${latestReview.year} · ${latestReview.overallScore}/100 (${latestReview.grade})` : "Not reviewed yet"],
                    ]} />
                </Card>

                <Card
                    title="Bank & identity"
                    action={(
                        <button
                            onClick={toggleReveal}
                            disabled={revealing}
                            className="rounded-md bg-ocean-50 px-2.5 py-1 text-xs font-semibold text-ocean-700 hover:bg-ocean-100 disabled:opacity-60"
                        >
                            {revealing ? "Loading…" : sensitive ? "Hide numbers" : "Reveal numbers"}
                        </button>
                    )}
                >
                    {!emp.kycComplete && (
                        <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            KYC is incomplete. Add Aadhaar, PAN, account number and IFSC from <span className="font-semibold">Edit</span>.
                        </p>
                    )}
                    <InfoGrid items={[
                        ["Aadhaar", aadhaar],
                        ["PAN", bank.panNumber],
                        ["Bank", bank.bankName],
                        ["IFSC", bank.ifscCode],
                        ["Account number", bank.accountNumber],
                        ["PF UAN", bank.pfUAN],
                    ]} />
                </Card>

                <Card title="Login access">
                    <div className="flex items-start justify-between gap-4">
                        <InfoGrid items={[
                            ["Status", emp.hasLogin ? (emp.loginActive ? <Pill tone="Active">Can sign in</Pill> : <Pill tone="Inactive">Disabled</Pill>) : "No login"],
                            ["Last sign-in", emp.lastLogin ? fmtDate(emp.lastLogin, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"],
                        ]} />
                        <button
                            onClick={onSendInvite}
                            disabled={sendingInvite || emp.status === "Inactive"}
                            className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy-800 hover:bg-ocean-50 disabled:opacity-50"
                        >
                            {sendingInvite ? "Sending…" : emp.hasLogin ? "Send setup link" : "Create login & invite"}
                        </button>
                    </div>

                </Card>
            </div>
        </div>
    );
}
