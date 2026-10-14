import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Pencil, ArrowLeft, Search } from "lucide-react";
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

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-32 shrink-0 text-sm text-gray-600">{label}</span>
      <div className="text-sm font-medium text-gray-900 min-w-0">{children}</div>
    </div>
  );
}

export default function RoleDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [permissionQuery, setPermissionQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/roles/${id}`);
      const data = response?.data?.data;
      setRole(data || null);

      const assigned = data?.permissions || [];
      if (assigned.some((p) => typeof p !== "object")) {
        // permissions came back as ids – resolve names/descriptions from Permission Master
        try {
          const permRes = await axiosInstance.get(`/permissions`);
          const permData = permRes?.data?.data;
          const all = Array.isArray(permData) ? permData : permData?.permissions || [];
          setPermissions(
            assigned.map((p) => {
              const pid = typeof p === "object" ? p._id : p;
              return all.find((x) => x._id === pid) || { _id: pid, name: pid, description: "" };
            })
          );
        } catch {
          setPermissions(assigned.map((p) => (typeof p === "object" ? p : { _id: p, name: p, description: "" })));
        }
      } else {
        setPermissions(assigned);
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

  const visiblePermissions = useMemo(() => {
    const q = permissionQuery.trim().toLowerCase();
    return permissions.filter(
      (p) => !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }, [permissions, permissionQuery]);

  // Use the activity log from the API when present, otherwise derive it from created / updated stamps.
  const activity = useMemo(() => {
    if (!role) return [];
    if (Array.isArray(role.activity) && role.activity.length) {
      return role.activity.map((a) => ({
        title: a.title || a.action || "Activity",
        message: a.message || a.description || "",
        at: a.at || a.createdAt || a.date,
        by: userName(a.by || a.user || a.createdBy),
        type: (a.action || a.type || "").toLowerCase().includes("create") ? "created" : "updated",
      }));
    }
    const items = [];
    if (role.createdAt) {
      items.push({
        title: "Role created",
        message: `Role "${role.name}" was created.`,
        at: role.createdAt,
        by: userName(role.createdBy),
        type: "created",
      });
    }
    if (role.updatedAt && role.updatedAt !== role.createdAt) {
      items.push({
        title: "Role updated",
        message: "Role details were updated.",
        at: role.updatedAt,
        by: userName(role.updatedBy),
        type: "updated",
      });
    }
    return items;
  }, [role]);

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <span>Configuration</span>
            <ChevronRight size={12} />
            <Link to="/role-master" className="hover:text-primary">Role Master</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Role Details</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Role Details</h2>
          <p className="text-xs text-gray-500 mt-1">View complete information about the selected role.</p>
        </div>
        <button
          onClick={() => navigate(`/role-master/edit/${id}`)}
          className="flex items-center gap-2 border border-primary text-sm font-medium text-primary px-4 py-2 rounded-lg hover:bg-primary-light"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {role && (
        <div className="space-y-5 mt-4">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Basic Information</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-4 px-5 py-5">
              <div className="space-y-4">
                <InfoRow label="Code">{role.code || "-"}</InfoRow>
                <InfoRow label="Name">{role.name}</InfoRow>
                <InfoRow label="Level">{role.level}</InfoRow>
                <InfoRow label="Description">{role.description || "-"}</InfoRow>
              </div>
              <div className="space-y-4">
                <InfoRow label="Status">
                  <StatusBadge status={role.status} />
                </InfoRow>
                <InfoRow label="Created On">{formatDate(role.createdAt, true)}</InfoRow>
                <InfoRow label="Created By">{userName(role.createdBy)}</InfoRow>
                <InfoRow label="Last Updated">{formatDate(role.updatedAt, true)}</InfoRow>
                <InfoRow label="Updated By">{userName(role.updatedBy)}</InfoRow>
              </div>
            </div>
          </div>

          {/* Assigned Permissions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-900">Assigned Permissions</p>
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-200 text-[11px] font-semibold text-gray-700">
                  {permissions.length}
                </span>
              </div>
              <div className="relative w-full max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={permissionQuery}
                  onChange={(e) => setPermissionQuery(e.target.value)}
                  placeholder="Search permissions..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-700 border-b border-gray-100">
                    <th className="px-5 py-3 font-semibold w-20">#</th>
                    <th className="px-4 py-3 font-semibold w-1/3">Permission Name</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visiblePermissions.map((permission, index) => (
                    <tr key={permission._id || index}>
                      <td className="px-5 py-3.5 text-gray-600">{index + 1}</td>
                      <td className="px-4 py-3.5 text-gray-900">{permission.name}</td>
                      <td className="px-4 py-3.5 text-gray-600">{permission.description || "-"}</td>
                    </tr>
                  ))}
                  {visiblePermissions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                        {permissions.length === 0 ? "No permissions assigned to this role." : "No permissions match your search."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Information */}
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-5">
            <p className="text-sm font-semibold text-gray-900 mb-4">Activity Information</p>
            {activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity recorded.</p>
            ) : (
              <ol className="relative">
                {activity.map((item, index) => (
                  <li key={index} className="relative flex gap-3 pb-5 last:pb-0">
                    {index < activity.length - 1 && (
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
      )}

      {!role && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-sm text-gray-400 mt-4">
          Role not found.
        </div>
      )}

      <button
        onClick={() => navigate("/role-master")}
        className="flex items-center gap-2 mt-6 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <ArrowLeft size={15} />
        Back to List
      </button>
    </AdminLayout>
  );
}
