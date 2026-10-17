import { X } from "lucide-react";

export default function InvoiceEditModal({ editing, form, setForm, clients, formTotal, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">{editing ? "Edit Invoice" : "Create Invoice"}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Client <span className="text-red-400">*</span></label>
              <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors">
                <option value="">Select client</option>
                {clients.filter((c) => c.status === "Active").map((c) => (
                  <option key={c._id} value={c._id}>{c.name} ({c.companyName})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Due Date <span className="text-red-400">*</span></label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500">Items</label>
              <button onClick={() => setForm({ ...form, items: [...form.items, { service: "", description: "", quantity: 1, price: 0 }] })}
                className="text-xs font-bold text-ocean-600 hover:text-ocean-700">+ Add Item</button>
            </div>
            <div className="space-y-3">
              {form.items.map((item, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-3 space-y-2 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <input placeholder="Service" value={item.service}
                      onChange={(e) => { const items = [...form.items]; items[idx].service = e.target.value; setForm({ ...form, items }); }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors" />
                    <input type="number" placeholder="Qty" value={item.quantity}
                      onChange={(e) => { const items = [...form.items]; items[idx].quantity = e.target.value; setForm({ ...form, items }); }}
                      className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors text-center" />
                    <input type="number" placeholder="Price" value={item.price}
                      onChange={(e) => { const items = [...form.items]; items[idx].price = e.target.value; setForm({ ...form, items }); }}
                      className="w-28 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors" />
                    <span className="text-sm font-bold text-slate-600 w-20 text-right">₹{((item.quantity || 0) * (item.price || 0)).toLocaleString("en-IN")}</span>
                    <button onClick={() => { if (form.items.length > 1) setForm({ ...form, items: form.items.filter((_, i) => i !== idx) }); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"><X size={14} /></button>
                  </div>
                  <input placeholder="Description" value={item.description || ""}
                    onChange={(e) => { const items = [...form.items]; items[idx].description = e.target.value; setForm({ ...form, items }); }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Tax (₹)</label>
              <input type="number" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">Discount (₹)</label>
              <input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors" />
            </div>
            <div className="flex flex-col justify-end">
              <p className="text-sm font-bold text-slate-800">Total: ₹{formTotal.toLocaleString("en-IN")}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors resize-none" />
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors">Cancel</button>
          <button onClick={onSubmit} className="flex-1 py-2.5 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-sm font-bold transition-colors">
            {editing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}