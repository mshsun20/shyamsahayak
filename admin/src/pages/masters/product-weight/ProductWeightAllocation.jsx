import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Pencil, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate, PrivilegeStatusBadge as StatusBadge } from "../../configuration/privilege/privilegeUtils";
import {
  API,
  BASE_PATH,
  formatWeight,
  refId,
  resolveRef,
  productLabel,
  thicknessLabel,
  metricLabel,
  useAllocationMasters,
} from "./productWeightUtils";

const filterDefaults = { search: "", product: "All", thickness: "All", metric: "All", status: "All" };

const columns = [
  { key: "product", label: "Product", sortable: false },
  { key: "thickness", label: "Thickness", sortable: false },
  { key: "metric", label: "Metric", sortable: false },
  { key: "unitWeight", label: "Unit Weight", sortable: false },
  { key: "info", label: "Info", sortable: false },
  { key: "status", label: "Status", sortable: false },
  { key: "updatedAt", label: "Updated On", sortable: false },
];

function SortIcon({ active, dir }) {
  if (!active) return <ArrowUpDown size={13} className="text-gray-400" />;
  return dir === "asc" ? (
    <ArrowUp size={13} className="text-primary" />
  ) : (
    <ArrowDown size={13} className="text-primary" />
  );
}

const selectClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30";

export default function ProductWeightAllocation() {
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState({ key: "", dir: "asc" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, thicknesses, metrics } = useAllocationMasters();

  const { register, watch } = useForm({ defaultValues: filterDefaults });
  const search = watch("search") || "";
  const productFilter = watch("product") || "All";
  const thicknessFilter = watch("thickness") || "All";
  const metricFilter = watch("metric") || "All";
  const status = watch("status") || "All";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(API);
      const data = response?.data?.data;
      setAllocations(Array.isArray(data) ? data : data?.allocations || []);
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // attach display labels once so search / sort can use them
  const rows = useMemo(
    () =>
      allocations.map((a) => ({
        ...a,
        _product: productLabel(resolveRef(a.product, products)),
        _thickness: thicknessLabel(resolveRef(a.thickness, thicknesses)),
        _metric: metricLabel(resolveRef(a.metric, metrics)),
      })),
    [allocations, products, thicknesses, metrics]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter((r) => {
      const matchesSearch =
        !q ||
        r._product.toLowerCase().includes(q) ||
        r._thickness.toLowerCase().includes(q) ||
        r._metric.toLowerCase().includes(q) ||
        formatWeight(r.unitWeight).includes(q) ||
        r.info?.toLowerCase().includes(q);
      return (
        matchesSearch &&
        (productFilter === "All" || refId(r.product) === productFilter) &&
        (thicknessFilter === "All" || refId(r.thickness) === thicknessFilter) &&
        (metricFilter === "All" || refId(r.metric) === metricFilter) &&
        (status === "All" || r.status === status)
      );
    });
    if (!sort.key) return list;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let av;
      let bv;
      if (sort.key === "unitWeight") {
        av = Number(a.unitWeight) || 0;
        bv = Number(b.unitWeight) || 0;
      } else if (sort.key === "updatedAt") {
        av = new Date(a.updatedAt || a.createdAt).getTime() || 0;
        bv = new Date(b.updatedAt || b.createdAt).getTime() || 0;
      } else {
        const k = ["product", "thickness", "metric"].includes(sort.key) ? `_${sort.key}` : sort.key;
        av = (a[k] ?? "").toString().toLowerCase();
        bv = (b[k] ?? "").toString().toLowerCase();
      }
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [rows, search, productFilter, thicknessFilter, metricFilter, status, sort]);

  const toggleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  return (
    <AdminLayout title="Master Data">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <span>Master Data</span>
            <ChevronRight size={12} />
            <span className="text-gray-600">Product Weight Allocation</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Product Weight Allocation</h2>
          <p className="text-xs text-gray-500 mt-1">Manage and view product weight allocation used in the system.</p>
        </div>
        <button
          onClick={() => navigate(`${BASE_PATH}/add`)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} />
          Add Allocation
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-end gap-3 my-4">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Search by product, thickness, metric or unit weight..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Product</span>
          <select {...register("product")} className={selectClass}>
            <option value="All">All</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {productLabel(p)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Thickness</span>
          <select {...register("thickness")} className={selectClass}>
            <option value="All">All</option>
            {thicknesses.map((t) => (
              <option key={t._id} value={t._id}>
                {thicknessLabel(t)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Metric</span>
          <select {...register("metric")} className={selectClass}>
            <option value="All">All</option>
            {metrics.map((m) => (
              <option key={m._id} value={m._id}>
                {metricLabel(m)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Status</span>
          <select {...register("status")} className={selectClass}>
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-700">
                <th className="px-4 py-3 font-semibold w-12">#</th>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-semibold">
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className="flex items-center gap-1.5 hover:text-gray-900"
                      >
                        {col.label}
                        <SortIcon active={sort.key === col.key} dir={sort.dir} />
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRows.map((row, index) => (
                <tr key={row._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3.5 font-semibold text-gray-900">{row._product}</td>
                  <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{row._thickness}</td>
                  <td className="px-4 py-3.5 text-gray-700 max-w-[160px]">{row._metric}</td>
                  <td className="px-4 py-3.5 text-gray-800">{formatWeight(row.unitWeight)}</td>
                  <td className="px-4 py-3.5 text-gray-700 max-w-[160px]">{row.info || "-"}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-600">
                    {formatDate(row.updatedAt || row.createdAt, true)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(`${BASE_PATH}/${row._id}`)}
                        title="View"
                        className="p-1.5 text-gray-500 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`${BASE_PATH}/edit/${row._id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {allocations.length === 0
                      ? "No product weight allocations found."
                      : "No allocations match the current filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredRows.length} of {allocations.length} allocations
        </div>
      </div>
    </AdminLayout>
  );
}
