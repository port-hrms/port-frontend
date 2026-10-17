import React from "react";

export const BankSection = ({ bank, handleBankChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">2. Bank Details</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Holder</label>
          <input
            name="holder"
            value={bank.holder}
            onChange={handleBankChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
            placeholder="e.g. Briskode Technology Pvt. Ltd."
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bank Name</label>
          <input
            name="bank"
            value={bank.bank}
            onChange={handleBankChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
            placeholder="e.g. HDFC Bank"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Number</label>
          <input
            name="account"
            value={bank.account}
            onChange={handleBankChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
            placeholder="e.g. 50200087663786"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Branch</label>
          <input
            name="branch"
            value={bank.branch}
            onChange={handleBankChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
            placeholder="e.g. Infocity"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">IFSC Code</label>
          <input
            name="ifsc"
            value={bank.ifsc}
            onChange={handleBankChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
            placeholder="e.g. HDFC0004013"
          />
        </div>
      </div>
    </div>
  );
};
