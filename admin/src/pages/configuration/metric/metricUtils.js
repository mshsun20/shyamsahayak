// Metric value is free text (e.g. "RMT", "Order quantity (Ton)").
// Purely numeric values are shown with 2 decimal places (e.g. 10 -> 10.00), anything else as entered.
export const isNumeric = (v) => v !== "" && v != null && /^-?\d+(\.\d+)?$/.test(String(v).trim());

export const formatValue = (v) => {
  if (v === "" || v == null) return "-";
  return isNumeric(v) ? Number(v).toFixed(2) : String(v);
};
