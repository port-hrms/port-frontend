export const DEPT_COLORS = {
    Engineering: "bg-ocean-100 text-ocean-700",
    Marketing: "bg-pink-100 text-pink-700",
    HR: "bg-navy-100 text-navy-700",
    Finance: "bg-emerald-100 text-emerald-700",
    Sales: "bg-amber-100 text-amber-700",
    Operations: "bg-cyan-100 text-cyan-700",
    Design: "bg-rose-100 text-rose-700",
};

export const STATUS_STYLES = {
    New: "bg-ocean-100 text-ocean-700",
    Reviewed: "bg-emerald-100 text-emerald-700",
};

export const JOB_STATUS_STYLES = {
    Active: "bg-emerald-100 text-emerald-700",
    Closed: "bg-red-100 text-red-600",
    Draft: "bg-slate-100 text-slate-600",
};

export const DEPARTMENTS = ["Engineering", "Marketing", "HR", "Finance", "Sales", "Operations", "Design"];
export const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Intern", "Remote"];
export const EXP_LEVELS = ["Fresher", "1-2 Years", "3-5 Years", "5+ Years"];

export const defaultJobForm = {
    title: "", department: "Engineering", location: "",
    jobType: "Full-Time", experienceLevel: "Fresher",
    salaryMin: "", salaryMax: "",
    description: "", requirements: "", responsibilities: "",
    status: "Active", deadline: "",
};

export const AVATAR_COLORS = ["bg-navy-700", "bg-ocean-600", "bg-navy-600", "bg-ocean-500", "bg-port-teal", "bg-navy-500"];
