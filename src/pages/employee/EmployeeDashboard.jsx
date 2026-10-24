// @ts-nocheck
import API from "@/api/axios";
import BirthdayTodayCard from "@/components/dashboard/BirthdayTodayCard";
import AttendancePanel from "@/components/employee/dashboard/sections/AttendancePanel";
import PerformancePanel from "@/components/employee/dashboard/sections/PerformancePanel";
import QuickLinksSection from "@/components/employee/dashboard/sections/QuickLinksSection";
import StatsCardsSection from "@/components/employee/dashboard/sections/StatsCardsSection";
import WelcomeBannerSection from "@/components/employee/dashboard/sections/WelcomeBannerSection";
import FieldAgentTrackingPanel from "@/components/employee/dashboard/sections/FieldAgentTrackingPanel";
import { GRADE_CONFIG, STATUS_STYLES } from "@/components/employee/dashboard/shared/constants";
import NewsFeedPanel from "@/components/dashboard/NewsFeedPanel";
import RecentLeaveRequests from "@/components/dashboard/RecentLeaveRequests";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { deriveStatus, parseMinutes } from "@/components/attendance/attendanceHelpers";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard({ setActiveTab }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const employeeId = user?.employee?._id || user?.employee || null;

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attendStats, setAttendStats] = useState({ present: 0, late: 0, halfDay: 0, onLeave: 0, absent: 0, total: 0 });
  const [todayStatus, setTodayStatus] = useState("Not Marked");
  const [todayRecord, setTodayRecord] = useState(null);
  const [payroll, setPayroll] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [birthdayEmployees, setBirthdayEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [todayWFH, setTodayWFH] = useState(null);
  // HR staff (department or designation "HR") review everyone's leave requests here
  const [recentLeaveRequests, setRecentLeaveRequests] = useState([]);
  const isHrStaff = (emp) => ["hr"].includes((emp?.department || "").toLowerCase()) || (emp?.designation || "").toLowerCase() === "hr";

  const fetchLeaveRequestsForHr = async () => {
    try {
      // Only the leave list — not the company-wide figures
      const { data } = await API.get("/dashboard/stats", { params: { sections: "recentLeaveRequests" } });
      setRecentLeaveRequests(Array.isArray(data?.data?.recentLeaveRequests) ? data.data.recentLeaveRequests : []);
    } catch {
      // not HR staff on the server side — keep the panel hidden
      setRecentLeaveRequests([]);
    }
  };

  const handleUpdateLeaveStatus = async (leaveId, status, managerNotes) => {
    try {
      await API.put(`/leaves/${leaveId}`, { status, managerNotes });
      toast.success(`Leave ${status.toLowerCase()} successfully`);
      fetchLeaveRequestsForHr();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update leave status");
      throw error;
    }
  };





  const fetchLatestPayroll = async (empId, month, year) => {
    try {
      const { data } = await API.get("/payroll", { params: { employeeId: empId, month, year } });
      const records = Array.isArray(data?.data) ? data.data : [];
      setPayroll(records[0] || null);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (employeeId) {
      fetchAll(employeeId, isMounted);
    } else {
      setLoading(false);
    }
    return () => { isMounted = false; };
  }, [employeeId]);

  const fetchAll = async (empId, isMounted = true) => {
    try {
      setLoading(true);
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();

      const todayStr = now.toISOString().split("T")[0];

      const [empRes, attendRes, payrollRes, perfRes, statsRes, tasksRes, wfhRes] = await Promise.allSettled([
        API.get(`/employees/${empId}`),
        API.get(`/attendance/report/${empId}`, { params: { month, year } }),
        API.get("/payroll", { params: { employeeId: empId, month, year } }),
        API.get("/performance", { params: { employeeId: empId } }),
        API.get("/dashboard/employee/highlights"),
        API.get("/tasks", { params: { date: todayStr } }),
        API.get("/wfh/today"),
      ]);

      if (!isMounted) return; // component unmounted while fetching

      if (empRes.status === "fulfilled") {
        setEmployee(empRes.value.data.data);
        if (isHrStaff(empRes.value.data.data)) fetchLeaveRequestsForHr();
      }

      if (attendRes.status === "fulfilled") {
        const attendanceData = attendRes.value.data?.data;
        const records = Array.isArray(attendanceData)
          ? attendanceData
          : Array.isArray(attendanceData?.records)
            ? attendanceData.records
            : [];

        setAttendance(records.slice(0, 5));

        const stats = { present: 0, late: 0, halfDay: 0, onLeave: 0, absent: 0, total: 0, totalHours: 0 };
        records.forEach((record) => {
          const status = deriveStatus(record.checkIn, record.status);

          if (status === "Present") stats.present += 1;
          else if (status === "Late") stats.late += 1;
          else if (status === "Half Day") stats.halfDay += 1;
          else if (status === "On Leave") stats.onLeave += 1;
          else if (status === "Absent") stats.absent += 1;

          if (record.hoursWorked) {
            stats.totalHours += Number(record.hoursWorked);
          } else if (record.checkIn && !record.checkOut) {
            const checkInMin = parseMinutes(record.checkIn);
            if (checkInMin !== null) {
              const currentMin = now.getHours() * 60 + now.getMinutes();
              if (currentMin > checkInMin) {
                stats.totalHours += (currentMin - checkInMin) / 60;
              }
            }
          }
        });
        stats.total = records.length;
        stats.totalHours = Number(stats.totalHours.toFixed(1));
        setAttendStats(stats);

        const todayText = now.toDateString();
        const todayRec = records.find((record) => new Date(record.date).toDateString() === todayText);
        if (todayRec) {
          setTodayStatus(deriveStatus(todayRec.checkIn, todayRec.status));
          setTodayRecord(todayRec);
        }
      }

      if (payrollRes.status === "fulfilled") {
        const records = payrollRes.value.data.data || [];
        setPayroll(records[0] || null);
      }

      if (perfRes.status === "fulfilled") {
        const records = perfRes.value.data.data || [];
        if (records.length > 0) setPerformance(records[0]);
      }

      if (statsRes.status === "fulfilled") {
        const stats = statsRes.value.data?.data || {};
        setBirthdayEmployees(Array.isArray(stats.birthdayEmployees) ? stats.birthdayEmployees : []);
      }

      if (tasksRes.status === "fulfilled") {
        const list = tasksRes.value.data?.data;
        setTasks(Array.isArray(list) ? list : []);
      }

      if (wfhRes.status === "fulfilled") {
        setTodayWFH(wfhRes.value.data?.data || null);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    if (!employeeId) return;

    const refreshPayroll = () => {
      const now = new Date();
      fetchLatestPayroll(employeeId, now.getMonth() + 1, now.getFullYear());
    };

    refreshPayroll();

    const intervalId = window.setInterval(refreshPayroll, 10000);
    const handleFocus = () => refreshPayroll();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [employeeId]);

  const productiveDays = attendStats.present + attendStats.late + (attendStats.halfDay * 0.5);
  const attendanceRate = attendStats.total > 0
    ? Math.round((productiveDays / attendStats.total) * 100)
    : 0;

  const todayStyle = STATUS_STYLES[todayStatus] || STATUS_STYLES["Not Marked"];
  const gradeConfig = performance?.grade ? (GRADE_CONFIG[performance.grade] || GRADE_CONFIG.Average) : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
        <div className="w-10 h-10 border-4 border-ocean-200 border-t-ocean-600 rounded-full animate-spin" />
        <p className="text-sm font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <WelcomeBannerSection
        employee={employee}
        userName={user?.name}
        todayRecord={todayRecord}
        todayStatus={todayStatus}
      />

      {/* ── WFH Day Banner ──────────────────────────────────── */}
      {todayWFH && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-ocean-600 to-port-teal p-4 shadow-md">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="text-white font-bold text-sm">Today is a Work From Home Day!</p>
                <p className="text-teal-100 text-xs mt-0.5">Geofencing is disabled — check in from anywhere.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("wfh")}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
            >
              View WFH Requests →
            </button>
          </div>
        </div>
      )}

      {employee?.isFieldAgent && (
        <FieldAgentTrackingPanel employee={employee} />
      )}

      <StatsCardsSection
        attendanceRate={attendanceRate}
        attendStats={attendStats}
        todayStyle={todayStyle}
        todayStatus={todayStatus}
        todayRecord={todayRecord}
        payroll={payroll}
        performance={performance}
        gradeConfig={gradeConfig}
        tasks={tasks}
        employeeId={employeeId}
        onOpenTasks={() => setActiveTab?.("tasks")}
      />
      <BirthdayTodayCard employees={birthdayEmployees} />
      <NewsFeedPanel setActiveTab={setActiveTab} />

      <QuickLinksSection navigate={navigate} setActiveTab={setActiveTab} />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <AttendancePanel
          attendance={attendance}
          attendStats={attendStats}
          attendanceRate={attendanceRate}
          setActiveTab={setActiveTab}
        />

        <div className="lg:col-span-2 flex flex-col gap-5">
          {isHrStaff(employee) && recentLeaveRequests.length > 0 && (
            <RecentLeaveRequests requests={recentLeaveRequests} onUpdateStatus={handleUpdateLeaveStatus} />
          )}
          <PerformancePanel performance={performance} gradeConfig={gradeConfig} navigate={navigate} setActiveTab={setActiveTab} />
        </div>
      </div>
    </div>
  );
}
