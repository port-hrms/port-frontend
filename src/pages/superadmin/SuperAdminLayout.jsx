// @ts-nocheck
import { useState, useEffect } from "react";
import { useSuperAdmin } from "../../context/SuperAdminContext";

const NAV = [
    {
        id: "analytics", label: "Analytics", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="18" y="3" width="4" height="18" /><rect x="10" y="8" width="4" height="13" /><rect x="2" y="13" width="4" height="8" /></svg>
        )
    },
    {
        id: "organizations", label: "Organizations", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        )
    },
    {
        id: "plans", label: "Subscription Plans", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        )
    },
    {
        id: "payment-history", label: "Payment History", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
        )
    },
    {
        id: "support", label: "Support Tickets", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
        )
    },
];

function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return isMobile;
}

export default function SuperAdminLayout({ activeTab, setActiveTab, children }) {
    const { admin, logout } = useSuperAdmin();
    const isMobile = useIsMobile();
    const [desktopCollapsed, setDesktopCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile sidebar on tab change
    const handleTabChange = (id) => {
        setActiveTab(id);
        setMobileOpen(false);
    };

    const initial = admin?.platformName?.[0] || "N";
    const collapsed = !isMobile && desktopCollapsed;

    return (
        <div className="flex min-h-screen font-sans bg-slate-100 text-slate-900">

            {/* Mobile overlay */}
            {isMobile && mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-slate-900 text-white transition-all duration-200 ${
                isMobile
                    ? (mobileOpen ? "translate-x-0 w-60 shadow-2xl" : "-translate-x-full w-60")
                    : (desktopCollapsed ? "w-16" : "w-56")
            }`}>
                {/* Logo */}
                <div className={`border-b border-white/10 ${collapsed ? "p-4 flex justify-center" : "px-5 py-5"}`}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl flex-shrink-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-extrabold text-white shadow-md shadow-indigo-500/20">
                            {initial}
                        </div>
                        {!collapsed && (
                            <div>
                                <div className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase">Super Admin</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-1">
                    {NAV.map((item) => {
                        const active = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleTabChange(item.id)}
                                title={collapsed ? item.label : undefined}
                                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                                    active
                                        ? "bg-indigo-500/20 text-indigo-300 font-semibold"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                } ${collapsed ? "justify-center px-2" : ""}`}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Bottom user */}
                <div className="p-2 border-t border-white/10">
                    {!collapsed && (
                        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
                            <div className="w-8 h-8 rounded-full flex-shrink-0 bg-blue-800 flex items-center justify-center text-xs font-bold text-white">
                                {admin?.name?.[0] || "R"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-white truncate">{admin?.name || "Root Super Admin"}</div>
                                <div className="text-[11px] text-slate-400 truncate">{admin?.email}</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        title={collapsed ? "Sign out" : undefined}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ${
                            collapsed ? "justify-center px-2" : ""
                        }`}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                        {!collapsed && <span>Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Main content wrapper */}
            <div className={`flex-1 flex flex-col min-w-0 transition-[margin] duration-200 ${
                isMobile ? "ml-0" : (desktopCollapsed ? "ml-16" : "ml-56")
            }`}>
                {/* Topbar */}
                <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        {/* Hamburger */}
                        <button
                            onClick={() => isMobile ? setMobileOpen(o => !o) : setDesktopCollapsed(c => !c)}
                            className="text-slate-500 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                        </button>
                        <span className="text-sm font-semibold text-slate-800 truncate max-w-[160px] sm:max-w-xs">
                            {NAV.find(n => n.id === activeTab)?.label || "Dashboard"}
                        </span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                        Platform Control
                    </span>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
