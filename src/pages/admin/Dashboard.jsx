// @ts-nocheck
// client/src/pages/Dashboard.jsx

import API from "@/api/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AttendanceSummary from "@/components/dashboard/AttendanceSummary";
import BirthdayTodayCard from "@/components/dashboard/BirthdayTodayCard";
import DepartmentChart from "@/components/dashboard/DepartmentChart";
import KPICards from "@/components/dashboard/KPICards";
import OnLeaveTodayCard from "@/components/dashboard/OnLeaveTodayCard";
import PerformanceGrades from "@/components/dashboard/PerformanceGrades";
import RecentEmployees from "@/components/dashboard/RecentEmployees";
import RecentLeaveRequests from "@/components/dashboard/RecentLeaveRequests";
import TodayDateCard from "@/components/dashboard/TodayDateCard";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import NewsFeedPanel from "@/components/dashboard/NewsFeedPanel";
import { FaBuilding, FaFileInvoiceDollar, FaFileSignature, FaMoneyBillWave, FaWallet } from "react-icons/fa";

export default function Dashboard({ setActiveTab }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/dashboard/stats");
            setStats(data.data);
        } catch {
            toast.error("Failed to load dashboard stats");
        } finally {
            setLoading(false);
        }
    };


    const handleUpdateLeaveStatus = async (leaveId, status) => {
        try {
            await API.put(`/leaves/${leaveId}`, { status });
            toast.success(`Leave ${status.toLowerCase()} successfully`);
            await fetchStats();
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to update leave status";
            toast.error(message);
            throw error;
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // ─── Loading State ────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium">Loading dashboard...</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none">
                <div className="text-5xl mb-4 opacity-60">📊</div>
                <h2 className="text-xl font-extrabold text-slate-700 mb-1">No Data Available</h2>
                <p className="text-sm text-slate-400">Unable to load dashboard statistics.</p>
            </div>
        );
    }

    const { employees, attendance, payroll, performance, leaves, recentEmployees, recentLeaveRequests, birthdayEmployees, billing } = stats;

    return (
        <div className="space-y-6">
            <WelcomeBanner />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TodayDateCard />
                <OnLeaveTodayCard requests={recentLeaveRequests} activeCount={leaves?.activeToday || 0} />
                <BirthdayTodayCard employees={birthdayEmployees} />
            </div>

            <KPICards employees={employees} attendance={attendance} payroll={payroll} performance={performance} leaves={leaves} />

            {billing && (
              <div>
                <h3 className="text-base font-extrabold text-slate-800 mb-3">Client & Billing Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    { icon: <FaBuilding className="text-lg" />, label: "Total Clients", value: billing.totalClients, bg: "bg-blue-500/10", color: "text-blue-600" },
                    { icon: <FaFileSignature className="text-lg" />, label: "Total Quotations", value: billing.totalQuotations, bg: "bg-violet-500/10", color: "text-violet-600" },
                    { icon: <FaFileInvoiceDollar className="text-lg" />, label: "Total Invoices", value: billing.totalInvoices, bg: "bg-indigo-500/10", color: "text-indigo-600" },
                    { icon: <FaWallet className="text-lg" />, label: "Pending Payments", value: "₹" + (billing.pendingPayments || 0).toLocaleString("en-IN"), bg: "bg-amber-500/10", color: "text-amber-600" },
                    { icon: <FaMoneyBillWave className="text-lg" />, label: "Revenue Generated", value: "₹" + (billing.revenueGenerated || 0).toLocaleString("en-IN"), bg: "bg-emerald-500/10", color: "text-emerald-600" },
                  ].map((card) => (
                    <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-start gap-3 hover:shadow-md transition-shadow duration-300 group">
                      <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center shrink-0 ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                        {card.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
                        <p className="text-lg font-extrabold text-slate-900 mt-0.5 truncate">{card.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <NewsFeedPanel setActiveTab={setActiveTab} />
                <AttendanceSummary attendance={attendance} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceGrades performance={performance} />
                <DepartmentChart departmentStats={employees.departmentStats} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <RecentEmployees employees={recentEmployees} />
                <RecentLeaveRequests requests={recentLeaveRequests} onUpdateStatus={handleUpdateLeaveStatus} />
            </div>

        </div>
    );
}
