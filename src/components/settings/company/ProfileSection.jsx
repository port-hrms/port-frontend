import React from "react";

export const ProfileSection = ({ form, handleChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">1. Company Profile</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Company Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-colors"
            placeholder="e.g. Dreamonix Solution Pvt. Ltd."
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">GSTIN / UIN</label>
          <input
            name="gstin"
            value={form.gstin}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-colors"
            placeholder="e.g. 21AAMCB1486G1ZT"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State Name</label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-colors"
            placeholder="e.g. Odisha"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">State Code</label>
          <input
            name="stateCode"
            value={form.stateCode}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-colors"
            placeholder="e.g. 21"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Numbers</label>
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-colors"
            placeholder="e.g. 9348354248, 8117856483"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-colors"
            placeholder="e.g. dreamonixsolution@gmail.com"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">HR Email Address</label>
          <input
            name="hrEmail"
            type="email"
            value={form.hrEmail}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-colors"
            placeholder="e.g. hr@dreamonixsolution.com"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Address</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={2}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-100 transition-colors resize-none"
            placeholder="Plot No-222, District Center, Bhubaneswar - 751001"
          />
        </div>
      </div>
    </div>
  );
};
