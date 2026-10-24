// @ts-nocheck
import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Eye, RefreshCw, Upload } from "lucide-react";
import API from "../../../api/axios";
import { DOCUMENT_TYPES } from "../documentTypes";
import { Card } from "./shared";

const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

export default function DocumentsTab({ employee, onChanged }) {
    const [busy, setBusy] = useState("");

    const view = async (key) => {
        try {
            setBusy(`view-${key}`);
            const { data } = await API.get(`/employees/${employee._id}/documents/${key}`, { responseType: "blob" });
            const url = URL.createObjectURL(data);
            window.open(url, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch {
            toast.error("Could not open document");
        } finally {
            setBusy("");
        }
    };

    const upload = async (key, file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error("File is larger than 10 MB"); return; }
        try {
            setBusy(`up-${key}`);
            const fd = new FormData();
            fd.append(key, file);
            await API.put(`/employees/${employee._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("Document uploaded");
            onChanged?.();
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setBusy("");
        }
    };

    return (
        <Card title="Documents">
            <p className="-mt-2 mb-4 text-sm text-slate-500">Private files — only admins and this employee can open them. PDF, Word, JPG or PNG up to 10 MB.</p>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {DOCUMENT_TYPES.map(({ key, label, desc, icon }) => {
                    const Icon = icon;
                    const has = Boolean(employee.documents?.[key]);
                    return (
                        <li key={key} className="flex flex-wrap items-center gap-3 px-4 py-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-navy-600 ring-1 ring-slate-200"><Icon size={18} /></span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-navy-900">{label}</p>
                                <p className="text-xs text-slate-500">
                                    {has ? <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 size={12} /> Uploaded</span> : `Not uploaded · ${desc}`}
                                </p>
                            </div>
                            <div className="flex gap-1.5">
                                {has && (
                                    <button onClick={() => view(key)} disabled={Boolean(busy)} className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-ocean-700 hover:bg-ocean-50 disabled:opacity-50">
                                        <Eye size={13} /> {busy === `view-${key}` ? "Opening…" : "View"}
                                    </button>
                                )}
                                <label className={`inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-ocean-200 ${busy ? "pointer-events-none opacity-50" : ""}`}>
                                    {has ? <RefreshCw size={13} /> : <Upload size={13} />}
                                    {busy === `up-${key}` ? "Uploading…" : has ? "Replace" : "Upload"}
                                    <input type="file" accept={ACCEPT} className="sr-only" onChange={(e) => { upload(key, e.target.files?.[0]); e.target.value = ""; }} />
                                </label>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </Card>
    );
}
