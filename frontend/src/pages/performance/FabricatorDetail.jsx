import React from "react";
import { useParams } from 'react-router'
import { Phone, AlertTriangle, User, Mail, MapPin, Calendar } from 'lucide-react'
import ScreenHeader from '../../components/ScreenHeader.jsx'
import EntityIcon from '../../components/EntityIcon.jsx'
import StatusPill from '../../components/StatusPill.jsx'
import { fabricators } from '../../data/mockData.js'

const InfoRow = React.memo(function InfoRow({ icon, label, value, align = 'right', isLast = false }) {
  return (
    <div className={`flex items-start justify-between gap-4 px-4 py-3.5 ${!isLast ? 'border-b border-ink-100' : ''}`}>
      <div className="flex shrink-0 items-center gap-2 text-sm text-ink-400">
        {icon}
        <span>{label}</span>
      </div>
      <p
        className={`text-sm font-semibold text-ink-900 ${
          align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        {value}
      </p>
    </div>
  )
});

const FabricatorDetail = () => {
  const { id } = useParams()
  const fabricator = fabricators.find((f) => f.id === id) || fabricators[0]

  return (
    <div className="min-h-screen bg-ink-50 pb-8">
      <ScreenHeader title="Fabricator Details" subtitle="Complete information and performance overview" />

      <div className="space-y-4 px-4 pt-4">
        {/* Identity card */}
        <div className="rounded-2xl border border-ink-100 bg-white p-4">
          <div className="flex items-start gap-3">
            <EntityIcon icon={fabricator.icon} tone={fabricator.iconTone} />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[17px] font-extrabold leading-snug text-ink-900">{fabricator.name}</h2>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill status={fabricator.status} />
                  <a
                    href={`tel:${fabricator.phone.replace(/\s/g, '')}`}
                    aria-label="Call"
                    className="tap-highlight-none flex h-8 w-8 items-center justify-center rounded-full text-ink-900"
                  >
                    <Phone size={18} />
                  </a>
                </div>
              </div>
              <p className="mt-1 text-sm text-ink-400">{fabricator.code}</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
                <MapPin size={14} />
                {fabricator.location}
              </p>
              <p className="mt-1 text-sm text-ink-700">
                {fabricator.ownerName} &bull; {fabricator.phone}
              </p>
            </div>
          </div>

          {fabricator.followUpRequired && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-danger-50 px-3.5 py-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-danger-500" />
                <div>
                  <p className="text-sm font-bold text-ink-900">
                    Last visited {fabricator.lastVisitDays} days ago
                  </p>
                  <p className="text-sm font-medium text-brand-500">Follow-up required</p>
                </div>
              </div>
              <button
                type="button"
                className="tap-highlight-none shrink-0 rounded-full border border-brand-500 px-3.5 py-2 text-sm font-semibold text-brand-500 active:bg-brand-50"
              >
                Schedule Visit
              </button>
            </div>
          )}
        </div>

        {/* Fabricator information */}
        <div>
          <h3 className="mb-2 text-[17px] font-extrabold text-ink-900">Fabricator Information</h3>
          <div className="rounded-2xl border border-ink-100 bg-white">
            <InfoRow icon={<User size={16} />} label="Owner Name" value={fabricator.ownerName} />
            <InfoRow icon={<Phone size={16} />} label="Mobile Number" value={fabricator.phone} />
            <InfoRow icon={<Mail size={16} />} label="Email ID" value={fabricator.email} />
            <InfoRow icon={<MapPin size={16} />} label="Address" value={fabricator.address} align="right" />
            <InfoRow
              icon={<Calendar size={16} />}
              label="Member Since"
              value={fabricator.memberSince}
              isLast
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(FabricatorDetail);
