import { ArrowRight } from "lucide-react";

const colorMap = {
  primary: {
    bg: "bg-orange-50",
    text: "text-primary",
    button: "bg-orange-50/80",
  },
  success: {
    bg: "bg-green-50",
    text: "text-green-600",
    button: "bg-green-50",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-500",
    button: "bg-amber-50",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-500",
    button: "bg-purple-50",
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  description,
  actionLabel,
  color = "primary",
  onClick,
}) {
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="flex min-h-[159px] flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${c.bg} ${c.text}`}
        >
          <Icon size={18} strokeWidth={2} />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>

      <div className="mt-2">
        <p className="text-[26px] font-bold leading-8 tracking-tight text-gray-900">{value}</p>
        <p className="mt-1 text-[10px] leading-4 text-gray-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={onClick}
        className={`mt-auto flex h-7 w-full items-center justify-between rounded-md px-3 text-[10px] font-medium ${c.text} ${c.button}`}
      >
        <span>{actionLabel}</span>
        <ArrowRight size={12} strokeWidth={2} />
      </button>
    </div>
  );
}
