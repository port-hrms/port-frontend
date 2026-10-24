// @ts-nocheck

export const formatCurrency = (n) =>
  n ? `₹${Number(n).toLocaleString("en-IN")}` : "—";

// Same display as the attendance screens ("10:05 AM")
export { formatClockTime as formatTime } from "../../../attendance/timeUtils";


export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};
