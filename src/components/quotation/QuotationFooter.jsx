import React from "react";

export const QuotationFooter = ({ companyInfo }) => {
  const co = companyInfo || {};
  const coName = co.name || "";
  const coSignature = co.signature || "";
  const coBank = co.bank || {};

  return (
    <div style={{
      padding: "10mm 18mm 18mm 18mm",
      marginTop: 18,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-end",
      fontSize: 9.5,
    }}>
      {/* Left: Bank Details */}
      <div style={{ flex: 1.2 }}>
        {(coBank.holder || coBank.account || coBank.ifsc) && (
          <div style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", maxWidth: "260px" }}>
            <p style={{ fontWeight: "bold", margin: "0 0 5px", fontSize: 10, color: "#1e3a8a", borderBottom: "1px solid #e2e8f0", paddingBottom: "3px" }}>Bank Payment Details</p>
            {coBank.holder && <p style={{ margin: "2px 0", color: "#475569" }}><strong style={{ color: "#0f172a" }}>A/C Name:</strong> {coBank.holder}</p>}
            {coBank.account && <p style={{ margin: "2px 0", color: "#475569" }}><strong style={{ color: "#0f172a" }}>A/C No:</strong> {coBank.account}</p>}
            {coBank.ifsc && <p style={{ margin: "2px 0", color: "#475569" }}><strong style={{ color: "#0f172a" }}>IFSC:</strong> {coBank.ifsc}</p>}
          </div>
        )}
      </div>

      {/* Right: Signature */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end", textAlign: "right" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", width: "150px" }}>
          {coSignature ? (
            <img src={coSignature} alt="Signature" style={{ height: 36, objectFit: "contain", marginBottom: 5 }} />
          ) : (
            <div style={{ height: 36 }} />
          )}
          <div style={{ borderTop: "1px solid #cbd5e1", width: "100%", marginBottom: 4 }} />
          <p style={{ margin: 0, fontWeight: "bold", fontSize: 9.5, color: "#475569" }}>Authorized Signature</p>
          <p style={{ margin: "2px 0 0", fontWeight: "bold", color: "#1e3a8a" }}>{coName}</p>
        </div>
      </div>
    </div>
  );
};
