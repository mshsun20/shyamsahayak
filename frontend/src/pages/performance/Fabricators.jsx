import React from 'react'
import { useNavigate } from 'react-router'
import { ChevronRight, MapPin, User, Phone, Layers } from 'lucide-react'
import ScreenHeader from '../../components/ScreenHeader.jsx'
import SearchFilterBar from '../../components/SearchFilterBar.jsx'
import FilterTabs from '../../components/FilterTabs.jsx'
import EntityIcon from '../../components/EntityIcon.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import StatsFooter from '../../components/StatsFooter.jsx'
import { fabricators, fabricatorStats } from '../../data/mockData.js'
import axiosInstance from '../../config/axiosInstance.js';

const TABS = [
  { key: 'all', label: 'All', count: 67 },
  { key: 'active', label: 'Active', count: 48, dotClass: 'bg-success-500' },
  { key: 'inactive', label: 'Inactive', count: 14, dotClass: 'bg-ink-400' },
  { key: 'needs_attention', label: 'Needs Attention', count: 8, dotClass: 'bg-danger-500' },
]

const STATUS_KEY = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  'NEEDS ATTENTION': 'needs_attention',
}

const FabricatorCard = React.memo(function FabricatorCard({ fabricator, onClick }) {  
  return (
    <button
      type="button"
      onClick={onClick}
      className="tap-highlight-none block w-full rounded-2xl border border-ink-100 bg-white p-4 text-left active:bg-ink-50"
    >
      <div className="flex items-start gap-3">
        <EntityIcon icon={fabricator.icon} tone={fabricator.iconTone} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[16px] font-bold text-ink-900">{fabricator.name}</h3>
            <div className="flex shrink-0 items-center gap-1">
              <StatusPill status={fabricator.status} />
              <ChevronRight size={16} className="text-ink-300" />
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-400">
            <MapPin size={14} />
            <span className="truncate">{fabricator.location}</span>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-sm text-ink-500">
            <User size={14} />
            <span className="truncate">
              {fabricator.ownerName} &bull; {fabricator.phone}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
        <div className="flex items-center gap-4 text-sm text-ink-700">
          <span className="flex items-center gap-1.5">
            <Layers size={14} className="text-ink-400" />
            {fabricator.counters} Counters
          </span>
          <span className="font-semibold text-ink-900">{fabricator.volumeMT} MT</span>
          <span className="font-semibold text-ink-900">{fabricator.targetPct}% Target</span>
        </div>
        <a
          href={`tel:${fabricator.phone.replace(/\s/g, '')}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Call ${fabricator.ownerName}`}
          className="tap-highlight-none flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-700 active:bg-ink-200"
        >
          <Phone size={16} />
        </a>
      </div>
    </button>
  )
});

const Fabricators = () => {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('all')

  const filtered = React.useMemo(() => {
    return fabricators.filter((f) => {
      const matchesTab = activeTab === 'all' || STATUS_KEY[f.status] === activeTab
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.ownerName.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q)
      return matchesTab && matchesQuery
    })
  }, [query, activeTab])

  const fetchData = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get("/accounts");

      console.log("ACCOUNT API RESPONSE:", response);
    } catch (error) {
      console.error("ACCOUNT API ERROR:", error);
      console.error("STATUS:", error.response?.status);
      console.error("DATA:", error.response?.data);
      console.error("HEADERS:", error.response?.headers);
    }
  }, []);
  React.useEffect(() => {
    fetchData();
  }, [fetchData])

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <ScreenHeader title="Fabricators" subtitle="All fabricators in your territory" />

      <SearchFilterBar value={query} onChange={setQuery} placeholder="Search counters, owner or location..." />
      <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="flex-1 space-y-3 px-4 pb-4 pt-3">
        {filtered.map((f) => (
          <FabricatorCard key={f.id} fabricator={f} onClick={() => navigate(`/fabricators/${f.id}`)} />
        ))}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-400">No fabricators match your search.</p>
        )}
      </div>

      <StatsFooter
        totalLabel="Total Fabricators"
        total={fabricatorStats.total}
        active={fabricatorStats.active}
        inactive={fabricatorStats.inactive}
        needsAttention={fabricatorStats.needsAttention}
      />
    </div>
  )
}

export default React.memo(Fabricators);
