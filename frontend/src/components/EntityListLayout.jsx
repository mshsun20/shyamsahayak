import React from 'react'
import { Search, Filter, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import { TmHeader, Avatar, StatusPill, Delta } from "./Shared.jsx";

export function StatSummary({ stats }) {
    return (
        <div className="grid grid-cols-4 bg-white rounded-2xl border border-neutral-200 p-3.5 mt-4 divide-x divide-neutral-100">
            {stats.map((s) => (
                <div key={s.label} className="text-center px-1">
                    <p className="text-[10px] text-neutral-400 leading-tight">{s.label}</p>
                    <p className={`text-[18px] font-bold mt-1 ${s.color || "text-neutral-900"}`}>
                        {s.value}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{s.sub}</p>
                </div>
            ))}
        </div>
    );
}

const EntityListLayout = ({
    title,
    period,
    searchPlaceholder,
    columns,
    stats,
    rows,
    onRowClick,
    colorIndexFor,
}) => {
    return (
        <div className="min-h-dvh px-4 pt-6 pb-10">
            <TmHeader title={title} />

            {/* Filters */}
            <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-between gap-1 bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-[12px] font-medium text-neutral-700">
                    <span className="truncate">{period}</span>
                    <ChevronDown size={14} className="shrink-0 text-neutral-400" />
                </button>
                <button className="flex-1 flex items-center justify-between gap-1 bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-[12px] font-medium text-neutral-700">
                    All Status
                    <ChevronDown size={14} className="shrink-0 text-neutral-400" />
                </button>
            </div>

            <StatSummary stats={stats} />

            {/* Search + sort */}
            <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-neutral-200 px-3.5 py-2.5">
                    <Search size={16} className="text-neutral-400 shrink-0" />
                    <input
                        placeholder={searchPlaceholder}
                        className="flex-1 text-[13px] outline-none placeholder:text-neutral-400 bg-transparent min-w-0"
                    />
                </div>
                <button className="flex items-center gap-1 bg-white rounded-xl border border-neutral-200 px-3 py-2.5 text-[12.5px] font-medium text-neutral-700 shrink-0">
                    Sort
                    <ChevronDown size={14} />
                </button>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1.3fr_0.9fr_0.55fr_1fr] gap-1.5 px-1 mt-4 pb-2 text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
                {columns.map((c) => (
                    <span key={c}>{c}</span>
                ))}
            </div>

            {/* Rows */}
            <div className="flex flex-col gap-2">
                {rows.map((r, i) => (
                    <button
                        key={r.key}
                        onClick={() => onRowClick?.(r)}
                        className="grid grid-cols-[1.3fr_0.9fr_0.55fr_1fr] gap-1.5 items-center bg-white rounded-xl border border-neutral-200 p-2.5 text-left"
                    >
                        <div className="flex items-center gap-2 min-w-0">
                            <Avatar name={r.title} size={34} colorIndex={colorIndexFor ? colorIndexFor(r, i) : i} />
                            <div className="min-w-0">
                                <p className="text-[12.5px] font-bold text-neutral-900 leading-tight truncate">
                                    {r.title}
                                </p>
                                <p className="text-[10.5px] text-neutral-400">{r.code}</p>
                            </div>
                        </div>
                        <p className="text-[12px] text-neutral-600 truncate">{r.related}</p>
                        <span
                            className={`text-[12.5px] font-bold ${r.achievement >= 70 ? "text-emerald-600" : "text-orange-500"
                                }`}
                        >
                            {r.achievement}%
                        </span>
                        <div className="flex items-center justify-between gap-1">
                            <Delta value={r.delta} />
                            <StatusPill status={r.status} />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default React.memo(EntityListLayout)