// @ts-nocheck
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fieldId } from "./fieldId";

const inputClass = (hasError, extra = "") =>
    `w-full py-2.5 text-sm text-slate-800 bg-white rounded-lg border outline-none transition-colors placeholder-slate-400 ${extra}
     ${hasError
        ? "border-red-400 bg-red-50/40 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"}`;

function Label({ name, label, required }) {
    return (
        <label htmlFor={fieldId(name)} className="mb-1.5 block text-xs font-semibold text-slate-600">
            {label} {required && <span className="text-port-red" aria-hidden="true">*</span>}
        </label>
    );
}

function Message({ name, error, hint }) {
    if (error) return <p id={`${fieldId(name)}-msg`} role="alert" className="mt-1 text-xs text-red-600">{error}</p>;
    if (hint) return <p id={`${fieldId(name)}-msg`} className="mt-1 text-xs text-slate-500">{hint}</p>;
    return null;
}

export default function Field({
    label, name, type = "text", placeholder, required, colSpan = "", form, errors, onChange,
    prefix, hint, ...inputProps
}) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (show ? "text" : "password") : type;
    const error = errors?.[name];

    return (
        <div className={colSpan}>
            <Label name={name} label={label} required={required} />
            <div className="relative">
                {prefix && (
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">{prefix}</span>
                )}
                <input
                    id={fieldId(name)}
                    type={inputType}
                    name={name}
                    value={form[name] ?? ""}
                    onChange={onChange}
                    placeholder={placeholder}
                    aria-invalid={Boolean(error)}
                    aria-required={required || undefined}
                    aria-describedby={error || hint ? `${fieldId(name)}-msg` : undefined}
                    onWheel={inputType === "number" ? (e) => e.target.blur() : undefined}
                    {...inputProps}
                    className={inputClass(error, `${prefix ? "pl-12" : "pl-3.5"} ${isPassword ? "pr-10" : "pr-3.5"}`)}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-label={show ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            <Message name={name} error={error} hint={hint} />
        </div>
    );
}

export function SelectField({ label, name, options, required, colSpan = "", form, errors, onChange, placeholder = "Select…", hint }) {
    const error = errors?.[name];
    return (
        <div className={colSpan}>
            <Label name={name} label={label} required={required} />
            <select
                id={fieldId(name)}
                name={name}
                value={form[name] ?? ""}
                onChange={onChange}
                aria-invalid={Boolean(error)}
                aria-required={required || undefined}
                aria-describedby={error || hint ? `${fieldId(name)}-msg` : undefined}
                className={`${inputClass(error, "px-3.5 cursor-pointer")} ${form[name] ? "" : "text-slate-400"}`}
            >
                <option value="" disabled={required}>{placeholder}</option>
                {options.map((option) => <option key={option} value={option} className="text-slate-800">{option}</option>)}
            </select>
            <Message name={name} error={error} hint={hint} />
        </div>
    );
}

export function SectionTitle({ title, description }) {
    return (
        <div className="mb-5">
            <h3 className="text-base font-bold text-navy-900">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
        </div>
    );
}
