import { BarChart3 } from 'lucide-react'

export default function StatsFooter({ total, active, inactive, needsAttention, totalLabel = 'Total Fabricators' }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-ink-100 bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white">
          <BarChart3 size={20} strokeWidth={2.2} />
        </div>
        <div className="flex flex-1 items-center justify-between">
          <Stat label={totalLabel} value={total} valueClass="text-ink-900" />
          <Stat label="Active" value={active} valueClass="text-success-600" />
          <Stat label="Inactive" value={inactive} valueClass="text-ink-500" />
          <Stat label="Needs Attention" value={needsAttention} valueClass="text-danger-600" />
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, valueClass }) {
  return (
    <div className="flex flex-col items-center px-1 text-center">
      <span className={`text-base font-extrabold leading-none ${valueClass}`}>{value}</span>
      <span className="mt-1 max-w-[64px] text-[10px] font-medium leading-tight text-ink-400">{label}</span>
    </div>
  )
}
