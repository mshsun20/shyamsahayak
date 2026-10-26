import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Pencil, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate, PrivilegeStatusBadge as StatusBadge } from "../privilege/privilegeUtils";
import { formatValue, isNumeric } from "./metricUtils";

const filterDefaults = { search: "", status: "All" };

const columns = [
  { key: "value", label: "Value" },
  { key: "details", label: "Details" },
  { key: "status", label: "Status" },
  { key: "updatedAt", label: "Updated On" },
];

function SortIcon({ active, dir }) {
  if (!active) return <ArrowUpDown size={13} className="text-gray-400" />;
  return dir === "asc" ? (
    <ArrowUp size={13} className="text-primary" />
  ) : (
    <ArrowDown size={13} className="text-primary" />
  );
}

export default function MetricMaster() {
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState({ key: "updatedAt", dir: "asc" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch } = useForm({ defaultValues: filterDefaults });
  const search = watch("search") || "";
  const status = watch("status") || "All";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/metrics`);
      const data = response?.data?.data;
      setMetrics(Array.isArray(data) ? data : data?.metrics || []);
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

  const filteredMetrics = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = metrics.filter((m) => {
      const matchesSearch =
        !q ||
        formatValue(m.value).toLowerCase().includes(q) ||
        String(m.value ?? "").toLowerCase().includes(q) ||
        m.details?.toLowerCase().includes(q);
      const matchesStatus = status === "All" || m.status === status;
      return matchesSearch && matchesStatus;
    });
    const { key, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "value" && isNumeric(av) && isNumeric(bv)) {
        av = Number(av);
        bv = Number(bv);
      } else if (key === "updatedAt") {
        av = new Date(a.updatedAt || a.createdAt).getTime() || 0;
        bv = new Date(b.updatedAt || b.createdAt).getTime() || 0;
      } else {
        av = (av ?? "").toString().toLowerCase();
        bv = (bv ?? "").toString().toLowerCase();
      }
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [metrics, search, status, sort]);

  const toggleSort = (key) => {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <span>Configuration</span>
            <ChevronRight size={12} />
            <span className="text-gray-600">Metric Master</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Metric Master</h2>
          <p className="text-xs text-gray-500 mt-1">Manage and view all metrics used in the system.</p>
        </div>
        <button
          onClick={() => navigate("/metric-master/add")}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} />
          Add Metric
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Search by value or details..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status</span>
          <select
            {...register("status")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-32 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-700">
                <th className="px-4 py-3 font-semibold w-12">#</th>
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 font-semibold">
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className="flex items-center gap-1.5 hover:text-gray-900"
                    >
                      {col.label}
                      <SortIcon active={sort.key === col.key} dir={sort.dir} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMetrics.map((metric, index) => (
                <tr key={metric._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3.5 text-gray-800">{formatValue(metric.value)}</td>
                  <td className="px-4 py-3.5 text-gray-800">{metric.details || "-"}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={metric.status} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {formatDate(metric.updatedAt || metric.createdAt, true)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(`/metric-master/${metric._id}`)}
                        title="View"
                        className="p-1.5 text-gray-500 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/metric-master/edit/${metric._id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMetrics.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {metrics.length === 0 ? "No metrics found." : "No metrics match the current filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredMetrics.length} of {metrics.length} metrics
        </div>
      </div>
    </AdminLayout>
  );
}
