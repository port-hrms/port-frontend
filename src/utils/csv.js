// Small CSV helpers (RFC 4180 quoting) — no external dependency.

/** Parse CSV text into an array of objects keyed by the header row. */
export function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    const src = String(text || "").replace(/^\uFEFF/, ""); // strip Excel BOM

    for (let i = 0; i < src.length; i++) {
        const ch = src[i];
        if (inQuotes) {
            if (ch === '"' && src[i + 1] === '"') { field += '"'; i++; }
            else if (ch === '"') inQuotes = false;
            else field += ch;
        } else if (ch === '"') {
            inQuotes = true;
        } else if (ch === ",") {
            row.push(field); field = "";
        } else if (ch === "\n" || ch === "\r") {
            if (ch === "\r" && src[i + 1] === "\n") i++;
            row.push(field); field = "";
            rows.push(row); row = [];
        } else {
            field += ch;
        }
    }
    if (field !== "" || row.length) { row.push(field); rows.push(row); }

    const nonEmpty = rows.filter((r) => r.some((c) => c.trim() !== ""));
    if (nonEmpty.length === 0) return { headers: [], records: [] };

    const headers = nonEmpty[0].map((h) => h.trim());
    const records = nonEmpty.slice(1).map((cells) =>
        Object.fromEntries(headers.map((h, idx) => [h, (cells[idx] ?? "").trim()]))
    );
    return { headers, records };
}

// Values starting with these can run as formulas in Excel/Sheets — neutralise them
const FORMULA_START = /^[=+\-@\t\r]/;

const escapeCell = (value) => {
    let str = value === null || value === undefined ? "" : String(value);
    if (FORMULA_START.test(str)) str = `'${str}`;
    return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

/** Build CSV text from rows using [{ key, label }] column definitions. */
export function toCSV(rows, columns) {
    const header = columns.map((c) => escapeCell(c.label)).join(",");
    const body = rows.map((r) => columns.map((c) => escapeCell(typeof c.value === "function" ? c.value(r) : r[c.key])).join(","));
    return [header, ...body].join("\r\n");
}

/** Trigger a browser download of CSV text (with BOM so Excel opens UTF-8 correctly). */
export function downloadCSV(filename, csvText) {
    const blob = new Blob(["\uFEFF" + csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
