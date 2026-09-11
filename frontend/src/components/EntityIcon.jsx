import { Store, Building2, Flag, UserPlus, ClipboardCheck, MapPin, Phone, ShoppingCart, HelpCircle } from 'lucide-react'

const ICONS = {
  store: Store,
  building: Building2,
  flag: Flag,
  new_fabricator: UserPlus,
  followup: ClipboardCheck,
  visit: MapPin,
  call: Phone,
  purchase: ShoppingCart,
  enquiry: HelpCircle,
}

const TONE_STYLES = {
  success: 'bg-success-100 text-success-600',
  warn: 'bg-brand-100 text-brand-600',
  danger: 'bg-danger-100 text-danger-600',
  info: 'bg-info-100 text-info-600',
  neutral: 'bg-ink-100 text-ink-500',
}

export default function EntityIcon({ icon = 'store', tone = 'neutral', size = 'md' }) {
  const Icon = ICONS[icon] || Store
  const sizeClasses = size === 'sm' ? 'h-10 w-10 rounded-xl' : 'h-12 w-12 rounded-2xl'
  const iconSize = size === 'sm' ? 18 : 22

  return (
    <div className={`flex shrink-0 items-center justify-center ${sizeClasses} ${TONE_STYLES[tone]}`}>
      <Icon size={iconSize} strokeWidth={2} />
    </div>
  )
}
