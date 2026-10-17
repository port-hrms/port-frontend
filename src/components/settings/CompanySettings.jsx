import React from "react";
import useCompanySettings from "../../hooks/useCompanySettings";
import { ProfileSection } from "./company/ProfileSection";
import { BankSection } from "./company/BankSection";
import { BrandingSection } from "./company/BrandingSection";
import { GeofenceSection } from "./company/GeofenceSection";

export default function CompanySettings() {
  const {
    form,
    loading,
    saving,
    handleChange,
    handleBankChange,
    handleFileChange,
    handleSubmit,
  } = useCompanySettings();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex justify-center items-center h-48">
        <span className="text-slate-400 text-sm font-semibold">Loading company settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="mb-5">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-lg">💼</span>
          Company Billing Settings
        </h3>
        <p className="text-xs text-slate-400 mt-1 ml-10">
          Manage company branding, tax registrations, and payment details for invoices/quotations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 ml-10">
        {/* Profile Settings */}
        <ProfileSection form={form} handleChange={handleChange} />

        {/* Bank Settings */}
        <BankSection bank={form.bank} handleBankChange={handleBankChange} />

        {/* Branding Assets Settings */}
        <BrandingSection logo={form.logo} signature={form.signature} handleFileChange={handleFileChange} />

        {/* Geofence Location Settings */}
        <GeofenceSection latitude={form.latitude} longitude={form.longitude} handleChange={handleChange} />

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
              saving
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
            }`}
          >
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
