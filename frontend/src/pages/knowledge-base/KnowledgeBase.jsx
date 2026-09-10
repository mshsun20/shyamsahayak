import { useNavigate } from "react-router";
import React from 'react'
import {
  Search,
  SlidersHorizontal,
  Layers,
  Wrench,
  ShieldCheck,
  Play,
  ArrowRight,
  ChevronRight,
  Clock,
  FileText,
} from "lucide-react";

const CATEGORIES = [
  {
    key: "products",
    label: "Products",
    desc: "All about our roofing sheets",
    icon: Layers,
    bg: "bg-orange-50",
    iconBg: "bg-brand",
    arrow: "text-brand",
    bordr: "0.05rem solid #ffeed9",
  },
  {
    key: "installation",
    label: "Installation",
    desc: "Installation guides and best practices",
    icon: Wrench,
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-500",
    arrow: "text-emerald-500",
    bordr: "0.1rem solid #e0f9e9",
    to: "/knowledge-base/installation",
  },
  {
    key: "warranty",
    label: "Warranty",
    desc: "Warranty terms and conditions",
    icon: ShieldCheck,
    bg: "bg-blue-50",
    iconBg: "bg-blue-500",
    arrow: "text-blue-500",
    bordr: "0.1rem solid #dbe9ff",
  },
  {
    key: "videos",
    label: "Videos",
    desc: "Product & installation",
    icon: Play,
    bg: "bg-purple-50",
    iconBg: "bg-purple-500",
    arrow: "text-purple-500",
    bordr: "0.1rem solid #f2e7ff",
  },
];

const FEATURED = [
  {
    badge: "Products",
    badgeColor: "text-brand bg-orange-50",
    title: "Tiger Premium - Product Overview",
    desc: "Explore features, specifications and benefits of Tiger Premium...",
    time: "5 min read",
    img: "roof-red-1",
  },
  {
    badge: "Installation",
    badgeColor: "text-emerald-600 bg-emerald-50",
    title: "How to Install Roofing Sheets",
    desc: "Step-by-step guide to install roofing sheets correctly and...",
    time: "7 min read",
    img: "install-2",
    to: "/knowledge-base/installation/how-to-install",
  },
  {
    badge: "Warranty",
    badgeColor: "text-blue-600 bg-blue-50",
    title: "Warranty Terms & Conditions",
    desc: "Know everything about warranty coverage, exclusions and claim",
    time: "6 min read",
    img: "warranty-3",
  },
];

const LATEST = [
  {
    title: "Tiger AZ150 — Technical Specifications",
    desc: "Understand the technical details and",
    time: "4 min read",
    img: "specs-4",
  },
  {
    title: "Storage & Handling of Roofing Sheets",
    desc: "Tips to store and handle sheets for...",
    time: "3 min read",
    img: "storage-5",
  },
];

function ArticleRow({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 bg-white rounded-2xl border border-neutral-200 p-2.5 text-left"
    >
      <img
        src={`https://picsum.photos/seed/${item.img}/120/120`}
        alt=""
        className="w-16 h-16 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        {item.badge && (
          <span
            className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md mb-1 ${item.badgeColor}`}
          >
            {item.badge}
          </span>
        )}
        <p className="text-[14px] font-bold text-neutral-900 leading-snug">
          {item.title}
        </p>
        <p className="text-[12px] text-neutral-500 line-clamp-2 mt-0.5">
          {item.desc}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
            <Clock size={12} /> {item.time}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
            <FileText size={12} /> Article
          </span>
        </div>
      </div>
      <ChevronRight size={18} className="text-neutral-300 shrink-0" />
    </button>
  );
}

const KnowledgeBase = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh px-4 pt-6 pb-10">
      <h1 className="text-[19px] font-bold text-neutral-900">Knowledge Base</h1>
      <p className="text-[13px] text-neutral-500 mt-0.5">
        Learn, explore and stay updated
      </p>

      {/* Search */}
      <div className="flex items-center gap-2 mt-4 bg-white rounded-xl border border-neutral-200 px-3.5 py-3">
        <Search size={18} className="text-neutral-400 shrink-0" />
        <input
          placeholder="Search for articles, guides and more..."
          className="flex-1 text-[13px] outline-none placeholder:text-neutral-400 bg-transparent min-w-0"
        />
        <SlidersHorizontal size={18} className="text-neutral-400 shrink-0" />
      </div>

      {/* Categories */}
      <h2 className="text-[15px] font-bold text-neutral-900 mt-6 mb-3">
        Browse by Category
      </h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => c.to && navigate(c.to)}
            className={`w-33 shrink-0 rounded-2xl p-4 text-left ${c.bg}`}
            style={{border:c.bordr}}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.iconBg}`}
            >
              <c.icon size={17} className="text-white" strokeWidth={2.25} />
            </div>
            <p className="text-[14px] font-bold text-neutral-900 mt-3">
              {c.label}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
              {c.desc}
            </p>
            <ArrowRight size={15} className={`mt-3 ${c.arrow}`} />
          </button>
        ))}
      </div>

      {/* Featured */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-[15px] font-bold text-neutral-900">
          Featured Articles
        </h2>
        <span className="text-[13px] font-semibold text-brand">View all</span>
      </div>
      <div className="flex flex-col gap-3">
        {FEATURED.map((item) => (
          <ArticleRow
            key={item.title}
            item={item}
            onClick={() => item.to && navigate(item.to)}
          />
        ))}
      </div>

      {/* Latest */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-[15px] font-bold text-neutral-900">
          Latest Articles
        </h2>
        <span className="text-[13px] font-semibold text-brand">View all</span>
      </div>
      <div className="flex flex-col gap-3">
        {LATEST.map((item) => (
          <ArticleRow key={item.title} item={item} />
        ))}
      </div>
    </div>
  )
}

export default React.memo(KnowledgeBase)