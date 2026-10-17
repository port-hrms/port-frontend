import { Download, Mail, Pencil, Plus, Search, Trash2, View, CheckCircle } from "lucide-react";
import InvoiceEditModal from "./components/InvoiceEditModal";
import InvoiceViewModal from "./components/InvoiceViewModal";
import TaxInvoiceTemplate from "@/components/invoice/TaxInvoiceTemplate";
import useInvoices from "../../../hooks/useInvoices";

export default function Invoices() {
  const {
    invoices,
    loading,
    search,
    setSearch,
    stats,
    pagination,
    showModal,
    setShowModal,
    showView,
    setShowView,
    editing,
    setEditing,
    clients,
    downloadingInvoice,
    companySettings,
    form,
    setForm,
    formTotal,
    fetchInvoices,
    handleSubmit,
    resetForm,
    openEdit,
    handleDelete,
    handleDownloadPDF,
    handleSendEmail,
    handleMarkPaid,
  } = useInvoices();

  const statCards = [
    { label: "Total Invoices", value: stats?.total || 0, color: "text-ocean-600" },
    { label: "Paid", value: stats?.paid || 0, color: "text-emerald-600" },
    { label: "Unpaid", value: stats?.unpaid || 0, color: "text-amber-600" },
    { label: "Overdue", value: stats?.overdue || 0, color: "text-rose-600" },
    { label: "Revenue", value: `₹${(stats?.revenueGenerated || 0).toLocaleString("en-IN")}`, color: "text-navy-600" },
    { label: "Pending Payments", value: `₹${(stats?.pendingPayments || 0).toLocaleString("en-IN")}`, color: "text-orange-600" },
  ];

  const statusStyles = {
    Paid: "bg-emerald-50 text-emerald-600",
    Unpaid: "bg-amber-50 text-amber-600",
    Partial: "bg-ocean-50 text-ocean-600",
    Overdue: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage invoices and payment tracking</p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-ocean-600 to-navy-600 text-white text-sm font-bold rounded-xl shadow-md shadow-ocean-200 hover:from-ocean-700 hover:to-navy-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} />
          Create Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="panel p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:border-ocean-400 focus:ring-2 focus:ring-ocean-100 transition-colors" />
      </div>

      {/* Table */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {["Invoice ID", "Client", "Amount", "Due Date", "Payment Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 uppercase whitespace-nowrap text-[11px] font-semibold text-slate-500 tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm font-medium">Loading...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm font-medium">No invoices found</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-700">{inv.invoiceNumber}</td>
                  <td className="px-5 py-3.5 text-slate-600">{inv.clientId?.name || inv.clientId?.companyName || "—"}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">₹{inv.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(inv.dueDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusStyles[inv.paymentStatus] || "bg-slate-100 text-slate-500"}`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowView(inv)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ocean-50 text-slate-400 hover:text-ocean-600" title="View"><View size={13} /></button>
                      <button onClick={() => handleDownloadPDF(inv._id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-navy-50 text-slate-400 hover:text-navy-600" title="Download PDF"><Download size={13} /></button>
                      <button onClick={() => handleSendEmail(inv._id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-ocean-50 text-slate-400 hover:text-ocean-600" title="Send Email"><Mail size={13} /></button>
                      {inv.paymentStatus !== "Paid" && (
                        <button onClick={() => handleMarkPaid(inv)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600" title="Mark as Paid"><CheckCircle size={13} /></button>
                      )}
                      <button onClick={() => openEdit(inv)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-navy-50 text-slate-400 hover:text-navy-600" title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => handleDelete(inv)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchInvoices(pagination.page - 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40">Prev</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchInvoices(pagination.page + 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showModal && (
        <InvoiceEditModal
          editing={editing}
          form={form}
          setForm={setForm}
          clients={clients}
          formTotal={formTotal}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
        />
      )}

      {/* View Modal */}
      {showView && (
        <InvoiceViewModal
          invoice={showView}
          statusStyles={statusStyles}
          onDownloadPDF={handleDownloadPDF}
          onSendEmail={handleSendEmail}
          onMarkPaid={handleMarkPaid}
          onClose={() => setShowView(null)}
        />
      )}

      {/* Hidden container for crisp client-side PDF capture */}
      {downloadingInvoice && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "210mm", height: "297mm", zIndex: -100, opacity: 0, pointerEvents: "none", background: "white" }}>
          <div id="capture-pdf-target" style={{ width: "210mm", minHeight: "297mm" }}>
            <TaxInvoiceTemplate invoice={downloadingInvoice} companyInfo={companySettings} />
          </div>
        </div>
      )}
    </div>
  );
}
