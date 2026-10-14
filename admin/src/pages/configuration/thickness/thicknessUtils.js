// Thickness values are always shown with 2 decimal places (e.g. 0.50)
export const formatValue = (v) => {
  const n = Number(v);
  return v === "" || v == null || Number.isNaN(n) ? "-" : n.toFixed(2);
};
