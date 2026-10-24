// @ts-nocheck
import { useState } from "react";
import toast from "react-hot-toast";
import { KeyRound, Mail, Send, ShieldCheck, ShieldOff } from "lucide-react";
import API from "../../../api/axios";
import Field, { SectionTitle } from "./Field";

function ModeOption({ value, current, onSelect, icon, title, text }) {
    const Icon = icon;
    const selected = current === value;
    return (
        <label className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition-colors ${selected ? "border-ocean-400 bg-ocean-50/60 ring-1 ring-ocean-200" : "border-slate-200 hover:border-slate-300"}`}>
            <input type="radio" name="loginMode" value={value} checked={selected} onChange={() => onSelect(value)} className="mt-1 accent-navy-700" />
            <span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-navy-900"><Icon size={15} /> {title}</span>
                <span className="mt-0.5 block text-xs text-slate-500">{text}</span>
            </span>
        </label>
    );
}

// Create mode: choose how the employee gets access
export function LoginSetup({ form, errors, onChange, onToggleCreateLogin, onModeChange }) {
    return (
        <section>
            <SectionTitle title="Login access" description="Let the employee sign in to see attendance, leaves and payslips." />

            <label htmlFor="emp-field-createLogin" className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3">
                <span>
                    <span className="block text-sm font-semibold text-navy-900">Give this employee login access</span>
                    <span className="block text-xs text-slate-500">Sign-in email: <span className="font-medium text-slate-700">{form.email || "set in Personal details"}</span></span>
                </span>
                <input
                    id="emp-field-createLogin"
                    type="checkbox"
                    checked={form.createLogin}
                    onChange={onToggleCreateLogin}
                    className="h-5 w-5 accent-navy-700"
                />
            </label>

            {form.createLogin && (
                <div className="mt-4 space-y-3">
                    <ModeOption
                        value="invite"
                        current={form.loginMode}
                        onSelect={onModeChange}
                        icon={Mail}
                        title="Email an invite (recommended)"
                        text="They get a secure link to set their own password. Nobody else ever knows it."
                    />
                    <ModeOption
                        value="password"
                        current={form.loginMode}
                        onSelect={onModeChange}
                        icon={KeyRound}
                        title="Set a temporary password"
                        text="Use only if email isn't available. Share it privately and ask them to change it."
                    />
                    {form.loginMode === "password" && (
                        <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                            <Field label="Temporary password" name="loginPassword" type="password" placeholder="At least 6 characters" required autoComplete="new-password" form={form} errors={errors} onChange={onChange} />
                            <Field label="Confirm password" name="confirmLoginPassword" type="password" placeholder="Re-enter password" required autoComplete="new-password" form={form} errors={errors} onChange={onChange} />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

// Edit mode: show current access and (re)send the setup link
export function LoginStatus({ employee, onInviteSent }) {
    const [sending, setSending] = useState(false);
    const hasLogin = employee?.hasLogin;

    const sendInvite = async () => {
        try {
            setSending(true);
            const { data } = await API.post(`/employees/${employee._id}/send-invite`);
            toast.success(data.message || "Invite sent");
            onInviteSent?.();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not send invite");
        } finally {
            setSending(false);
        }
    };

    return (
        <section>
            <SectionTitle title="Login access" description="Passwords are never set by admins — the employee sets their own from an emailed link." />
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${hasLogin ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                        {hasLogin ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-navy-900">{hasLogin ? "Has login access" : hasLogin === false ? "No login access yet" : "Login access"}</p>
                        <p className="text-xs text-slate-500">
                            {hasLogin
                                ? `Signs in as ${employee.email}. Send a new link if they can't sign in.`
                                : `An account will be created for ${employee?.email} and a setup link emailed.`}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={sendInvite}
                    disabled={sending || employee?.status === "Inactive"}
                    title={employee?.status === "Inactive" ? "Set the employee to Active first" : undefined}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-navy-800 hover:bg-ocean-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Send size={14} />
                    {sending ? "Sending…" : hasLogin ? "Send password setup link" : "Create login & send invite"}
                </button>
            </div>
        </section>
    );
}
