const TONE_STYLES = {
  success: 'bg-success-100 text-success-700',
  warn: 'bg-warn-100 text-warn-600',
  danger: 'bg-danger-100 text-danger-600',
  info: 'bg-info-100 text-info-600',
  neutral: 'bg-ink-100 text-ink-500',
}

const STATUS_TONE = {
  ACTIVE: 'success',
  Active: 'success',
  INACTIVE: 'warn',
  Inactive: 'neutral',
  'NEEDS ATTENTION': 'danger',
  'Needs Attention': 'danger',
}

export default function StatusPill({ status, tone }) {
  const resolvedTone = tone || STATUS_TONE[status] || 'neutral'
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONE_STYLES[resolvedTone]}`}
    >
      {status}
    </span>
  )
}
