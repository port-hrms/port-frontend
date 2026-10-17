import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import API from "@/api/axios";
import TaxInvoiceTemplate from "@/components/invoice/TaxInvoiceTemplate";

export default function InvoiceViewModal({ invoice, onClose }) {
  const printRef = useRef();
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const { data } = await API.get("/settings/company");
        setCompanySettings(data.data);
      } catch {}
    };
    fetchCompanySettings();
  }, []);

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-extrabold text-slate-800">
            Tax Invoice - {invoice.invoiceNumber}
          </h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={16} />
          </button>
        </div>

        {/* Body (Tax Invoice Template) */}
        <div className="overflow-auto bg-slate-50 p-4 flex justify-center">
          <TaxInvoiceTemplate ref={printRef} invoice={invoice} companyInfo={companySettings} />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-500 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
