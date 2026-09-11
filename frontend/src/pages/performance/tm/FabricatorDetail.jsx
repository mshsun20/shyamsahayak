import React from 'react'
import { User, Phone, Mail, MapPin, PhoneCall, Navigation } from "lucide-react";
import { TmHeader, Avatar, StatusPill, StatBlock, ContactRow } from "../../../components/Shared";

const FabricatorDetail = () => {
    return (
        <div className="min-h-dvh px-4 pt-6 pb-10">
            <TmHeader title="Fabricator Details" />

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar name="Vikas Steel Works" size={48} colorIndex={2} />
                        <div>
                            <p className="text-[15px] font-bold text-neutral-900 leading-tight">
                                Vikas Steel Works
                            </p>
                            <p className="text-[12px] text-neutral-400">FAB1003</p>
                            <p className="text-[12px] text-neutral-400">Gurugram</p>
                        </div>
                    </div>
                    <StatusPill status="On Track" />
                </div>
                <div className="flex items-center justify-between mt-3 text-[11.5px] text-neutral-400">
                    <span>Assigned DGO</span>
                    <span className="font-semibold text-brand">Raj Kumar (DGO1001)</span>
                </div>

                <div className="flex mt-4 pt-4 border-t border-neutral-100">
                    <StatBlock label="Achievement" value="72%" delta="+12%" valueColor="text-emerald-600" />
                    <StatBlock label="Counters" value="18" delta="-3" />
                    <StatBlock label="Total Visits (This Period)" value="36" delta="-6" />
                </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 mt-4">
                <p className="text-[14px] font-bold text-neutral-900 mb-1">Contact Information</p>
                <ContactRow icon={User} label="Contact Person" value="Suresh Kumar" />
                <ContactRow icon={Phone} label="Phone Number" value="+91 93012 34567" action={<Phone size={15} />} />
                <ContactRow icon={Mail} label="Email ID" value="suresh@skrsteel.com" action={<Mail size={15} />} />
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

export default React.memo(FabricatorDetail)