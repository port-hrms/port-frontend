// @ts-nocheck

import { useState } from "react";
import { FaLock } from "react-icons/fa6";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPasswordAPI } from "../../api/authAPI";
import { config } from "../../config";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [tokenError, setTokenError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.newPassword || !form.confirmPassword) {
            setError("Please fill in both password fields.");
            return;
        }
        if (form.newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const data = await resetPasswordAPI(token, form.newPassword);
            toast.success(data.message || "Password reset successful! Please log in.");
            navigate("/login", { replace: true });
        } catch (err) {
            const msg = err.response?.data?.message || "Reset failed. The link may have expired.";
            setError(msg);
            // If token is invalid/expired, show the re-request UI
            if (err.response?.status === 400) {
                setTokenError(true);
            }
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
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-indigo-900/60 flex flex-col items-center justify-center px-10 text-center">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-5">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <h2 className="text-white text-2xl font-bold mb-3">Set a new password</h2>
                        <p className="text-white/75 text-sm leading-relaxed">
                            Choose a strong password that you haven't used before. Your link will expire in 15 minutes.
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
                            <h2 className="text-xl font-extrabold text-slate-800">Create New Password</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Enter and confirm your new password below.
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <span className="text-red-500 text-sm mt-0.5">⚠️</span>
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {!tokenError ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                            <FaLock />
                                        </span>
                                        <input
                                            id="new-password"
                                            type={showNew ? "text" : "password"}
                                            placeholder="Min. 6 characters"
                                            value={form.newPassword}
                                            onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
                                            className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNew(!showNew)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                                        >
                                            {showNew ? <IoEyeOff /> : <IoEye />}
                                        </button>
                                    </div>

                                    {/* Strength indicator */}
                                    {form.newPassword && (
                                        <div className="mt-2 flex gap-1">
                                            {[1, 2, 3].map((level) => {
                                                const strength = form.newPassword.length >= 6
                                                    ? form.newPassword.length >= 10
                                                        ? 3
                                                        : 2
                                                    : 1;
                                                return (
                                                    <div
                                                        key={level}
                                                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= strength
                                                            ? strength === 1 ? "bg-red-400" : strength === 2 ? "bg-yellow-400" : "bg-green-500"
                                                            : "bg-slate-200"
                                                            }`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                            <FaLock />
                                        </span>
                                        <input
                                            id="confirm-password"
                                            type={showConfirm ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                            className={`w-full pl-11 pr-12 py-3 bg-slate-50 border rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all ${form.confirmPassword && form.confirmPassword !== form.newPassword
                                                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                                                : form.confirmPassword && form.confirmPassword === form.newPassword
                                                    ? "border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirm(!showConfirm)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                                        >
                                            {showConfirm ? <IoEyeOff /> : <IoEye />}
                                        </button>
                                    </div>
                                    {form.confirmPassword && form.confirmPassword === form.newPassword && (
                                        <p className="text-green-600 text-xs mt-1.5 font-medium">✓ Passwords match</p>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    id="reset-password-btn"
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
                                            Resetting...
                                        </span>
                                    ) : "Reset Password →"}
                                </button>
                            </form>
                        ) : (
                            /* ── Expired Token State ───────────────────────── */
                            <div className="space-y-4">
                                <div className="flex flex-col items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="12" y1="8" x2="12" y2="12" />
                                            <line x1="12" y1="16" x2="12.01" y2="16" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-amber-800 text-sm">Link Expired or Invalid</p>
                                        <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                                            Your reset link has expired or is invalid. Please request a new one.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    to="/forgot-password"
                                    className="block w-full py-3.5 rounded-xl text-center text-white font-bold text-sm bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
                                >
                                    Request New Reset Link
                                </Link>
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
