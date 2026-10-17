// @ts-nocheck
import React from "react";
import Field from "./Field";

export default function BankInfoSection({ form, errors, onChange }) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-indigo-600 font-black text-sm">|</span>
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">Bank & Identity Details</h3>
                <span className="text-[10px] text-slate-400 font-medium">(Required for Payroll)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field
                    label="Bank Name"
                    name="bankName"
                    placeholder="e.g. State Bank of India"
                    required
                    form={form}
                    errors={errors}
                    onChange={onChange}
                />

                <Field
                    label="Account Number"
                    name="accountNumber"
                    placeholder="e.g. 123456789012"
                    required
                    form={form}
                    errors={errors}
                    onChange={onChange}
                    inputMode="numeric"
                />

                <Field
                    label="IFSC Code"
                    name="ifscCode"
                    placeholder="e.g. SBIN0001234"
                    required
                    form={form}
                    errors={errors}
                    onChange={onChange}
                />

                <Field
                    label="PAN Number"
                    name="panNumber"
                    placeholder="e.g. ABCDE1234F"
                    required
                    form={form}
                    errors={errors}
                    onChange={onChange}
                    maxLength={10}
                />

                <Field
                    label="PF Number (Optional)"
                    name="pfNumber"
                    placeholder="e.g. OR/BBS/12345/678"
                    form={form}
                    errors={errors}
                    onChange={onChange}
                />

                <Field
                    label="PF UAN (Optional)"
                    name="pfUAN"
                    placeholder="12-digit UAN number"
                    form={form}
                    errors={errors}
                    onChange={onChange}
                    inputMode="numeric"
                    maxLength={12}
                />
            </div>
        </div>
    );
}
