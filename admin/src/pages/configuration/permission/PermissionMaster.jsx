import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Pencil, Trash2, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Modal from "../../../components/Modal";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate, PrivilegeStatusBadge as StatusBadge } from "../privilege/privilegeUtils";

const filterDefaults = { search: "", status: "All" };

const columns = [
  { key: "module", label: "Module" },
  { key: "action", label: "Action" },
  { key: "name", label: "Name" },
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

export default function PermissionMaster() {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sort, setSort] = useState({ key: "updatedAt", dir: "asc" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch } = useForm({ defaultValues: filterDefaults });
  const search = watch("search") || "";
  const status = watch("status") || "All";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/permissions`);
      const data = response?.data?.data;
      setPermissions(Array.isArray(data) ? data : data?.permissions || []);
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

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/permissions/${deleteTarget._id}`);
      dispatch(showSnackbar({ message: "Permission deleted successfully", type: "success" }));
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      console.error(error.message);
      setDeleteTarget(null);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const filteredPermissions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = permissions.filter((p) => {
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.module?.toLowerCase().includes(q) ||
        p.action?.toLowerCase().includes(q);
      const matchesStatus = status === "All" || p.status === status;
      return matchesSearch && matchesStatus;
    });
    const { key, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "updatedAt") {
        av = new Date(av).getTime() || 0;
        bv = new Date(bv).getTime() || 0;
      } else {
        av = (av || "").toString().toLowerCase();
        bv = (bv || "").toString().toLowerCase();
      }
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [permissions, search, status, sort]);

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
            <span className="text-gray-600">Permission Master</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Permission Master</h2>
          <p className="text-xs text-gray-500 mt-1">Manage and view all permissions used for role and privilege mapping.</p>
        </div>
        <button
          onClick={() => navigate("/permission-master/add")}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} />
          Add Permission
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Search by name, module or action..."
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
              {filteredPermissions.map((permission, index) => (
                <tr key={permission._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3.5 text-gray-800">{permission.module || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-600">{permission.action || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-800">{permission.name}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={permission.status} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                    {formatDate(permission.updatedAt || permission.createdAt, true)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(`/permission-master/${permission._id}`)}
                        title="View"
                        className="p-1.5 text-gray-500 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/permission-master/edit/${permission._id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(permission)}
                        title="Delete"
                        className="p-1.5 text-gray-500 hover:text-danger hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPermissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {permissions.length === 0 ? "No permissions found." : "No permissions match the current filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredPermissions.length} of {permissions.length} permissions
        </div>
      </div>

      {deleteTarget && (
        <Modal
          title="Delete Permission"
          onClose={() => setDeleteTarget(null)}
          footer={
            <>
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteTarget.name}</span>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </AdminLayout>
  );
}