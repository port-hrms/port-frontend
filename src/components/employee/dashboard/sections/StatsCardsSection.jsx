// @ts-nocheck
import CircleProgress from "../shared/CircleProgress";
import { MONTH_NAMES } from "../shared/constants";
import CountUp from "../shared/CountUp";
import { formatCurrency, formatTime } from "../shared/utils";

export default function StatsCardsSection({
  attendanceRate,
  attendStats,
  todayStyle,
  todayStatus,
  todayRecord,
  payroll,
  performance,
  gradeConfig,
  tasks = [],
  employeeId,
  onOpenTasks,
}) {
  // Only tasks assigned to me (the API also returns ones I assigned to others)
  const myTasks = tasks.filter((t) => (t.employee?._id || t.employee) === employeeId);
  const taskCounts = {
    total: myTasks.length,
    done: myTasks.filter((t) => t.status === "Completed").length,
    inProgress: myTasks.filter((t) => t.status === "In Progress").length,
  };
  taskCounts.pending = taskCounts.total - taskCounts.done - taskCounts.inProgress;

  const grossSalary = Number(payroll?.earnings?.basic || 0)
    + Number(payroll?.earnings?.hra || 0)
    + Number(payroll?.earnings?.bonus || 0);
  const totalDeductions = Number(payroll?.deductions?.pf || 0)
    + Number(payroll?.deductions?.tax || 0);
  const netSalary = grossSalary - totalDeductions;
  const paymentStatus = payroll?.payment?.status || "Draft";

  const cards = [
    {
      type: "attendance",
      title: "Attendance Rate",
      attendanceRate,
      presentCount: attendStats.present + attendStats.late,
      halfDayCount: attendStats.halfDay || 0,
    },
    {
      type: "today",
      title: "Today\'s Status",
      todayStyle,
      todayStatus,
      todayRecord,
    },
    // {
    //   type: "payroll",
    //   title: "Latest Payroll",
    //   payroll,
    //   netSalary,
    //   paymentStatus,
    // },
    {
      type: "review",
      title: "Latest Review",
      performance,
      gradeConfig,
    },
    {
      type: "tasks",
      title: "Today's Tasks",
      taskCounts,
    },
  ];

  const renderCardContent = (card) => {
    if (card.type === "attendance") {
      const parts = [];
      if (card.presentCount > 0 || !card.halfDayCount) {
        parts.push(`${card.presentCount} present`);
      }
      if (card.halfDayCount > 0) {
        parts.push(`${card.halfDayCount} half day${card.halfDayCount > 1 ? "s" : ""}`);
      }
      const attendanceSubtext = `${parts.join(", ")} this month`;

      return (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <CircleProgress percent={card.attendanceRate} size={64} stroke={5} color="#1e88c8" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-700">{card.attendanceRate}%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-navy-900">
              <CountUp target={card.attendanceRate} suffix="%" />
            </p>
            <p className="text-xs text-slate-400 mt-0.5">{attendanceSubtext}</p>
          </div>
        </div>
      );
    }

    if (card.type === "today") {
      return (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${card.todayStyle.dot}`} />
            <p className={`text-xl font-bold ${card.todayStyle.text}`}>{card.todayStatus}</p>
          </div>
          {card.todayRecord ? (
            <p className="text-xs text-slate-400">
              {formatTime(card.todayRecord.checkIn)} → {formatTime(card.todayRecord.checkOut)}
            </p>
          ) : (
            <p className="text-xs text-slate-400">No check-in recorded today</p>
          )}
        </>
      );
    }

    if (card.type === "payroll") {
      return card.payroll ? (
        <>
          <p className="text-2xl font-bold text-navy-900">{formatCurrency(card.netSalary)}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700"
                : card.paymentStatus === "Processed" ? "bg-ocean-100 text-ocean-700"
                  : card.paymentStatus === "Hold" ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"}`}
            >
              {card.paymentStatus}
            </span>
            <span className="text-xs text-slate-400">{MONTH_NAMES[card.payroll.month - 1]} {card.payroll.year}</span>
          </div>
        </>
      ) : (
        <>
          <p className="text-xl font-bold text-slate-300">--</p>
          <p className="text-xs text-slate-400 mt-1">No payroll record yet</p>
        </>
      );
    }

    if (card.type === "tasks") {
      const { total, done, inProgress, pending } = card.taskCounts;
      if (total === 0) {
        return (
          <>
            <p className="text-sm font-semibold text-slate-500">No tasks for today</p>
            <p className="text-xs text-slate-400 mt-1">New assignments will show up here</p>
          </>
        );
      }
      return (
        <>
          <div className="flex items-baseline gap-1.5 mb-2">
            <p className="text-2xl font-bold text-navy-900 tabular-nums">{done}</p>
            <p className="text-sm text-slate-400 font-medium">/ {total} done</p>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
            <div className="h-full rounded-full bg-linear-to-r from-navy-700 to-ocean-400 transition-all duration-1000" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <p className="text-xs text-slate-400">{pending} pending · {inProgress} in progress</p>
        </>
      );
    }

    return card.performance ? (
      <>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-2xl font-bold text-navy-900">{card.performance.overallScore}</p>
          <p className="text-sm text-slate-400 font-medium">/ 100</p>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${card.gradeConfig?.bar || "bg-ocean-500"}`}
            style={{ width: `${card.performance.overallScore}%` }}
          />
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${card.gradeConfig?.color} ${card.gradeConfig?.bg} ${card.gradeConfig?.border}`}>
          {card.gradeConfig?.emoji} {card.performance.grade}
        </span>
      </>
    ) : (
      <>
        <p className="text-xl font-bold text-slate-300">Pending</p>
        <p className="text-xs text-slate-400 mt-1">No performance review yet</p>
      </>
    );
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const clickable = card.type === "tasks" && onOpenTasks;
        const Tag = clickable ? "button" : "div";
        return (
          <Tag
            key={card.title}
            onClick={clickable ? onOpenTasks : undefined}
            className={`panel p-5 text-left transition-shadow hover:shadow-md ${clickable ? "cursor-pointer hover:border-ocean-200" : ""}`}
          >
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">{card.title}</p>
            {renderCardContent(card)}
          </Tag>
        );
      })}
    </div>
  );
}
