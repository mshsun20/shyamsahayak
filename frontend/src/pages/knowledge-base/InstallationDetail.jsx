import React from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Clock, Calendar, Info } from "lucide-react";

const STEPS = [
  {
    n: 1,
    title: "Prepare the Structure",
    desc: "Ensure the roof structure is strong, level and properly aligned. Clean the surface and remove any debris.",
    img: "structure-10",
  },
  {
    n: 2,
    title: "Lay the First Sheet",
    desc: "Place the first sheet at the edge and align it properly. Ensure the overhang is as per guidelines.",
    img: "firstsheet-11",
  },
  {
    n: 3,
    title: "Fix the Sheets",
    desc: "Use self-drilling screws at the recommended points. Do not over-tighten the screws.",
    img: "fixsheets-12",
  },
  {
    n: 4,
    title: "Overlap and Continue",
    desc: "Overlap the next sheet as per the recommended side and end lap. Continue till the end.",
    img: "overlap-13",
  },
];

const InstallationDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft size={20} className="text-neutral-900" />
        </button>
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
          Installation
        </span>
      </div>

      <h1 className="text-[19px] font-bold text-neutral-900 mt-3 leading-tight">
        How to Install Roofing Sheets
      </h1>
      <p className="text-[13px] text-neutral-500 mt-1">
        Step-by-step guide to install roofing sheets correctly and safely.
      </p>

      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-[12px] text-neutral-400">
          <Clock size={13} /> 7 min read
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-neutral-400">
          <Calendar size={13} /> Updated on 10 May 2025
        </span>
      </div>

      <img
        src="https://picsum.photos/seed/roof-install-hero/600/360"
        alt="Workers installing roofing sheets"
        className="w-full h-44 object-cover rounded-2xl mt-4"
      />

      <p className="text-[13.5px] text-neutral-600 leading-relaxed mt-4">
        Proper installation ensures the durability, safety and performance of
        roofing sheets. Follow these steps for correct installation.
      </p>

      {/* Steps */}
      <div className="flex flex-col gap-4 mt-5">
        {STEPS.map((s) => (
          <div key={s.n} className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {s.n}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14.5px] font-bold text-neutral-900">
                {s.title}
              </p>
              <p className="text-[12.5px] text-neutral-500 leading-snug mt-0.5">
                {s.desc}
              </p>
            </div>
            <img
              src={`https://picsum.photos/seed/${s.img}/120/120`}
              alt=""
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
          </div>
        ))}
      </div>

      {/* Note */}
      <div className="flex items-start gap-2.5 mt-6 rounded-2xl bg-emerald-50 p-3.5">
        <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-emerald-800 leading-snug">
          <span className="font-semibold">Note:</span> Always use safety gear
          and follow company guidelines during installation.
        </p>
      </div>
    </div>
  );
}

export default React.memo(InstallationDetail);
