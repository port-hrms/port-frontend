// @ts-nocheck
import Field, { SectionTitle, SelectField } from "./Field";

export default function JobInfoSection({ form, errors, onChange, departments, empTypes, statuses }) {
    const needsEndDate = ["Contract", "Intern"].includes(form.employmentType);
    return (
        <section>
            <SectionTitle title="Job details" description="Role, team and pay." />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <SelectField label="Department" name="department" options={departments} placeholder="Select department" required form={form} errors={errors} onChange={onChange} />
                <Field label="Designation" name="designation" placeholder="e.g. Software Engineer" required form={form} errors={errors} onChange={onChange} />
                <SelectField label="Employment type" name="employmentType" options={empTypes} required form={form} errors={errors} onChange={onChange} />
                <SelectField label="Status" name="status" options={statuses} required form={form} errors={errors} onChange={onChange} />
                <Field label="Joining date" name="joiningDate" type="date" required form={form} errors={errors} onChange={onChange} />
                <Field
                    label="End date"
                    name="endingDate"
                    type="date"
                    min={form.joiningDate || undefined}
                    hint={needsEndDate ? "Contract / internship end date" : "Only for contracts and internships"}
                    form={form}
                    errors={errors}
                    onChange={onChange}
                />
                <Field label="Monthly salary" name="salary" type="number" prefix="₹" placeholder="60000" min={0} required form={form} errors={errors} onChange={onChange} />
            </div>
        </section>
    );
}
