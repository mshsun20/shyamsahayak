import React from 'react'
import { User, Phone, Mail, MapPin, AlertCircle, PhoneCall, Navigation } from "lucide-react";
import { TmHeader, Avatar, StatusPill, StatBlock, ContactRow } from "../../../components/Shared";

const CounterDetail = () => {
    return (
        <div className="min-h-dvh px-4 pt-6 pb-10">
            <TmHeader title="Counter Details" />

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar name="Maa Ganga Fabricators" size={48} colorIndex={1} />
                        <div>
                            <p className="text-[15px] font-bold text-neutral-900 leading-tight">
                                Maa Ganga Fabricators
                            </p>
                            <p className="text-[12px] text-neutral-400">CNT1004</p>
                            <p className="text-[12px] text-neutral-400">Gurugram</p>
                        </div>
                    </div>
                    <StatusPill status="Needs Attention" />
                </div>
                <div className="flex items-center justify-between mt-3 text-[11.5px] text-neutral-400">
                    <span>Joined: 12 Jan 2023</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        Active <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </span>
                </div>

                <div className="flex mt-4 pt-4 border-t border-neutral-100">
                    <StatBlock label="Achievement" value="78%" delta="-18%" valueColor="text-orange-500" />
                    <StatBlock label="Fabricators" value="2" delta="-2" />
                    <StatBlock label="Total Visits (This Period)" value="18 May 2025" delta="-6" />
                </div>
            </div>

            {/* Needs attention */}
            <div className="flex items-start gap-2.5 rounded-2xl bg-orange-50 p-4 mt-4">
                <AlertCircle size={17} className="text-brand shrink-0 mt-0.5" />
                <div>
                    <p className="text-[14px] font-bold text-neutral-900">Needs Attention</p>
                    <p className="text-[12.5px] text-neutral-600 mt-1">3 Fabricators require follow-up</p>
                    <p className="text-[12.5px] text-neutral-600">Visit target below expected</p>
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 mt-4">
                <p className="text-[14px] font-bold text-neutral-900 mb-1">Contact Information</p>
                <ContactRow icon={User} label="Contact Person" value="Rakesh Sharma" />
                <ContactRow icon={Phone} label="Phone Number" value="+91 92345 67890" action={<Phone size={15} />} />
                <ContactRow icon={Mail} label="Email ID" value="rakesh@dhanbadsteelmart.com" action={<Mail size={15} />} />
                <ContactRow icon={MapPin} label="Address" value="Dhanbad Market, Dhanbad, Jharkhand - 826001" />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-5">
                <button className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-[14px] font-semibold text-neutral-800">
                    <PhoneCall size={16} className="text-brand" />
                    Call
                </button>
                <button className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 py-3 text-[14px] font-semibold text-neutral-800">
                    <Navigation size={16} className="text-brand" />
                    Navigate
                </button>
            </div>
        </div>
    )
}

export default React.memo(CounterDetail)