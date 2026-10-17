// @ts-nocheck
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { getGreeting } from "../shared/utils";
import VoyageTracker from "./VoyageTracker";

export default function WelcomeBannerSection({ employee, userName, todayRecord, todayStatus }) {
  const [showConfetti, setShowConfetti] = useState(true);

  // Check if today is the employee's birthday
  const isBirthday = (() => {
    if (!employee?.dateOfBirth) return false;
    const dob = new Date(employee.dateOfBirth);
    const today = new Date();
    return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
  })();

  const age = isBirthday && employee?.dateOfBirth
    ? new Date().getFullYear() - new Date(employee.dateOfBirth).getFullYear()
    : null;

  // Stop confetti after 8 seconds
  useEffect(() => {
    if (!isBirthday) return;
    const timer = setTimeout(() => setShowConfetti(false), 8000);
    return () => clearTimeout(timer);
  }, [isBirthday]);

  return (
    <>
      {/* Full-screen confetti on birthday */}
      {isBirthday && showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={250}
          gravity={0.15}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 50 }}
        />
      )}

      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-navy-800 via-navy-700 to-ocean-600 text-white p-8">
        <div className="wb-sheen pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-transparent via-white/[0.07] to-transparent" />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl ${
            isBirthday ? "bg-amber-500/15" : "bg-ocean-400/20"
          }`} />
          <div className={`absolute bottom-0 left-1/3 w-48 h-48 rounded-full blur-2xl ${
            isBirthday ? "bg-rose-500/10" : "bg-navy-600/10"
          }`} />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative flex items-center justify-between flex-wrap gap-6">
          <div>
            <p className="text-ocean-200 text-sm font-medium uppercase tracking-widest mb-2">
              {isBirthday ? "🎉 It's Your Special Day!" : ""}
            </p>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {isBirthday
                ? <>Happy Birthday, {employee?.firstName}! 🎂</>
                : <>{getGreeting()}, {employee?.firstName || userName?.split(" ")[0]}</>
              }
            </h1>
            <p className="text-ocean-100/80 text-sm max-w-md">
              {isBirthday
                ? `Wishing you a wonderful birthday${age ? ` as you turn ${age}` : ""}! May this year bring you great success and happiness! 🥳`
                : "Track your attendance, latest payroll, and most recent performance review from one place."
              }
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {isBirthday && (
              <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-3 flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-wider mb-0.5">Birthday</p>
                  <p className="font-bold text-white text-lg">Today! 🎊</p>
                </div>
              </div>
            )}
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-3">
              <p className="text-ocean-200 text-[10px] font-semibold uppercase tracking-wider mb-1">Employee ID</p>
              <p className="font-bold text-white text-lg">{employee?.employeeId || "—"}</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-3">
              <p className="text-ocean-200 text-[10px] font-semibold uppercase tracking-wider mb-1">Department</p>
              <p className="font-bold text-white text-lg">{employee?.department || "—"}</p>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-3">
              <p className="text-ocean-200 text-[10px] font-semibold uppercase tracking-wider mb-1">Designation</p>
              <p className="font-bold text-white text-lg">{employee?.designation || "—"}</p>
            </div>
          </div>
        </div>

        <VoyageTracker record={todayRecord} status={todayStatus} />
      </div>
    </>
  );
}
