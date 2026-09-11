import React from 'react';
import { useNavigate } from 'react-router'
import { ChevronRight, MapPin, Layers, Target } from 'lucide-react'
import ScreenHeader from '../../components/ScreenHeader.jsx'
import SearchFilterBar from '../../components/SearchFilterBar.jsx'
import FilterTabs from '../../components/FilterTabs.jsx'
import EntityIcon from '../../components/EntityIcon.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import StatsFooter from '../../components/StatsFooter.jsx'
import { visitCounters, visitCounterStats } from '../../data/mockData.js'

const TABS = [
  { key: 'all', label: 'All', count: 67 },
  { key: 'active', label: 'Active', count: 48, dotClass: 'bg-success-500' },
  { key: 'inactive', label: 'Inactive', count: 14, dotClass: 'bg-ink-400' },
]

const STATUS_KEY = {
  Active: 'active',
  Inactive: 'inactive',
  'Needs Attention': 'needs_attention',
}

const CounterCard = React.memo(function CounterCard({ counter, onClick }) {
  const showStatus = counter.status === 'Active' || counter.status === 'Inactive'

  return (
    <button
      type="button"
      onClick={onClick}
      className="tap-highlight-none block w-full rounded-2xl border border-ink-100 bg-white p-4 text-left active:bg-ink-50"
    >
      <div className="flex items-start gap-3">
        <EntityIcon icon={counter.icon} tone={counter.iconTone} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[16px] font-bold text-ink-900">{counter.name}</h3>
            <div className="flex shrink-0 items-center gap-1">
              {showStatus && <StatusPill status={counter.status} />}
              <ChevronRight size={16} className="text-ink-300" />
            </div>
          </div>
          <p className="mt-1 text-sm text-ink-500">Owner: {counter.ownerName}</p>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
            <MapPin size={14} />
            <span className="truncate">{counter.location}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
        <Metric icon={<Layers size={14} className="text-success-500" />} label="MTD Sales" value={`${counter.mtdSales}MT`} />
        <Metric icon={<Target size={14} className="text-info-600" />} label="Target" value={`${counter.target}MT`} />
        <div className="text-right">
          <p className="text-base font-extrabold leading-none text-ink-900">{counter.achievementPct}%</p>
          <p className="mt-1 text-[11px] text-ink-400">Achievement</p>
        </div>
      </div>
    </button>
  )
})

const Metric = React.memo(function Metric({ icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-50">{icon}</span>
      <div>
        <p className="text-[11px] leading-none text-ink-400">{label}</p>
        <p className="mt-0.5 text-sm font-bold leading-none text-ink-900">{value}</p>
      </div>
    </div>
  )
})

const Visits = () => {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('all')

  const filtered = React.useMemo(() => {
    return visitCounters.filter((c) => {
      const matchesTab = activeTab === 'all' || STATUS_KEY[c.status] === activeTab
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.ownerName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [query, activeTab])

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <ScreenHeader title="Visits" subtitle="All counters under your territory" />

      <SearchFilterBar value={query} onChange={setQuery} placeholder="Search counters, owner or location..." />
      <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="flex-1 space-y-3 px-4 pb-4 pt-3">
        {filtered.map((c) => (
          <CounterCard key={c.id} counter={c} onClick={() => navigate(`/visits/${c.id}`)} />
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-400">No counters match your search.</p>
        )}
      </div>

      <StatsFooter
        totalLabel="Total Counters"
        total={visitCounterStats.total}
        active={visitCounterStats.active}
        inactive={visitCounterStats.inactive}
        needsAttention={visitCounterStats.needsAttention}
      />
    </div>
  )
}

export default React.memo(Visits);
