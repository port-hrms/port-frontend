import React from "react";

export const QuotationMetadata = ({ client, quotation, quotationDate, validTill }) => {
  const clientName = client?.name || client?.companyName || "";
  const clientCompany = (client?.companyName && client.companyName !== client.name) ? client.companyName : "";

  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
      {/* Client Details Box */}
      <div style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
        <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#1e40af", marginBottom: "6px", letterSpacing: "0.05em" }}>PREPARED FOR</div>
        {(clientName || clientCompany) ? (
          <>
            <div style={{ fontSize: "13px", fontWeight: "bold", color: "#0f172a" }}>{clientName}</div>
            {clientCompany && <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>{clientCompany}</div>}
            {client?.email && <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "4px" }}>{client.email}</div>}
            {client?.contact && <div style={{ fontSize: "10.5px", color: "#64748b" }}>{client.contact}</div>}
          </>
        ) : (
          <span style={{ color: "#94a3b8", fontSize: "11px", fontStyle: "italic" }}>No client details available</span>
        )}
      </div>

      {/* Quotation Details Box */}
      <div style={{ flex: 1, padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
        <div style={{ fontSize: "9px", fontWeight: "bold", textTransform: "uppercase", color: "#1e40af", marginBottom: "6px", letterSpacing: "0.05em" }}>QUOTATION DETAILS</div>
        <div style={{ display: "grid", gridTemplateColumns: "95px 1fr", gap: "5px", fontSize: "11px", color: "#475569" }}>
          <span>Quotation No:</span>
          <strong style={{ color: "#0f172a" }}>{quotation?.quotationNumber || "—"}</strong>
          
          <span>Date:</span>
          <span style={{ color: "#0f172a", fontWeight: "500" }}>{quotationDate}</span>
          
          <span>Valid Till:</span>
          <span style={{ color: "#0f172a", fontWeight: "bold" }}>{validTill || "—"}</span>
        </div>
      </div>
    </div>
  );
};
