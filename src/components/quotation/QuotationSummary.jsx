import React from "react";
import { fmt, numberToWords } from "@/utils/numberUtils";

export const QuotationSummary = ({ subtotal, tax, discount, grandTotal }) => {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 }}>
      {/* Amount in words */}
      <div style={{ flex: 1, paddingRight: 30 }}>
        <p style={{ margin: 0, fontSize: 9.5, color: "#64748b", lineHeight: 1.4 }}>
          Amount in Words:<br />
          <strong style={{ fontStyle: "normal", color: "#334155", fontSize: 10.5 }}>
            {numberToWords(grandTotal)} Rupees Only
          </strong>
        </p>
      </div>
      
      <table style={{ fontSize: 10.5, borderCollapse: "collapse", minWidth: 200 }}>
        <tbody>
          {(tax > 0 || discount > 0) && (
            <tr>
              <td style={{ padding: "3px 10px 3px 0", textAlign: "right", color: "#64748b" }}>Sub Total:</td>
              <td style={{ padding: "3px 0", textAlign: "right", minWidth: 80, color: "#334155" }}>₹{fmt(subtotal)}/-</td>
            </tr>
          )}
          {tax > 0 && (
            <tr>
              <td style={{ padding: "3px 10px 3px 0", textAlign: "right", color: "#64748b" }}>Tax:</td>
              <td style={{ padding: "3px 0", textAlign: "right", color: "#334155" }}>₹{fmt(tax)}/-</td>
            </tr>
          )}
          {discount > 0 && (
            <tr>
              <td style={{ padding: "3px 10px 3px 0", textAlign: "right", color: "#64748b" }}>Discount:</td>
              <td style={{ padding: "3px 0", textAlign: "right", color: "#e11d48" }}>- ₹{fmt(discount)}/-</td>
            </tr>
          )}
          <tr style={{ borderTop: "1.5px solid #cbd5e1" }}>
            <td style={{ padding: "6px 10px 6px 0", textAlign: "right", fontWeight: "bold", fontSize: 11.5, color: "#1e3a8a" }}>
              Grand Total:
            </td>
            <td style={{ padding: "6px 0", textAlign: "right", fontWeight: "800", fontSize: 12, color: "#1e3a8a" }}>
              ₹{fmt(grandTotal)}/-
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
