import React from "react";

export const QuotationNotes = ({ notes, terms, closingNote }) => {
  return (
    <>
      {/* Notes & Terms Section */}
      {(notes || terms.length > 0) && (
        <div style={{ marginTop: 20, display: "flex", gap: "16px" }}>
          {/* Notes */}
          {notes && (
            <div style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", backgroundColor: "#f8fafc", borderLeft: "3.5px solid #64748b" }}>
              <p style={{ fontWeight: "bold", margin: "0 0 4px", fontSize: 10.5, color: "#475569" }}>Notes</p>
              <p style={{ margin: 0, fontSize: 10, color: "#475569", whiteSpace: "pre-line", lineHeight: 1.4 }}>{notes}</p>
            </div>
          )}

          {/* Terms */}
          {terms.length > 0 && (
            <div style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", backgroundColor: "#f8fafc", borderLeft: "3.5px solid #1e40af" }}>
              <p style={{ fontWeight: "bold", margin: "0 0 4px", fontSize: 10.5, color: "#1e40af" }}>Terms &amp; Conditions</p>
              {terms.map((term, idx) => (
                <p key={idx} style={{ margin: "2px 0", fontSize: 10, color: "#475569", display: "flex", gap: "4px" }}>
                  <span>&bull;</span>
                  <span>{term}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Closing Note */}
      {closingNote && (
        <div style={{ marginTop: 15, padding: "0 2px" }}>
          {closingNote.split("\n").map((line, idx) => (
            <p key={idx} style={{ margin: "2px 0", fontSize: 10, color: "#475569", lineHeight: 1.4 }}>{line}</p>
          ))}
        </div>
      )}
    </>
  );
};
