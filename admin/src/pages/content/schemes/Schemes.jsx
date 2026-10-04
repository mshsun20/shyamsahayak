import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Plus,
  Layers,
  SlidersHorizontal,
  Pencil,
  MoreVertical,
  ChevronRight,
  ChevronsUpDown,
  Trash2,
  Eye,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Modal from "../../../components/Modal";
// import { deleteScheme } from "../../../redux/store";
import { schemeTypes, applicableOnOptions, schemeStatuses } from "../../../data/content";

const filterDefaults = {
  search: "",
  schemeType: "All Types",
  applicableOn: "All Products",
  status: "All Status",
};

const typeBadge = {
  Discount: "bg-blue-50 text-info",
  Cashback: "bg-green-50 text-success",
  Combo: "bg-purple-50 text-purple-600",
  Loyalty: "bg-teal-50 text-teal-600",
};

const statusBadge = {
  Draft: "bg-gray-100 text-gray-500",
  Upcoming: "bg-amber-50 text-warning",
  Active: "bg-green-50 text-success",
  Expired: "bg-red-50 text-danger",
};

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function ActionsMenu({ onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md"
      >
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

export default function Schemes() {
  const schemes = [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, watch, reset } = useForm({ defaultValues: filterDefaults });
  const { search, schemeType, applicableOn, status } = watch();

  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [viewScheme, setViewScheme] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredSchemes = useMemo(() => {
    let list = schemes.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        s.name.toLowerCase().includes(q) || s.shortDescription.toLowerCase().includes(q);
      const matchesType = schemeType === "All Types" || s.schemeType === schemeType;
      const matchesApplicable = applicableOn === "All Products" || s.applicableOn === applicableOn;
      const matchesStatus = status === "All Status" || s.status === status;
      return matchesSearch && matchesType && matchesApplicable && matchesStatus;
    });

    if (sortKey) {
      list = [...list].sort((a, b) => {
        let av = a[sortKey];
        let bv = b[sortKey];
        if (sortKey === "validityPeriod") {
          av = a.startDate;
          bv = b.startDate;
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [schemes, search, schemeType, applicableOn, status, sortKey, sortDir]);

  const clearFilters = () => reset(filterDefaults);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      // dispatch(deleteScheme(deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const SortHeader = ({ label, sortField }) => (
    <button onClick={() => toggleSort(sortField)} className="flex items-center gap-1 font-semibold">
      {label}
      <ChevronsUpDown size={12} className="text-gray-300" />
    </button>
  );

  return (
    <AdminLayout title="Content Management">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/content" className="hover:text-primary">Content Management</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">Schemes</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Schemes</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 border border-primary text-sm font-medium text-primary px-3.5 py-2 rounded-lg hover:bg-primary-light">
            <Layers size={15} />
            Add Scheme in Bulk
          </button>
          <button
            onClick={() => navigate("/content/schemes/add")}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-3.5 py-2 rounded-lg"
          >
            <Plus size={15} />
            Add Scheme
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 my-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              {...register("search")}
              placeholder="Search schemes..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <select
            {...register("schemeType")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Types</option>
            {schemeTypes.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <select
            {...register("applicableOn")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {applicableOnOptions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>

          <select
            {...register("status")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option>All Status</option>
            {schemeStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <button className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50">
            <SlidersHorizontal size={14} />
            Filters
          </button>

          <button onClick={clearFilters} className="text-xs font-medium text-primary ml-auto">
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Scheme Name</th>
                <th className="px-4 py-3">Scheme Type</th>
                <th className="px-4 py-3"><SortHeader label="Applicable On" sortField="applicableOn" /></th>
                <th className="px-4 py-3"><SortHeader label="Validity Period" sortField="validityPeriod" /></th>
                <th className="px-4 py-3"><SortHeader label="Status" sortField="status" /></th>
                <th className="px-4 py-3 font-semibold">Created On</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSchemes.map((scheme) => (
                <tr key={scheme.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800">{scheme.name}</p>
                    <p className="text-xs text-gray-400">{scheme.shortDescription}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${typeBadge[scheme.schemeType]}`}>
                      {scheme.schemeType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{scheme.applicableProducts || scheme.applicableOn}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {scheme.noExpiry ? "No Expiry" : `${formatDate(scheme.startDate)} - ${formatDate(scheme.endDate)}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[scheme.status]}`}>
                      {scheme.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700">{scheme.createdOn}</p>
                    <p className="text-xs text-gray-400">{scheme.createdTime} · {scheme.createdBy}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewScheme(scheme)}
                        title="View"
                        className="p-1.5 text-gray-400 hover:text-info hover:bg-blue-50 rounded-md"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/content/schemes/edit/${scheme.id}`)}
                        title="Edit"
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-md"
                      >
                        <Pencil size={15} />
                      </button>
                      <ActionsMenu onDelete={() => setDeleteTarget(scheme)} />
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSchemes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No schemes match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredSchemes.length} of {schemes.length} schemes
        </div>
      </div>

      {viewScheme && (
        <Modal title="Scheme Details" onClose={() => setViewScheme(null)}>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Scheme Name</span><span className="text-gray-800 font-medium">{viewScheme.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Type</span><span className="text-gray-800">{viewScheme.schemeType}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Applicable On</span><span className="text-gray-800">{viewScheme.applicableProducts || viewScheme.applicableOn}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Validity</span><span className="text-gray-800">{viewScheme.noExpiry ? "No Expiry" : `${formatDate(viewScheme.startDate)} - ${formatDate(viewScheme.endDate)}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Status</span><StatusPill status={viewScheme.status} /></div>
            <div className="flex justify-between"><span className="text-gray-400">Benefit</span><span className="text-gray-800">{viewScheme.benefitValue}{viewScheme.benefitType === "Percentage" ? "%" : ""} ({viewScheme.benefitType})</span></div>
            {viewScheme.minPurchase && (
              <div className="flex justify-between"><span className="text-gray-400">Min Purchase</span><span className="text-gray-800">₹{viewScheme.minPurchase}</span></div>
            )}
            <div>
              <span className="text-gray-400 block mb-1">Description</span>
              <p className="text-gray-700 whitespace-pre-line">{viewScheme.description}</p>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          title="Delete Scheme"
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

function StatusPill({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[status]}`}>
      {status}
    </span>
  );
}
