import {
  Layers, Wrench, ShieldCheck, Play, BookOpen, FileText, Video, Package,
  Hammer, Ruler, Truck, Award, HelpCircle, Star, Tag, Folder,
} from "lucide-react";

// Icon names are managed in the admin "Knowledge Category Master" and stored as strings.
const ICON_MAP = {
  Layers, Wrench, ShieldCheck, Play, BookOpen, FileText, Video, Package,
  Hammer, Ruler, Truck, Award, HelpCircle, Star, Tag, Folder,
};

export const getCategoryIcon = (name) => ICON_MAP[name] || Tag;

// Neutral look used when an article's category is missing from the master (e.g. deactivated).
export const DEFAULT_BADGE = "text-neutral-600 bg-neutral-100";

// Badge classes for an article, derived from its category's master theme (arrow = text colour, bg = tint).
export const categoryBadgeClass = (category) =>
  category ? `${category.arrow || "text-neutral-600"} ${category.bg || "bg-neutral-100"}` : DEFAULT_BADGE;
