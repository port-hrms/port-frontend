import { useRef } from "react";
import { X } from "lucide-react";
import QuotationTemplate from "@/components/quotation/QuotationTemplate";

export default function QuotationViewModal({ quotation, companyInfo, onClose, onDownloadPDF, onSendEmail }) {
  const printRef = useRef();

  if (!quotation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Quotation - {quotation.quotationNumber}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400"><X size={16} /></button>
        </div>
        
        {/* Render premium Quotation Template */}
        <div className="overflow-auto bg-slate-50 p-4 flex justify-center">
          <QuotationTemplate ref={printRef} quotation={quotation} companyInfo={companyInfo} />
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <button onClick={() => onDownloadPDF(quotation._id)} className="flex-1 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors">Download PDF</button>
          <button onClick={() => onSendEmail(quotation._id)} className="flex-1 py-2.5 rounded-xl bg-navy-600 hover:bg-navy-700 text-white text-sm font-bold transition-colors">Send Email</button>
          <button onClick={onClose} className="py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
}