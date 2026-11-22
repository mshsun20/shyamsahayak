export const API_CLIENT_STATUS = {
  active: { label: "Active", cls: "bg-green-50 text-success" },
  inactive: { label: "Inactive", cls: "bg-gray-100 text-gray-600" },
  revoked: { label: "Revoked", cls: "bg-red-50 text-danger" },
};

export function ApiClientStatusBadge({ status }) {
  const s = API_CLIENT_STATUS[status] || API_CLIENT_STATUS.inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.label}
    </span>
  );
}

// tone: none (never expires) | ok | soon (<= 7 days) | expired
export const getExpiry = (expiresAt) => {
  if (!expiresAt) return { label: "Never", tone: "none" };
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return { label: "-", tone: "none" };
  const days = Math.ceil((d.getTime() - Date.now()) / 86400000);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  if (days < 0) return { label: date, tone: "expired", note: "Expired" };
  if (days <= 7) return { label: date, tone: "soon", note: days === 0 ? "Expires today" : `In ${days}d` };
  return { label: date, tone: "ok" };
};

export const expiryToneClass = {
  none: "text-gray-500",
  ok: "text-gray-700",
  soon: "text-warning font-medium",
  expired: "text-danger font-medium",
};

// <input type="date"> works with local YYYY-MM-DD strings
const pad = (n) => String(n).padStart(2, "0");
export const toDateInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
export const fromDateInput = (value) => (value ? new Date(`${value}T23:59:59`).toISOString() : null);
export const addDaysInput = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateInput(d);
};

export const timeAgo = (value) => {
  if (!value) return "Never used";
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return "-";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
