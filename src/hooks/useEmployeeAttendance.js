import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { monthInputFromDate, deriveStatus } from "../components/attendance/attendanceHelpers";
import { getCalendarHolidays } from "../api/holidayAPI";

// Pure utility — no hook state, defined outside to avoid rebuild on every render
const getCoordinates = () =>
    new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }),
            (error) => {
                let msg = "Failed to retrieve location. Please enable location permission.";
                if (error.code === error.PERMISSION_DENIED)        msg = "Location permission denied. Please allow location access to check-in.";
                else if (error.code === error.POSITION_UNAVAILABLE) msg = "Location information is unavailable.";
                else if (error.code === error.TIMEOUT)              msg = "Location request timed out.";
                reject(new Error(msg));
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });

/**
 * Verify location, then check in / check out. Shows its own toasts.
 * Throws on failure so callers can skip their refresh.
 */
export async function performAttendanceAction(kind) {
    const label = kind === "check-in" ? "Check-in" : "Check-out";
    let toastId;
    try {
        toastId = toast.loading("Verifying your location...");
        const coords = await getCoordinates();
        toast.dismiss(toastId);
        toastId = toast.loading(kind === "check-in" ? "Checking in..." : "Checking out...");
        await API.post(`/attendance/${kind}`, { latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy });
        toast.dismiss(toastId);
        toast.success(kind === "check-in" ? "Checked in" : "Checked out");
    } catch (err) {
        if (toastId) toast.dismiss(toastId);
        toast.error(err.response?.data?.message || err.message || `${label} failed`);
        throw err;
    }
}

export default function useEmployeeAttendance() {
    const [selectedMonth, setSelectedMonth] = useState(() => monthInputFromDate(new Date()));
    const [profile, setProfile] = useState(null);
    const [todayRecord, setTodayRecord] = useState(null);
    const [summary, setSummary] = useState(null);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [holidays, setHolidays] = useState([]);

    const monthLabel = useMemo(() => {
        const [year, month] = selectedMonth.split("-");
        return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" })
            .format(new Date(Number(year), Number(month) - 1, 1));
    }, [selectedMonth]);

    const fetchDashboard = useCallback(async () => {
        try {
            const { data } = await API.get("/dashboard/employee");
            const d = data?.data;
            if (!d?.profile?.hasEmployeeRecord) {
                setProfile(null);
                setTodayRecord(null);
                setLoading(false);
                return null;
            }
            setProfile(d.profile);
            setTodayRecord(d.attendance?.today || null);
            return d;
        } catch (err) {
            setLoading(false);
            toast.error(err.response?.data?.message || "Failed to load attendance profile");
            return null;
        }
    }, []);

    const fetchAttendance = useCallback(async (employeeId, monthValue = selectedMonth) => {
        try {
            setLoading(true);
            const [year, month] = monthValue.split("-");
            const { data } = await API.get(`/attendance/report/${employeeId}`, {
                params: { month: Number(month), year: Number(year) },
            });
            setSummary(data?.data?.summary || null);
            setRecords(data?.data?.records || []);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to load attendance report");
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    const runAction = async (kind) => {
        try {
            setActionLoading(kind);
            await performAttendanceAction(kind);
            await fetchDashboard();
            if (profile?._id) await fetchAttendance(profile._id, selectedMonth);
        } catch {
            // toast already shown
        } finally {
            setActionLoading("");
        }
    };

    const handleCheckIn = () => runAction("check-in");
    const handleCheckOut = () => runAction("check-out");

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    useEffect(() => {
        if (!profile?._id) {
            setLoading(false);
            return;
        }
        fetchAttendance(profile._id, selectedMonth);
    }, [profile?._id, selectedMonth, fetchAttendance]);

    // Fetch holidays for the selected month
    useEffect(() => {
        const [year, month] = selectedMonth.split("-").map(Number);
        getCalendarHolidays(year, month)
            .then(res => setHolidays(res?.data || []))
            .catch(() => setHolidays([]));
    }, [selectedMonth]);

    const todayStatus = todayRecord?.status || "Not Marked";
    const displayStatus = deriveStatus(todayRecord?.checkIn, todayStatus);
    const canCheckIn = todayStatus !== "On Leave" && !todayRecord?.checkIn;
    const canCheckOut = todayStatus !== "On Leave" && todayRecord?.checkIn && !todayRecord?.checkOut;

    const STATS = useMemo(() => [
        ["Present", summary?.present ?? 0],
        ["Late", summary?.late ?? 0],
        ["Half Day", summary?.halfDay ?? 0],
        ["On Leave", summary?.onLeave ?? 0],
        ["Absent", summary?.absent ?? 0],
    ], [summary]);

    return {
        selectedMonth,
        setSelectedMonth,
        profile,
        todayRecord,
        summary,
        records,
        holidays,
        loading,
        actionLoading,
        monthLabel,
        handleCheckIn,
        handleCheckOut,
        todayStatus,
        displayStatus,
        canCheckIn,
        canCheckOut,
        STATS
    };
}
