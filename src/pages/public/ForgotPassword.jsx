// @ts-nocheck

import { useState } from "react";
import { MdEmail } from "react-icons/md";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPasswordAPI } from "../../api/authAPI";
import { config } from "../../config";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        setLoading(true);
        try {
            await forgotPasswordAPI(email);
            setSubmitted(true);
            toast.success("Reset link sent! Check your inbox.");
        } catch (err) {
            const msg = err.response?.data?.message || "Something went wrong. Please try again.";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-white flex items-center justify-center p-0 sm:p-4">

            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-5xl relative flex flex-col lg:flex-row rounded-none sm:rounded-3xl overflow-hidden sm:shadow-2xl sm:shadow-black/40 sm:border border-white/10 min-h-dvh sm:min-h-0">

                {/* ─── LEFT: Image Panel ─────────────────────────── */}
                <div className="hidden lg:block w-1/2 relative">
                    <img
                        src="/hrms.jpg"
                        alt="HRMS"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-indigo-900/60 flex flex-col items-center justify-center px-10 text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h2 className="text-white text-2xl font-bold mb-3">Forgot your password?</h2>
                        <p className="text-white/75 text-sm leading-relaxed">
                            No worries — it happens! Enter the email address linked to your account and we'll send you a secure reset link.
                        </p>
                    </div>
                </div>

                {/* ─── RIGHT: Form Panel ─────────────────────────── */}
                <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center">

                    {/* Mobile logo */}
                    <div className="lg:hidden px-6 pt-7 pb-5 text-center border-b border-slate-200 bg-white/95">
                        <img src="/logo1.png" alt="HRMS" className="mx-auto w-32 object-cover" />
                    </div>

                    <div className="px-5 sm:px-8 lg:px-12 py-7 sm:py-10 space-y-5">
                        <div>
                            <h2 className="text-xl font-extrabold text-slate-800">Reset Password</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Enter your account email and we'll send you a reset link.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <span className="text-red-500 text-sm">⚠️</span>
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                            <MdEmail />
                                        </span>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            placeholder="you@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    id="send-reset-link-btn"
                                    disabled={loading}
                                    className={`w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all
                                        ${loading
                                            ? "bg-slate-400 cursor-not-allowed"
                                            : "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                                        }`}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Sending...
                                        </span>
                                    ) : "Send Reset Link →"}
                                </button>
                            </form>
                        ) : (
                            /* ── Success State ─────────────────────────────── */
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-4 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-800 text-sm">Check your inbox!</p>
                                        <p className="text-green-700 text-xs mt-1 leading-relaxed">
                                            If <strong>{email}</strong> is linked to an account, you'll receive a reset link shortly. The link expires in <strong>15 minutes</strong>.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => { setSubmitted(false); setEmail(""); }}
                                    className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-all"
                                >
                                    Try a different email
                                </button>
                            </div>
                        )}

                        {/* Back to login */}
                        <div className="text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="19" y1="12" x2="5" y2="12" />
                                    <polyline points="12 19 5 12 12 5" />
                                </svg>
                                Back to Login
                            </Link>
                        </div>
                    </div>

                    <p className="text-center text-slate-400 text-xs pb-6 pt-1">
                        <Link
                            to={config.companyWebsite}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-slate-500"
                        >
                            Designed By Dreamonix Solution Pvt. Ltd.
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
