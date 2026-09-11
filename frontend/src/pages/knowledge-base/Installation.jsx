import React from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Search,
  Filter,
  Wrench,
  ArrowUpDown,
  Clock,
  Eye,
  ChevronRight,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

const TABS = [
  { key: "all", label: "All", count: 22 },
  { key: "articles", label: "Articles", count: 18 },
  { key: "videos", label: "Videos", count: 4 },
];

const ARTICLES = [
  {
    title: "How to Install Roofing Sheets",
    desc: "Step-by-step guide to install roofing sheets correctly and...",
    time: "7 min read",
    views: "1.2K views",
    img: "install-2",
    to: "/knowledge-base/installation/:",
  },
  {
    title: "Lapping and Overlap Guideline",
    desc: "Learn the correct lapping methods to prevent leakage and",
    time: "5 min read",
    views: "856 views",
    img: "lapping-6",
  },
  {
    title: "Screw Selection & Fastening",
    desc: "Choose the right screws and learn proper fastening...",
    time: "6 min read",
    views: "743 views",
    img: "screws-7",
  },
  {
    title: "Sealing and Waterproofing Tips",
    desc: "Best practices to seal joints and prevent water penetration in...",
    time: "4 min read",
    views: "612 views",
    img: "sealant-8",
  },
  {
    title: "Ventilation and Ridge Installation",
    desc: "Ensure proper ventilation and ridge cap installation for better...",
    time: "6 min read",
    views: "521 views",
    img: "ridge-9",
  },
];

const Installation = () => {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState("all");

  return (
    <div className="min-h-dvh px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <button onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft size={20} className="text-neutral-900" />
        </button>
        <h1 className="text-[19px] font-bold text-neutral-900">Installation</h1>
      </div>
      <p className="text-[13px] text-neutral-500 pl-8">
        Step-by-step guides and best practices
      </p>

      {/* Search + Filter */}
      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border border-neutral-200 px-3.5 py-3">
          <Search size={17} className="text-neutral-400 shrink-0" />
          <input
            placeholder="Search installation articles..."
            className="flex-1 text-[13px] outline-none placeholder:text-neutral-400 bg-transparent min-w-0"
          />
        </div>
        <button className="flex items-center gap-1.5 bg-white rounded-xl border border-neutral-200 px-3.5 py-3 text-[13px] font-medium text-neutral-700 shrink-0">
          <Filter size={15} />
          Filter
        </button>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden mt-4 rounded-2xl bg-emerald-50 p-4" style={{border:"0.05rem solid #e0f9e9"}}>
        <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center">
          <Wrench size={20} className="text-white" strokeWidth={2.25} />
        </div>
        <p className="text-[15px] font-bold text-neutral-900 mt-3">
          Installation
        </p>
        <p className="text-[12px] text-neutral-600 mt-1 max-w-[220px]">
          Guides and instructions to install roofing sheets correctly and
          safely.
        </p>
        <p className="text-[12px] font-medium text-neutral-500 mt-2">
          18 Articles &nbsp;•&nbsp; 4 Videos
        </p>
        <div className="absolute right-3 bottom-0 flex items-end gap-1.5 opacity-40">
          <div className="w-6 h-16 bg-emerald-300 rounded-t-md" />
          <div className="w-6 h-24 bg-emerald-400 rounded-t-md" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 flex items-center gap-1.5 bg-neutral-100 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 text-center text-[12.5px] font-semibold py-2 rounded-lg transition-colors ${
                tab === t.key
                  ? "bg-brand text-white"
                  : "text-neutral-500"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
        <button className="bg-white rounded-xl border border-neutral-200 p-2.5 shrink-0">
          <ArrowUpDown size={16} className="text-neutral-500" />
        </button>
      </div>

      {/* Article list */}
      <div className="flex flex-col gap-3 mt-4">
        {ARTICLES.map((a) => (
          <button
            key={a.title}
            onClick={() => a.to && navigate(a.to)}
            className="w-full flex items-center gap-3 bg-white rounded-2xl border border-neutral-200 p-2.5 text-left"
          >
            <img
              src={`https://picsum.photos/seed/${a.img}/120/120`}
              alt=""
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-neutral-900 leading-snug">
                {a.title}
              </p>
              <p className="text-[12px] text-neutral-500 line-clamp-2 mt-0.5">
                {a.desc}
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <Clock size={12} /> {a.time}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <Eye size={12} /> {a.views}
                </span>
              </div>
            </div>
            <ChevronRight size={18} className="text-neutral-300 shrink-0" />
          </button>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center justify-between gap-3 mt-4 rounded-2xl bg-orange-50 p-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <MessageCircle size={18} className="text-brand shrink-0" />
          <p className="text-[13px] font-medium text-neutral-800 leading-snug">
            Can't find what you're looking for?
          </p>
        </div>
        <button className="flex items-center gap-1 shrink-0 text-[13px] font-semibold text-brand bg-white rounded-lg px-3 py-2 border border-orange-200">
          Ask Sahayak
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

export default React.memo(Installation);