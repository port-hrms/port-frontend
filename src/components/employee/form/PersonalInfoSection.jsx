// @ts-nocheck
import Field, { SectionTitle, SelectField } from "./Field";

export default function PersonalInfoSection({ form, errors, onChange, genders }) {
    const today = new Date().toISOString().slice(0, 10);
    return (
        <section>
            <SectionTitle title="Personal details" description="Basic information about the employee." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="First name" name="firstName" placeholder="e.g. Priya" required autoComplete="off" form={form} errors={errors} onChange={onChange} />
                <Field label="Last name" name="lastName" placeholder="e.g. Sharma" required autoComplete="off" form={form} errors={errors} onChange={onChange} />
                <Field label="Work email" name="email" type="email" placeholder="priya@company.com" required autoComplete="off" hint="Also used to sign in" form={form} errors={errors} onChange={onChange} />
                <Field label="Mobile number" name="phone" prefix="+91" placeholder="98765 43210" required inputMode="numeric" maxLength={10} autoComplete="off" form={form} errors={errors} onChange={onChange} />
                <Field label="Date of birth" name="dateOfBirth" type="date" max={today} form={form} errors={errors} onChange={onChange} />
                <SelectField label="Gender" name="gender" options={genders} placeholder="Select gender" form={form} errors={errors} onChange={onChange} />
                <Field label="Address" name="address" placeholder="House, street, city, PIN" colSpan="sm:col-span-2" form={form} errors={errors} onChange={onChange} />
            </div>
        </section>
    );
}
