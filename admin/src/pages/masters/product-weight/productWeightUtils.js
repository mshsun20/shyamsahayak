import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatValue as formatMetricValue } from "../../configuration/metric/metricUtils";

export const API = "/product-weight-allocations";
export const BASE_PATH = "/product-weight-allocation";

// Unit weight is always shown with 3 decimal places (e.g. 0.395)
export const formatWeight = (v) => {
  const n = Number(v);
  return v === "" || v == null || Number.isNaN(n) ? "-" : n.toFixed(3);
};

// product / thickness / metric may come back populated (object) or as a plain id
export const refId = (x) => (x && typeof x === "object" ? x._id : x) || "";

export const productLabel = (p) => (p && typeof p === "object" ? p.name || p.code || "-" : "-");
export const thicknessLabel = (t) => {
  if (!t || typeof t !== "object") return "-";
  const n = Number(t.value);
  const value = Number.isNaN(n) ? t.value : String(n);
  return `${value ?? ""} ${t.unit || ""}`.trim() || "-";
};
export const metricLabel = (m) => (m && typeof m === "object" ? formatMetricValue(m.value) : "-");

// Resolve a reference to its object: use the populated object if present, otherwise look it up by id.
export const resolveRef = (ref, list) => {
  if (ref && typeof ref === "object") return ref;
  return list.find((item) => item._id === ref) || null;
};

const toList = (data, key) => (Array.isArray(data) ? data : data?.[key] || []);

// Loads Product, Thickness and Metric masters used for dropdowns, filters and label lookups.
export function useAllocationMasters() {
  const dispatch = useDispatch();
  const [masters, setMasters] = useState({ products: [], thicknesses: [], metrics: [], loaded: false });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled([
        axiosInstance.get(`/products`),
        axiosInstance.get(`/thicknesses`),
        axiosInstance.get(`/metrics`),
      ]);
      if (cancelled) return;
      const [p, t, m] = results.map((r) => (r.status === "fulfilled" ? r.value?.data?.data : null));
      const failed = results.find((r) => r.status === "rejected");
      if (failed) {
        const error = failed.reason;
        console.error(error?.message);
        dispatch(showSnackbar({ message: error?.response?.data?.message || error?.message, type: "error" }));
      }
      setMasters({
        products: toList(p, "products"),
        thicknesses: toList(t, "thicknesses"),
        metrics: toList(m, "metrics"),
        loaded: true,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return masters;
}
