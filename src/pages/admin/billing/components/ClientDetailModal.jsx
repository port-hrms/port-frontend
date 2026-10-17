import { X } from "lucide-react";

export default function ClientDetailModal({ client, onClose }) {
  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-800">Client Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          {[
            { label: "Client ID", value: client.clientId || client._id.slice(-6).toUpperCase() },
            { label: "Name", value: client.name },
            { label: "Company", value: client.companyName },
            { label: "Email", value: client.email },
            { label: "Phone", value: client.phone },
            { label: "GST Number", value: client.gstNumber || "—" },
            { label: "Address", value: client.address || "—" },
            { label: "Status", value: client.status },
          ].map((f) => (
            <div key={f.label} className="flex justify-between items-center py-1">
              <span className="text-xs font-bold text-slate-400">{f.label}</span>
              <span className="text-sm font-semibold text-slate-700">{f.value}</span>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}