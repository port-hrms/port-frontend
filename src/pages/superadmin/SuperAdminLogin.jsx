// @ts-nocheck
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useSuperAdmin } from "../../context/SuperAdminContext";

export default function SuperAdminLogin() {
    const { login, isLoggedIn } = useSuperAdmin();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    if (isLoggedIn) {
        return <Navigate to="/superadmin/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(form.email, form.password);
        setLoading(false);
        if (result.success) navigate("/superadmin/dashboard");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-purple-50/70 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
            {/* Shield Icon */}
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-indigo-500/30">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                    <path d="M10 17l-3-3 1.4-1.4 1.6 1.6 4.6-4.6L16 11l-6 6z" fill="rgba(255,255,255,0.3)" />
                    <polyline points="9,12 11,14 15,10" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Super Admin Portal
            </h1>
            <p className="text-sm text-slate-500 mb-8 sm:mb-9 text-center">
                Platform-level access — manage every organization
            </p>

            {/* Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-md shadow-xl shadow-slate-200/60 border border-slate-100">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                            </svg>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="Enter you email"
                                required
                                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <input
                                type={showPass ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                                placeholder="Enter your password"
                                required
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(s => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                            >
                                {showPass ? (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                ) : (
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign In →"}
                    </button>
                </form>

                {/* Demo hint */}
                {/* <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <p className="text-xs text-slate-400 mb-2">No backend connected yet — use the demo account:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md font-mono">superadmin@nebolla.com</code>
                        <span className="text-slate-300">/</span>
                        <code className="text-xs text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-md font-mono">SuperAdmin123</code>
                    </div>
                </div> */}
            </div>

            <p className="mt-7 text-xs text-slate-400">
                This is a restricted area for Briskode platform staff only.
            </p>
        </div>
    );
}
