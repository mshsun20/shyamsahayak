import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Pencil, ArrowLeft } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate, PrivilegeStatusBadge as StatusBadge } from "../privilege/privilegeUtils";
import { formatValue } from "./thicknessUtils";

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

export default function ThicknessDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [thickness, setThickness] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/thicknesses/${id}`);
      setThickness(response?.data?.data || null);
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
    if (!thickness) return [];
    if (Array.isArray(thickness.activity) && thickness.activity.length) {
      return thickness.activity.map((a) => ({
        title: a.title || a.action || "Activity",
        message: a.message || a.description || "",
        at: a.at || a.createdAt || a.date,
        by: userName(a.by || a.user || a.createdBy),
        type: (a.action || a.type || "").toLowerCase().includes("create") ? "created" : "updated",
      }));
    }
    const label = `${formatValue(thickness.value)} ${thickness.unit || ""}`.trim();
    const items = [];
    if (thickness.createdAt) {
      items.push({
        title: "Created",
        message: `Thickness "${label}" was created.`,
        at: thickness.createdAt,
        by: userName(thickness.createdBy),
        type: "created",
      });
    }
    if (thickness.updatedAt && thickness.updatedAt !== thickness.createdAt) {
      items.push({
        title: "Updated",
        message: "Thickness details were updated.",
        at: thickness.updatedAt,
        by: userName(thickness.updatedBy),
        type: "updated",
      });
    }
    return items;
  }, [thickness]);

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <span>Configuration</span>
            <ChevronRight size={12} />
            <Link to="/thickness-master" className="hover:text-primary">Thickness Master</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Thickness Details</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Thickness Details</h2>
          <p className="text-xs text-gray-500 mt-1">View complete information about the selected thickness.</p>
        </div>
        <button
          onClick={() => navigate(`/thickness-master/edit/${id}`)}
          className="flex items-center gap-2 border border-primary text-sm font-medium text-primary px-4 py-2 rounded-lg hover:bg-primary-light"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {thickness && (
        <div className="space-y-5 mt-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Thickness Information</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 px-5 py-5">
              <div className="space-y-4">
                <InfoRow label="Code">{thickness.code || "-"}</InfoRow>
                <InfoRow label="Value">{formatValue(thickness.value)}</InfoRow>
                <InfoRow label="Unit">{thickness.unit || "-"}</InfoRow>
                <InfoRow label="Details">{thickness.details || "-"}</InfoRow>
              </div>
              <div className="space-y-4">
                <InfoRow label="Status">
                  <StatusBadge status={thickness.status} />
                </InfoRow>
                <InfoRow label="Created On">{formatDate(thickness.createdAt, true)}</InfoRow>
                <InfoRow label="Created By">{userName(thickness.createdBy)}</InfoRow>
                <InfoRow label="Last Updated">{formatDate(thickness.updatedAt, true)}</InfoRow>
                <InfoRow label="Updated By">{userName(thickness.updatedBy)}</InfoRow>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Audit Information</p>
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

      {!thickness && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400 mt-4">
          Thickness not found.
        </div>
      )}

      <button
        onClick={() => navigate("/thickness-master")}
        className="flex items-center gap-2 mt-6 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <ArrowLeft size={15} />
        Back to List
      </button>
    </AdminLayout>
  );
}
