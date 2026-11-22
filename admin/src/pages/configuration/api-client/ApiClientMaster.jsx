import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Pencil, Trash2, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, KeyRound } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Modal from "../../../components/Modal";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate } from "../privilege/privilegeUtils";
import { ApiClientStatusBadge, getExpiry, expiryToneClass, timeAgo } from "./apiClientUtils";

const filterDefaults = { search: "", status: "All" };

const columns = [
  { key: "name", label: "Client" },
  { key: "keyPrefix", label: "Key Prefix" },
  { key: "permissions", label: "Permissions" },
  { key: "status", label: "Status" },
  { key: "expiresAt", label: "Expires" },
  { key: "lastUsedAt", label: "Last Used" },
];

function SortIcon({ active, dir }) {
  if (!active) return <ArrowUpDown size={13} className="text-gray-400" />;
  return dir === "asc" ? (
    <ArrowUp size={13} className="text-primary" />
  ) : (
    <ArrowDown size={13} className="text-primary" />
  );
}

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-400 shrink-0">{label}</span>
      <span className="text-gray-800 text-right min-w-0 break-all">{children}</span>
    </div>
  );
}

export default function ApiClientMaster() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sort, setSort] = useState({ key: "name", dir: "asc" });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch } = useForm({ defaultValues: filterDefaults });
  const search = watch("search") || "";
  const status = watch("status") || "All";

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api-clients`);
      const data = response?.data?.data;
      setClients(Array.isArray(data) ? data : data?.clients || []);
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
      await axiosInstance.delete(`/api-clients/${deleteTarget._id}`);
      dispatch(showSnackbar({ message: "API client deleted successfully", type: "success" }));
      setDeleteTarget(null);
      await fetchData();
    } catch (error) {
      console.error(error.message);
      setDeleteTarget(null);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = clients.filter((c) => {
      const matchesSearch =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        c.clientId?.toLowerCase().includes(q) ||
        c.keyPrefix?.toLowerCase().includes(q);
      const matchesStatus = status === "All" || c.status === status;
      return matchesSearch && matchesStatus;
    });
    const { key, dir } = sort;
    const factor = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      let av = a[key];
      let bv = b[key];
      if (key === "permissions") {
        av = a.permissions?.length || 0;
        bv = b.permissions?.length || 0;
      } else if (key === "expiresAt" || key === "lastUsedAt") {
        // empty dates (never expires / never used) sort last when ascending
        av = av ? new Date(av).getTime() : Number.MAX_SAFE_INTEGER;
        bv = bv ? new Date(bv).getTime() : Number.MAX_SAFE_INTEGER;
      } else {
        av = (av || "").toString().toLowerCase();
        bv = (bv || "").toString().toLowerCase();
      }
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [clients, search, status, sort]);

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
            <span className="text-gray-600">API Client Master</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">API Client Master</h2>
          <p className="text-xs text-gray-500 mt-1">Manage external applications that access the system with an API key.</p>
        </div>
        <button
          onClick={() => navigate("/api-client-master/add")}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} />
          Add API Client
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Search by name, client ID or key prefix..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="revoked">Revoked</option>
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
                  <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
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
              {filteredClients.map((client, index) => {
                const expiry = getExpiry(client.expiresAt);
                return (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3.5 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                          <KeyRound size={15} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{client.name}</p>
                          <p className="text-[11px] font-mono text-gray-400 truncate">{client.clientId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-mono">
                        {client.keyPrefix}…
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-blue-50 text-info text-xs font-medium">
                        {client.permissions?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <ApiClientStatusBadge status={client.status} />
                    </td>
                    <td className={`px-4 py-3.5 whitespace-nowrap ${expiryToneClass[expiry.tone]}`}>
                      {expiry.label}
                      {expiry.note && <span className="block text-[11px]">{expiry.note}</span>}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">{timeAgo(client.lastUsedAt)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewTarget(client)}
                          title="View"
                          className="p-1.5 text-gray-500 hover:text-info hover:bg-blue-50 rounded-md"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/api-client-master/edit/${client._id}`)}
                          title="Edit"
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-light rounded-md"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(client)}
                          title="Delete"
                          className="p-1.5 text-gray-500 hover:text-danger hover:bg-red-50 rounded-md"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {clients.length === 0 ? "No API clients found." : "No API clients match the current filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredClients.length} of {clients.length} API clients
        </div>
      </div>

      {viewTarget && (
        <Modal
          title="API Client Details"
          onClose={() => setViewTarget(null)}
          footer={
            <>
              <button
                onClick={() => setViewTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => navigate(`/api-client-master/edit/${viewTarget._id}`)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
              >
                Edit
              </button>
            </>
          }
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
              <KeyRound size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-900 truncate">{viewTarget.name}</p>
              <p className="text-[11px] font-mono text-gray-400 truncate">{viewTarget.clientId}</p>
            </div>
            <ApiClientStatusBadge status={viewTarget.status} />
          </div>
          <div className="space-y-2.5 text-sm">
            <DetailRow label="Key Prefix"><span className="font-mono text-xs">{viewTarget.keyPrefix}••••••••</span></DetailRow>
            <DetailRow label="Expires">
              <span className={expiryToneClass[getExpiry(viewTarget.expiresAt).tone]}>
                {getExpiry(viewTarget.expiresAt).label}
                {getExpiry(viewTarget.expiresAt).note ? ` (${getExpiry(viewTarget.expiresAt).note})` : ""}
              </span>
            </DetailRow>
            <DetailRow label="Last Used">{viewTarget.lastUsedAt ? formatDate(viewTarget.lastUsedAt, true) : "Never used"}</DetailRow>
            <DetailRow label="Last IP">{viewTarget.lastUsedIp || "-"}</DetailRow>
            <DetailRow label="Created On">{formatDate(viewTarget.createdAt, true)}</DetailRow>
            <DetailRow label="Updated On">{formatDate(viewTarget.updatedAt || viewTarget.createdAt, true)}</DetailRow>
            <div>
              <span className="text-gray-400 block mb-1">Description</span>
              <p className="text-gray-700 whitespace-pre-line">{viewTarget.description || "-"}</p>
            </div>
            <div>
              <span className="text-gray-400 block mb-1.5">Permissions ({viewTarget.permissions?.length || 0})</span>
              {viewTarget.permissions?.length ? (
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {viewTarget.permissions.map((p) => (
                    <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-xs">No permissions assigned.</p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete API Client"
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
            Are you sure you want to delete <span className="font-semibold text-gray-800">{deleteTarget.name}</span>? Any
            application using its key will immediately lose access. This action cannot be undone.
          </p>
        </Modal>
      )}
    </AdminLayout>
  );
}
