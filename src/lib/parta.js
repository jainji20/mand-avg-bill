export const num = (v) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? 0 : n;
};

// Round to 2 decimals (money)
export const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

export const fmt = (n) =>
  Number(n.toFixed(2)).toLocaleString("en-IN", { maximumFractionDigits: 2 });

// Weight keeps up to 3 decimals exactly as entered (no rounding)
export const fmtWeight = (n) =>
  Number(n.toFixed(3)).toLocaleString("en-IN", { maximumFractionDigits: 3 });

// "9A" -> 9, "4B" -> 4 (number at the start of the marka)
export const markaBags = (marka) => num(String(marka ?? "").trim());

// Financial year: 01-Apr to 31-Mar, e.g. "2026-27"
export const financialYear = (dateStr) => {
  const d = new Date(`${dateStr}T00:00:00`);
  const y = d.getFullYear();
  const startYear = d.getMonth() >= 3 ? y : y - 1;
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};