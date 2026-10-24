// Shift rules from the server (single source). Fetched once and shared.
import { useEffect, useState } from "react";
import API from "../api/axios";
import { parseMinutes, SHIFT_END, SHIFT_START, SHIFT_TOTAL_MINUTES } from "../components/attendance/attendanceHelpers";

const FALLBACK = {
    shiftStart: SHIFT_START,
    shiftEnd: SHIFT_END,
    shiftMinutes: SHIFT_TOTAL_MINUTES,
    lateAfter: "10:30 AM",
    halfDayCheckInAfter: "1:00 PM",
    halfDayHours: 4,
    weeklyOffDays: [0],
};

let cached = null;
let pending = null;

const loadPolicy = () => {
    if (cached) return Promise.resolve(cached);
    if (!pending) {
        pending = API.get("/attendance/policy")
            .then(({ data }) => {
                const p = { ...FALLBACK, ...(data?.data || {}) };
                p.shiftMinutes = p.shiftMinutes || (parseMinutes(p.shiftEnd) - parseMinutes(p.shiftStart));
                cached = p;
                return p;
            })
            .catch(() => {
                pending = null; // try again next time
                return FALLBACK;
            });
    }
    return pending;
};

export default function useAttendancePolicy() {
    const [policy, setPolicy] = useState(cached || FALLBACK);
    useEffect(() => {
        let alive = true;
        if (!cached) loadPolicy().then((p) => { if (alive) setPolicy(p); });
        return () => { alive = false; };
    }, []);
    return policy;
}
