import React from "react";
import { fmt } from "@/utils/numberUtils";

export const QuotationTable = ({ items }) => {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5, marginBottom: 15 }}>
      <thead>
        <tr style={{ borderBottom: "2px solid #cbd5e1" }}>
          <th style={{ textAlign: "left", padding: "8px 6px", color: "#475569", fontWeight: "bold", width: "6%" }}>Sl.</th>
          <th style={{ textAlign: "left", padding: "8px 6px", color: "#475569", fontWeight: "bold", width: "50%" }}>Description</th>
          <th style={{ textAlign: "center", padding: "8px 6px", color: "#475569", fontWeight: "bold", width: "12%" }}>Qty</th>
          <th style={{ textAlign: "right", padding: "8px 6px", color: "#475569", fontWeight: "bold", width: "14%" }}>Rate (₹)</th>
          <th style={{ textAlign: "right", padding: "8px 6px", color: "#475569", fontWeight: "bold", width: "18%" }}>Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ padding: "14px 6px", color: "#94a3b8", fontStyle: "italic", textAlign: "center" }}>
              No items added.
            </td>
          </tr>
        ) : items.map((item, idx) => (
          <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
            <td style={{ padding: "8px 6px", verticalAlign: "top", color: "#64748b" }}>{idx + 1}.</td>
            <td style={{ padding: "8px 6px", verticalAlign: "top" }}>
              <div style={{ fontWeight: "bold", color: "#0f172a" }}>{item.service}</div>
              {item.description && (
                <div style={{ color: "#475569", fontSize: 9.5, marginTop: 2 }}>{item.description}</div>
              )}
            </td>
            <td style={{ textAlign: "center", padding: "8px 6px", verticalAlign: "top", color: "#334155" }}>
              {item.quantity} Nos
            </td>
            <td style={{ textAlign: "right", padding: "8px 6px", verticalAlign: "top", color: "#334155" }}>
              {fmt(item.price)}
            </td>
            <td style={{ textAlign: "right", padding: "8px 6px", verticalAlign: "top", fontWeight: "600", color: "#0f172a" }}>
              {fmt((Number(item.quantity) || 0) * (Number(item.price) || 0))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
