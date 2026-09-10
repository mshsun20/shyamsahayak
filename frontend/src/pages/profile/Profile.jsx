import React from 'react'
import { useNavigate } from "react-router";
import {
    ArrowLeft,
    Globe,
    Lock,
    HelpCircle,
    LogOut,
    ChevronRight,
} from "lucide-react";

const SETTINGS = [
    {
        key: "language",
        icon: Globe,
        iconBg: "bg-orange-50",
        iconColor: "text-brand",
        title: "Language",
        subtitle: "English",
    },
    {
        key: "pin",
        icon: Lock,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
        title: "Change PIN",
        subtitle: "Update your 4-digit PIN",
    },
    {
        key: "help",
        icon: HelpCircle,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
        title: "Help & Support",
        subtitle: "FAQs, guides and contact support",
    },
    {
        key: "logout",
        icon: LogOut,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        title: "Logout",
        subtitle: "Sign out from the app",
    },
];

const Profile = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh px-4 pt-6 pb-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <button onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft size={20} className="text-neutral-900" />
                </button>
                <h1 className="text-[19px] font-bold text-neutral-900">Profile</h1>
            </div>

            {/* Profile card */}
            <div className="flex items-center gap-3.5 bg-white rounded-2xl border border-neutral-200 p-4">
                <img
                    src="https://picsum.photos/seed/raj-kumar/120/120"
                    alt="Raj Kumar"
                    className="w-16 h-16 rounded-full object-cover shrink-0"
                />
                <div className="min-w-0">
                    <p className="text-[16px] font-bold text-neutral-900">Raj Kumar</p>
                    <p className="text-[13px] font-semibold text-brand mt-0.5">DGO</p>
                    <p className="text-[12px] text-neutral-400 mt-0.5">EMP-10245</p>
                </div>
            </div>

            {/* Settings */}
            <h2 className="text-[15px] font-bold text-neutral-900 mt-6 mb-3">
                Settings
            </h2>
            <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100">
                {SETTINGS.map((s) => (
                    <button
                        key={s.key}
                        className="w-full flex items-center gap-3 p-4 text-left"
                    >
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg}`}
                        >
                            <s.icon size={18} className={s.iconColor} strokeWidth={2.25} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold text-neutral-900">
                                {s.title}
                            </p>
                            <p className="text-[12px] text-neutral-500 mt-0.5">
                                {s.subtitle}
                            </p>
                        </div>
                        <ChevronRight size={18} className="text-neutral-300 shrink-0" />
                    </button>
                ))}
            </div>

            {/* App info */}
            <div className="flex items-center gap-3 bg-white rounded-2xl border border-neutral-200 p-4 mt-4">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center shrink-0 text-white text-[16px]">
                    🐯
                </div>
                <div>
                    <p className="text-[14px] font-semibold text-neutral-900">
                        SEL Tiger Sahayak
                    </p>
                    <p className="text-[12px] text-neutral-400 mt-0.5">Version 1.0.0</p>
                </div>
            </div>
        </div>
    )
}

export default React.memo(Profile);