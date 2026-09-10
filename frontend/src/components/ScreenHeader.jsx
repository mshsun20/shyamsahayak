import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router'

export default function ScreenHeader({ title, subtitle }) {
  const navigate = useNavigate()

  return (
    <div className="sticky top-0 z-20 flex items-start gap-3 border-b border-ink-100 bg-white/95 px-5 pb-4 pt-6 backdrop-blur">
      <button
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="tap-highlight-none mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-900 active:bg-ink-100"
      >
        <ChevronLeft size={22} strokeWidth={2.4} />
      </button>
      <div className="min-w-0">
        <h1 className="text-lg font-bold leading-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
    </div>
  )
}
