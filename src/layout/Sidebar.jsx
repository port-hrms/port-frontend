// @ts-nocheck
import { useEffect, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import AdminProfileCard from "./AdminProfileCard";
import EmployeeProfileCard from "./EmployeeProfileCard";

import BrandMark from "../components/BrandMark";
const ROLE_STYLES = {
  admin: "bg-ocean-400/15 text-ocean-300",
  employee: "bg-port-green/20 text-emerald-300",
};

const ITEM_ACTIVE = "bg-white/10 text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-r-full before:bg-ocean-400";
const ITEM_IDLE = "text-ocean-100/60 hover:bg-white/5 hover:text-white";
const GROUP_ACTIVE = "text-white";

const BUILT_MODULES = ["dashboard", "employees", "attendance", "tasks", "announcements", "leaves", "payroll", "wages-creation", "expenditure", "profile", "performance", "tracking", "recruitment", "settings", "holidays"];

// ─── Sub-Component for Individual Navigation Items ──────────────────────────
function NavItem({ item, activeTab, isEmployee, sidebarOpen, expandedGroups, toggleGroup, handleNavClick }) {
  const Icon = item.icon;

  if (item.subItems) {
    const isOpen = expandedGroups[item.id];
    const isChildActive = item.subItems.some((s) => s.id === activeTab);

    return (
      <div>
        <button
          onClick={() => toggleGroup(item.id)}
          className={`relative w-full flex items-center gap-2.5 px-3 ${isEmployee ? "py-1.5" : "py-2"} rounded-lg ${isEmployee ? "text-sm" : "text-[14px]"} font-medium transition-colors duration-200
            ${isChildActive ? GROUP_ACTIVE : ITEM_IDLE}`}
        >
          <span className="shrink-0 inline-flex items-center justify-center w-5 h-5">
            {Icon && typeof Icon !== "string" ? <Icon size={18} strokeWidth={2} className="text-current" /> : <span className="text-sm">•</span>}
          </span>
          {sidebarOpen && (
            <>
              <span className="truncate flex-1 text-left">{item.label}</span>
              <ChevronDown size={14} className={`text-current transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </>
          )}
          {!sidebarOpen && <span className="truncate flex-1 text-left md:hidden">{item.label}</span>}
        </button>

        {sidebarOpen && isOpen && (
          <div className="ml-5 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">
            {item.subItems.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleNavClick(sub.id)}
                  className={`relative w-full flex items-center gap-2.5 px-3 ${isEmployee ? "py-1.5" : "py-1.5"} rounded-lg text-[13px] font-medium transition-colors duration-200
                    ${activeTab === sub.id ? ITEM_ACTIVE : ITEM_IDLE}`}
                >
                  <span className="shrink-0 inline-flex items-center justify-center w-5 h-5">
                    {SubIcon && typeof SubIcon !== "string" ? <SubIcon size={16} strokeWidth={2} className="text-current" /> : <span className="text-sm">•</span>}
                  </span>
                  <span className="truncate flex-1 text-left">{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => handleNavClick(item.id)}
      className={`relative w-full flex items-center gap-2.5 px-3 ${isEmployee ? "py-1.5" : "py-2"} rounded-lg ${isEmployee ? "text-sm" : "text-[14px]"} font-medium transition-colors duration-200
        ${activeTab === item.id ? ITEM_ACTIVE : ITEM_IDLE}`}
    >
      <span className="shrink-0 inline-flex items-center justify-center w-5 h-5">
        {Icon && typeof Icon !== "string" ? <Icon size={18} strokeWidth={2} className="text-current" /> : typeof Icon === "string" ? <span className="text-sm">{Icon}</span> : <span className="text-sm">•</span>}
      </span>
      {sidebarOpen && <span className="truncate flex-1 text-left">{item.label}</span>}
      {!sidebarOpen && <span className="truncate flex-1 text-left md:hidden">{item.label}</span>}

    </button>
  );
}

// ─── Main Sidebar Component ───────────────────────────────────────────────
export default function Sidebar({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, navItems }) {
  const { user, logout } = useAuth();
  const [empProfile, setEmpProfile] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const expandedDesktopWidthClass = user?.role === "employee" ? "md:w-60" : "md:w-64";
  const isEmployee = user?.role === "employee";

  useEffect(() => {
    if (user?.role !== "employee") return;
    API.get("/dashboard/employee")
      .then((res) => {
        if (res.data?.data?.profile?.hasEmployeeRecord) {
          setEmpProfile(res.data.data.profile);
        }
      })
      .catch(() => { });
  }, [user?.role]);

  // Auto-expand group if any child is active
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.subItems) {
        const childActive = item.subItems.some((s) => s.id === activeTab);
        if (childActive) {
          setExpandedGroups((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [activeTab, navItems]);

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const toggleGroup = (id) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        ${sidebarOpen ? `translate-x-0 ${expandedDesktopWidthClass}` : "-translate-x-full md:translate-x-0 md:w-20"}
        fixed md:relative inset-y-0 left-0 z-40
        w-64
        bg-linear-to-b from-navy-900 to-navy-950 flex flex-col shrink-0
        transition-all duration-300 overflow-hidden
      `}>
        {/* Faint harbour waves at the bottom */}
        <svg className="pointer-events-none absolute bottom-0 left-0 w-full h-24 text-ocean-400/[0.06]" viewBox="0 0 256 96" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 40 Q32 28 64 40 T128 40 T192 40 T256 40 V96 H0Z" fill="currentColor" />
          <path d="M0 62 Q32 50 64 62 T128 62 T192 62 T256 62 V96 H0Z" fill="currentColor" />
        </svg>

        <div className={`relative flex items-center ${sidebarOpen ? "justify-start" : "justify-center"} px-4 ${isEmployee ? "py-3.5" : "py-4"} border-b border-white/5`}>
          <BrandMark tone="light" compact={!sidebarOpen} />
        </div>

        <div className="relative flex-1 flex flex-col overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20">
          <nav className={`flex-1 px-2 ${isEmployee ? "py-2.5" : "py-3"} space-y-0.5`}>
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                item={item}
                activeTab={activeTab}
                isEmployee={isEmployee}
                sidebarOpen={sidebarOpen}
                expandedGroups={expandedGroups}
                toggleGroup={toggleGroup}
                handleNavClick={handleNavClick}
              />
            ))}
          </nav>

          <div className={`px-2 ${isEmployee ? "py-2.5" : "py-3"} border-t border-white/5 space-y-1`}>
            <div className="px-3 py-3 bg-white/5 border border-white/10 rounded-xl md:hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-ocean-400 to-navy-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <p className="text-white text-xs font-bold truncate">{user?.name}</p>
                  <p className="text-ocean-100/50 text-xs truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold capitalize ${ROLE_STYLES[user?.role]}`}>
                  {user?.role}
                </span>
                <button onClick={logout} className="text-xs text-ocean-100/50 hover:text-port-red font-semibold transition-colors">
                  Sign out
                </button>
              </div>
            </div>

            {sidebarOpen ? (
              <div className="hidden md:block">
                {user?.role === "employee" && empProfile ? (
                  <EmployeeProfileCard
                    empProfile={empProfile}
                    employeeId={user?.employee?._id || user?.employee}
                    onLogout={logout}
                    onViewAllLeaves={() => handleNavClick("leaves")}
                  />
                ) : (
                  <AdminProfileCard user={user} onLogout={logout} />
                )}
              </div>
            ) : (
              <button
                onClick={logout}
                title="Sign out"
                className="w-full items-center justify-center px-3 py-2.5 rounded-lg text-ocean-100/50 hover:text-port-red hover:bg-white/5 transition-colors hidden md:flex"
              >
                <LogOut size={18} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
