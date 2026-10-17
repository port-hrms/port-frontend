// @ts-nocheck

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import Attendance from "../pages/admin/Attendance";
import Dashboard from "../pages/admin/Dashboard";
import Employees from "../pages/admin/Employees";
import Payroll from "../pages/admin/Payroll";
import Performance from "../pages/admin/Performance";
import Recruitment from "../pages/admin/Recruitment";
import Settings from "../pages/admin/Settings";
import Tasks from "../pages/admin/Tasks";
import Tracking from "../pages/admin/Tracking";
import Announcements from "../pages/admin/Announcements";
import WagesCreation from "../pages/admin/WagesCreation";
import EmployeeAttendance from "../pages/employee/EmployeeAttendance";
import EmployeeDashboard from "../pages/employee/EmployeeDashboard";
import EmployeeLeaves from "../pages/employee/EmployeeLeaves";
import EmployeePayroll from "../pages/employee/EmployeePayroll";
import EmployeePerformance from "../pages/employee/EmployeePerformance";
import EmployeeProfile from "../pages/employee/EmployeeProfile";
import EmployeeTasks from "../pages/employee/EmployeeTasks";
import EmployeeWFH from "../pages/employee/EmployeeWFH";
import AdminWFHPanel from "../pages/admin/AdminWFHPanel";
import HolidayPage from "../pages/HolidayPage";
import EmployeeAnnouncements from "../pages/employee/Announcements";
import Expenditure from "../pages/admin/expenditure/Expenditure";

// Client & Billing
import Clients from "../pages/admin/billing/Clients";
import Quotations from "../pages/admin/billing/Quotations";
import Invoices from "../pages/admin/billing/Invoices";

import EmployeeDetail from "../components/employee/EmployeeDetail";
import EmployeeForm from "../components/employee/EmployeeForm";

export default function AppRoutes({ activeTab, setActiveTab }) {
  const { user, isAdmin } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => setRefreshTrigger((n) => n + 1);

  const NAV_ITEMS = [
    { id: "dashboard", roles: ["admin", "employee"] },
    { id: "employees", roles: ["admin"] },
    { id: "attendance", roles: ["admin", "employee"] },
    { id: "tasks", roles: ["admin", "employee"] },
    { id: "announcements", roles: ["admin", "employee"] },
    { id: "leaves", roles: ["employee"] },
    { id: "wfh", roles: ["admin", "employee"] },
    { id: "payroll", roles: ["admin", "employee"] },
    { id: "wages-creation", roles: ["admin"] },
    { id: "billing", roles: ["admin"] },
    { id: "clients", roles: ["admin"] },
    { id: "quotations", roles: ["admin"] },
    { id: "invoices", roles: ["admin"] },
    { id: "expenditure", roles: ["admin"] },
    { id: "holidays", roles: ["admin", "employee"] },
    { id: "profile", roles: ["employee"] },
    { id: "performance", roles: ["admin", "employee"] },
    { id: "tracking", roles: ["admin"] },
    { id: "recruitment", roles: ["admin"] },
    { id: "settings", roles: ["admin", "employee"] },
  ];
  const visibleNavIds = NAV_ITEMS
    .filter((n) => n.roles.includes(user?.role) || (isAdmin && n.roles.includes("admin")))
    .map((n) => n.id);

  return (
    <>
      {activeTab === "dashboard" && (!isAdmin && user?.role === "employee" ? <EmployeeDashboard setActiveTab={setActiveTab} /> : <Dashboard setActiveTab={setActiveTab} />)}

      {activeTab === "employees" && isAdmin && (
        <Employees
          key={refreshTrigger}
          onAddClick={() => setShowAddForm(true)}
          onViewClick={(emp) => setViewEmployee(emp)}
          onEditClick={(emp) => setEditEmployee(emp)}
        />
      )}

      {activeTab === "attendance" && (!isAdmin && user?.role === "employee" ? <EmployeeAttendance /> : isAdmin && <Attendance />)}

      {activeTab === "tasks" && (!isAdmin && user?.role === "employee" ? <EmployeeTasks /> : isAdmin && <Tasks />)}

      {activeTab === "announcements" && (!isAdmin && user?.role === "employee" ? <EmployeeAnnouncements /> : isAdmin && <Announcements />)}

      {activeTab === "leaves" && user?.role === "employee" && <EmployeeLeaves />}

      {activeTab === "wfh" && (isAdmin ? <AdminWFHPanel /> : <EmployeeWFH />)}

      {activeTab === "holidays" && <HolidayPage />}

      {activeTab === "payroll" && (isAdmin ? <Payroll /> : <EmployeePayroll />)}

      {activeTab === "wages-creation" && isAdmin && <WagesCreation />}

      {activeTab === "expenditure" && isAdmin && <Expenditure />}

      {activeTab === "profile" && user?.role === "employee" && <EmployeeProfile />}

      {activeTab === "performance" && (isAdmin ? <Performance /> : <EmployeePerformance />)}

      {activeTab === "settings" && <Settings />}

      {activeTab === "tracking" && isAdmin && <Tracking />}

      {activeTab === "recruitment" && isAdmin && <Recruitment />}

      {activeTab === "clients" && isAdmin && <Clients />}
      {activeTab === "quotations" && isAdmin && <Quotations setActiveTab={setActiveTab} />}
      {activeTab === "invoices" && isAdmin && <Invoices />}

      {!visibleNavIds.includes(activeTab) && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-extrabold text-slate-700 mb-1">Access Denied</h2>
          <p className="text-sm text-slate-400">You don't have permission to view this page.</p>
        </div>
      )}

      {showAddForm && <EmployeeForm onClose={() => setShowAddForm(false)} onSuccess={triggerRefresh} />}
      {editEmployee && <EmployeeForm employee={editEmployee} onClose={() => setEditEmployee(null)} onSuccess={triggerRefresh} />}
      {viewEmployee && (
        <EmployeeDetail
          employee={viewEmployee}
          onClose={() => setViewEmployee(null)}
          onEdit={(emp) => { setViewEmployee(null); setEditEmployee(emp); }}
        />
      )}
    </>
  );
}
