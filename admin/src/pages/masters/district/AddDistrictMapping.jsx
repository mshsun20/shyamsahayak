import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  Map,
  Landmark,
  Factory,
  UserCircle2,
  Users,
  Home,
  ArrowLeftRight,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { states, districtsByState } from "../../../data/masterData";

const emptyForm = {
  code: "",
  status: "Active",
  state: "",
  district: "",
  fabricator: "",
  dgo: "",
  tm: "",
  dealer: "",
  distributor: "",
};

const previewSteps = [
  { key: "state", label: "State", icon: Map },
  { key: "district", label: "District", icon: Landmark },
  { key: "fabricator", label: "Fabricator", icon: Factory },
  { key: "dgo", label: "DGO", icon: UserCircle2 },
  { key: "tm", label: "TM", icon: Users },
  { key: "dealer", label: "Dealer", icon: Home },
  { key: "distributor", label: "DB (Distributor)", icon: ArrowLeftRight },
];

// account role used to narrow each selector (all accounts are shown if none has that role)
const accountRoles = { fabricator: "Fabricator", dgo: "DGO", tm: "TM", dealer: "Dealer", distributor: "Distributor" };
const optionalAccounts = ["dgo", "tm", "dealer", "distributor"];

// the API may return an Account as a populated object or just its id
const refId = (value) => (value && typeof value === "object" ? value._id : value || "");

// keep a saved value selectable even if it is not in the static list
const withCurrent = (list, value) => (value && !list.includes(value) ? [...list, value] : list);

export default function AddDistrictMapping() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mapping, setMapping] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: emptyForm,
    mode: "onSubmit",
  });

  const values = watch();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [accountResponse, mappingResponse] = await Promise.allSettled([
        axiosInstance.get(`/accounts`),
        isEdit ? axiosInstance.get(`/location-mapping/${id}`) : Promise.resolve(null),
      ]);
      [accountResponse, mappingResponse].forEach((result) => {
        if (result.status === "rejected") {
          console.error(result.reason.message);
          dispatch(showSnackbar({ message: result.reason.response?.data?.message || result.reason.message, type: "error" }));
        }
      });
      if (accountResponse.status === "fulfilled") {
        setAccounts(accountResponse.value?.data?.data?.accounts || []);
      }
      if (mappingResponse.status === "fulfilled") {
        setMapping(mappingResponse.value?.data?.data || null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, isEdit, dispatch]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // runs again when the accounts arrive so the saved selections are applied to loaded options
  useEffect(() => {
    if (isEdit && mapping) {
      reset({
        code: mapping.code || "",
        status: mapping.status || "Active",
        state: mapping.state || "",
        district: mapping.district || "",
        fabricator: refId(mapping.fabricator),
        dgo: refId(mapping.dgo),
        tm: refId(mapping.tm),
        dealer: refId(mapping.dealer),
        distributor: refId(mapping.distributor),
      });
    }
  }, [isEdit, mapping, accounts, reset]);

  const availableDistricts = withCurrent(values.state ? districtsByState[values.state] || [] : [], values.district);

  const accountOptions = (key) => {
    const sameRole = accounts.filter((a) => a.role?.name?.toLowerCase() === accountRoles[key].toLowerCase());
    return sameRole.length ? sameRole : accounts;
  };

  const onSubmit = async (data) => {
    const payload = {
      code: data.code.trim(),
      state: data.state,
      district: data.district,
      fabricator: data.fabricator,
      status: data.status,
    };
    optionalAccounts.forEach((key) => {
      if (data[key]) payload[key] = data[key];
      // clear a reference that was saved before; never send an empty id
      else if (isEdit && refId(mapping?.[key])) payload[key] = null;
    });

    try {
      if (isEdit) {
        await axiosInstance.patch(`/location-mapping/${id}`, payload);
      } else {
        await axiosInstance.post(`/location-mapping`, payload);
      }
      dispatch(showSnackbar({ message: isEdit ? "Mapping updated successfully" : "Mapping created successfully", type: "success" }));
      navigate("/district-master");
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const requiredFilled = ["state", "district", "fabricator"].every((k) => Boolean(values[k]));

  // preview shows account names, not ids
  const previewValue = (key) =>
    accountRoles[key] ? accounts.find((a) => a._id === values[key])?.fullName || "" : values[key];

  const selectClass = (field) =>
    `w-full text-sm border rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  return (
    <AdminLayout title="Master Data">
      {isLoading && <Loader />}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/district-master" className="hover:text-primary">District Master</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">{isEdit ? "Edit Mapping" : "Add Mapping"}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit District Mapping" : "Add District Mapping"}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Map the hierarchy of State → District → Fabricator → DGO → TM → Dealer → DB (Distributor).
          </p>
        </div>
        <button
          onClick={() => navigate("/district-master")}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3.5 py-2 hover:bg-gray-50 shrink-0"
        >
          <ArrowLeft size={14} />
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-4xl" noValidate>
        {/* Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Mapping Details</p>
              <p className="text-xs text-gray-400 mt-1">Enter code and status</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Code *</label>
              <input
                {...register("code", { required: "Code is required.", validate: (v) => v.trim() !== "" || "Code is required." })}
                placeholder="Enter mapping code"
                className={selectClass("code")}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
              <select {...register("status")} className={selectClass("status")}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div />
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Location</p>
              <p className="text-xs text-gray-400 mt-1">Select state and district</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">State *</label>
              <select
                {...register("state", { required: "State is required." })}
                onChange={(e) => {
                  setValue("state", e.target.value);
                  setValue("district", "");
                }}
                className={selectClass("state")}
              >
                <option value="">Select State</option>
                {withCurrent(states, values.state).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">District *</label>
              <select
                {...register("district", { required: "District is required." })}
                disabled={!values.state}
                className={`${selectClass("district")} ${!values.state ? "bg-gray-50 text-gray-400" : ""}`}
              >
                <option value="">Select District</option>
                {availableDistricts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue("state", "");
                setValue("district", "");
              }}
              className="flex items-center gap-1 text-xs font-medium text-success self-end mb-2.5"
            >
              <CheckCircle2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Fabricator */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Fabricator</p>
              <p className="text-xs text-gray-400 mt-1">Select fabricator under the selected district</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Fabricator *</label>
              <select {...register("fabricator", { required: "Fabricator is required." })} className={selectClass("fabricator")}>
                <option value="">Select Fabricator</option>
                {accountOptions("fabricator").map((a) => (
                  <option key={a._id} value={a._id}>{a.fullName}</option>
                ))}
              </select>
            </div>
            <div />
            <button
              type="button"
              onClick={() => setValue("fabricator", "")}
              className="flex items-center gap-1 text-xs font-medium text-success self-end mb-2.5"
            >
              <CheckCircle2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Team Mapping */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Team Mapping</p>
              <p className="text-xs text-gray-400 mt-1">Select DGO and TM under the fabricator</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">DGO</label>
              <select {...register("dgo")} className={selectClass("dgo")}>
                <option value="">Select DGO</option>
                {accountOptions("dgo").map((a) => (
                  <option key={a._id} value={a._id}>{a.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">TM</label>
              <select {...register("tm")} className={selectClass("tm")}>
                <option value="">Select TM</option>
                {accountOptions("tm").map((a) => (
                  <option key={a._id} value={a._id}>{a.fullName}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue("dgo", "");
                setValue("tm", "");
              }}
              className="flex items-center gap-1 text-xs font-medium text-success self-end mb-2.5"
            >
              <CheckCircle2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Channel Mapping */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Channel Mapping</p>
              <p className="text-xs text-gray-400 mt-1">Select dealer and DB under the TM</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Dealer</label>
              <select {...register("dealer")} className={selectClass("dealer")}>
                <option value="">Select Dealer</option>
                {accountOptions("dealer").map((a) => (
                  <option key={a._id} value={a._id}>{a.fullName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">DB (Distributor)</label>
              <select {...register("distributor")} className={selectClass("distributor")}>
                <option value="">Select DB</option>
                {accountOptions("distributor").map((a) => (
                  <option key={a._id} value={a._id}>{a.fullName}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue("dealer", "");
                setValue("distributor", "");
              }}
              className="flex items-center gap-1 text-xs font-medium text-success self-end mb-2.5"
            >
              <CheckCircle2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Mapping Preview */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <Map size={14} className="text-info" />
            Mapping Preview
          </p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            {requiredFilled ? "Mapping is ready to be saved." : "Please complete the required selections to preview the mapping."}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
            {previewSteps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 w-24 text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      previewValue(step.key) ? "bg-primary text-white" : "bg-white text-gray-300 border border-gray-200"
                    }`}
                  >
                    <step.icon size={16} />
                  </div>
                  <span className="text-[11px] text-gray-500">{step.label}</span>
                  {previewValue(step.key) && (
                    <span className="text-[11px] font-medium text-gray-700 truncate w-24">{previewValue(step.key)}</span>
                  )}
                </div>
                {i < previewSteps.length - 1 && <ChevronRight size={14} className="text-gray-300 mb-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/district-master")}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60"
          >
            {isEdit ? "Save Changes" : "Save Mapping"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}