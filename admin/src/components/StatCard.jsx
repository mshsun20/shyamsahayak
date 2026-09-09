import { ArrowRight } from "lucide-react";

const colorMap = {
  primary: { bg: "bg-primary-light", text: "text-primary" },
  success: { bg: "bg-green-50", text: "text-success" },
  warning: { bg: "bg-amber-50", text: "text-warning" },
  purple: { bg: "bg-purple-50", text: "text-purple-600" },
};

export default function StatCard({ icon: Icon, label, value, description, actionLabel, color = "primary" }) {
  const c = colorMap[color] || colorMap.primary;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon size={18} />
        </div>
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button className={`flex items-center gap-1 text-xs font-medium ${c.text} mt-1`}>
        {actionLabel}
        <ArrowRight size={12} />
      </button>
    </div>
  );
}
