// @ts-nocheck

import { useState } from "react";
import { FaLock, FaCheck } from "react-icons/fa6";
import { IoMdEyeOff } from "react-icons/io";
import { IoEye } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { config } from "../../config";

// Tileable wave path: 2 identical 1440-wide segments so translateX(-50%) loops seamlessly
const wavePath = (y, amp) => {
    let d = `M0 ${y}`;
    for (let x = 0; x < 2880; x += 360) {
        d += ` Q${x + 90} ${y - amp} ${x + 180} ${y} T${x + 360} ${y}`;
    }
    return `${d} V160 H0Z`;
};

const sceneStyles = `
@keyframes pp-wave { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes pp-sail { from { left: -420px } to { left: calc(100% + 40px) } }
@keyframes pp-rock { 0%,100% { transform: translateY(0) rotate(-1deg) } 50% { transform: translateY(5px) rotate(1deg) } }
@keyframes pp-smoke { 0% { opacity: .55; transform: translate(0,0) scale(.6) } 100% { opacity: 0; transform: translate(-28px,-34px) scale(1.6) } }
@keyframes pp-cloud { from { transform: translateX(-30vw) } to { transform: translateX(130vw) } }
@keyframes pp-gull { 0% { transform: translate(-10vw, 0) } 50% { transform: translate(55vw, -18px) } 100% { transform: translate(120vw, 6px) } }
@keyframes pp-flap { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(.45) } }
@keyframes pp-card { from { opacity: 0; transform: translateY(18px) scale(.98) } to { opacity: 1; transform: none } }
@keyframes pp-shake { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-6px) } 40%,80% { transform: translateX(6px) } }
@keyframes pp-shine { from { transform: translateX(-120%) skewX(-20deg) } to { transform: translateX(260%) skewX(-20deg) } }
@keyframes pp-glow { 0%,100% { opacity: .75 } 50% { opacity: 1 } }

.pp-wave { animation: pp-wave linear infinite; }
.pp-ship { animation: pp-sail 34s linear infinite; }
.pp-ship-body { transform-box: fill-box; transform-origin: center; animation: pp-rock 3.6s ease-in-out infinite; }
.pp-smoke { transform-box: fill-box; transform-origin: center; animation: pp-smoke 2.4s ease-out infinite; }
.pp-cloud { animation: pp-cloud linear infinite; }
.pp-gull { animation: pp-gull linear infinite; }
.pp-gull path { transform-box: fill-box; transform-origin: center; animation: pp-flap .6s ease-in-out infinite; }
.pp-card { animation: pp-card .7s cubic-bezier(.2,.8,.2,1) both; }
.pp-shake { animation: pp-shake .4s ease-in-out; }
.pp-btn:hover .pp-shine { animation: pp-shine .9s ease-out; }
.pp-sun { animation: pp-glow 6s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .pp-scene *, .pp-card, .pp-shake, .pp-btn * { animation: none !important; }
  .pp-ship { left: 8%; }
}
`;

function Ship() {
    return (
        <svg viewBox="0 0 440 170" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
            <g className="pp-ship-body">
                {/* Funnel smoke */}
                <circle className="pp-smoke" cx="388" cy="20" r="7" fill="#e2ebf2" />
                <circle className="pp-smoke" style={{ animationDelay: "0.8s" }} cx="388" cy="20" r="7" fill="#e2ebf2" />
                <circle className="pp-smoke" style={{ animationDelay: "1.6s" }} cx="388" cy="20" r="7" fill="#e2ebf2" />

                {/* Containers — lower row */}
                <g stroke="#ffffff66" strokeWidth="1">
                    {["#e85e4a", "#f2a33a", "#2b8aaf", "#3f9c6d", "#e85e4a", "#2b8aaf"].map((c, i) => (
                        <rect key={`l${i}`} x={60 + i * 48} y="70" width="46" height="36" rx="2" fill={c} />
                    ))}
                    {["#2b8aaf", "#e85e4a", "#f2a33a", "#2b8aaf", "#3f9c6d"].map((c, i) => (
                        <rect key={`m${i}`} x={60 + i * 48} y="38" width="46" height="30" rx="2" fill={c} />
                    ))}
                    {["#f2a33a", "#2b8aaf", "#e85e4a"].map((c, i) => (
                        <rect key={`t${i}`} x={108 + i * 48} y="12" width="46" height="24" rx="2" fill={c} />
                    ))}
                </g>
                {/* Container ribs */}
                <g stroke="#00000018" strokeWidth="1">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <path key={i} d={`M${72 + i * 48} 72V104M${84 + i * 48} 72V104M${96 + i * 48} 72V104`} />
                    ))}
                </g>

                {/* Bridge / superstructure */}
                <path d="M356 50H404V106H350V66H356Z" fill="#f4f8fb" stroke="#b5c9d9" />
                <rect x="352" y="44" width="56" height="8" rx="2" fill="#dfe9f1" />
                {[0, 1, 2].map((i) => (
                    <rect key={i} x={362 + i * 13} y="58" width="8" height="7" rx="1" fill="#4a8fbb" />
                ))}
                {[0, 1, 2].map((i) => (
                    <rect key={i} x={362 + i * 13} y="76" width="8" height="6" rx="1" fill="#8fb7d2" />
                ))}
                {/* Funnel */}
                <path d="M381 44V26H396V44Z" fill="#e85e4a" />
                <rect x="381" y="30" width="15" height="4" fill="#123d61" />
                {/* Mast + flag */}
                <path d="M370 44V22" stroke="#345b78" strokeWidth="2" />
                <path d="M370 22L382 26L370 30Z" fill="#ff9933" />

                {/* Hull */}
                <path d="M22 106H420L392 146Q384 154 362 154H78Q58 152 48 138Z" fill="#123d61" />
                <path d="M26 107H417L405 120H36Z" fill="#e85e4a" />
                <path d="M44 132H398" stroke="#ffffff22" strokeWidth="2" />
                <text x="300" y="140" fontSize="9" fontWeight="800" fill="#ffffffaa" letterSpacing="1.5">PARADEEP</text>
                {/* Bow anchor */}
                <circle cx="60" cy="126" r="3" fill="#ffffff55" />
            </g>
            {/* Wake */}
            <path d="M70 162Q118 168 168 161M200 163Q258 170 314 162M330 163Q356 166 380 160" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
    );
}

function Cranes() {
    return (
        <svg viewBox="0 0 260 140" className="w-full h-full" preserveAspectRatio="xMaxYMax meet">
            <g fill="none" stroke="#2f6d93" strokeOpacity=".55" strokeWidth="3" strokeLinejoin="round">
                {/* Crane 1 */}
                <path d="M40 140V50M70 140V50M40 50H70M40 80L70 110M70 80L40 110" />
                <path d="M10 46H150M55 46L55 20L130 46M55 20L18 46" />
                <path d="M118 46V70" strokeWidth="2" />
                <rect x="110" y="70" width="16" height="10" fill="#e85e4a" fillOpacity=".6" stroke="none" />
                {/* Crane 2 */}
                <path d="M160 140V64M186 140V64M160 64H186M160 90L186 116M186 90L160 116" />
                <path d="M132 60H252M173 60L173 38L238 60M173 38L140 60" />
                <path d="M226 60V82" strokeWidth="2" />
                <rect x="218" y="82" width="16" height="10" fill="#f2a33a" fillOpacity=".6" stroke="none" />
            </g>
        </svg>
    );
}

function Gull({ className, style }) {
    return (
        <svg viewBox="0 0 30 12" className={`pp-gull absolute ${className}`} style={style}>
            <path d="M1 8Q8 0 15 8Q22 0 29 8" fill="none" stroke="#3d5a73" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

function Cloud({ className, style }) {
    return (
        <div className={`pp-cloud absolute ${className}`} style={style}>
            <div className="relative w-40 h-12">
                <div className="absolute bottom-0 left-0 w-40 h-8 rounded-full bg-white/80" />
                <div className="absolute bottom-3 left-6 w-16 h-16 rounded-full bg-white/80" />
                <div className="absolute bottom-2 left-18 w-14 h-12 rounded-full bg-white/80" />
            </div>
        </div>
    );
}

function OceanScene() {
    return (
        <div className="pp-scene pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
            {/* Sky details */}
            <div className="pp-sun absolute right-[10%] top-[6%] w-64 h-64 rounded-full bg-[radial-gradient(circle,#fff6d5_0%,#fff6d566_35%,transparent_70%)]" />
            <Cloud className="top-[8%]" style={{ animationDuration: "90s", animationDelay: "-20s" }} />
            <Cloud className="top-[20%] scale-75 opacity-80" style={{ animationDuration: "120s", animationDelay: "-70s" }} />
            <Cloud className="top-[32%] scale-50 opacity-70" style={{ animationDuration: "150s", animationDelay: "-110s" }} />
            <Gull className="top-[14%] w-7" style={{ animationDuration: "26s", animationDelay: "-4s" }} />
            <Gull className="top-[18%] w-5" style={{ animationDuration: "30s", animationDelay: "-6s" }} />
            <Gull className="top-[26%] w-6" style={{ animationDuration: "38s", animationDelay: "-22s" }} />

            {/* Sea */}
            <div className="absolute bottom-0 left-0 w-full h-[34vh] min-h-52 max-sm:h-[28vh]">
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#bfe6f6] to-[#4fa6cf]" />

                {/* Port cranes on the shore */}
                <div className="absolute right-0 bottom-[58%] w-64 h-36 max-sm:w-40 max-sm:h-24">
                    <Cranes />
                </div>

                {/* Back wave */}
                <svg className="pp-wave absolute left-0 bottom-[40%] w-[200%] h-24" style={{ animationDuration: "22s" }} viewBox="0 0 2880 160" preserveAspectRatio="none">
                    <path d={wavePath(60, 26)} fill="#7cc6e6" fillOpacity=".6" />
                </svg>

                {/* Ship */}
                <div className="pp-ship absolute bottom-[22%] w-[min(400px,62vw)] drop-shadow-[0_8px_6px_rgba(7,55,92,0.25)]">
                    <Ship />
                </div>

                {/* Middle wave */}
                <svg className="pp-wave absolute left-0 bottom-[12%] w-[200%] h-28" style={{ animationDuration: "16s", animationDirection: "reverse" }} viewBox="0 0 2880 160" preserveAspectRatio="none">
                    <path d={wavePath(60, 30)} fill="#2a9ccc" fillOpacity=".7" />
                </svg>

                {/* Front wave */}
                <svg className="pp-wave absolute left-0 -bottom-2 w-[200%] h-28" style={{ animationDuration: "11s" }} viewBox="0 0 2880 160" preserveAspectRatio="none">
                    <path d={wavePath(70, 22)} fill="#0a5d93" fillOpacity=".92" />
                </svg>

                <div className="absolute right-5 bottom-3 text-[10px] font-extrabold tracking-[0.25em] text-white/80">
                    PARADEEP PORT · ODISHA
                </div>
            </div>
        </div>
    );
}

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ role: "admin", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState("");
    const [errorKey, setErrorKey] = useState(0);

    const showError = (msg) => {
        setError(msg);
        setErrorKey((k) => k + 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!form.email || !form.password) {
            showError("Please enter both email and password");
            return;
        }
        setLoading(true);
        const result = await login(form.email, form.password, form.role);
        if (!result.success) {
            showError(result.message || "Invalid credentials");
        } else if (result.redirectPath) {
            navigate(result.redirectPath, { replace: true });
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-dvh overflow-hidden bg-linear-to-br from-[#f8fcff] via-[#eef7ff] to-[#dff0fc]">
            <style>{sceneStyles}</style>
            <OceanScene />

            <main className="relative z-10 min-h-dvh flex items-start sm:items-center justify-center px-4 pt-8 pb-[30vh] sm:pb-[26vh]">
                <section className="pp-card w-full max-w-115 rounded-3xl border border-white bg-white/85 backdrop-blur-md shadow-[0_22px_65px_rgba(22,60,90,0.16)]">
                    <form onSubmit={handleSubmit} className="px-6 sm:px-8 pt-8 pb-6 space-y-5">
                        <div>
                            <h2 className="text-[22px] font-extrabold text-[#172b43]">Role-Based Login</h2>
                            <p className="text-slate-500 text-sm mt-1">Choose your role and sign in to the matching dashboard</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div key={errorKey} className="pp-shake flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <span className="text-red-500 text-sm">⚠️</span>
                                <p className="text-red-600 text-sm font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                                Login As
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: "admin", label: "Admin", description: "Management dashboard" },
                                    { value: "employee", label: "Employee", description: "Personal dashboard" },
                                ].map((roleOption) => {
                                    const isSelected = form.role === roleOption.value;

                                    return (
                                        <button
                                            key={roleOption.value}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() => setForm((prev) => ({ ...prev, role: roleOption.value }))}
                                            className={`relative rounded-2xl border px-3 py-3 text-left transition-all ${isSelected
                                                ? "border-blue-400 bg-blue-50 ring-2 ring-blue-500/15"
                                                : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-white"
                                                }`}
                                        >
                                            <span
                                                className={`absolute right-2.5 top-2.5 grid place-items-center w-4.5 h-4.5 rounded-full text-[9px] text-white transition-all ${isSelected ? "bg-blue-600 scale-100 opacity-100" : "scale-50 opacity-0"
                                                    }`}
                                            >
                                                <FaCheck />
                                            </span>
                                            <p className="text-sm font-bold text-slate-800">{roleOption.label}</p>
                                            <p className="mt-1 text-[11px] leading-4 text-slate-500">{roleOption.description}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"><MdEmail /></span>
                                <input
                                    id="login-email"
                                    type="email"
                                    autoComplete="username"
                                    placeholder="you@company.com"
                                    value={form.email}
                                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                    className="w-full pl-11 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="login-password" className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                                    Password
                                </label>
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"><FaLock /></span>
                                <input
                                    id="login-password"
                                    type={showPwd ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                    className="w-full pl-11 pr-12 py-3 bg-white/80 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    aria-label={showPwd ? "Hide password" : "Show password"}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-sm"
                                >
                                    {showPwd ? <IoMdEyeOff /> : <IoEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`pp-btn relative overflow-hidden w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all
                                ${loading
                                    ? "bg-slate-400 cursor-not-allowed"
                                    : "bg-linear-to-r from-[#1769f5] to-[#5037ed] shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                                }`}
                        >
                            <span className="pp-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-white/25" />
                            {loading ? (
                                <span className="relative flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : <span className="relative">Sign In →</span>}
                        </button>
                    </form>

                    

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
                </section>
            </main>
        </div>
    );
}
