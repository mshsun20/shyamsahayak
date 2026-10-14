import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Download, SlidersHorizontal, Search, Link2, Pencil, MoreVertical, Trash2 } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Modal from "../../../components/Modal";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { states, districtsByState } from "../../../data/masterData";

// the API may return an Account as a populated object or just its id
const accountName = (value, accounts) => {
  if (!value) return "";
  const account = typeof value === "object" ? value : accounts.find((a) => a._id === value);
  return account?.fullName || account?.name || "";
};

const filterDefaults = { state: "All States", district: "All Districts", tm: "All TMs", dgo: "All DGOs", search: "" };

function ActionsMenu({ onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md">
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20">
            <button
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50"
            >
              <Trash2 size={13} />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function DistrictMaster() {
  const [mappings, setMappings] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch, reset } = useForm({ defaultValues: filterDefaults });
  const { state: stateFilter, district: districtFilter, tm: tmFilter, dgo: dgoFilter, search } = watch();

  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [locationResponse, accountResponse] = await Promise.allSettled([
        axiosInstance.get(`/locations`),
        axiosInstance.get(`/accounts`),
      ]);
      if (locationResponse.status === "fulfilled") {
        const data = locationResponse.value?.data?.data;
        // list may come back as the data itself or wrapped in an object (like /accounts)
        setMappings(Array.isArray(data) ? data : Object.values(data || {}).find(Array.isArray) || []);
      } else {
        const error = locationResponse.reason;
        console.error(error.message);
        dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
        setMappings([]);
      }
      // accounts are only used to show names when the API returns plain ids
      setAccounts(accountResponse.status === "fulfilled" ? accountResponse.value?.data?.data?.accounts || [] : []);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const rows = useMemo(
    () =>
      mappings.map((m) => ({
        ...m,
        fabricatorName: accountName(m.fabricator, accounts),
        dgoName: accountName(m.dgo, accounts),
        tmName: accountName(m.tm, accounts),
        dealerName: accountName(m.dealer, accounts),
        distributorName: accountName(m.distributor, accounts),
      })),
    [mappings, accounts]
  );
  const tmOptions = [...new Set(rows.map((r) => r.tmName).filter(Boolean))];
  const dgoOptions = [...new Set(rows.map((r) => r.dgoName).filter(Boolean))];

  const availableDistricts = stateFilter === "All States" ? [] : districtsByState[stateFilter] || [];

  const filteredMappings = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter((m) => {
      const matchesState = stateFilter === "All States" || m.state === stateFilter;
      const matchesDistrict = districtFilter === "All Districts" || m.district === districtFilter;
      const matchesTm = tmFilter === "All TMs" || m.tmName === tmFilter;
      const matchesDgo = dgoFilter === "All DGOs" || m.dgoName === dgoFilter;
      const matchesSearch =
        !q ||
        m.fabricatorName.toLowerCase().includes(q) ||
        m.dealerName.toLowerCase().includes(q) ||
        m.distributorName.toLowerCase().includes(q);
      return matchesState && matchesDistrict && matchesTm && matchesDgo && matchesSearch;
    });
  }, [rows, stateFilter, districtFilter, tmFilter, dgoFilter, search]);

  const clearFilters = () => reset(filterDefaults);

  const handleExport = () => {
    const headers = ["Code", "State", "District", "Fabricator", "DGO", "TM", "Dealer", "Distributor", "Status"];
    const exportRows = filteredMappings.map((m) => [m.code, m.state, m.district, m.fabricatorName, m.dgoName, m.tmName, m.dealerName, m.distributorName, m.status]);
    const csvContent = [headers, ...exportRows].map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "district-mappings.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setIsLoading(true);
    try {
      await axiosInstance.delete(`/locations/${target._id}`);
      dispatch(showSnackbar({ message: "Mapping deleted successfully", type: "success" }));
      await fetchData();
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout title="Master Data">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">District Master</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Maintain and manage the hierarchy mapping of State → District → Fabricator → DGO → TM → Dealer → DB (Distributor).
          </p>
        </div>
        <button
          onClick={() => navigate("/district-master/add")}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg shrink-0"
        >
          <Plus size={15} />
          Add Mapping
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">State</label>
            <select {...register("state")} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>All States</option>
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">District</label>
            <select {...register("district")} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>All Districts</option>
              {availableDistricts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">TM</label>
            <select {...register("tm")} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>All TMs</option>
              {tmOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">DGO</label>
            <select {...register("dgo")} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option>All DGOs</option>
              {dgoOptions.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Search</label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                {...register("search")}
                placeholder="Search by Fabricator, Dealer, DB..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs font-medium text-primary">
            <SlidersHorizontal size={12} />
            Clear Filters
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <Link2 size={14} />
          Total Mappings: {mappings.length}
        </span>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-700 px-3.5 py-2 rounded-lg hover:bg-gray-50"
        >
          <Download size={15} />
          Export
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">District</th>
                <th className="px-4 py-3 font-semibold">Fabricator</th>
                <th className="px-4 py-3 font-semibold">DGO</th>
                <th className="px-4 py-3 font-semibold">TM</th>
                <th className="px-4 py-3 font-semibold">Dealer</th>
                <th className="px-4 py-3 font-semibold">Distributor</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMappings.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">{m.code}</td>
                  <td className="px-4 py-3 text-gray-700">{m.state}</td>
                  <td className="px-4 py-3 text-gray-700">{m.district}</td>
                  <td className="px-4 py-3 text-gray-700">{m.fabricatorName || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{m.dgoName || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{m.tmName || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{m.dealerName || "-"}</td>
                  <td className="px-4 py-3 text-gray-700">{m.distributorName || "-"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        m.status === "Active" ? "bg-green-50 text-success" : "bg-red-50 text-danger"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/district-master/edit/${m._id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                      <ActionsMenu onDelete={() => setDeleteTarget(m)} />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredMappings.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No mappings match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredMappings.length} of {mappings.length} mappings
        </div>
      </div>

      {deleteTarget && (
        <Modal
          title="Delete Mapping"
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
            Are you sure you want to delete the mapping <span className="font-semibold text-gray-800">{deleteTarget.code}</span>? This action cannot be undone.
          </p>
        </Modal>
      )}
    </AdminLayout>
  );
}