import React from "react";
import { config } from "../../config";

export const QuotationHeader = ({ companyInfo, quotationDate }) => {
  const co = companyInfo || {};
  const coName = co.name || "";
  const coAddress = co.address || "";
  const coGstin = co.gstin || "";
  const coContact = co.contact || "";
  const coEmail = co.email || "";
  const coHrEmail = co.hrEmail || config.companyHrEmail;
  const coLogo = co.logo || "";

  return (
    <div style={{ padding: "18mm 18mm 0 18mm", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Left: Logo + Company info */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {coLogo ? (
            <img src={coLogo} alt="Logo" style={{ height: 50, maxWidth: 180, objectFit: "contain", borderRadius: 8 }} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: 8,
              background: "linear-gradient(135deg, #1e40af, #0f172a)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginTop: 2,
            }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 26 }}>
                {coName ? coName.charAt(0).toUpperCase() : "B"}
              </span>
            </div>
          )}
          <div>
            <div style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: "0.03em",
              color: "#1e3a8a",
              lineHeight: 1.1,
            }}>
              {coName.toUpperCase()}
            </div>
            <div style={{ fontSize: 9.5, color: "#64748b", marginTop: 4, lineHeight: 1.4, fontWeight: "500" }}>
              {coAddress && <div style={{ whiteSpace: "pre-line" }}>{coAddress}</div>}
              <div>
                {coContact && <span>Phone: {coContact}</span>}
                {coEmail && <span> &bull; Email: {coEmail}</span>}
              </div>
              {coHrEmail && <div>HR Email: {coHrEmail}</div>}
              {coGstin && <div style={{ fontWeight: "600", color: "#475569", marginTop: 2 }}>GSTIN: {coGstin}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ marginTop: 12, height: "1.5px", background: "linear-gradient(90deg, #1e3a8a 0%, #e2e8f0 100%)" }} />

      {/* Center Title */}
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <h1 style={{ fontSize: 16, fontWeight: 900, color: "#1e3a8a", letterSpacing: "0.15em", margin: 0, textTransform: "uppercase" }}>QUOTATION</h1>
      </div>
    </div>
  );
};
