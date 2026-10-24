// @ts-nocheck
// client/src/components/employee/EmployeeForm.jsx
// Add / Edit employee — side drawer with steps.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle, ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import API from "../../api/axios";
import ConfirmDialog from "../ConfirmDialog";
import JobInfoSection from "./form/JobInfoSection";
import { LoginSetup, LoginStatus } from "./form/LoginCredentialsSection";
import PersonalInfoSection from "./form/PersonalInfoSection";
import DocumentsSection from "./form/DocumentsSection";
import BankInfoSection from "./form/BankInfoSection";
import { fieldId } from "./form/fieldId";
import { defaultForm, DEPARTMENTS, EMP_TYPES, GENDERS, STATUSES } from "./form/constants";

const STEPS = [
    { id: "personal", label: "Personal", fields: ["firstName", "lastName", "email", "phone", "dateOfBirth", "gender", "address"] },
    { id: "job", label: "Job", fields: ["department", "designation", "employmentType", "status", "joiningDate", "endingDate", "salary"] },
    { id: "kyc", label: "Bank & KYC", fields: ["aadharNumber", "panNumber", "ifscCode", "bankName", "accountNumber", "pfNumber", "pfUAN"] },
    { id: "documents", label: "Documents", fields: [] },
    { id: "access", label: "Login access", fields: ["loginPassword", "confirmLoginPassword"] },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IFSC_RE = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

// Input clean-up while typing
const SANITIZE = {
    phone: (v) => v.replace(/\D/g, "").slice(0, 10),
    aadharNumber: (v) => v.replace(/\D/g, "").slice(0, 12),
    accountNumber: (v) => v.replace(/\D/g, "").slice(0, 18),
    pfUAN: (v) => v.replace(/\D/g, "").slice(0, 12),
    panNumber: (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
    ifscCode: (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11),
};

function validateForm(form, { isEditMode }) {
    const e = {};
    const today = new Date().toISOString().slice(0, 10);

    // Personal
    if (!form.firstName.trim()) e.firstName = "Enter a first name";
    if (!form.lastName.trim()) e.lastName = "Enter a last name";
    if (!form.email.trim()) e.email = "Enter a work email";
    else if (!EMAIL_RE.test(form.email.trim())) e.email = "Enter a valid email, like name@company.com";
    if (!form.phone) e.phone = "Enter a mobile number";
    else if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Enter a valid 10-digit Indian mobile number";
    if (form.dateOfBirth) {
        if (form.dateOfBirth > today) e.dateOfBirth = "Date of birth can't be in the future";
        else if (form.dateOfBirth < "1940-01-01") e.dateOfBirth = "Check the year";
    }

    // Job
    if (!form.department) e.department = "Choose a department";
    if (!form.designation.trim()) e.designation = "Enter a designation";
    if (!form.employmentType) e.employmentType = "Choose an employment type";
    if (!form.status) e.status = "Choose a status";
    if (!form.joiningDate) e.joiningDate = "Choose the joining date";
    if (form.endingDate && form.joiningDate && form.endingDate < form.joiningDate) e.endingDate = "End date must be after the joining date";
    if (form.salary === "" || form.salary === null) e.salary = "Enter the monthly salary";
    else if (Number(form.salary) <= 0) e.salary = "Salary must be more than 0";

    // Bank & KYC — optional, but valid when entered
    if (form.aadharNumber && !/^\d{12}$/.test(form.aadharNumber)) e.aadharNumber = "Aadhaar must be 12 digits";
    if (form.panNumber && !PAN_RE.test(form.panNumber)) e.panNumber = "PAN looks like ABCDE1234F";
    if (form.ifscCode && !IFSC_RE.test(form.ifscCode)) e.ifscCode = "IFSC looks like SBIN0001234";
    if (form.accountNumber && !/^\d{9,18}$/.test(form.accountNumber)) e.accountNumber = "Account number must be 9–18 digits";
    if (form.pfUAN && !/^\d{12}$/.test(form.pfUAN)) e.pfUAN = "UAN must be 12 digits";

    // Login (create only)
    if (!isEditMode && form.createLogin && form.loginMode === "password") {
        if (!form.loginPassword) e.loginPassword = "Enter a temporary password";
        else if (form.loginPassword.length < 6) e.loginPassword = "Use at least 6 characters";
        if (form.confirmLoginPassword !== form.loginPassword) e.confirmLoginPassword = "Passwords don't match";
    }
    return e;
}

const stepOfField = (field) => STEPS.findIndex((s) => s.fields.includes(field));

export default function EmployeeForm({ employee, onClose, onSuccess }) {
    const isEditMode = Boolean(employee);
    const [form, setForm] = useState(defaultForm);
    const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify(defaultForm));
    const [docs, setDocs] = useState({ bankDetails: null, aadhar: null, resume: null, offerLetter: null });
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showErrorBanner, setShowErrorBanner] = useState(false);
    const [focusField, setFocusField] = useState(null);
    const [confirmDiscard, setConfirmDiscard] = useState(false);
    const [ifscInfo, setIfscInfo] = useState("");
    // In edit mode the list only has masked Aadhaar/bank numbers, so load the real ones first
    const [sensitiveLoading, setSensitiveLoading] = useState(isEditMode);
    const bodyRef = useRef(null);

    // Pre-fill in edit mode
    useEffect(() => {
        if (!isEditMode || !employee) return;
        const base = {
            ...defaultForm,
            firstName: employee.firstName || "",
            lastName: employee.lastName || "",
            email: employee.email || "",
            phone: employee.phone || "",
            dateOfBirth: employee.dateOfBirth?.slice(0, 10) || "",
            gender: employee.gender || "",
            address: employee.address || "",
            department: employee.department || "",
            designation: employee.designation || "",
            employmentType: employee.employmentType || "Full-Time",
            joiningDate: employee.joiningDate?.slice(0, 10) || "",
            endingDate: employee.endingDate?.slice(0, 10) || "",
            status: employee.status || "Active",
            salary: employee.salary ?? "",
            createLogin: false,
        };
        setForm(base);
        setInitialSnapshot(JSON.stringify(base));

        let cancelled = false;
        API.get(`/employees/${employee._id}/sensitive`)
            .then(({ data }) => {
                if (cancelled) return;
                const b = data?.data?.bankInfo || {};
                const withSensitive = {
                    ...base,
                    aadharNumber: data?.data?.aadharNumber || "",
                    bankName: b.bankName || "",
                    accountNumber: b.accountNumber || "",
                    ifscCode: b.ifscCode || "",
                    panNumber: b.panNumber || "",
                    pfNumber: b.pfNumber || "",
                    pfUAN: b.pfUAN || "",
                };
                setForm(withSensitive);
                setInitialSnapshot(JSON.stringify(withSensitive));
            })
            .catch(() => { if (!cancelled) toast.error("Could not load bank & KYC details"); })
            .finally(() => { if (!cancelled) setSensitiveLoading(false); });
        return () => { cancelled = true; };
    }, [employee, isEditMode]);

    const isDirty = useMemo(
        () => JSON.stringify(form) !== initialSnapshot || Object.values(docs).some(Boolean),
        [form, docs, initialSnapshot]
    );

    const requestClose = useCallback(() => {
        if (loading) return;
        if (isDirty) setConfirmDiscard(true);
        else onClose();
    }, [isDirty, loading, onClose]);

    // Esc closes (asks first if there are unsaved changes)
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && !confirmDiscard) requestClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [requestClose, confirmDiscard]);

    // Look up the bank from a complete IFSC code
    useEffect(() => {
        const code = form.ifscCode;
        if (!IFSC_RE.test(code)) { setIfscInfo(""); return; }
        let cancelled = false;
        fetch(`https://ifsc.razorpay.com/${code}`)
            .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
            .then((info) => {
                if (cancelled) return;
                setIfscInfo(`${info.BANK} · ${info.BRANCH}`);
                setForm((p) => (p.bankName ? p : { ...p, bankName: info.BANK }));
            })
            .catch((status) => { if (!cancelled) setIfscInfo(status === 404 ? "IFSC not found — please double-check it" : ""); });
        return () => { cancelled = true; };
    }, [form.ifscCode]);

    // After switching steps to show an error, focus that field
    useEffect(() => {
        if (!focusField) return;
        const el = document.getElementById(fieldId(focusField));
        if (el) {
            el.focus({ preventScroll: true });
            el.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        setFocusField(null);
    }, [focusField, step]);

    useEffect(() => { bodyRef.current?.scrollTo({ top: 0 }); }, [step]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const next = SANITIZE[name] ? SANITIZE[name](value) : value;
        setForm((p) => ({ ...p, [name]: next }));
        if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
    };

    const errorCount = Object.keys(errors).length;
    const stepErrorCount = (index) => STEPS[index].fields.filter((f) => errors[f]).length;

    const goNext = () => {
        const all = validateForm(form, { isEditMode });
        const current = Object.fromEntries(Object.entries(all).filter(([f]) => STEPS[step].fields.includes(f)));
        if (Object.keys(current).length > 0) {
            setErrors((p) => ({ ...p, ...current }));
            setFocusField(Object.keys(current)[0]);
            return;
        }
        setStep((s) => Math.min(s + 1, STEPS.length - 1));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        const all = validateForm(form, { isEditMode });
        setErrors(all);
        if (Object.keys(all).length > 0) {
            const first = Object.keys(all).sort((a, b) => stepOfField(a) - stepOfField(b))[0];
            setShowErrorBanner(true);
            setStep(stepOfField(first));
            setFocusField(first);
            return;
        }
        setShowErrorBanner(false);

        try {
            setLoading(true);
            const fd = new FormData();
            const { confirmLoginPassword: _confirm, ...payload } = form;
            if (!payload.createLogin || payload.loginMode !== "password") delete payload.loginPassword;
            Object.entries(payload).forEach(([k, v]) => {
                if (v !== undefined && v !== null) fd.append(k, String(v));
            });
            Object.entries(docs).forEach(([k, file]) => {
                if (file instanceof File || file instanceof Blob) fd.append(k, file);
            });

            if (isEditMode) {
                await API.put(`/employees/${employee._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
                toast.success("Changes saved");
            } else {
                const { data } = await API.post("/employees", fd, { headers: { "Content-Type": "multipart/form-data" } });
                const d = data?.data || {};
                if (d.inviteSent) toast.success(`Employee added · invite emailed to ${d.email}`);
                else if (d.loginCreated && d.inviteError) toast(d.inviteError, { icon: "⚠", duration: 7000 });
                else if (d.loginCreated) toast.success("Employee and login account created");
                else toast.success("Employee added");
            }
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.error || err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const isLast = step === STEPS.length - 1;
    const saveDisabled = loading || sensitiveLoading;

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/40 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) requestClose(); }}>
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="employee-form-title"
                className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                    <div className="min-w-0">
                        <h2 id="employee-form-title" className="text-lg font-bold text-navy-900">{isEditMode ? "Edit employee" : "Add employee"}</h2>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                            {isEditMode ? `${employee.firstName} ${employee.lastName} · ${employee.employeeId}` : "Fields marked * are required. You can add KYC and documents later."}
                        </p>
                    </div>
                    <button onClick={requestClose} aria-label="Close" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                {/* Steps */}
                <nav aria-label="Form steps" className="border-b border-slate-100 px-6">
                    <ol className="flex gap-1 overflow-x-auto">
                        {STEPS.map((s, i) => {
                            const active = i === step;
                            const count = stepErrorCount(i);
                            return (
                                <li key={s.id}>
                                    <button
                                        type="button"
                                        onClick={() => setStep(i)}
                                        aria-current={active ? "step" : undefined}
                                        className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors ${active ? "border-navy-800 text-navy-900" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                                    >
                                        <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${count ? "bg-red-100 text-red-700" : active ? "bg-navy-800 text-white" : i < step ? "bg-ocean-100 text-ocean-700" : "bg-slate-100 text-slate-500"}`}>
                                            {count ? "!" : i < step ? <Check size={12} /> : i + 1}
                                        </span>
                                        {s.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </nav>

                {/* Body */}
                <form id="employee-form" onSubmit={handleSubmit} noValidate ref={bodyRef} className="flex-1 overflow-y-auto px-6 py-6">
                    {showErrorBanner && errorCount > 0 && (
                        <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            <AlertCircle size={18} className="mt-0.5 shrink-0" />
                            <span>
                                <span className="font-semibold">{errorCount} field{errorCount === 1 ? " needs" : "s need"} attention.</span>{" "}
                                Steps marked with <span className="font-bold">!</span> have problems.
                            </span>
                        </div>
                    )}

                    {step === 0 && <PersonalInfoSection form={form} errors={errors} onChange={handleChange} genders={GENDERS} />}
                    {step === 1 && <JobInfoSection form={form} errors={errors} onChange={handleChange} departments={DEPARTMENTS} empTypes={EMP_TYPES} statuses={STATUSES} />}
                    {step === 2 && (
                        sensitiveLoading
                            ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-11 animate-pulse rounded-lg bg-slate-100" />)}</div>
                            : <BankInfoSection form={form} errors={errors} onChange={handleChange} ifscInfo={ifscInfo} />
                    )}
                    {step === 3 && (
                        <DocumentsSection
                            docs={docs}
                            onFileChange={(field, file) => setDocs((p) => ({ ...p, [field]: file }))}
                            existingDocs={employee?.documents}
                            employeeId={employee?._id}
                        />
                    )}
                    {step === 4 && (
                        isEditMode
                            ? <LoginStatus employee={employee} onInviteSent={onSuccess} />
                            : (
                                <LoginSetup
                                    form={form}
                                    errors={errors}
                                    onChange={handleChange}
                                    onToggleCreateLogin={(e) => setForm((p) => ({ ...p, createLogin: e.target.checked }))}
                                    onModeChange={(mode) => setForm((p) => ({ ...p, loginMode: mode }))}
                                />
                            )
                    )}
                </form>

                {/* Footer — always visible */}
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
                    <button
                        type="button"
                        onClick={() => setStep((s) => s - 1)}
                        disabled={step === 0}
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:invisible"
                    >
                        <ArrowLeft size={15} /> Back
                    </button>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={requestClose} className="rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                            Cancel
                        </button>
                        {!isLast && (
                            <button type="button" onClick={goNext} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-navy-800 hover:bg-slate-50">
                                Next <ArrowRight size={15} />
                            </button>
                        )}
                        <button
                            type="submit"
                            form="employee-form"
                            disabled={saveDisabled}
                            className="inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-ocean-600 to-navy-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-ocean-700 hover:to-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
                            {loading ? "Saving…" : sensitiveLoading ? "Loading details…" : isEditMode ? "Save changes" : "Create employee"}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmDiscard}
                title="Discard changes?"
                message="You have unsaved changes. If you close now, they will be lost."
                confirmLabel="Discard"
                cancelLabel="Keep editing"
                onConfirm={() => { setConfirmDiscard(false); onClose(); }}
                onCancel={() => setConfirmDiscard(false)}
            />
        </div>
    );
}
