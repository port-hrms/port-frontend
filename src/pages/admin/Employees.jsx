// @ts-nocheck
// client/src/pages/admin/Employees.jsx
// Employee directory — server-side search, filters, sorting and paging.

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
    ArrowDown, ArrowUp, ArrowUpDown, Download, LayoutGrid, MoreHorizontal, Pencil, Plus,
    Rows3, Search, ShieldAlert, Trash2, Upload, UserRound, X,
} from "lucide-react";
import API from "@/api/axios";
import ConfirmDialog from "@/components/ConfirmDialog";
import ImportEmployeesModal from "@/components/employee/ImportEmployeesModal";
import EmployeeAvatar from "@/components/employee/EmployeeAvatar";
import { DEPARTMENTS, EMP_TYPES, STATUSES } from "@/components/employee/form/constants";
import { downloadCSV, toCSV } from "@/utils/csv";

const PAGE_SIZE = 10;
const VIEW_KEY = "employees:view";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

const STATUS_STYLES = {
    Active: { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
    "On Leave": { pill: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
    Inactive: { pill: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400" },
};

const readView = () => {
    try { return localStorage.getItem(VIEW_KEY) || "table"; } catch { return "table"; }
};

function StatusPill({ status = "Active" }) {
    const s = STATUS_STYLES[status] || STATUS_STYLES.Inactive;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${s.pill}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {status}
        </span>
    );
}

function KycBadge() {
    return (
        <span title="Aadhaar, PAN or bank details missing" className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700 ring-1 ring-amber-200">
            <ShieldAlert size={10} /> KYC
        </span>
    );
}

// "⋯" menu for secondary actions
function RowMenu({ onEdit, onRemove }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        const esc = (e) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", esc);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", esc);
        };
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                aria-label="More actions"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
                <MoreHorizontal size={18} />
            </button>
            {open && (
                <div role="menu" className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    <button role="menuitem" onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                        <Pencil size={14} /> Edit
                    </button>
                    <button role="menuitem" onClick={() => { setOpen(false); onRemove(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-port-red hover:bg-red-50">
                        <Trash2 size={14} /> Remove
                    </button>
                </div>
            )}
        </div>
    );
}

function SortHeader({ label, field, sort, onSort, className = "" }) {
    const active = sort.by === field;
    const Icon = !active ? ArrowUpDown : sort.order === "asc" ? ArrowUp : ArrowDown;
    return (
        <th className={`px-4 py-3 text-left ${className}`} aria-sort={active ? (sort.order === "asc" ? "ascending" : "descending") : "none"}>
            <button
                type="button"
                onClick={() => onSort(field)}
                className={`inline-flex items-center gap-1 uppercase text-[11px] font-semibold tracking-wider ${active ? "text-navy-800" : "text-slate-500 hover:text-slate-700"}`}
            >
                {label}
                <Icon size={12} className={active ? "" : "opacity-50"} />
            </button>
        </th>
    );
}

function FilterSelect({ label, value, onChange, options }) {
    return (
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
            <span className="hidden sm:inline">{label}</span>
            <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent font-medium text-slate-800 outline-none cursor-pointer">
                <option value="All">All</option>
                {options.map((o) => <option key={o}>{o}</option>)}
            </select>
        </label>
    );
}

export default function Employees({ onAddClick, onViewClick, onEditClick, refreshKey }) {
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ total: 0, pages: 1 });
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({ department: "All", status: "All", employmentType: "All" });
    const [sort, setSort] = useState({ by: "createdAt", order: "desc" });
    const [page, setPage] = useState(1);
    const [view, setView] = useState(readView);

    const [pendingRemoval, setPendingRemoval] = useState(null); // { id, name }
    const [removing, setRemoving] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [exporting, setExporting] = useState(false);

    const queryParams = useCallback(() => {
        const params = { sortBy: sort.by, order: sort.order };
        if (search) params.search = search;
        Object.entries(filters).forEach(([k, v]) => { if (v !== "All") params[k] = v; });
        return params;
    }, [search, filters, sort]);

    // Debounce typing → search
    useEffect(() => {
        const t = setTimeout(() => setSearch(searchInput.trim()), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    // Any filter / sort / search change goes back to page 1
    useEffect(() => { setPage(1); }, [search, filters, sort]);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/employees", { params: { ...queryParams(), page, limit: PAGE_SIZE } });
            setItems(data.data || []);
            setMeta({ total: data.total ?? data.count ?? 0, pages: data.pages ?? 1 });
        } catch {
            toast.error("Failed to fetch employees");
        } finally {
            setLoading(false);
        }
    }, [queryParams, page]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await API.get("/employees/stats/summary");
            setStats(data.data);
        } catch {
            // summary is optional
        }
    }, []);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees, refreshKey]);
    useEffect(() => { fetchStats(); }, [fetchStats, refreshKey]);

    const changeView = (next) => {
        setView(next);
        try { localStorage.setItem(VIEW_KEY, next); } catch { /* ignore */ }
    };

    const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value }));
    const toggleSort = (field) =>
        setSort((s) => (s.by === field ? { by: field, order: s.order === "asc" ? "desc" : "asc" } : { by: field, order: field === "joiningDate" ? "desc" : "asc" }));

    const hasFilters = Boolean(search) || Object.values(filters).some((v) => v !== "All");
    const clearFilters = () => {
        setSearchInput("");
        setSearch("");
        setFilters({ department: "All", status: "All", employmentType: "All" });
    };

    // ─── Remove (soft delete: login disabled, history kept) ──────
    const confirmRemoval = async () => {
        if (!pendingRemoval) return;
        const { id, name } = pendingRemoval;
        try {
            setRemoving(true);
            await API.delete(`/employees/${id}`);
            toast.success(`${name} removed`);
            setPendingRemoval(null);
            fetchEmployees();
            fetchStats();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove employee");
        } finally {
            setRemoving(false);
        }
    };

    // ─── Export (current filters, all pages) ───────────────────────
    const exportCSV = async () => {
        try {
            setExporting(true);
            const { data } = await API.get("/employees", { params: queryParams() });
            const rows = data.data || [];
            const csv = toCSV(rows, [
                { key: "employeeId", label: "Employee ID" },
                { key: "firstName", label: "First Name" },
                { key: "lastName", label: "Last Name" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
                { key: "department", label: "Department" },
                { key: "designation", label: "Designation" },
                { key: "employmentType", label: "Employment Type" },
                { key: "status", label: "Status" },
                { label: "Joining Date", value: (r) => (r.joiningDate ? r.joiningDate.slice(0, 10) : "") },
                { label: "KYC Complete", value: (r) => (r.kycComplete ? "Yes" : "No") },
            ]);
            downloadCSV(`employees-${new Date().toISOString().slice(0, 10)}.csv`, csv);
            toast.success(`Exported ${rows.length} employee${rows.length === 1 ? "" : "s"}`);
        } catch {
            toast.error("Export failed");
        } finally {
            setExporting(false);
        }
    };

    const summary = [
        { label: "Total", value: stats?.total, status: "All" },
        { label: "Active", value: stats?.active, status: "Active", dot: "bg-emerald-500" },
        { label: "On Leave", value: stats?.onLeave, status: "On Leave", dot: "bg-amber-500" },
        { label: "Inactive", value: stats?.inactive, status: "Inactive", dot: "bg-slate-400" },
    ];
    const from = meta.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, meta.total);

    return (
        <div className="space-y-5">
            {/* ── Header ── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">Employees</h2>
                    <p className="text-sm text-slate-500 mt-0.5">Manage your people, their details and access</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setShowImport(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Upload size={15} /> Import
                    </button>
                    <button onClick={exportCSV} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                        <Download size={15} /> {exporting ? "Exporting…" : "Export"}
                    </button>
                    <button onClick={onAddClick} className="inline-flex items-center gap-1.5 rounded-lg bg-linear-to-r from-ocean-600 to-navy-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-ocean-700 hover:to-navy-800">
                        <Plus size={16} /> Add Employee
                    </button>
                </div>
            </div>

            {/* ── Summary ── */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {summary.map((s) => {
                    const active = filters.status === s.status;
                    return (
                        <button
                            key={s.label}
                            onClick={() => setFilter("status", s.status)}
                            className={`panel flex items-center justify-between px-4 py-3 text-left transition-colors ${active ? "ring-2 ring-ocean-300 border-ocean-200" : "hover:border-ocean-200"}`}
                        >
                            <span className="flex items-center gap-2 text-sm font-medium text-slate-600">
                                {s.dot && <span className={`h-2 w-2 rounded-full ${s.dot}`} />}
                                {s.label}
                            </span>
                            <span className="text-xl font-bold tabular-nums text-navy-900">{s.value ?? "–"}</span>
                        </button>
                    );
                })}
            </div>

            {stats?.byDepartment?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {stats.byDepartment.map((d) => {
                        const active = filters.department === d._id;
                        return (
                            <button
                                key={d._id}
                                onClick={() => setFilter("department", active ? "All" : d._id)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors ${active ? "bg-navy-800 text-white ring-navy-800" : "bg-white text-slate-600 ring-slate-200 hover:ring-ocean-300"}`}
                            >
                                {d._id}
                                <span className={`tabular-nums ${active ? "text-ocean-200" : "text-slate-400"}`}>{d.count}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center gap-2.5">
                <label className="flex min-w-56 flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <Search size={16} className="text-slate-400" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search name, employee ID or email"
                        aria-label="Search employees"
                        className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder-slate-400"
                    />
                    {searchInput && (
                        <button onClick={() => setSearchInput("")} aria-label="Clear search" className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                    )}
                </label>
                <FilterSelect label="Department" value={filters.department} onChange={(v) => setFilter("department", v)} options={DEPARTMENTS} />
                <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilter("status", v)} options={STATUSES} />
                <FilterSelect label="Type" value={filters.employmentType} onChange={(v) => setFilter("employmentType", v)} options={EMP_TYPES} />
                {hasFilters && (
                    <button onClick={clearFilters} className="text-sm font-semibold text-ocean-700 hover:text-navy-800">Clear filters</button>
                )}
                <div className="ml-auto flex rounded-lg border border-slate-200 bg-white p-0.5" role="group" aria-label="View">
                    {[{ key: "table", icon: Rows3, label: "Table view" }, { key: "cards", icon: LayoutGrid, label: "Card view" }].map(({ key, icon, label }) => {
                        const ViewIcon = icon;
                        return (
                            <button
                                key={key}
                                onClick={() => changeView(key)}
                                aria-label={label}
                                aria-pressed={view === key}
                                className={`rounded-md p-1.5 ${view === key ? "bg-navy-800 text-white" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <ViewIcon size={16} />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Results ── */}
            <div className="panel overflow-hidden">
                {!loading && items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <UserRound size={44} className="mb-3 text-slate-300" />
                        <p className="text-base font-semibold text-slate-600">{hasFilters ? "No employees match these filters" : "No employees yet"}</p>
                        <p className="text-sm mt-1">{hasFilters ? "Try a different search or clear the filters." : "Add your first employee or import a CSV."}</p>
                        {hasFilters && <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-ocean-700">Clear filters</button>}
                    </div>
                ) : view === "table" ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px]">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <SortHeader label="Employee" field="name" sort={sort} onSort={toggleSort} />
                                    <SortHeader label="ID" field="employeeId" sort={sort} onSort={toggleSort} />
                                    <SortHeader label="Department" field="department" sort={sort} onSort={toggleSort} />
                                    <SortHeader label="Designation" field="designation" sort={sort} onSort={toggleSort} />
                                    <SortHeader label="Status" field="status" sort={sort} onSort={toggleSort} />
                                    <SortHeader label="Joined" field="joiningDate" sort={sort} onSort={toggleSort} />
                                    <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading
                                    ? Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="h-9 w-9 rounded-full bg-slate-100" /><div className="space-y-1.5"><div className="h-3 w-32 rounded bg-slate-100" /><div className="h-2.5 w-44 rounded bg-slate-100" /></div></div></td>
                                            {Array.from({ length: 5 }).map((__, j) => <td key={j} className="px-4 py-3.5"><div className="h-3 w-20 rounded bg-slate-100" /></td>)}
                                            <td className="px-4 py-3.5" />
                                        </tr>
                                    ))
                                    : items.map((emp) => (
                                        <tr key={emp._id} className="hover:bg-ocean-50/40">
                                            <td className="px-4 py-3">
                                                <button onClick={() => onViewClick(emp)} className="flex items-center gap-3 text-left">
                                                    <EmployeeAvatar employee={emp} />
                                                    <span className="min-w-0">
                                                        <span className="flex items-center gap-2">
                                                            <span className="truncate text-sm font-semibold text-navy-900 hover:text-ocean-700">{emp.firstName} {emp.lastName}</span>
                                                            {emp.kycComplete === false && <KycBadge />}
                                                        </span>
                                                        <span className="block truncate text-xs text-slate-500">{emp.email}</span>
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-600">{emp.employeeId}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{emp.department}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">
                                                {emp.designation}
                                                <span className="block text-xs text-slate-400">{emp.employmentType}</span>
                                            </td>
                                            <td className="px-4 py-3"><StatusPill status={emp.status} /></td>
                                            <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{fmtDate(emp.joiningDate)}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => onViewClick(emp)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50">View</button>
                                                    <RowMenu
                                                        onEdit={() => onEditClick(emp)}
                                                        onRemove={() => setPendingRemoval({ id: emp._id, name: `${emp.firstName} ${emp.lastName}` })}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
                        {loading
                            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-36 animate-pulse rounded-xl bg-slate-100" />)
                            : items.map((emp) => (
                                <div key={emp._id} className="rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-md">
                                    <div className="flex items-start gap-3">
                                        <EmployeeAvatar employee={emp} className="h-12 w-12 text-sm" />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="truncate text-sm font-semibold text-navy-900">{emp.firstName} {emp.lastName}</p>
                                                {emp.kycComplete === false && <KycBadge />}
                                            </div>
                                            <p className="truncate text-sm text-slate-600">{emp.designation}</p>
                                            <p className="mt-0.5 text-xs text-slate-400">{emp.employeeId} · {emp.department}</p>
                                        </div>
                                        <RowMenu
                                            onEdit={() => onEditClick(emp)}
                                            onRemove={() => setPendingRemoval({ id: emp._id, name: `${emp.firstName} ${emp.lastName}` })}
                                        />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <StatusPill status={emp.status} />
                                        <button onClick={() => onViewClick(emp)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50">View profile</button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}

                {/* ── Pagination ── */}
                {meta.total > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-700">{from}–{to}</span> of <span className="font-semibold text-slate-700">{meta.total}</span>{hasFilters ? " matching" : ""} employees
                        </p>
                        {meta.pages > 1 && (
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                                <span className="text-xs text-slate-500">Page {page} of {meta.pages}</span>
                                <button onClick={() => setPage((p) => p + 1)} disabled={page >= meta.pages} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={Boolean(pendingRemoval)}
                title={`Remove ${pendingRemoval?.name || "employee"}?`}
                message="Their login will be disabled and they will no longer appear in lists. Attendance, payroll and leave history is kept."
                confirmLabel="Remove employee"
                busy={removing}
                onConfirm={confirmRemoval}
                onCancel={() => setPendingRemoval(null)}
            />

            {showImport && (
                <ImportEmployeesModal
                    onClose={() => setShowImport(false)}
                    onImported={() => { fetchEmployees(); fetchStats(); }}
                />
            )}
        </div>
    );
}
