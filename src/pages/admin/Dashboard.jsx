// @ts-nocheck
// client/src/pages/admin/Dashboard.jsx

import API from "@/api/axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import AttendanceSummary from "@/components/dashboard/AttendanceSummary";
import AttentionPanel from "@/components/dashboard/AttentionPanel";
import CelebrationsCard from "@/components/dashboard/CelebrationsCard";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import DepartmentChart from "@/components/dashboard/DepartmentChart";
import KPICards from "@/components/dashboard/KPICards";
import OnLeaveTodayCard from "@/components/dashboard/OnLeaveTodayCard";
import RecentEmployees from "@/components/dashboard/RecentEmployees";
import RecentLeaveRequests from "@/components/dashboard/RecentLeaveRequests";
import SectionError from "@/components/dashboard/SectionError";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import NewsFeedPanel from "@/components/dashboard/NewsFeedPanel";
import { SectionHeader, StatCard } from "@/components/dashboard/StatCard";
import { AlertTriangle, BadgeIndianRupee, Banknote, Building2, Hourglass, RotateCw } from "lucide-react";

const inr = (n) => "₹" + (n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

// Sections that change when a leave is approved/rejected (approval also writes attendance)
const LEAVE_SECTIONS = ["onLeaveToday", "pendingLeaves", "attention", "attendance"];
const PENDING_LEAVES_ID = "pending-leaves";

export default function Dashboard({ setActiveTab }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [retrying, setRetrying] = useState(false);
    const [updatedAt, setUpdatedAt] = useState(null);

    // sections: refetch only these and merge them in; omit to load everything
    const fetchStats = async (sections) => {
        try {
            const { data } = await API.get("/dashboard/stats", {
                params: sections ? { sections: sections.join(",") } : undefined,
            });
            const fresh = data.data;
            setStats((prev) => {
                if (!sections || !prev) return fresh;
                const stillFailed = (prev.failedSections || []).filter((name) => !sections.includes(name));
                return { ...prev, ...fresh, failedSections: [...stillFailed, ...fresh.failedSections] };
            });
            if (!sections) setUpdatedAt(new Date());
            if (fresh.failedSections?.length) {
                toast.error("Some dashboard sections couldn't be loaded");
            }
        } catch {
            toast.error("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const retry = async (sections) => {
        setRetrying(true);
        await fetchStats(sections);
        setRetrying(false);
    };

    const handleUpdateLeaveStatus = async (leaveId, status, managerNotes) => {
        try {
            await API.put(`/leaves/${leaveId}`, { status, managerNotes });
            toast.success(`Leave ${status.toLowerCase()} successfully`);
            await fetchStats(LEAVE_SECTIONS);
        } catch (error) {
            const message = error?.response?.data?.message || "Failed to update leave status";
            toast.error(message);
            throw error;
        }
    };

    if (loading) return <DashboardSkeleton />;

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center select-none">
                <AlertTriangle className="w-10 h-10 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700 mb-1">Couldn't load the dashboard</h2>
                <p className="text-sm text-slate-500 mb-5">Check your connection and try again.</p>
                <button
                    onClick={() => retry()}
                    disabled={retrying}
                    className="inline-flex items-center gap-2 rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:opacity-60"
                >
                    <RotateCw size={15} className={retrying ? "animate-spin" : ""} />
                    {retrying ? "Retrying..." : "Retry"}
                </button>
            </div>
        );
    }

    const { employees, attendance, payroll, performance, recentEmployees, pendingLeaves, onLeaveToday, attention, celebrations, billing } = stats;
    const errorProps = (...sections) => ({ onRetry: () => retry(sections), retrying });
    const openPendingLeaves = () =>
        document.getElementById(PENDING_LEAVES_ID)?.scrollIntoView({ behavior: "smooth", block: "start" });
    const openTab = (tab) => () => setActiveTab?.(tab);

    return (
        <div className="space-y-6">
            <WelcomeBanner />

            {/* KPIs (2×2) beside the to-do list; on phones the to-do list comes first */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:order-2 lg:col-span-2">
                    {attention ? (
                        <AttentionPanel
                            attention={attention}
                            billing={billing}
                            setActiveTab={setActiveTab}
                            onOpenPendingLeaves={openPendingLeaves}
                            updatedAt={updatedAt}
                            onRefresh={() => retry()}
                            refreshing={retrying}
                        />
                    ) : (
                        <SectionError title="Needs your attention" {...errorProps("attention")} />
                    )}
                </div>
                <div className="lg:order-1 lg:col-span-3">
                    <KPICards
                        className="h-full auto-rows-fr grid-cols-1 sm:grid-cols-2"
                        employees={employees}
                        attendance={attendance}
                        payroll={payroll}
                        performance={performance}
                        attention={attention}
                        setActiveTab={setActiveTab}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {attendance ? <AttendanceSummary attendance={attendance} /> : <SectionError title="Today's Attendance" {...errorProps("attendance")} />}
                <div className="space-y-4">
                    {onLeaveToday ? <OnLeaveTodayCard leaves={onLeaveToday} /> : <SectionError compact title="On Leave Today" {...errorProps("onLeaveToday")} />}
                    {celebrations ? <CelebrationsCard events={celebrations} /> : <SectionError compact title="Celebrations This Week" {...errorProps("celebrations")} />}
                </div>
            </div>

            {pendingLeaves ? (
                <RecentLeaveRequests
                    id={PENDING_LEAVES_ID}
                    title="Pending Leave Approvals"
                    subtitle="Oldest first, so nobody waits too long"
                    emptyMessage="No leave requests waiting for approval"
                    showWaiting
                    requests={pendingLeaves}
                    onUpdateStatus={handleUpdateLeaveStatus}
                />
            ) : (
                <SectionError title="Pending Leave Approvals" {...errorProps("pendingLeaves")} />
            )}

            {billing ? (
                <div>
                    <SectionHeader title="Client & Billing Overview" subtitle="Collections and money owed" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                        <StatCard compact icon={Banknote} label="Collected This Month" value={inr(billing.collectedThisMonth)} onClick={openTab("invoices")} />
                        <StatCard
                            compact
                            icon={AlertTriangle}
                            label="Overdue"
                            value={inr(billing.overdueAmount)}
                            sub={`${billing.overdueCount} invoice${billing.overdueCount === 1 ? "" : "s"} past due`}
                            onClick={openTab("invoices")}
                        />
                        <StatCard compact icon={Hourglass} label="Pending Payments" value={inr(billing.pendingPayments)} onClick={openTab("invoices")} />
                        <StatCard compact icon={BadgeIndianRupee} label="Total Revenue" value={inr(billing.revenueGenerated)} onClick={openTab("invoices")} />
                        <StatCard compact icon={Building2} label="Total Clients" value={billing.totalClients} onClick={openTab("clients")} />
                    </div>
                </div>
            ) : stats.failedSections?.includes("billing") && (
                <SectionError compact title="Client & Billing Overview" {...errorProps("billing")} />
            )}

            {/* lg: news on its own row, the other two side by side; xl: three columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <div className="lg:col-span-2 xl:col-span-1">
                    <NewsFeedPanel setActiveTab={setActiveTab} />
                </div>
                {employees ? <DepartmentChart departmentStats={employees.departmentStats} /> : <SectionError title="Department Distribution" {...errorProps("employees")} />}
                {recentEmployees ? <RecentEmployees employees={recentEmployees} setActiveTab={setActiveTab} /> : <SectionError title="Recent Employees" {...errorProps("recentEmployees")} />}
            </div>
        </div>
    );
}
