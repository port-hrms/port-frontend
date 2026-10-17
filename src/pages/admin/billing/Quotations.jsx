import { Check, Download, Mail, Plus, Search, Trash2, View, Ban, FileSpreadsheet, Edit } from "lucide-react";
import QuotationModal from "./components/QuotationModal";
import QuotationViewModal from "./components/QuotationViewModal";
import QuotationTemplate from "@/components/quotation/QuotationTemplate";
import useQuotations from "../../../hooks/useQuotations";

export default function Quotations({ setActiveTab }) {
  const {
    quotations,
    loading,
    search,
    setSearch,
    clients,
    stats,
    pagination,
    showModal,
    setShowModal,
    showView,
    setShowView,
    editing,
    setEditing,
    downloadingQuotation,
    companySettings,
    form,
    setForm,
    subtotal,
    total,
    fetchQuotations,
    handleSubmit,
    resetForm,
    openEdit,
    handleDelete,
    handleStatus,
    handleDownloadPDF,
    handleSendEmail,
    handleGenerateInvoice,
    addItem,
    removeItem,
    updateItem,
  } = useQuotations(setActiveTab);

  const statCards = [
    { label: "Total Quotations", value: stats?.total || 0, color: "bg-blue-500/10 text-blue-600" },
    { label: "Pending", value: stats?.pending || 0, color: "bg-amber-500/10 text-amber-600" },
    { label: "Approved", value: stats?.approved || 0, color: "bg-emerald-500/10 text-emerald-600" },
    { label: "Revenue Estimate", value: `₹${(stats?.revenueEstimate || 0).toLocaleString("en-IN")}`, color: "bg-violet-500/10 text-violet-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Quotations</h1>
          <p className="text-sm text-slate-400 mt-0.5">Create and manage service quotations</p>
        </div>
        <button
          onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} />
          Create Quotation
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-extrabold mt-1 ${s.color.split(" ")[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search quotations..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Quotation ID", "Client", "Amount", "Status", "Created", "Valid Till", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-extrabold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">Loading...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">No quotations found</td></tr>
              ) : quotations.map((q) => (
                <tr key={q._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-700">{q.quotationNumber}</td>
                  <td className="px-5 py-3.5 text-slate-600">{q.clientId?.name || q.clientId?.companyName || "—"}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-700">₹{q.total.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${q.status === "Approved" ? "bg-emerald-50 text-emerald-600" : q.status === "Rejected" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(q.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs">{new Date(q.validTill).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowView(q)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600" title="View"><View size={13} /></button>
                      <button onClick={() => handleDownloadPDF(q._id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600" title="Download PDF"><Download size={13} /></button>
                      <button onClick={() => handleSendEmail(q._id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-600" title="Send Email"><Mail size={13} /></button>
                      {q.status === "Pending" && (
                        <>
                          <button onClick={() => handleStatus(q._id, "Approved")} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600" title="Approve"><Check size={13} /></button>
                          <button onClick={() => handleStatus(q._id, "Rejected")} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600" title="Reject"><Ban size={13} /></button>
                        </>
                      )}
                      {q.status === "Approved" && (
                        <button onClick={() => handleGenerateInvoice(q)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-violet-50 text-slate-400 hover:text-violet-600" title="Generate Invoice"><FileSpreadsheet size={13} /></button>
                      )}
                      <button onClick={() => openEdit(q)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600" title="Edit"><Edit size={13} /></button>
                      <button onClick={() => handleDelete(q)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600" title="Delete"><Trash2 size={13} /></button>
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
              <button disabled={pagination.page <= 1} onClick={() => fetchQuotations(pagination.page - 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40">Prev</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchQuotations(pagination.page + 1)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Quotation Modal */}
      {showModal && (
        <QuotationModal
          editing={editing}
          form={form}
          setForm={setForm}
          clients={clients}
          subtotal={subtotal}
          total={total}
          addItem={addItem}
          removeItem={removeItem}
          updateItem={updateItem}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
        />
      )}

      {/* View Modal */}
      {showView && (
        <QuotationViewModal
          quotation={showView}
          companyInfo={companySettings}
          onDownloadPDF={handleDownloadPDF}
          onSendEmail={handleSendEmail}
          onClose={() => setShowView(null)}
        />
      )}

      {/* Hidden container for crisp client-side PDF capture */}
      {downloadingQuotation && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "210mm", height: "297mm", zIndex: -100, opacity: 0, pointerEvents: "none", background: "white" }}>
          <div id="capture-quotation-pdf-target" style={{ width: "210mm", minHeight: "297mm" }}>
            <QuotationTemplate quotation={downloadingQuotation} companyInfo={companySettings} />
          </div>
        </div>
      )}
    </div>
  );
}
