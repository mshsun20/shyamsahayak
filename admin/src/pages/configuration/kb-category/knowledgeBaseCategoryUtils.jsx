import {
  Layers, Wrench, ShieldCheck, Play, BookOpen, FileText, Video, Package,
  Hammer, Ruler, Truck, Award, HelpCircle, Star, Tag, Folder, ArrowRight,
} from "lucide-react";

// Icon names are stored on the category as plain strings (model field: icon).
export const ICON_MAP = {
  Layers, Wrench, ShieldCheck, Play, BookOpen, FileText, Video, Package,
  Hammer, Ruler, Truck, Award, HelpCircle, Star, Tag, Folder,
};
export const ICON_NAMES = Object.keys(ICON_MAP);

export function CategoryIcon({ name, size = 16, className = "", strokeWidth = 2.25 }) {
  const Icon = ICON_MAP[name] || Tag;
  return <Icon size={size} className={className} strokeWidth={strokeWidth} />;
}

// Colour presets. bg / iconBg / arrow are Tailwind classes and border is a CSS border
// string, exactly the shape the mobile Knowledge Base screen already consumes.
export const THEMES = [
  { key: "orange",  label: "Orange",  swatch: "#FF5A00", bg: "bg-orange-50",  iconBg: "bg-brand",       arrow: "text-brand",       border: "0.05rem solid #ffeed9" },
  { key: "emerald", label: "Emerald", swatch: "#10B981", bg: "bg-emerald-50", iconBg: "bg-emerald-500", arrow: "text-emerald-500", border: "0.1rem solid #e0f9e9" },
  { key: "blue",    label: "Blue",    swatch: "#3B82F6", bg: "bg-blue-50",    iconBg: "bg-blue-500",    arrow: "text-blue-500",    border: "0.1rem solid #dbe9ff" },
  { key: "purple",  label: "Purple",  swatch: "#A855F7", bg: "bg-purple-50",  iconBg: "bg-purple-500",  arrow: "text-purple-500",  border: "0.1rem solid #f2e7ff" },
  { key: "rose",    label: "Rose",    swatch: "#F43F5E", bg: "bg-rose-50",    iconBg: "bg-rose-500",    arrow: "text-rose-500",    border: "0.1rem solid #ffe4e6" },
  { key: "amber",   label: "Amber",   swatch: "#F59E0B", bg: "bg-amber-50",   iconBg: "bg-amber-500",   arrow: "text-amber-500",   border: "0.1rem solid #fef3c7" },
  { key: "teal",    label: "Teal",    swatch: "#14B8A6", bg: "bg-teal-50",    iconBg: "bg-teal-500",    arrow: "text-teal-500",    border: "0.1rem solid #ccfbf1" },
  { key: "slate",   label: "Slate",   swatch: "#475569", bg: "bg-slate-100",  iconBg: "bg-slate-600",   arrow: "text-slate-600",   border: "0.1rem solid #e2e8f0" },
];

export const DEFAULT_THEME = THEMES[0];

export const matchTheme = ({ bg, iconBg, arrow, border } = {}) =>
  THEMES.find((t) => t.bg === bg && t.iconBg === iconBg && t.arrow === arrow && t.border === border)?.key || "custom";

// The mobile app uses a `brand` colour token; the admin panel calls the same colour `primary`.
const toAdminClass = (c = "") => c.replace(/-brand\b/g, "-primary");

export const makeCode = (name = "") =>
  String(name).trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);

// Live replica of the mobile "Browse by Category" card.
export function CategoryPreview({ name, description, icon, bg, iconBg, arrow, border }) {
  return (
    <div
      className={`w-33 shrink-0 rounded-2xl p-4 text-left ${toAdminClass(bg) || "bg-gray-50"}`}
      style={{ border: border || "0.1rem solid #e5e7eb" }}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${toAdminClass(iconBg) || "bg-gray-500"}`}>
        <CategoryIcon name={icon} size={17} className="text-white" />
      </div>
      <p className="text-[14px] font-bold text-neutral-900 mt-3 leading-tight wrap-break-word">{name || "Category name"}</p>
      <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug line-clamp-3">
        {description || "Short description"}
      </p>
      <ArrowRight size={15} className={`mt-3 ${toAdminClass(arrow) || "text-gray-500"}`} />
    </div>
  );
}

// Small rounded icon tile used in table rows.
export function CategoryTile({ icon, iconBg, size = 32 }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-lg text-white ${toAdminClass(iconBg) || "bg-gray-500"}`}
      style={{ width: size, height: size }}
    >
      <CategoryIcon name={icon} size={Math.round(size * 0.5)} className="text-white" />
    </span>
  );
}

// Coloured pill for a category name, themed from the category's own master record.
// `category` is the master record (may be undefined for legacy / unknown names).
export function CategoryBadge({ name, category }) {
  const theme = category ? THEMES.find((t) => t.key === matchTheme(category)) : null;
  const style = theme
    ? {
        background: `color-mix(in srgb, ${theme.swatch} 12%, transparent)`,
        color: `color-mix(in srgb, ${theme.swatch} 75%, black)`,
      }
    : undefined;
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${theme ? "" : "bg-gray-100 text-gray-600"}`}
      style={style}
    >
      {name}
    </span>
  );
}

export const userName = (u) => {
  if (!u) return "-";
  if (typeof u === "string") return u;
  return u.name || u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "-";
};
