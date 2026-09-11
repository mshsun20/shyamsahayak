import React from 'react'
import { Calculator as CalcIcon, ChevronDown, RotateCcw, Info } from "lucide-react";

// Approx unit-weight (kg per running ft) by sheet thickness for the demo product
const UNIT_WEIGHT_BY_THICKNESS = {
  "0.40 mm": 1.637,
  "0.45 mm": 1.842,
  "0.50 mm": 2.046,
  "0.60 mm": 2.455,
};

const LENGTHS = [6, 8, 10, 12, 14, 16];
const QUANTITIES = [1, 5, 10, 20, 50, 100];

const Calculator = () => {
  const [thickness, setThickness] = React.useState("0.50 mm");
  const [length, setLength] = React.useState(12);
  const [quantity, setQuantity] = React.useState(10);
  const [showResult, setShowResult] = React.useState(true);

  const unitWeight = UNIT_WEIGHT_BY_THICKNESS[thickness];
  const totalWeight = React.useMemo(
    () => unitWeight * length * quantity,
    [unitWeight, length, quantity]
  );

  return (
    <div className="min-h-dvh px-4 pt-6 pb-10">
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-brand flex items-center justify-center shrink-0 shadow-sm shadow-orange-200">
          <CalcIcon size={20} className="text-white" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="text-[19px] font-bold text-neutral-900 leading-tight">
            Weight Calculator
          </h1>
          <p className="text-[13px] text-neutral-500 mt-0.5">
            Calculate the total weight of roofing sheets
          </p>
        </div>
      </div>

      {/* Total weight card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5">
        <div className="bg-neutral-100 rounded-xl py-5 text-center">
          <p className="text-[13px] text-neutral-500">Total Weight</p>
          <p className="text-[28px] font-bold text-emerald-600 mt-1">
            {showResult ? `${totalWeight.toFixed(2)} kg` : "-- kg"}
          </p>
        </div>

        <h2 className="text-[15px] font-bold text-neutral-900 mt-5 mb-3">
          Enter Details
        </h2>

        {/* Product */}
        <label className="text-[13px] text-neutral-500">Product</label>
        <button className="w-full mt-1.5 flex items-center gap-3 rounded-xl border border-neutral-200 p-2.5 text-left">
          <img
            src="https://picsum.photos/seed/roofing-sheet/64/64"
            alt="TIGER Premium Roofing Sheet"
            className="w-11 h-11 rounded-lg object-cover shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-neutral-900 leading-snug">
              TIGER Premium Roofing Sheet
            </p>
            <p className="text-[12px] text-neutral-500">
              AZ150 • Zinc-Aluminium Coated
            </p>
          </div>
          <ChevronDown size={18} className="text-neutral-400 shrink-0" />
        </button>

        {/* Thickness */}
        <label className="text-[13px] text-neutral-500 block mt-4">
          Thickness
        </label>
        <div className="relative mt-1.5">
          <select
            value={thickness}
            onChange={(e) => setThickness(e.target.value)}
            className="w-full appearance-none rounded-xl border border-neutral-200 p-3 text-[14px] font-medium text-neutral-900 bg-white"
          >
            {Object.keys(UNIT_WEIGHT_BY_THICKNESS).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Length + Quantity */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-[13px] text-neutral-500">Length (ft)</label>
            <div className="relative mt-1.5">
              <select
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-neutral-200 p-3 text-[14px] font-medium text-neutral-900 bg-white"
              >
                {LENGTHS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>
          <div>
            <label className="text-[13px] text-neutral-500">Quantity (Nos)</label>
            <div className="relative mt-1.5">
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full appearance-none rounded-xl border border-neutral-200 p-3 text-[14px] font-medium text-neutral-900 bg-white"
              >
                {QUANTITIES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Unit weight */}
        <label className="text-[13px] text-neutral-500 block mt-4">
          Unit Weight
        </label>
        <div
          className="mt-1.5 flex items-center justify-between rounded-xl bg-neutral-100 p-3.5"
          style={{background:"#f9fafc",border:"0.05rem solid #e6e8eb"}}
        >
          <span className="text-[14px] font-medium text-neutral-700">
            {unitWeight.toFixed(3)} kg/ft
          </span>
          <span
            className="flex items-center gap-1 text-[12px] font-medium text-blue-600"
            style={{background:"#ebf5ff",padding:"0.2rem 0.5rem", borderRadius:"0.5rem"}}
          >
            Auto calculated
            <Info size={13} />
          </span>
        </div>

        {/* Actions */}
        <button
          onClick={() => setShowResult(true)}
          className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-white text-[15px] font-semibold active:bg-brand-dark transition-colors"
        >
          <CalcIcon size={18} />
          Calculate Weight
        </button>
        <button
          onClick={() => {
            setThickness("0.50 mm");
            setLength(12);
            setQuantity(10);
          }}
          className="w-full mt-3 flex items-center justify-center gap-2 rounded-xl border border-brand py-3.5 text-brand-dark text-[15px] font-semibold"
        >
          <RotateCcw size={16} />
          Calculate Again
        </button>
      </div>

      <p className="text-center text-[12px] text-neutral-400 mt-4">
        Weight may vary ±5% due to manufacturing tolerance.
      </p>
    </div>
  )
}

export default React.memo(Calculator)