import React from "react";
import { ArrowLeft, ChevronDown, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router";

const AVATAR_COLORS = [
    { bg: "bg-orange-100", text: "text-orange-600" },
    { bg: "bg-yellow-100", text: "text-yellow-700" },
    { bg: "bg-emerald-100", text: "text-emerald-600" },
    { bg: "bg-blue-100", text: "text-blue-600" },
];

const Avatar = React.memo(function Avatar({ name, size = 44, colorIndex = 0 }) {
    const initials = name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    const c = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
    return (
        <div
            style={{ width: size, height: size }}
            className={`rounded-full flex items-center justify-center font-bold shrink-0 ${c.bg} ${c.text}`}
        >
            <span style={{ fontSize: size * 0.36 }}>{initials}</span>
        </div>
    );
});

const StatusPill = React.memo(function StatusPill({ status }) {
    const map = {
        "On Track": "bg-emerald-50 text-emerald-600",
        "Needs Attention": "bg-orange-50 text-orange-600",
        "Not Active": "bg-neutral-100 text-neutral-500",
    };
    return (
        <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-md whitespace-nowrap ${map[status] || map["Not Active"]
                }`}
        >
            {status}
        </span>
    );
});

const Delta = React.memo(function Delta({ value }) {
    const positive = value.trim().startsWith("+");
    return (
        <span
            className={`text-[12px] font-semibold ${positive ? "text-emerald-600" : "text-red-500"
                }`}
        >
            {value}
        </span>
    );
});

const TmHeader = React.memo(function TmHeader({ title, back = true, subtitle = "TM • Delhi" }) {
    const navigate = useNavigate();
    return (
        <div className="flex items-center gap-3 mb-4">
            {back && (
                <button onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft size={20} className="text-neutral-900" />
                </button>
            )}
            <div>
                <h1 className="text-[19px] font-bold text-neutral-900 leading-tight">
                    {title}
                </h1>
                <button className="flex items-center gap-1 text-[12px] text-neutral-500">
                    {subtitle}
                    <ChevronDown size={13} />
                </button>
            </div>
        </div>
    );
});

const ContactRow = React.memo(function ContactRow({ icon: Icon, label, value, action }) {
    return (
        <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
            <div className="flex items-center gap-2.5 text-neutral-500">
                <Icon size={16} />
                <span className="text-[13px]">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-neutral-900 text-right">
                    {value}
                </span>
                {action && <span className="text-brand">{action}</span>}
            </div>
        </div>
    );
});

const StatBlock = React.memo(function StatBlock({ label, value, delta, valueColor = "text-neutral-900" }) {
    return (
        <div className="text-center flex-1">
            <p className="text-[11px] text-neutral-500">{label}</p>
            <p className={`text-[19px] font-bold mt-1 ${valueColor}`}>{value}</p>
            {delta && (
                <>
                    <p className="text-[10px] text-neutral-400 mt-1">vs Last Month</p>
                    <Delta value={delta} />
                </>
            )}
        </div>
    );
});

export { Phone, Mail, Avatar, StatusPill, Delta, TmHeader, ContactRow, StatBlock };
