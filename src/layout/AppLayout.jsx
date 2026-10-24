// @ts-nocheck
import {
  BarChart3,
  Briefcase,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  Gift,
  House,
  Laptop,
  MapPin,
  Megaphone,
  Receipt,
  ReceiptIndianRupee,
  Settings,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const NAV_ITEMS = [
  { id: "dashboard", label: "Home", icon: House, roles: ["admin", "employee"] },
  { id: "employees", label: "Employees", icon: Users, roles: ["admin"] },
  { id: "attendance", label: "Attendance", icon: Calendar, roles: ["admin", "employee"] },
  { id: "tasks", label: "Tasks", icon: ClipboardList, roles: ["admin", "employee"] },
  { id: "announcements", label: "News Feed", icon: Megaphone, roles: ["admin", "employee"] },
  { id: "leaves", label: "Leaves", icon: FileText, roles: ["employee"] },
  { id: "wfh", label: "Work From Home", icon: Laptop, roles: ["employee", "admin"] },
  { id: "payroll", label: "Payroll", icon: CreditCard, roles: ["admin", "employee"] },
  {
    id: "billing",
    label: "Client & Billing",
    icon: Receipt,
    roles: ["admin"],
    subItems: [
      { id: "clients", label: "Clients", icon: Users },
      { id: "quotations", label: "Quotations", icon: FileText },
      { id: "invoices", label: "Invoices", icon: ReceiptIndianRupee },
    ],
  },
  { id: "expenditure", label: "Expenditure", icon: TrendingUp, roles: ["admin"] },
  { id: "holidays", label: "Holidays", icon: Gift, roles: ["admin", "employee"] },
  { id: "profile", label: "Profile", icon: User, roles: ["employee"] },
  { id: "performance", label: "Performance", icon: BarChart3, roles: ["admin", "employee"] },
  { id: "tracking", label: "Tracking", icon: MapPin, roles: ["admin"] },
  { id: "recruitment", label: "Recruitment", icon: Briefcase, roles: ["admin"] },
  { id: "settings", label: "Settings", icon: Settings, roles: ["admin", "employee"] },
];

export default function AppLayout({ activeTab, setActiveTab, children }) {
  const { user, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1280);

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role) || (isAdmin && item.roles.includes("admin"))
  );

  const allTabIds = visibleNavItems.flatMap((item) =>
    item.subItems ? [item.id, ...item.subItems.map((s) => s.id)] : [item.id]
  );
  const activeItem = visibleNavItems.find((n) => {
    if (n.id === activeTab) return true;
    if (n.subItems) return n.subItems.some((s) => s.id === activeTab);
    return false;
  });
  const activeLabel = activeItem?.subItems
    ? activeItem.subItems.find((s) => s.id === activeTab)?.label || activeItem.label
    : activeItem?.label;

  return (
    // relative + overflow-hidden: nothing inside (absolute menus, sr-only labels…) can make the
    // page taller than the screen. h-dvh = the visible height on mobile, unlike h-screen.
    <div className="relative flex h-dvh bg-canvas font-sans overflow-hidden">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navItems={visibleNavItems}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Navbar
          activeLabel={activeLabel}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="relative flex-1 min-w-0 overflow-auto overscroll-contain p-3 sm:p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
