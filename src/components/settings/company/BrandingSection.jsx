import React from "react";

export const BrandingSection = ({ logo, signature, handleFileChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">3. Branding Assets</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo upload */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Company Logo</label>
          <div className="flex items-center gap-4">
            <div className="w-32 h-16 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden p-2">
              {logo ? (
                <img src={logo} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Logo</span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "logo")}
                id="logo-upload"
                className="hidden"
              />
              <label
                htmlFor="logo-upload"
                className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98]"
              >
                Choose Logo
              </label>
              <p className="text-[10px] text-slate-400 mt-1.5">PNG, JPG recommended. Max 2MB.</p>
            </div>
          </div>
        </div>

        {/* Signature upload */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized Signature</label>
          <div className="flex items-center gap-4">
            <div className="w-32 h-16 border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden p-2">
              {signature ? (
                <img src={signature} alt="Signature Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No Signature</span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "signature")}
                id="sig-upload"
                className="hidden"
              />
              <label
                htmlFor="sig-upload"
                className="inline-block px-4 py-2 bg-slate-100 hover:bg-slate-250 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98]"
              >
                Choose Signature
              </label>
              <p className="text-[10px] text-slate-400 mt-1.5">PNG signature with transparent background. Max 2MB.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
