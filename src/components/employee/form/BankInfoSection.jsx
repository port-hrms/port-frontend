// @ts-nocheck
import Field, { SectionTitle } from "./Field";

export default function BankInfoSection({ form, errors, onChange, ifscInfo }) {
    return (
        <section>
            <SectionTitle
                title="Bank & KYC"
                description="Optional now. Account number and IFSC are needed before salary can be paid by bank transfer."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Aadhaar number" name="aadharNumber" placeholder="12-digit number" inputMode="numeric" maxLength={12} autoComplete="off" form={form} errors={errors} onChange={onChange} />
                <Field label="PAN" name="panNumber" placeholder="ABCDE1234F" maxLength={10} autoComplete="off" form={form} errors={errors} onChange={onChange} />
                <Field
                    label="IFSC code"
                    name="ifscCode"
                    placeholder="SBIN0001234"
                    maxLength={11}
                    autoComplete="off"
                    hint={ifscInfo || "Bank name is filled in automatically"}
                    form={form}
                    errors={errors}
                    onChange={onChange}
                />
                <Field label="Bank name" name="bankName" placeholder="e.g. State Bank of India" form={form} errors={errors} onChange={onChange} />
                <Field label="Account number" name="accountNumber" placeholder="9–18 digits" inputMode="numeric" maxLength={18} autoComplete="off" form={form} errors={errors} onChange={onChange} />
                <Field label="PF number" name="pfNumber" placeholder="e.g. OR/BBS/12345/678" form={form} errors={errors} onChange={onChange} />
                <Field label="PF UAN" name="pfUAN" placeholder="12-digit UAN" inputMode="numeric" maxLength={12} form={form} errors={errors} onChange={onChange} />
            </div>
        </section>
    );
}
