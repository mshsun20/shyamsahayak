import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Pencil, ArrowLeft, User, ShieldCheck } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate, PrivilegeStatusBadge as StatusBadge } from "../privilege/privilegeUtils";

// createdBy / updatedBy may come back as a populated user object or a plain string
const userName = (u) => {
  if (!u) return "-";
  if (typeof u === "string") return u;
  return u.name || u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "-";
};

const listFrom = (res, key) => {
  const data = res?.data?.data;
  return Array.isArray(data) ? data : data?.[key] || [];
};

const containsPermission = (item, permissionId) =>
  (item.permissions || []).some((p) => (typeof p === "object" ? p._id : p) === permissionId);

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-28 shrink-0 text-sm font-medium text-gray-800">{label}</span>
      <div className="text-sm text-gray-700 min-w-0">{children}</div>
    </div>
  );
}

function UsageStat({ icon: Icon, iconClass, label, count, text }) {
  return (
    <div className="flex items-start gap-4 flex-1 px-5 py-5">
      <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${iconClass}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-tight mt-0.5">{count ?? "-"}</p>
        <p className="text-xs text-gray-500 mt-1">{text}</p>
      </div>
    </div>
  );
}

export default function PermissionDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [permission, setPermission] = useState(null);
  const [usage, setUsage] = useState({ privileges: null, roles: null });
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/permissions/${id}`);
      const data = response?.data?.data;
      setPermission(data || null);

      // Prefer usage counts sent by the API; otherwise count them from Privilege and Role Master.
      const apiPrivileges = data?.usage?.privileges ?? data?.privilegeCount;
      const apiRoles = data?.usage?.roles ?? data?.roleCount;
      if (apiPrivileges != null && apiRoles != null) {
        setUsage({ privileges: apiPrivileges, roles: apiRoles });
      } else if (data) {
        const [privRes, roleRes] = await Promise.allSettled([
          axiosInstance.get(`/privileges`),
          axiosInstance.get(`/roles`),
        ]);
        setUsage({
          privileges:
            apiPrivileges ??
            (privRes.status === "fulfilled"
              ? listFrom(privRes.value, "privileges").filter((p) => containsPermission(p, id)).length
              : null),
          roles:
            apiRoles ??
            (roleRes.status === "fulfilled"
              ? listFrom(roleRes.value, "roles").filter((r) => containsPermission(r, id)).length
              : null),
        });
      }
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
    if (!permission) return [];
    if (Array.isArray(permission.activity) && permission.activity.length) {
      return permission.activity.map((a) => ({
        title: a.title || a.action || "Activity",
        message: a.message || a.description || "",
        at: a.at || a.createdAt || a.date,
        by: userName(a.by || a.user || a.createdBy),
        type: (a.action || a.type || "").toLowerCase().includes("create") ? "created" : "updated",
      }));
    }
    const items = [];
    if (permission.createdAt) {
      items.push({
        title: "Created",
        message: `Permission "${permission.name}" was created.`,
        at: permission.createdAt,
        by: userName(permission.createdBy),
        type: "created",
      });
    }
    if (permission.updatedAt && permission.updatedAt !== permission.createdAt) {
      items.push({
        title: "Updated",
        message: "Permission details were updated.",
        at: permission.updatedAt,
        by: userName(permission.updatedBy),
        type: "updated",
      });
    }
    return items;
  }, [permission]);

  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <span>Configuration</span>
            <ChevronRight size={12} />
            <Link to="/permission-master" className="hover:text-primary">Permission Master</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Permission Details</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Permission Details</h2>
          <p className="text-xs text-gray-500 mt-1">View complete information about the selected permission.</p>
        </div>
        <button
          onClick={() => navigate(`/permission-master/edit/${id}`)}
          className="flex items-center gap-2 border border-primary text-sm font-medium text-primary px-4 py-2 rounded-lg hover:bg-primary-light"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {permission && (
        <div className="space-y-5 mt-4">
          {/* Permission Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Permission Information</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 px-5 py-5">
              <div className="space-y-4">
                <InfoRow label="Code">{permission.code || "-"}</InfoRow>
                <InfoRow label="Module">{permission.module || "-"}</InfoRow>
                <InfoRow label="Action">{permission.action || "-"}</InfoRow>
                <InfoRow label="Name">{permission.name}</InfoRow>
                <InfoRow label="Description">{permission.description || "-"}</InfoRow>
              </div>
              <div className="space-y-4">
                <InfoRow label="Status">
                  <StatusBadge status={permission.status} />
                </InfoRow>
                <InfoRow label="Created On">{formatDate(permission.createdAt, true)}</InfoRow>
                <InfoRow label="Created By">{userName(permission.createdBy)}</InfoRow>
                <InfoRow label="Last Updated">{formatDate(permission.updatedAt, true)}</InfoRow>
                <InfoRow label="Updated By">{userName(permission.updatedBy)}</InfoRow>
              </div>
            </div>
          </div>

          {/* Permission Usage */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Permission Usage</p>
            </div>
            <div className="flex flex-col md:flex-row md:divide-x divide-gray-200 md:[&>*]:my-4">
              <UsageStat
                icon={User}
                iconClass="bg-blue-50 text-info"
                label="Used in Privileges"
                count={usage.privileges}
                text={
                  usage.privileges == null
                    ? "Usage not available."
                    : `This permission is assigned to ${plural(usage.privileges, "privilege")}.`
                }
              />
              <UsageStat
                icon={ShieldCheck}
                iconClass="bg-purple-50 text-purple-600"
                label="Used in Roles"
                count={usage.roles}
                text={
                  usage.roles == null
                    ? "Usage not available."
                    : `This permission is assigned to ${plural(usage.roles, "role")}.`
                }
              />
            </div>
          </div>

          {/* Audit Information */}
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

      {!permission && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400 mt-4">
          Permission not found.
        </div>
      )}

      <button
        onClick={() => navigate("/permission-master")}
        className="flex items-center gap-2 mt-6 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <ArrowLeft size={15} />
        Back to List
      </button>
    </AdminLayout>
  );
}
