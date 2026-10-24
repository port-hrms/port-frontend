// Reusable confirmation dialog (replaces window.confirm)
import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "danger",
    busy = false,
    onConfirm,
    onCancel,
}) {
    const cancelRef = useRef(null);

    // Focus the safe option and close on Escape
    useEffect(() => {
        if (!open) return;
        cancelRef.current?.focus();
        const onKey = (e) => {
            if (e.key === "Escape" && !busy) onCancel?.();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, busy, onCancel]);

    if (!open) return null;

    const confirmTone = tone === "danger"
        ? "bg-port-red hover:bg-red-600 focus-visible:ring-red-200"
        : "bg-navy-800 hover:bg-navy-700 focus-visible:ring-ocean-200";

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-950/50 p-4 backdrop-blur-sm"
            onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel?.(); }}
        >
            <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone === "danger" ? "bg-red-50 text-port-red" : "bg-ocean-50 text-ocean-600"}`}>
                        <AlertTriangle size={20} />
                    </span>
                    <div className="min-w-0">
                        <h3 id="confirm-title" className="text-base font-bold text-navy-900">{title}</h3>
                        <div className="mt-1.5 text-sm leading-6 text-slate-600">{message}</div>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2.5">
                    <button
                        ref={cancelRef}
                        type="button"
                        onClick={onCancel}
                        disabled={busy}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-4 disabled:opacity-60 ${confirmTone}`}
                    >
                        {busy ? "Please wait…" : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
