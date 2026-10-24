// "⋯" menu for secondary row actions. items: [{ label, icon, onClick, danger, hidden }]
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export default function RowActionsMenu({ items, label = "More actions" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const visible = items.filter((i) => i && !i.hidden);

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

    if (visible.length === 0) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
                <MoreHorizontal size={18} />
            </button>
            {open && (
                <div role="menu" className="absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                    {visible.map(({ label: text, icon, onClick, danger }) => {
                        const Icon = icon;
                        return (
                            <button
                                key={text}
                                role="menuitem"
                                type="button"
                                onClick={() => { setOpen(false); onClick(); }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${danger ? "text-port-red hover:bg-red-50" : "text-slate-700 hover:bg-slate-50"}`}
                            >
                                {Icon && <Icon size={14} />} {text}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
