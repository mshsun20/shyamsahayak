import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, ChevronRight } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate } from "../../configuration/privilege/privilegeUtils";

const filterDefaults = {
  search: "",
  visitType: "All",
  partyName: "All",
  employeeCode: "All",
  district: "All",
  date: "",
};

// visitDate is stored as an array (one entry per occurrence) — show the most recent one
const visitDates = (v) => (Array.isArray(v.visitDate) ? v.visitDate : v.visitDate ? [v.visitDate] : []);
const latestVisitDate = (v) => {
  const times = visitDates(v)
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : null;
};

// compare by local calendar day (YYYY-MM-DD), matching the <input type="date"> value
const toDayKey = (d) => {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const uniqueSorted = (list, key) =>
  [...new Set(list.map((item) => item[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

function NewVisitBadge({ value }) {
  return value ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-green-50 text-success border border-green-100">
      Yes
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-danger border border-red-100">
      No
    </span>
  );
}

const selectClass =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30";

function FilterSelect({ label, options, registration }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-700 mb-1.5">{label}</span>
      <select {...registration} className={selectClass}>
        <option value="All">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Visits() {
  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch } = useForm({ defaultValues: filterDefaults });
  const filters = watch();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/visits`);
      const data = response?.data?.data;
      setVisits(Array.isArray(data) ? data : data?.visits || []);
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

  const options = useMemo(
    () => ({
      visitType: uniqueSorted(visits, "visitType"),
      partyName: uniqueSorted(visits, "partyName"),
      employeeCode: uniqueSorted(visits, "employeeCode"),
      district: uniqueSorted(visits, "district"),
    }),
    [visits]
  );

  const filteredVisits = useMemo(() => {
    const q = (filters.search || "").trim().toLowerCase();
    const match = (value, selected) => !selected || selected === "All" || value === selected;
    return visits
      .filter((v) => {
        const matchesSearch =
          !q ||
          [v.visitType, v.visitName, v.partyName, v.employeeCode, v.employeeName, v.state, v.district].some((f) =>
            f?.toString().toLowerCase().includes(q)
          );
        const matchesDate = !filters.date || visitDates(v).some((d) => toDayKey(d) === filters.date);
        return (
          matchesSearch &&
          matchesDate &&
          match(v.visitType, filters.visitType) &&
          match(v.partyName, filters.partyName) &&
          match(v.employeeCode, filters.employeeCode) &&
          match(v.district, filters.district)
        );
      })
      .sort((a, b) => (latestVisitDate(b)?.getTime() || 0) - (latestVisitDate(a)?.getTime() || 0));
  }, [visits, filters.search, filters.visitType, filters.partyName, filters.employeeCode, filters.district, filters.date]);

  return (
    <AdminLayout title="Activities">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <span>Activities</span>
            <ChevronRight size={12} />
            <span className="text-gray-600">Visit</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Visit</h2>
          <p className="text-xs text-gray-500 mt-1">Manage and view field visits recorded in the system.</p>
        </div>
        <button
          onClick={() => navigate("/visits/add")}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
        >
          <Plus size={15} />
          Add Visit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] items-end gap-3 mt-6">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            {...register("search")}
            placeholder="Search by visit, party, employee or location..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <FilterSelect label="Visit Type" options={options.visitType} registration={register("visitType")} />
        <FilterSelect label="Party Name" options={options.partyName} registration={register("partyName")} />
        <FilterSelect label="Employee Code" options={options.employeeCode} registration={register("employeeCode")} />
        <FilterSelect label="District" options={options.district} registration={register("district")} />
      </div>
      <div className="mt-3 mb-5">
        <label className="block w-full sm:w-44">
          <span className="block text-xs font-medium text-gray-700 mb-1.5">Date</span>
          <input
            type="date"
            {...register("date")}
            className={`w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              filters.date ? "text-gray-700" : "text-gray-400"
            }`}
          />
        </label>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-600 border-b border-gray-200">
                <th className="px-4 py-3 font-semibold">Visit Type</th>
                <th className="px-4 py-3 font-semibold">Visit Name</th>
                <th className="px-4 py-3 font-semibold">Visit Date</th>
                <th className="px-4 py-3 font-semibold">Party Name</th>
                <th className="px-4 py-3 font-semibold">Employee Code</th>
                <th className="px-4 py-3 font-semibold">Employee Name</th>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">District</th>
                <th className="px-4 py-3 font-semibold text-center">New Visit</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredVisits.map((visit) => (
                <tr key={visit._id} className="hover:bg-gray-50 text-xs">
                  <td className="px-4 py-3.5 text-gray-700">{visit.visitType || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-900 max-w-[140px]">{visit.visitName || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-600 max-w-[90px]">{formatDate(latestVisitDate(visit))}</td>
                  <td className="px-4 py-3.5 text-gray-700 max-w-[130px]">{visit.partyName || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-700">{visit.employeeCode || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-700 max-w-[120px]">{visit.employeeName || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-700 max-w-[110px]">{visit.state || "-"}</td>
                  <td className="px-4 py-3.5 text-gray-700">{visit.district || "-"}</td>
                  <td className="px-4 py-3.5 text-center">
                    <NewVisitBadge value={visit.newVisit} />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => navigate(`/visits/${visit._id}`)}
                        title="View"
                        className="p-1.5 text-gray-500 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredVisits.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {visits.length === 0 ? "No visits found." : "No visits match the current filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredVisits.length} of {visits.length} visits
        </div>
      </div>
    </AdminLayout>
  );
}
