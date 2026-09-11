import React from 'react';
import { useParams } from 'react-router'
import {
  CheckCircle2,
  MapPin,
  Layers,
  Target,
  ChevronRight,
  Hash,
  User,
  Phone,
  Mail,
  Navigation,
  Flag,
} from 'lucide-react'
import ScreenHeader from '../../components/ScreenHeader.jsx'
import EntityIcon from '../../components/EntityIcon.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import { visitCounters } from '../../data/mockData.js'
import { color } from 'framer-motion';


const Metric = React.memo(function Metric({ icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-50">{icon}</span>
      <div>
        <p className="text-sm font-bold leading-none text-ink-900">{value}</p>
        <p className="mt-0.5 text-[11px] leading-none text-ink-400">{label}</p>
      </div>
    </div>
  )
});

const PerfCard = React.memo(function PerfCard({ value, unit, label, barPct, barClass, footNote, valueClass = 'text-ink-900' }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3">
      <p className={`text-lg font-extrabold leading-none ${valueClass}`}>
        {value}
        {unit && <span className="text-xs font-semibold"> {unit}</span>}
      </p>
      <p className="mt-1.5 text-[11px] text-ink-400">{label}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
        <div className={`h-full rounded-full ${barClass}`} style={{ width: `${Math.min(100, barPct)}%` }} />
      </div>
      <p className="mt-1.5 text-[10px] text-ink-400">{footNote}</p>
    </div>
  )
});

const ActivityRow = React.memo(function ActivityRow({ item, isLast }) {
  return (
    <div className={`flex items-start justify-between gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-ink-100' : ''}`}>
      <div>
        <p className="text-[15px] font-bold text-ink-900">{item.title}</p>
        <p className="mt-0.5 text-sm text-ink-400">{item.subtitle}</p>
      </div>
      <span className="shrink-0 text-right text-xs text-ink-400">{item.time}</span>
    </div>
  )
});

const InfoRow = React.memo(function InfoRow({ icon, label, value, isLast = false }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-4 py-3.5 ${!isLast ? 'border-b border-ink-100' : ''}`}>
      <div className="flex shrink-0 items-center gap-2 text-sm text-ink-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-right text-sm font-semibold text-ink-900">{value}</p>
    </div>
  )
});

const TONE_CLASSES = {
  success: 'border-success-500 text-success-600 active:bg-success-50',
  info: 'border-info-600 text-info-600 active:bg-info-50',
  neutral: 'border-ink-200 text-ink-700 active:bg-ink-50',
  danger: 'border-danger-500 text-danger-600 active:bg-danger-50',
}

const ActionButton = React.memo(function ActionButton({ icon, label, tone, href, style }) {
  const classes = `tap-highlight-none flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 text-sm font-bold ${TONE_CLASSES[tone]}`

  if (href) {
    return (
      <a href={href} className={classes} style={style}>
        {icon}
        {label}
      </a>
    )
  }

  return (
    <button type="button" className={classes} style={style}>
      {icon}
      {label}
    </button>
  )
});

const customStyles = {
  success: { backgroundColor: "#f0fdf4", color: "#157f3d", fontWeight: 700, border: "0.1rem solid #ddfdeb" },
  info: { backgroundColor: "#eff6ff", color: "#214bd4", fontWeight: 700, border: "0.1rem solid #e0eafa" },
  neutral: { backgroundColor: "#f9fafc", color: "#353c4d", fontWeight: 700, border: "0.1rem solid #e5e7e9" },
  danger: { backgroundColor: "#fef2f2", color: "#d92d27", fontWeight: 700, border: "0.1rem solid #fee1e3" },
}

const CounterDetail = () => {
  const { id } = useParams()
  const counter = visitCounters.find((c) => c.id === id) || visitCounters[0]
  const achievementPct = Math.min(100, counter.achievementPct)
  const isUpVsLastMonth = counter.vsLastMonthMT >= 0

  return (
    <div className="min-h-screen bg-ink-50 pb-8">
      <ScreenHeader title="Counters Details" subtitle="Complete information and performance overview" />

      <div className="space-y-5 px-4 pt-4">
        {/* Identity card */}
        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <div className="flex items-start gap-3">
            <EntityIcon icon={counter.icon} tone={counter.iconTone} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[17px] font-extrabold leading-snug text-ink-900">{counter.name}</h2>
                <StatusPill status={counter.status.toUpperCase()} />
              </div>
              <p className="mt-1 text-sm text-ink-500">Owner: {counter.ownerName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-400">
                <MapPin size={14} />
                {counter.location}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3.5">
            <Metric icon={<Layers size={14} className="text-success-500" />} value={`${counter.mtdSales} MT`} label="MTD Sales" />
            <Metric icon={<Target size={14} className="text-info-600" />} value={`${counter.target} MT`} label="Target" />
            <div className="text-right">
              <p className="text-base font-extrabold leading-none text-ink-900">{achievementPct}%</p>
              <p className="mt-1 text-[11px] text-ink-400">Achievement</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-success-50 px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-success-600" />
              <div>
                <p className="text-sm font-bold text-ink-900">Last visited {counter.lastVisited}</p>
                <p className="text-sm font-medium text-success-600">Great! You are up to date.</p>
              </div>
            </div>
            <button
              type="button"
              className="tap-highlight-none shrink-0 rounded-full border border-success-600 px-3.5 py-2 text-sm font-semibold text-success-600 active:bg-success-100"
            >
              Schedule Visit
            </button>
          </div>
        </div>

        {/* Performance overview */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[17px] font-extrabold text-ink-900">Performance Overview</h3>
            <span className="text-xs text-ink-400">1 &ndash; 25 May 2025</span>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <PerfCard
              value={`${counter.mtdSales}`}
              unit="MT"
              label="MTD Sales"
              barPct={Math.round((counter.mtdSales / counter.target) * 100)}
              barClass="bg-success-500"
              footNote={`${Math.round((counter.mtdSales / counter.target) * 100)}% of ${counter.target} MT`}
            />
            <PerfCard
              value={`${counter.target}`}
              unit="MT"
              label="Target"
              barPct={100}
              barClass="bg-info-600"
              footNote="100%"
            />
            <PerfCard
              value={`${isUpVsLastMonth ? '+' : ''}${Math.round((counter.vsLastMonthMT / counter.target) * 100)}%`}
              unit=""
              label="vs Last Month"
              barPct={Math.min(100, Math.abs(Math.round((counter.vsLastMonthMT / counter.target) * 100)))}
              barClass="bg-brand-500"
              footNote={`${isUpVsLastMonth ? '+' : ''}${counter.vsLastMonthMT} MT`}
              valueClass={isUpVsLastMonth ? 'text-brand-600' : 'text-danger-600'}
            />
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-2xl border border-ink-100 bg-white">
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="text-[17px] font-extrabold text-ink-900">Recent Activity</h3>
            <button type="button" className="tap-highlight-none text-sm font-semibold text-brand-500">
              View all
            </button>
          </div>
          <div className="mt-1">
            {counter.recentActivity.length === 0 && (
              <p className="px-4 py-4 text-sm text-ink-400">No recent activity yet.</p>
            )}
            {counter.recentActivity.map((item, idx) => (
              <ActivityRow key={item.id} item={item} isLast={idx === counter.recentActivity.length - 1} />
            ))}
          </div>
        </div>

        {/* Counter information */}
        <div>
          <h3 className="mb-2 text-[17px] font-extrabold text-ink-900">Counter Information</h3>
          <div className="rounded-2xl border border-ink-100 bg-white">
            <InfoRow icon={<Hash size={16} />} label="Counter Code" value={counter.code} />
            <InfoRow icon={<User size={16} />} label="Owner Name" value={counter.ownerName} />
            <InfoRow icon={<Phone size={16} />} label="Mobile Number" value={counter.phone} />
            <InfoRow icon={<Mail size={16} />} label="Email ID" value={counter.email} />
            <InfoRow icon={<MapPin size={16} />} label="Address" value={counter.address} isLast />
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pb-2">
          <ActionButton icon={<Flag size={16} />} label="Schedule Visit" tone="success" style={customStyles.success} />
          <ActionButton icon={<Navigation size={16} />} label="View on Map" tone="info" style={customStyles.info} />
          <ActionButton icon={<Phone size={16} />} label="Call" tone="neutral" style={customStyles.neutral} href={`tel:${counter.phone.replace(/\s/g, '')}`} />
          <ActionButton icon={<ChevronRight size={16} className="rotate-90" />} label="Report Issue" tone="danger" style={customStyles.danger} />
        </div>
      </div>
    </div>
  )
}

export default React.memo(CounterDetail);
