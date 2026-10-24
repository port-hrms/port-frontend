// @ts-nocheck
// client/src/components/employee/form/DocumentsSection.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Eye, RefreshCw, Upload, X } from "lucide-react";
import API from "../../../api/axios";
import { DOCUMENT_TYPES } from "../documentTypes";
import { SectionTitle } from "./Field";

const FILE_TYPES = ".pdf,.doc,.docx,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png";
const MAX_MB = 10;

export default function DocumentsSection({ docs, onFileChange, existingDocs = {}, employeeId }) {
    const [opening, setOpening] = useState("");

    const viewExisting = async (key) => {
        try {
            setOpening(key);
            const { data } = await API.get(`/employees/${employeeId}/documents/${key}`, { responseType: "blob" });
            const url = URL.createObjectURL(data);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch {
            toast.error("Could not open document");
        } finally {
            setOpening("");
        }
    };

    const pick = (key, file) => {
        if (file && file.size > MAX_MB * 1024 * 1024) {
            toast.error(`File is larger than ${MAX_MB} MB`);
            return;
        }
        onFileChange(key, file || null);
    };

    return (
        <section>
            <SectionTitle title="Documents" description={`PDF, Word, JPG or PNG · up to ${MAX_MB} MB each. Photos of Aadhaar or a passbook are fine.`} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {DOCUMENT_TYPES.map(({ key, label, desc, icon }) => {
                    const Icon = icon;
                    const newFile = docs[key];
                    const hasExisting = Boolean(existingDocs?.[key]);
                    const inputId = `doc-${key}`;
                    return (
                        <div
                            key={key}
                            className={`rounded-xl border p-3.5 transition-colors ${newFile ? "border-ocean-300 bg-ocean-50/50" : "border-slate-200 bg-white"}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-navy-600 ring-1 ring-slate-200">
                                    <Icon size={18} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-navy-900">{label}</p>
                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                        {newFile
                                            ? <span className="font-medium text-ocean-700">New: {newFile.name}</span>
                                            : hasExisting
                                                ? <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 size={12} /> Uploaded</span>
                                                : desc}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {hasExisting && !newFile && employeeId && (
                                    <button
                                        type="button"
                                        onClick={() => viewExisting(key)}
                                        disabled={opening === key}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 disabled:opacity-60"
                                    >
                                        <Eye size={13} /> {opening === key ? "Opening…" : "View"}
                                    </button>
                                )}
                                <label
                                    htmlFor={inputId}
                                    className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-within:ring-2 focus-within:ring-ocean-200"
                                >
                                    {hasExisting || newFile ? <RefreshCw size={13} /> : <Upload size={13} />}
                                    {hasExisting || newFile ? "Replace" : "Upload"}
                                    <input
                                        id={inputId}
                                        type="file"
                                        accept={FILE_TYPES}
                                        className="sr-only"
                                        onChange={(e) => { pick(key, e.target.files?.[0]); e.target.value = ""; }}
                                    />
                                </label>
                                {newFile && (
                                    <button
                                        type="button"
                                        onClick={() => onFileChange(key, null)}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-port-red hover:bg-red-50"
                                    >
                                        <X size={13} /> {hasExisting ? "Keep current" : "Remove"}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
