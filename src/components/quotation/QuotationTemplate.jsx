import { forwardRef } from "react";
import { TopRightDecor, BottomLeftDecor } from "./Decorations";
import { QuotationHeader } from "./QuotationHeader";
import { QuotationMetadata } from "./QuotationMetadata";
import { QuotationTable } from "./QuotationTable";
import { QuotationSummary } from "./QuotationSummary";
import { QuotationNotes } from "./QuotationNotes";
import { QuotationFooter } from "./QuotationFooter";

const sans = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" };

const QuotationTemplate = forwardRef(({ quotation, companyInfo }, ref) => {
  // ── Quotation data ──
  const client = quotation?.clientId || {};
  const items = quotation?.items || [];
  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
  const tax = Number(quotation?.tax || 0);
  const discount = Number(quotation?.discount || 0);
  const grandTotal = Number(quotation?.total ?? (subtotal + tax - discount));

  const quotationDate = quotation?.createdAt
    ? new Date(quotation.createdAt).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");

  const validTill = quotation?.validTill
    ? new Date(quotation.validTill).toLocaleDateString("en-IN")
    : "";

  const terms = quotation?.termsAndConditions || [];
  const closingNote = quotation?.closingNote || "";
  const notes = quotation?.notes || "";

  return (
    <div
      ref={ref}
      style={{
        width: "210mm",
        minHeight: "297mm",
        background: "#ffffff",
        color: "#1e293b",
        ...sans,
        fontSize: 11,
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
      className="shadow-md print:shadow-none mx-auto select-none"
    >
      {/* ── Corner decorations ── */}
      <TopRightDecor />
      <BottomLeftDecor />

      {/* ── Header ── */}
      <QuotationHeader companyInfo={companyInfo} quotationDate={quotationDate} />

      {/* ── Body ── */}
      <div style={{ padding: "8mm 18mm 0 18mm", fontSize: 11, lineHeight: 1.6 }}>
        {/* Client & Quotation metadata cards */}
        <QuotationMetadata
          client={client}
          quotation={quotation}
          quotationDate={quotationDate}
          validTill={validTill}
        />

        <p style={{ margin: "0 0 12px", fontSize: "11.5px", color: "#334155" }}>
          Dear Sir/Madam,<br />
          Please find below the quotation details for the required service work:
        </p>

        {/* Items Table */}
        <QuotationTable items={items} />

        {/* Totals & Summary */}
        <QuotationSummary
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          grandTotal={grandTotal}
        />

        {/* Notes, Terms & Closing */}
        <QuotationNotes
          notes={notes}
          terms={terms}
          closingNote={closingNote}
        />
      </div>

      {/* ── Footer ── */}
      <QuotationFooter companyInfo={companyInfo} />
    </div>
  );
});

QuotationTemplate.displayName = "QuotationTemplate";
export default QuotationTemplate;
