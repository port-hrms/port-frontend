// @ts-nocheck
import { useState } from "react";

export default function Field({ label, name, type = "text", placeholder, required, colSpan = "", form, errors, onChange, ...inputProps }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (show ? "text" : "password") : type;

    return (
        <div className={colSpan}>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    value={form[name]}
                    onChange={onChange}
                    placeholder={placeholder}
                    onWheel={inputType === "number" ? (e) => e.target.blur() : undefined}
                    {...inputProps}
                    className={`w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border outline-none transition-colors placeholder-slate-300
          ${isPassword ? "pr-10" : ""}
          ${errors[name]
                            ? "border-red-400 focus:border-red-500 bg-red-50"
                            : "border-slate-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-100"
                        }`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                    >
                        {show ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 015.34 1.56M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
        </div>
    );
}
