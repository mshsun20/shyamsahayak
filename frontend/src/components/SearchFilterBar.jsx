import { Search, SlidersHorizontal } from 'lucide-react'

export default function SearchFilterBar({ value, onChange, placeholder }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4">
      <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2.5">
        <Search size={18} className="shrink-0 text-ink-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
      </div>
      <button
        type="button"
        aria-label="Filter"
        className="tap-highlight-none flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 active:bg-ink-50"
      >
        <SlidersHorizontal size={18} />
      </button>
    </div>
  )
}
