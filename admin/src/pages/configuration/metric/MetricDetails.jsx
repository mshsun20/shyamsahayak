import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Pencil, ArrowLeft } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate, PrivilegeStatusBadge as StatusBadge } from "../privilege/privilegeUtils";
import { formatValue } from "./metricUtils";

// createdBy / updatedBy may come back as a populated user object or a plain string
const userName = (u) => {
  if (!u) return "-";
  if (typeof u === "string") return u;
  return u.name || u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "-";
};

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-28 shrink-0 text-sm font-medium text-gray-800">{label}</span>
      <div className="text-sm text-gray-700 min-w-0">{children}</div>
    </div>
  );
}

export default function MetricDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [metric, setMetric] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/metrics/${id}`);
      setMetric(response?.data?.data || null);
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    } finally {
      setIsLoading(false);
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Use the activity log from the API when present, otherwise derive it from created / updated stamps.
  const audit = useMemo(() => {
    if (!metric) return [];
    if (Array.isArray(metric.activity) && metric.activity.length) {
      return metric.activity.map((a) => ({
        title: a.title || a.action || "Activity",
        message: a.message || a.description || "",
        at: a.at || a.createdAt || a.date,
        by: userName(a.by || a.user || a.createdBy),
        type: (a.action || a.type || "").toLowerCase().includes("create") ? "created" : "updated",
      }));
    }
    const items = [];
    if (metric.createdAt) {
      const withDetails = metric.details ? ` with details “${metric.details}”` : "";
      items.push({
        title: "Created",
        message: `Metric value “${formatValue(metric.value)}”${withDetails} was created.`,
        at: metric.createdAt,
        by: userName(metric.createdBy),
        type: "created",
      });
    }
    if (metric.updatedAt && metric.updatedAt !== metric.createdAt) {
      items.push({
        title: "Updated",
        message: "Metric details were updated.",
        at: metric.updatedAt,
        by: userName(metric.updatedBy),
        type: "updated",
      });
    }
    return items;
  }, [metric]);

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <span>Configuration</span>
            <ChevronRight size={12} />
            <Link to="/metric-master" className="hover:text-primary">Metric Master</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Metric Details</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Metric Details</h2>
          <p className="text-xs text-gray-500 mt-1">View complete information about the selected metric.</p>
        </div>
        <button
          onClick={() => navigate(`/metric-master/edit/${id}`)}
          className="flex items-center gap-2 border border-primary text-sm font-medium text-primary px-4 py-2 rounded-lg hover:bg-primary-light"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {metric && (
        <div className="space-y-5 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Metric Information</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 px-5 py-5">
              <div className="space-y-4">
                <InfoRow label="Code">
                  <span className="text-gray-900">{metric.code || "-"}</span>
                  <span className="block text-[11px] text-gray-400 mt-0.5">(Auto-generated)</span>
                </InfoRow>
                <InfoRow label="Value">
                  <span className="font-medium text-gray-900">{formatValue(metric.value)}</span>
                </InfoRow>
                <InfoRow label="Details">
                  <span className="font-medium text-gray-900">{metric.details || "-"}</span>
                </InfoRow>
              </div>
              <div className="space-y-4 lg:border-l lg:border-gray-100 lg:pl-10">
                <InfoRow label="Status">
                  <StatusBadge status={metric.status} />
                </InfoRow>
                <InfoRow label="Created On">{formatDate(metric.createdAt, true)}</InfoRow>
                <InfoRow label="Created By">{userName(metric.createdBy)}</InfoRow>
                <InfoRow label="Last Updated">{formatDate(metric.updatedAt, true)}</InfoRow>
                <InfoRow label="Updated By">{userName(metric.updatedBy)}</InfoRow>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Audit Trail</p>
            </div>
            <div className="px-5 py-5">
              {audit.length === 0 ? (
                <p className="text-sm text-gray-400">No activity recorded.</p>
              ) : (
                <ol className="relative">
                  {audit.map((item, index) => (
                    <li key={index} className="relative flex gap-3 pb-5 last:pb-0">
                      {index < audit.length - 1 && (
                        <span className="absolute left-[5px] top-4 bottom-0 w-px bg-gray-200" />
                      )}
                      <span
                        className={`relative mt-1 w-[11px] h-[11px] rounded-full shrink-0 ${
                          item.type === "created" ? "bg-success" : "bg-info"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        {item.message && <p className="text-xs text-gray-500 mt-0.5">{item.message}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-gray-800">{formatDate(item.at, true)}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">by {item.by}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}

      {!metric && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400 mt-4">
          Metric not found.
        </div>
      )}

      <button
        onClick={() => navigate("/metric-master")}
        className="flex items-center gap-2 mt-6 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <ArrowLeft size={15} />
        Back to List
      </button>
    </AdminLayout>
  );
}
