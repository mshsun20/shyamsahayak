import React from "react";
import { useDispatch } from "react-redux";
import { Calculator as CalcIcon, ChevronDown, RotateCcw } from "lucide-react";
import axiosInstance from "../../config/axiosInstance";
import { showSnackbar } from "../../redux/slices/snackbarSlice";
import Loader from "../../components/Loader";

// ---- API response helpers ----
// API shape: { success, message, data: [...] }
const toList = (res) => (Array.isArray(res?.data?.data) ? res.data.data : []);
// Reference field is a populated object (allocation) or a record (product)
const refId = (ref) => (ref && typeof ref === "object" ? ref._id ?? ref.id : ref);
// Populated thickness = { value, unit } (e.g. "0.32 mm"); populated metric = { value } (e.g. "RMT")
const refLabel = (ref, key) => (key === "thickness" ? `${ref?.value ?? ""} ${ref?.unit ?? ""}`.trim() : String(ref?.value ?? ""));
// Unique { id, label } options from allocation records
const uniqueOptions = (records, key) => {
  const seen = new Map();
  records.forEach((record) => {
    const id = refId(record[key]);
    if (id !== undefined && id !== null && !seen.has(String(id))) {
      seen.set(String(id), { id: String(id), label: refLabel(record[key], key) });
    }
  });
  return [...seen.values()];
};

const UNIT_UOM = "kg";

const Calculator = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = React.useState([]);
  const [allocations, setAllocations] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [productId, setProductId] = React.useState("");
  const [thicknessId, setThicknessId] = React.useState("");
  const [metricId, setMetricId] = React.useState("");
  const [quantity, setQuantity] = React.useState(1000);
  const [calculated, setCalculated] = React.useState(true);

  // Fetch products + product weight allocations
  React.useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const [productRes, allocationRes] = await Promise.all([
          axiosInstance.get("/products"),
          axiosInstance.get("/product-weight-allocations", { params: { status: "Active" } }),
        ]);
        if (!active) return;
        setProducts(toList(productRes).filter((product) => product.status === "Published"));
        setAllocations(toList(allocationRes));
      } catch (error) {
        if (!active) return;
        dispatch(showSnackbar({
          message: error.response?.data?.message || error.message || "Failed to load calculator data",
          type: "error",
        }));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [dispatch]);

  // Selected product
  const selectedProduct = React.useMemo(() => products.find((product) => String(refId(product)) === productId), [products, productId]);
  // Allocation records of the selected product
  const productAllocations = React.useMemo(() => allocations.filter((a) => productId && String(refId(a.product)) === productId), [allocations, productId]);
  // Available thicknesses for selected product
  const thicknesses = React.useMemo(() => uniqueOptions(productAllocations, "thickness"), [productAllocations]);
  // Available metrics for selected product + thickness
  const metrics = React.useMemo(
    () => uniqueOptions(productAllocations.filter((a) => thicknessId && String(refId(a.thickness)) === thicknessId), "metric"),
    [productAllocations, thicknessId]
  );
  // Matching allocation for selected product + thickness + metric
  const selectedAllocation = React.useMemo(
    () => (thicknessId && metricId ? productAllocations.find((a) => String(refId(a.thickness)) === thicknessId && String(refId(a.metric)) === metricId) : undefined),
    [productAllocations, thicknessId, metricId]
  );
  // Unit kg weight based on selected product + thickness + metric
  const unitWeight = Number(selectedAllocation?.unitWeight) || 0;
  const unitUom = UNIT_UOM;
  const metricLabel = metrics.find((m) => m.id === metricId)?.label || "";
  // Total calculated weight
  const calculatedWeight = React.useMemo(() => unitWeight * Number(quantity || 0), [unitWeight, quantity]);

  // Handle product change: reset dependent fields
  const handleProductChange = (value) => {
    setProductId(value);
    setThicknessId("");
    setMetricId("");
  };

  // Handle thickness change: reset metric (unit weight derives from selection)
  const handleThicknessChange = (value) => {
    setThicknessId(value);
    setMetricId("");
  };

  // Reset calculator
  const handleReset = () => {
    setProductId("");
    setThicknessId("");
    setMetricId("");
    setQuantity(1000);
    setCalculated(true);
  };

  return (
    <div className="relative min-h-dvh px-4 pt-6 pb-10">
      {loading && <Loader />}
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
          {calculated ? `${Math.round(calculatedWeight)} ${unitUom}` : "-- kg"}
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
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
            disabled={loading}
            className="w-full appearance-none rounded-xl border border-neutral-200 p-3.5 pr-10 text-[14px] font-medium text-neutral-900 bg-white"
          >
            <option value="" disabled>
              {loading ? "Loading products..." : products.length ? "Select product" : "No products available"}
            </option>
            {products.map((product) => (
              <option key={refId(product)} value={String(refId(product))}>
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
            {selectedProduct.image?.relativePath && (
              <img
                src={selectedProduct.image?.relativePath}
                alt={selectedProduct.name}
                className="w-11 h-11 rounded-lg object-cover shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-neutral-900 leading-snug">
                {selectedProduct.name}
              </p>

              <p className="text-[12px] text-neutral-500">
                {[selectedProduct.code, selectedProduct.shortDescription].filter(Boolean).join(" • ")}
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
            value={thicknessId}
            onChange={(e) => handleThicknessChange(e.target.value)}
            disabled={loading || !productId || !thicknesses.length}
            className="w-full appearance-none rounded-xl border border-neutral-200 p-3.5 text-[14px] font-medium text-neutral-900 bg-white"
          >
            <option value="" disabled>
              {!productId ? "Select product first" : thicknesses.length ? "Select thickness" : "No thickness available"}
            </option>
            {thicknesses.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
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
            value={metricId}
            onChange={(e) => setMetricId(e.target.value)}
            disabled={loading || !thicknessId || !metrics.length}
            className="w-full appearance-none rounded-xl border border-neutral-200 p-3.5 text-[14px] font-medium text-neutral-900 bg-white"
          >
            <option value="" disabled>
              {!thicknessId ? "Select thickness first" : metrics.length ? "Select metric" : "No metric available"}
            </option>
            {metrics.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
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
            {metricLabel}
          </span>
        </div>

        {/* Kg weight */}
        <label className="text-[13px] font-semibold text-neutral-700 block mt-4">
          Unit Weight
        </label>

        <div className="relative mt-1.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3.5">
          <span className="text-[15px] font-bold text-emerald-700">
            {unitWeight}
          </span>

          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-neutral-400 font-medium">
            {unitUom}
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