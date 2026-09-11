export default function FilterTabs({ tabs, active, onChange }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1 pt-3">
      {tabs.map((tab) => {
        const isActive = tab.key === active
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.(tab.key)}
            className={`tap-highlight-none flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? 'border-brand-500 bg-brand-50 text-brand-600'
                : 'border-ink-200 bg-white text-ink-500'
            }`}
          >
            {tab.dotClass && <span className={`h-1.5 w-1.5 rounded-full ${tab.dotClass}`} />}
            {tab.label} ({tab.count})
          </button>
        )
      })}
    </div>
  )
}
