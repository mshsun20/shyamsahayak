import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Pencil, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate, PrivilegeStatusBadge } from "./privilegeUtils";

const filterDefaults = { search: "" };

const columns = [
  { key: "name", label: "Name" },
  { key: "hierarchy", label: "Hierarchy" },
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

export default function PrivilegeMaster() {
  const [privileges, setPrivileges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sort, setSort] = useState({ key: "hierarchy", dir: "asc" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch } = useForm({ defaultValues: filterDefaults });
  const search = watch("search") || "";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/privileges`);
      const data = response?.data?.data;
      setPrivileges(Array.isArray(data) ? data : data?.privileges || []);
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

  const filteredPrivileges = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = privileges.filter(
      (p) => !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
    const { key, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "hierarchy") {
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
  }, [privileges, search, sort]);

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
            <span className="text-gray-600">Privilege Master</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Privilege Master</h2>
          <p className="text-xs text-gray-500 mt-1">Manage and view all privileges used for role and permission setup.</p>
        </div>
        <button
          onClick={() => navigate("/privilege-master/add")}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} />
          Add Privilege
        </button>
      </div>

      <div className="my-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Search by name or description..."
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
              {filteredPrivileges.map((privilege, index) => (
                <tr key={privilege._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3.5 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3.5 text-gray-800">{privilege.name}</td>
                  <td className="px-4 py-3.5 text-gray-600">{privilege.hierarchy}</td>
                  <td className="px-4 py-3.5 text-gray-600">{privilege.description || "-"}</td>
                  <td className="px-4 py-3.5">
                    <PrivilegeStatusBadge status={privilege.status} />
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{formatDate(privilege.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => navigate(`/privilege-master/${privilege._id}`)}
                        title="View"
                        className="p-1.5 text-gray-500 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/privilege-master/edit/${privilege._id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPrivileges.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {privileges.length === 0 ? "No privileges found." : "No privileges match your search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredPrivileges.length} of {privileges.length} privileges
        </div>
      </div>
    </AdminLayout>
  );
}
