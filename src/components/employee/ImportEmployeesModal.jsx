// Bulk-add employees from a CSV file
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Download, FileSpreadsheet, Upload, X, XCircle } from "lucide-react";
import API from "@/api/axios";
import { downloadCSV, parseCSV, toCSV } from "@/utils/csv";

const TEMPLATE_COLUMNS = [
    "firstName", "lastName", "email", "phone", "gender", "dateOfBirth", "department", "designation",
    "employmentType", "joiningDate", "endingDate", "status", "salary", "address",
    "aadharNumber", "bankName", "accountNumber", "ifscCode", "panNumber", "pfNumber", "pfUAN",
];
const REQUIRED = ["firstName", "lastName", "email", "phone", "department", "designation", "salary", "joiningDate"];
const EXAMPLE_ROW = {
    firstName: "Asha", lastName: "Mohanty", email: "asha.mohanty@example.com", phone: "9876543210",
    gender: "Female", dateOfBirth: "1995-04-12", department: "Operations", designation: "Port Supervisor",
    employmentType: "Full-Time", joiningDate: "2026-11-01", endingDate: "", status: "Active", salary: "42000",
    address: "Paradeep, Odisha", aadharNumber: "", bankName: "", accountNumber: "", ifscCode: "",
    panNumber: "", pfNumber: "", pfUAN: "",
};

export default function ImportEmployeesModal({ onClose, onImported }) {
    const fileRef = useRef(null);
    const [fileName, setFileName] = useState("");
    const [records, setRecords] = useState([]);
    const [missingColumns, setMissingColumns] = useState([]);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);

    const downloadTemplate = () => {
        const cols = TEMPLATE_COLUMNS.map((key) => ({ key, label: key }));
        downloadCSV("employee-import-template.csv", toCSV([EXAMPLE_ROW], cols));
    };

    const handleFile = async (file) => {
        setResult(null);
        if (!file) return;
        if (!/\.csv$/i.test(file.name)) {
            toast.error("Please choose a .csv file");
            return;
        }
        const { headers, records: rows } = parseCSV(await file.text());
        setFileName(file.name);
        setRecords(rows);
        setMissingColumns(REQUIRED.filter((c) => !headers.includes(c)));
    };

    const runImport = async () => {
        try {
            setImporting(true);
            const { data } = await API.post("/employees/import", { rows: records });
            setResult(data.data);
            if (data.data.created > 0) {
                toast.success(data.message);
                onImported?.();
            } else {
                toast.error("No employees were imported");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Import failed");
        } finally {
            setImporting(false);
        }
    };

    const canImport = records.length > 0 && missingColumns.length === 0 && !importing && !result;
    const failed = result?.results?.filter((r) => !r.success) || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-labelledby="import-title" className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
                    <div>
                        <h2 id="import-title" className="text-lg font-bold text-navy-900">Import employees</h2>
                        <p className="mt-0.5 text-sm text-slate-500">Add many employees at once from a CSV file. Logins are not created — set them up per employee afterwards.</p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                    {/* Step 1 */}
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="text-sm">
                            <p className="font-semibold text-navy-900">1. Download the template</p>
                            <p className="text-slate-500">Required: {REQUIRED.join(", ")}. Dates as YYYY-MM-DD.</p>
                        </div>
                        <button onClick={downloadTemplate} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-navy-800 hover:bg-ocean-50">
                            <Download size={15} /> Template
                        </button>
                    </div>

                    {/* Step 2 */}
                    <div>
                        <p className="mb-2 text-sm font-semibold text-navy-900">2. Choose your filled-in file</p>
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-slate-200 px-4 py-4 text-left hover:border-ocean-300 hover:bg-ocean-50/40"
                        >
                            <FileSpreadsheet size={22} className="text-ocean-600" />
                            <span className="text-sm">
                                {fileName
                                    ? <><span className="font-semibold text-navy-900">{fileName}</span> · {records.length} row{records.length === 1 ? "" : "s"}</>
                                    : <span className="text-slate-500">Click to select a .csv file</span>}
                            </span>
                        </button>
                        <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                        {missingColumns.length > 0 && (
                            <p className="mt-2 text-sm text-port-red">Missing required column(s): {missingColumns.join(", ")}</p>
                        )}
                    </div>

                    {/* Preview */}
                    {records.length > 0 && missingColumns.length === 0 && !result && (
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                    <tr>
                                        {["Name", "Email", "Department", "Designation"].map((h) => (
                                            <th key={h} className="px-3 py-2 text-left uppercase text-[11px] font-semibold text-slate-500 tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {records.slice(0, 5).map((r, i) => (
                                        <tr key={i}>
                                            <td className="px-3 py-2 text-navy-900">{r.firstName} {r.lastName}</td>
                                            <td className="px-3 py-2 text-slate-600">{r.email}</td>
                                            <td className="px-3 py-2 text-slate-600">{r.department}</td>
                                            <td className="px-3 py-2 text-slate-600">{r.designation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {records.length > 5 && <p className="px-3 py-2 text-xs text-slate-500">…and {records.length - 5} more</p>}
                        </div>
                    )}

                    {/* Result */}
                    {result && (
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                                    <CheckCircle2 size={16} /> {result.created} imported
                                </span>
                                {result.failed > 0 && (
                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                                        <XCircle size={16} /> {result.failed} failed
                                    </span>
                                )}
                            </div>
                            {failed.length > 0 && (
                                <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200 text-sm">
                                    {failed.map((r) => (
                                        <li key={r.row} className="flex gap-3 px-3 py-2">
                                            <span className="shrink-0 font-semibold text-slate-500">Row {r.row}</span>
                                            <span className="min-w-0 text-slate-700"><span className="text-slate-500">{r.email && `${r.email} — `}</span>{r.message}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2.5 border-t border-slate-100 px-6 py-4">
                    <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        {result ? "Done" : "Cancel"}
                    </button>
                    {!result && (
                        <button
                            onClick={runImport}
                            disabled={!canImport}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Upload size={15} /> {importing ? "Importing…" : `Import ${records.length || ""} employee${records.length === 1 ? "" : "s"}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
