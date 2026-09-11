import React from 'react'
import { useNavigate } from 'react-router';
import { Calendar, ChevronDown, ChevronRight, Users, MapPin } from 'lucide-react'
import EntityIcon from '../../components/EntityIcon';
import { summary, recentActivity } from '../../data/mockData';
import { useSelector } from 'react-redux';


const SummaryCard = ({ icon, iconBg, value, label, onViewAll }) => {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>{icon}</div>
      <p className="mt-4 text-[28px] font-semibold leading-none text-ink-900">{value}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-500">{label}</span>
        <button
          type="button"
          onClick={onViewAll}
          className="tap-highlight-none text-sm font-semibold text-brand-500"
        >
          View all
        </button>
      </div>
    </div>
  )
}

const ActivityRow = ({ item, isLast }) => {
  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-ink-100' : ''}`}>
      <EntityIcon icon={item.type} tone={iconToneFor(item.type)} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-ink-900">{item.title}</p>
        <p className="truncate text-sm text-ink-400">{item.subtitle}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="text-xs text-ink-400">{item.time}</span>
        <ChevronRight size={16} className="text-ink-300" />
      </div>
    </div>
  )
}

const iconToneFor = (type) => {
  if (type === 'new_fabricator') return 'success'
  if (type === 'followup') return 'warn'
  return 'info'
}

const Performance = () => {
  const { user } = useSelector(state => state.auth);
  console.log(user);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink-50 pb-8">
      {/* Top greeting bar */}
      <div className="bg-white px-5 pb-5 pt-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold leading-tight text-ink-900">
              Good Morning, {user?.fullName}
            </h1>
            <p className="mt-1 text-[15px] text-ink-400">
              {user?.role?.name} &bull;
              {user?.reportingDetails?.map((itm, i) => <span key={i}>
                {itm?.territory}
              </span>)}
            </p>
          </div>
          <button
            type="button"
            className="tap-highlight-none flex shrink-0 items-center gap-1.5 rounded-xl border border-ink-200 px-3 py-2.5 text-sm font-semibold text-ink-900 active:bg-ink-50"
          >
            <Calendar size={16} className="text-brand-500" />
            {summary.month}
            <ChevronDown size={16} className="text-ink-400" />
          </button>
        </div>
      </div>

      <div className="px-5">
        <h2 className="mb-3 mt-6 text-[19px] font-semibold text-ink-900">Performance Summary</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={<Users size={22} className="text-brand-500" />}
            iconBg="bg-brand-100"
            value={summary.fabricatorsCount}
            label="Fabricators"
            onViewAll={() => navigate('/fabricators')}
          />
          <SummaryCard
            icon={<MapPin size={22} className="text-info-600" />}
            iconBg="bg-info-100"
            value={summary.visitsCount}
            label="Visits"
            onViewAll={() => navigate('/visits')}
          />
        </div>

        {/* Priority action */}
        <button
          type="button"
          onClick={() => navigate('/fabricators')}
          className="tap-highlight-none mt-4 flex w-full items-center justify-between gap-3 rounded-2xl bg-brand-50 px-4 py-4 text-left active:bg-brand-100"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-brand-500">PRIORITY ACTION</p>
            <p className="mt-1 text-[15px] font-semibold leading-snug text-ink-900">
              {summary.priorityAction}
            </p>
          </div>
          <ChevronRight size={20} className="shrink-0 text-ink-300" />
        </button>

        {/* Recent activity */}
        <div className="mt-6 rounded-2xl border border-ink-100 bg-white">
          <div className="flex items-center justify-between px-4 pt-4">
            <h3 className="text-[17px] font-semibold text-ink-900">Recent Activity</h3>
            <button
              type="button"
              onClick={() => navigate('/visits')}
              className="tap-highlight-none text-sm font-semibold text-brand-500"
            >
              View all
            </button>
          </div>

          <div className="mt-2">
            {recentActivity.map((item, idx) => (
              <ActivityRow key={item.id} item={item} isLast={idx === recentActivity.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(Performance)