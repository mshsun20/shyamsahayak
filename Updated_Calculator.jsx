import React from "react";
import { Calculator as CalcIcon, ChevronDown, RotateCcw } from "lucide-react";

// kg weight per 1 unit of quantity, by product + thickness + metric
const productWeights = [
  {
    code: "AZ150",
    name: "TIGER Premium Roofing Sheet",
    shortDescription: "Zinc-Aluminium Coated",
    weights: [
      {
        thickness: "0.30 mm",
        metrics: [
          { metric: "RMT", value: 2.3, uom: "kg" },
          { metric: "Sq.ft", value: 1.38, uom: "kg" },
          { metric: "Sq.m", value: 14.85, uom: "kg" },
        ],
      },
      {
        thickness: "0.32 mm",
        metrics: [
          { metric: "RMT", value: 2.46, uom: "kg" },
          { metric: "Sq.ft", value: 1.48, uom: "kg" },
          { metric: "Sq.m", value: 15.9, uom: "kg" },
        ],
      },
      {
        thickness: "0.35 mm",
        metrics: [
          { metric: "RMT", value: 2.69, uom: "kg" },
          { metric: "Sq.ft", value: 1.61, uom: "kg" },
          { metric: "Sq.m", value: 17.35, uom: "kg" },
        ],
      },
      {
        thickness: "0.40 mm",
        metrics: [
          { metric: "RMT", value: 3.07, uom: "kg" },
          { metric: "Sq.ft", value: 1.84, uom: "kg" },
          { metric: "Sq.m", value: 19.8, uom: "kg" },
        ],
      },
      {
        thickness: "0.45 mm",
        metrics: [
          { metric: "RMT", value: 3.45, uom: "kg" },
          { metric: "Sq.ft", value: 2.07, uom: "kg" },
          { metric: "Sq.m", value: 22.3, uom: "kg" },
        ],
      },
      {
        thickness: "0.50 mm",
        metrics: [
          { metric: "RMT", value: 3.84, uom: "kg" },
          { metric: "Sq.ft", value: 2.3, uom: "kg" },
          { metric: "Sq.m", value: 24.8, uom: "kg" },
        ],
      },
    ],
  },
  {
    name: "pdt2",
  },
  {
    name: "pdt3",
  },
];

const Calculator = () => {
  const [productCode, setProductCode] = React.useState(
    productWeights[0]?.code || ""
  );

  const [thickness, setThickness] = React.useState(
    productWeights[0]?.weights?.[1]?.thickness ||
      productWeights[0]?.weights?.[0]?.thickness ||
      ""
  );

  const [metric, setMetric] = React.useState(
    productWeights[0]?.weights?.[1]?.metrics?.[0]?.metric ||
      productWeights[0]?.weights?.[0]?.metrics?.[0]?.metric ||
      ""
  );

  const [quantity, setQuantity] = React.useState(1000);
  const [calculated, setCalculated] = React.useState(true);

  // Selected product
  const selectedProduct = React.useMemo(
    () =>
      productWeights.find((product) => product.code === productCode) ||
      productWeights[0],
    [productCode]
  );

  // Available thicknesses for selected product
  const thicknesses = React.useMemo(
    () => selectedProduct?.weights?.map((weight) => weight.thickness) || [],
    [selectedProduct]
  );

  // Selected thickness mapping
  const selectedThickness = React.useMemo(
    () =>
      selectedProduct?.weights?.find(
        (weight) => weight.thickness === thickness
      ) || selectedProduct?.weights?.[0],
    [selectedProduct, thickness]
  );

  // Available metrics for selected product + thickness
  const metrics = React.useMemo(
    () => selectedThickness?.metrics?.map((item) => item.metric) || [],
    [selectedThickness]
  );

  // Selected metric mapping
  const selectedMetric = React.useMemo(
    () =>
      selectedThickness?.metrics?.find(
        (item) => item.metric === metric
      ) || selectedThickness?.metrics?.[0],
    [selectedThickness, metric]
  );

  // Unit kg weight based on selected product + thickness + metric
  const unitKgWeight = selectedMetric?.value || 0;

  // Total calculated weight
  const kgWeight = React.useMemo(
    () => unitKgWeight * Number(quantity || 0),
    [unitKgWeight, quantity]
  );

  // Handle product change
  const handleProductChange = (productCodeValue) => {
    const product = productWeights.find(
      (item) => item.code === productCodeValue
    );

    setProductCode(productCodeValue);

    const firstThickness = product?.weights?.[0];

    setThickness(firstThickness?.thickness || "");

    setMetric(firstThickness?.metrics?.[0]?.metric || "");
  };

  // Handle thickness change
  const handleThicknessChange = (thicknessValue) => {
    setThickness(thicknessValue);

    const thicknessData = selectedProduct?.weights?.find(
      (weight) => weight.thickness === thicknessValue
    );

    setMetric(thicknessData?.metrics?.[0]?.metric || "");
  };

  // Reset calculator
  const handleReset = () => {
    const defaultProduct = productWeights[0];
    const defaultThickness =
      defaultProduct?.weights?.find(
        (weight) => weight.thickness === "0.32 mm"
      ) || defaultProduct?.weights?.[0];

    setProductCode(defaultProduct?.code || "");
    setThickness(defaultThickness?.thickness || "");
    setMetric(defaultThickness?.metrics?.[0]?.metric || "RMT");
    setQuantity(1000);
    setCalculated(true);
  };

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
            Calculate the total weight of the product
          </p>
        </div>
      </div>

      {/* Total weight */}
      <div
        className="rounded-2xl py-5 text-center border border-neutral-200"
        style={{
          background: "#ecf5f0",
          borderColor: "#ecf5f0",
        }}
      >
        <p className="text-[13px] text-neutral-500">Total Weight</p>

        <p className="text-[28px] font-bold text-emerald-600 mt-1">
          {calculated ? `${Math.round(kgWeight)} kg` : "-- kg"}
        </p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 mt-4">
        <h2 className="text-[15px] font-bold text-neutral-900 mb-3">
          Enter Details
        </h2>

        {/* Product */}
        <label className="text-[13px] text-neutral-500">Product</label>

        <div className="relative mt-1.5">
          <select
            value={productCode}
            onChange={(e) => handleProductChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-neutral-200 p-3.5 pr-10 text-[14px] font-medium text-neutral-900 bg-white"
          >
            {productWeights.map((product) => (
              <option
                key={product.code || product.name}
                value={product.code || ""}
                disabled={!product.code}
              >
                {product.name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Selected Product Information */}
        {selectedProduct && (
          <div className="flex items-center gap-3 mt-2.5">
            <img
              src="https://picsum.photos/seed/roofing-sheet/64/64"
              alt={selectedProduct.name}
              className="w-11 h-11 rounded-lg object-cover shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-neutral-900 leading-snug">
                {selectedProduct.name}
              </p>

              <p className="text-[12px] text-neutral-500">
                {selectedProduct.code
                  ? `${selectedProduct.code} • ${
                      selectedProduct.shortDescription || ""
                    }`
                  : selectedProduct.shortDescription || ""}
              </p>
            </div>
          </div>
        )}

        {/* Thickness */}
        <label className="text-[13px] font-semibold text-neutral-700 block mt-4">
          Thickness
        </label>

        <div className="relative mt-1.5">
          <select
            value={thickness}
            onChange={(e) => handleThicknessChange(e.target.value)}
            className="w-full appearance-none rounded-xl border border-neutral-200 p-3.5 text-[14px] font-medium text-neutral-900 bg-white"
          >
            {thicknesses.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Metric */}
        <label className="text-[13px] font-semibold text-neutral-700 block mt-4">
          Metric
        </label>

        <div className="relative mt-1.5">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full appearance-none rounded-xl border border-neutral-200 p-3.5 text-[14px] font-medium text-neutral-900 bg-white"
          >
            {metrics.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Purchased quantity */}
        <label className="text-[13px] font-semibold text-neutral-700 block mt-4">
          Purchased Quantity
        </label>

        <div className="relative mt-1.5">
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 p-3.5 pr-14 text-[15px] font-bold text-neutral-900"
          />

          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400 font-medium">
            {metric}
          </span>
        </div>

        {/* Kg weight */}
        <label className="text-[13px] font-semibold text-neutral-700 block mt-4">
          Unit Kg Weight
        </label>

        <div className="relative mt-1.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
          <span className="text-[15px] font-bold text-emerald-700">
            {unitKgWeight}
          </span>

          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400 font-medium">
            Kg
          </span>
        </div>

        {/* Actions */}
        <button
          onClick={() => setCalculated(true)}
          className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-white text-[15px] font-semibold active:bg-brand-dark transition-colors"
        >
          <CalcIcon size={18} />
          Calculate Weight
        </button>

        <button
          onClick={handleReset}
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
  );
};

export default React.memo(Calculator);