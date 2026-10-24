// @ts-nocheck
// client/src/pages/admin/EmployeeProfile.jsx
// Full employee profile at /admin/employees/:id with tabs.

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
    ArrowLeft, Camera, Mail, MoreHorizontal, Pencil, Phone, Send, ShieldAlert, Trash2, UserRoundX,
} from "lucide-react";
import API from "@/api/axios";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmployeeAvatar from "@/components/employee/EmployeeAvatar";
import EmployeeForm from "@/components/employee/EmployeeForm";
import OverviewTab from "@/components/employee/profile/OverviewTab";
import AttendanceTab from "@/components/employee/profile/AttendanceTab";
import LeavesTab from "@/components/employee/profile/LeavesTab";
import PayrollTab from "@/components/employee/profile/PayrollTab";
import PerformanceTab from "@/components/employee/profile/PerformanceTab";
import DocumentsTab from "@/components/employee/profile/DocumentsTab";
import ActivityTab from "@/components/employee/profile/ActivityTab";
import { Pill } from "@/components/employee/profile/shared";
import { fmtDate } from "@/components/employee/profile/format";

const TABS = [
    { id: "overview", label: "Overview" },
    { id: "attendance", label: "Attendance" },
    { id: "leaves", label: "Leave & WFH" },
    { id: "payroll", label: "Payroll" },
    { id: "performance", label: "Performance" },
    { id: "documents", label: "Documents" },
    { id: "activity", label: "Activity" },
];

function HeaderMenu({ items }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        if (!open) return;
        const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        const esc = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", esc);
        return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
    }, [open]);
    return (
        <div className="relative" ref={ref}>
            <button onClick={() => setOpen((o) => !o)} aria-label="More actions" aria-haspopup="menu" aria-expanded={open} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50">
                <MoreHorizontal size={18} />
            </button>
            {open && (
                <div role="menu" className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {items.filter(Boolean).map(({ label, icon, onClick, danger, disabled }) => {
                        const Icon = icon;
                        return (
                            <button
                                key={label}
                                role="menuitem"
                                disabled={disabled}
                                onClick={() => { setOpen(false); onClick(); }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm disabled:opacity-50 ${danger ? "text-port-red hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
                            >
                                <Icon size={15} /> {label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function EmployeeProfile({ employeeId, onBack }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = TABS.some((t) => t.id === searchParams.get("tab")) ? searchParams.get("tab") : "overview";
    const setTab = (id) => setSearchParams(id === "overview" ? {} : { tab: id }, { replace: true });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [editing, setEditing] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [sendingInvite, setSendingInvite] = useState(false);
    const [photoBusy, setPhotoBusy] = useState(false);
    const photoInput = useRef(null);

    const load = useCallback(async (quiet = false) => {
        try {
            if (!quiet) setLoading(true);
            const { data: res } = await API.get(`/employees/${employeeId}/overview`);
            setData(res.data);
            setNotFound(false);
        } catch (err) {
            if (err.response?.status === 404 || err.response?.status === 400) setNotFound(true);
            else toast.error("Could not load this employee");
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => { load(); }, [load]);

    const emp = data?.employee;

    const sendInvite = async () => {
        try {
            setSendingInvite(true);
            const { data: res } = await API.post(`/employees/${employeeId}/send-invite`);
            toast.success(res.message || "Invite sent");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not send invite");
        } finally {
            setSendingInvite(false);
            load(true);
        }
    };

    const removeEmployee = async () => {
        try {
            setRemoving(true);
            await API.delete(`/employees/${employeeId}`);
            toast.success(`${emp.firstName} ${emp.lastName} removed`);
            onBack();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove employee");
            setRemoving(false);
        }
    };

    const uploadPhoto = async (file) => {
        if (!file) return;
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast.error("Choose a JPG, PNG or WebP image"); return; }
        if (file.size > 2 * 1024 * 1024) { toast.error("Photo must be 2 MB or smaller"); return; }
        try {
            setPhotoBusy(true);
            const fd = new FormData();
            fd.append("avatar", file);
            await API.put(`/employees/${employeeId}/avatar`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("Photo updated");
            load(true);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not upload photo");
        } finally {
            setPhotoBusy(false);
        }
    };

    const removePhoto = async () => {
        try {
            setPhotoBusy(true);
            await API.delete(`/employees/${employeeId}/avatar`);
            toast.success("Photo removed");
            load(true);
        } catch {
            toast.error("Could not remove photo");
        } finally {
            setPhotoBusy(false);
        }
    };

    const backLink = (
        <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy-800">
            <ArrowLeft size={16} /> Employees
        </button>
    );

    if (loading) {
        return (
            <div className="space-y-5">
                {backLink}
                <div className="panel flex animate-pulse items-center gap-5 p-6">
                    <div className="h-20 w-20 rounded-full bg-slate-100" />
                    <div className="space-y-2"><div className="h-5 w-48 rounded bg-slate-100" /><div className="h-3.5 w-64 rounded bg-slate-100" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />)}</div>
            </div>
        );
    }

    if (notFound || !emp) {
        return (
            <div className="space-y-5">
                {backLink}
                <div className="panel flex flex-col items-center py-16 text-center">
                    <UserRoundX size={40} className="mb-3 text-slate-300" />
                    <p className="text-base font-semibold text-slate-700">Employee not found</p>
                    <p className="mt-1 text-sm text-slate-500">They may have been removed, or the link is wrong.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {backLink}

            {/* ── Header ── */}
            <section className="panel overflow-hidden">
                <div className="h-16 bg-linear-to-r from-navy-800 via-navy-700 to-ocean-600" />
                <div className="flex flex-col gap-4 px-6 pb-5 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-end gap-4">
                        <div className="relative -mt-10">
                            <EmployeeAvatar employee={emp} className="h-20 w-20 text-2xl ring-4 ring-white" />
                            <button
                                onClick={() => photoInput.current?.click()}
                                disabled={photoBusy}
                                aria-label={emp.avatar ? "Change photo" : "Add photo"}
                                title={emp.avatar ? "Change photo" : "Add photo"}
                                className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-white ring-2 ring-white hover:bg-navy-700 disabled:opacity-60"
                            >
                                {photoBusy ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Camera size={14} />}
                            </button>
                            <input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { uploadPhoto(e.target.files?.[0]); e.target.value = ""; }} />
                        </div>
                        <div className="min-w-0 pb-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-xl font-bold text-navy-900">{emp.firstName} {emp.lastName}</h1>
                                <Pill>{emp.status}</Pill>
                                {!emp.kycComplete && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                                        <ShieldAlert size={12} /> KYC incomplete
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-600">{emp.designation} · {emp.department}</p>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span className="font-mono">{emp.employeeId}</span>
                                <a href={`mailto:${emp.email}`} className="inline-flex items-center gap-1 hover:text-ocean-700"><Mail size={12} /> {emp.email}</a>
                                {emp.phone && <a href={`tel:+91${emp.phone}`} className="inline-flex items-center gap-1 hover:text-ocean-700"><Phone size={12} /> +91 {emp.phone}</a>}
                                <span>Joined {fmtDate(emp.joiningDate)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-ocean-600 to-navy-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-ocean-700 hover:to-navy-800">
                            <Pencil size={15} /> Edit
                        </button>
                        <HeaderMenu items={[
                            { label: emp.hasLogin ? "Send setup link" : "Create login & invite", icon: Send, onClick: sendInvite, disabled: sendingInvite || emp.status === "Inactive" },
                            emp.avatar && { label: "Remove photo", icon: Camera, onClick: removePhoto },
                            { label: "Remove employee", icon: Trash2, onClick: () => setConfirmRemove(true), danger: true },
                        ]} />
                    </div>
                </div>

                {/* ── Tabs ── */}
                <nav aria-label="Profile sections" className="border-t border-slate-100 px-4">
                    <ul role="tablist" className="flex gap-1 overflow-x-auto">
                        {TABS.map((t) => (
                            <li key={t.id}>
                                <button
                                    role="tab"
                                    aria-selected={tab === t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${tab === t.id ? "border-navy-800 text-navy-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                                >
                                    {t.label}
                                    {t.id === "leaves" && data.leaves.pending > 0 && (
                                        <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 text-[11px] font-bold text-amber-700">{data.leaves.pending}</span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </section>

            {/* ── Tab content ── */}
            <div role="tabpanel">
                {tab === "overview" && <OverviewTab data={data} onSendInvite={sendInvite} sendingInvite={sendingInvite} />}
                {tab === "attendance" && <AttendanceTab employeeId={employeeId} />}
                {tab === "leaves" && <LeavesTab leaves={data.leaves} wfh={data.wfh} />}
                {tab === "payroll" && <PayrollTab payroll={data.payroll} />}
                {tab === "performance" && <PerformanceTab reviews={data.reviews} />}
                {tab === "documents" && <DocumentsTab employee={emp} onChanged={() => load(true)} />}
                {tab === "activity" && <ActivityTab data={{ ...data, employee: emp }} />}
            </div>

            {editing && (
                <EmployeeForm
                    employee={emp}
                    onClose={() => setEditing(false)}
                    onSuccess={() => load(true)}
                />
            )}

            <ConfirmDialog
                open={confirmRemove}
                title={`Remove ${emp.firstName} ${emp.lastName}?`}
                message="Their login will be disabled and they will no longer appear in lists. Attendance, payroll and leave history is kept."
                confirmLabel="Remove employee"
                busy={removing}
                onConfirm={removeEmployee}
                onCancel={() => setConfirmRemove(false)}
            />
        </div>
    );
}
