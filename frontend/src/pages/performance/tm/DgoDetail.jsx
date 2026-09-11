import React from 'react'
import { useNavigate } from "react-router";
import { User, Phone, Mail, MapPin, Calendar, AlertCircle, LayoutGrid, ChevronRight } from "lucide-react";
import { TmHeader, Avatar, StatusPill, StatBlock, ContactRow } from "../../../components/Shared";

const DgoDetail = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh px-4 pt-6 pb-10">
            <TmHeader title="DGO Details" />

            {/* Profile card */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar name="Raj Kumar" size={48} colorIndex={0} />
                        <div>
                            <p className="text-[15px] font-bold text-neutral-900">Raj Kumar</p>
                            <p className="text-[12px] text-neutral-400">DGO1001</p>
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
                    <StatBlock label="Achievement" value="62%" delta="-18%" valueColor="text-orange-500" />
                    <StatBlock label="Fabricators" value="24" delta="-2" />
                    <StatBlock label="Total Visits (This Period)" value="36" delta="-6" />
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
            <div className="bg-white rounded-2xl border border-neutral-200 px-4 mt-4">
                <ContactRow icon={User} label="Primary Contact" value="Raj Kumar" />
                <ContactRow icon={Phone} label="Phone Number" value="+91 93012 34567" action={<Phone size={15} />} />
                <ContactRow icon={Mail} label="Email ID" value="raj.kumar@smel.in" action={<Mail size={15} />} />
                <ContactRow icon={MapPin} label="Territory" value="Dhanbad District" />
                <ContactRow icon={Calendar} label="Date of Joining" value="12 Jan 2023" />
            </div>

            {/* View fabricators */}
            <button
                onClick={() => navigate("/tm/fabricators")}
                className="w-full flex items-center gap-3 bg-white rounded-2xl border border-neutral-200 p-4 mt-4"
            >
                <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                    <LayoutGrid size={16} className="text-brand" />
                </div>
                <span className="flex-1 text-[14px] font-bold text-neutral-900 text-left">
                    View Fabricators
                </span>
                <ChevronRight size={18} className="text-neutral-300" />
            </button>
        </div>
    )
}

export default React.memo(DgoDetail)