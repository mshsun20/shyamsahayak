import React from 'react'
import { useNavigate } from "react-router";
import {
    Calendar,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    Users,
    Factory,
    Wallet,
    Download,
} from "lucide-react";

const STATS = [
    { label: "DGOs", value: "4", sub: "All Active" },
    { label: "Fabricators", value: "126", sub: "98 Active" },
    { label: "Counters", value: "215", sub: "168 Active" },
    { label: "Total Visits", value: "548", sub: "This Period" },
];

const ATTENTION = [
    { title: "2 DGOs", sub: "Below 70% achievement" },
    { title: "14 Fabricators", sub: "No visit this month" },
    { title: "22 Counters", sub: "Low sale month" },
];

const TREND = [40, 58, 48, 62, 55, 82];
const TREND_LABELS = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

const TEAM = [
    { name: "Raj Kumar", district: "Dhanbad", achievement: 62, delta: "-18%", fab: 24 },
    { name: "Amit Singh", district: "Ranchi", achievement: 68, delta: "-12%", fab: 28 },
    { name: "Sanjay Shaw", district: "Bokaro", achievement: 85, delta: "+5%", fab: 32 },
    { name: "Manoj Kumar", district: "Jamshedpur", achievement: 91, delta: "+8%", fab: 42 },
];

const QUICK_ACTIONS = [
    { label: "View All DGOs", icon: Users, bg: "bg-blue-50", color: "text-blue-500", to: "/tm/dgos" },
    { label: "View Fabricators", icon: Factory, bg: "bg-purple-50", color: "text-purple-500", to: "/tm/fabricators" },
    { label: "View Counters", icon: Wallet, bg: "bg-yellow-50", color: "text-yellow-600", to: "/tm/visits" },
    { label: "Download Report", icon: Download, bg: "bg-emerald-50", color: "text-emerald-500" },
];

const Sparkline = React.memo(function Sparkline() {
    const w = 280;
    const h = 70;
    const max = Math.max(...TREND);
    const min = Math.min(...TREND);
    const pts = TREND.map((v, i) => {
        const x = (i / (TREND.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 10) - 5;
        return [x, y];
    });
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[70px]">
            <path d={path} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />
            ))}
        </svg>
    );
});

const Performance = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-dvh px-4 pt-6 pb-10">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[18px] font-bold text-neutral-900">
                        Good Morning, Raj Kumar
                    </h1>
                    <p className="text-[12.5px] text-neutral-500 mt-0.5">TM • Delhi</p>
                </div>
                <button className="flex items-center gap-1.5 bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-neutral-700 shrink-0">
                    <Calendar size={13} />
                    Aug 2026
                    <ChevronDown size={13} />
                </button>
            </div>

            {/* Stat grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                {STATS.map((s) => (
                    <div key={s.label} className="bg-white rounded-2xl border border-neutral-200 p-4">
                        <p className="text-[12.5px] text-neutral-500">{s.label}</p>
                        <p className="text-[22px] font-bold text-neutral-900 mt-1">{s.value}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Attention required */}
            <div className="rounded-2xl bg-orange-50 p-4 mt-4">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[13.5px] font-bold text-neutral-900">
                        <AlertTriangle size={15} className="text-brand" />
                        Attention Required
                    </span>
                    <span className="text-[12px] font-semibold text-brand">View All ›</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                    {ATTENTION.map((a) => (
                        <div key={a.title} className="bg-white rounded-xl p-2.5">
                            <p className="text-[13px] font-bold text-neutral-900">{a.title}</p>
                            <p className="text-[10.5px] text-neutral-500 leading-snug mt-0.5">{a.sub}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Territory achievement */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 mt-4">
                <p className="text-[13px] text-neutral-500">Territory Achievement</p>
                <p className="text-[30px] font-bold text-emerald-600 mt-1">82%</p>
                <div className="h-2.5 bg-neutral-100 rounded-full mt-2.5 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "82%" }} />
                </div>
                <div className="flex items-center justify-between mt-3">
                    <div>
                        <p className="text-[13px] font-semibold text-neutral-900">₹ 3.28 Cr / ₹ 4.00 Cr</p>
                        <p className="text-[11px] text-neutral-400">vs Target</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[13px] font-semibold text-emerald-600">▲ 8%</p>
                        <p className="text-[11px] text-neutral-400">vs last month</p>
                    </div>
                </div>
            </div>

            {/* Trend */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 mt-4">
                <p className="text-[13.5px] font-bold text-neutral-900 mb-2">Achievement Trend</p>
                <Sparkline />
                <div className="flex justify-between mt-1">
                    {TREND_LABELS.map((m) => (
                        <span key={m} className="text-[10.5px] text-neutral-400">
                            {m}
                        </span>
                    ))}
                </div>
            </div>

            {/* Team snapshot */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[13.5px] font-bold text-neutral-900">My DGO Team Snapshot</p>
                    <button onClick={() => navigate("/tm/dgos")} className="text-[12px] font-semibold text-brand shrink-0">
                        View All DGOs ›
                    </button>
                </div>
                <div className="grid grid-cols-[1.4fr_1fr_0.7fr] gap-2 text-[10.5px] text-neutral-400 font-semibold pb-2 border-b border-neutral-100">
                    <span>DGO</span>
                    <span>Achievement</span>
                    <span className="text-right">Fab.</span>
                </div>
                {TEAM.map((t) => (
                    <div key={t.name} className="grid grid-cols-[1.4fr_1fr_0.7fr] gap-2 items-center py-2.5 border-b border-neutral-50 last:border-0">
                        <div>
                            <p className="text-[13px] font-semibold text-neutral-900">{t.name}</p>
                            <p className="text-[11px] text-neutral-400">{t.district}</p>
                        </div>
                        <div>
                            <span className={`text-[12.5px] font-bold ${t.achievement >= 70 ? "text-emerald-600" : "text-orange-500"}`}>
                                {t.achievement}%
                            </span>
                            <div className="h-1.5 bg-neutral-100 rounded-full mt-1 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${t.achievement >= 70 ? "bg-emerald-500" : "bg-orange-400"}`}
                                    style={{ width: `${t.achievement}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-[13px] font-semibold text-neutral-700 text-right">{t.fab}</span>
                    </div>
                ))}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-4 mt-4">
                <p className="text-[13.5px] font-bold text-neutral-900 mb-3">Quick Actions</p>
                <div className="grid grid-cols-4 gap-2">
                    {QUICK_ACTIONS.map((q) => (
                        <button
                            key={q.label}
                            onClick={() => q.to && navigate(q.to)}
                            className="flex flex-col items-center gap-1.5"
                        >
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${q.bg}`}>
                                <q.icon size={18} className={q.color} strokeWidth={2.25} />
                            </div>
                            <span className="text-[10px] text-neutral-600 text-center leading-tight">{q.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default React.memo(Performance)