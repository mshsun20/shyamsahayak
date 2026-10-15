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

const filterDefaults = { search: "" };

const columns = [
  { key: "name", label: "Name" },
  { key: "level", label: "Level" },
  { key: "description", label: "Description" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created On" },
];

function SortIcon({ active, dir }) {
  if (!active) return <ArrowUpDown size={13} className="text-gray-400" />;
  return dir === "asc" ? (
    <ArrowUp size={13} className="text-primary" />
  ) : (
    <ArrowDown size={13} className="text-primary" />
  );
}

export default function RoleMaster() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sort, setSort] = useState({ key: "level", dir: "asc" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch } = useForm({ defaultValues: filterDefaults });
  const search = watch("search") || "";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/roles`);
      const data = response?.data?.data;
      setRoles(Array.isArray(data) ? data : data?.roles || []);
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
      await axiosInstance.delete(`/roles/${deleteTarget._id}`);
      dispatch(showSnackbar({ message: "Role deleted successfully", type: "success" }));
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      console.error(error.message);
      setDeleteTarget(null);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const filteredRoles = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = roles.filter(
      (r) =>
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.code?.toLowerCase().includes(q)
    );
    const { key, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "level") {
        av = Number(av) || 0;
        bv = Number(bv) || 0;
      } else if (key === "createdAt") {
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
  }, [roles, search, sort]);

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
            <span className="text-gray-600">Role Master</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Role Master</h2>
          <p className="text-xs text-gray-500 mt-1">Manage and view all roles with their access permissions.</p>
        </div>
        <button
          onClick={() => navigate("/role-master/add")}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} />
          Add Role
        </button>
      </div>

      <div className="my-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Search by role name or description..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
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
              {filteredRoles.map((role, index) => (
                <tr key={role._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">{role.name}</td>
                  <td className="px-4 py-3.5 text-gray-600">{role.level}</td>
                  <td className="px-4 py-3.5 text-gray-600">{role.description || "-"}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={role.status} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(role.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(`/role-master/${role._id}`)}
                        title="View"
                        className="p-1.5 text-gray-500 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/role-master/edit/${role._id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(role)}
                        title="Delete"
                        className="p-1.5 text-gray-500 hover:text-danger hover:bg-red-50 rounded-md"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRoles.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {roles.length === 0 ? "No roles found." : "No roles match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredRoles.length} of {roles.length} roles
        </div>
      </div>

      {deleteTarget && (
        <Modal
          title="Delete Role"
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