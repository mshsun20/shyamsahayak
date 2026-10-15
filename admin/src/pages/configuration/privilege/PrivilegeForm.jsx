import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, ChevronDown, X, Search, Check } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";

const DESCRIPTION_MAX = 250;

const emptyForm = {
  name: "",
  heirarchy: "",
  sameLevel: false,
  description: "",
  permissions: [],
  status: "Active",
};

// Multi-select dropdown for permissions coming from Permission Master.
// `value` is an array of permission ids.
function PermissionSelect({ options, value = [], onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedOptions = useMemo(
    () => value.map((id) => options.find((o) => o._id === id) || { _id: id, name: id }),
    [options, value]
  );

  const visibleOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !q || o.name?.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          <span className="text-gray-700">
            {value.length ? `${value.length} permission${value.length > 1 ? "s" : ""} selected` : "Select permissions"}
          </span>
          <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search permissions..."
                    className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {visibleOptions.map((option) => {
                  const checked = value.includes(option._id);
                  return (
                    <button
                      type="button"
                      key={option._id}
                      onClick={() => toggle(option._id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50"
                    >
                      <span
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          checked ? "bg-primary border-primary text-white" : "border-gray-300"
                        }`}
                      >
                        {checked && <Check size={11} />}
                      </span>
                      <span className="text-gray-700">{option.name}</span>
                    </button>
                  );
                })}
                {visibleOptions.length === 0 && (
                  <p className="px-3 py-3 text-xs text-gray-400 text-center">No permissions found.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedOptions.map((option) => (
            <span
              key={option._id}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
            >
              {option.name}
              <button type="button" onClick={() => toggle(option._id)} className="text-gray-400 hover:text-gray-700">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-[11px] text-gray-400 mt-1.5">Select one or more permissions from Permission Master.</p>
    </div>
  );
}

function FieldRow({ label, required, children, alignTop }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-2 sm:gap-6 ${alignTop ? "sm:items-start" : "sm:items-center"}`}>
      <label className={`sm:w-36 shrink-0 text-sm font-semibold text-gray-800 ${alignTop ? "sm:pt-2.5" : ""}`}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

export default function PrivilegeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [permissionOptions, setPermissionOptions] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: emptyForm, mode: "onSubmit" });

  const description = watch("description") || "";

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/permissions`);
      const data = response?.data?.data;
      const list = Array.isArray(data) ? data : data?.permissions || [];
      setPermissionOptions(list.filter((p) => !p.status || p.status === "Active"));
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  }, [dispatch]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/privileges/${id}`);
      const privilege = response?.data?.data;
      if (privilege) {
        const permissionIds = (privilege.permissions || []).map((p) => (typeof p === "object" ? p._id : p));
        // keep populated permissions selectable even if they are not in the active options list
        const populated = (privilege.permissions || []).filter((p) => typeof p === "object");
        if (populated.length) {
          setPermissionOptions((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            return [...prev, ...populated.filter((p) => !ids.has(p._id))];
          });
        }
        reset({
          ...emptyForm,
          name: privilege.name ?? "",
          heirarchy: privilege.heirarchy ?? "",
          sameLevel: Boolean(privilege.sameLevel),
          description: privilege.description ?? "",
          permissions: permissionIds,
          status: privilege.status || "Active",
        });
      }
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    } finally {
      setIsLoading(false);
    }
  }, [id, reset, dispatch]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (isEdit) {
      fetchData();
    }
  }, [isEdit, fetchData]);

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      heirarchy: Number(data.heirarchy),
      sameLevel: Boolean(data.sameLevel),
      description: data.description?.trim() || "",
      status: data.status,
    };

    try {
      if (isEdit) {
        await axiosInstance.patch(`/privileges/${id}`, payload);
        // permissions are assigned through their own endpoint
        await axiosInstance.put(`/privileges/${id}/permissions`, { permissions: data.permissions || [] });
      } else {
        await axiosInstance.post(`/privileges`, { ...payload, permissions: data.permissions || [] });
      }
      dispatch(
        showSnackbar({
          message: isEdit ? "Privilege updated successfully" : "Privilege created successfully",
          type: "success",
        })
      );
      navigate("/privilege-master");
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  const title = isEdit ? "Edit Privilege" : "Add Privilege";

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="mb-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          <span>Configuration</span>
          <ChevronRight size={12} />
          <Link to="/privilege-master" className="hover:text-primary">Privilege Master</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">{title}</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {isEdit ? "Update the privilege details below." : "Create a new privilege with required details."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4" noValidate>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-semibold text-gray-900 mb-5">Privilege Details</p>

          <div className="space-y-5">
            <FieldRow label="Name" required>
              <input
                placeholder="Enter privilege name"
                {...register("name", {
                  required: "Privilege name is required.",
                  validate: (v) => v.trim() !== "" || "Privilege name is required.",
                })}
                className={inputClass("name")}
              />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </FieldRow>

            <FieldRow label="Hierarchy" required>
              <input
                type="number"
                min={1}
                step={1}
                placeholder="Enter hierarchy level"
                {...register("heirarchy", {
                  required: "Hierarchy is required.",
                  min: { value: 1, message: "Hierarchy must be 1 or more." },
                  validate: (v) => Number.isInteger(Number(v)) || "Hierarchy must be a whole number.",
                })}
                className={`${inputClass("heirarchy")} max-w-[260px]`}
              />
              {errors.heirarchy && <p className="text-xs text-danger mt-1">{errors.heirarchy.message}</p>}
            </FieldRow>

            <FieldRow label="Same Level" required alignTop>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer sm:pt-2.5">
                <input
                  type="checkbox"
                  {...register("sameLevel")}
                  className="w-4 h-4 rounded border-gray-300 accent-primary"
                />
                Yes
              </label>
              <p className="text-[11px] text-gray-400 mt-1">Set this privilege at the same hierarchy level.</p>
            </FieldRow>

            <FieldRow label="Description" alignTop>
              <div className="relative">
                <textarea
                  rows={4}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Enter description (optional)"
                  {...register("description", {
                    maxLength: { value: DESCRIPTION_MAX, message: `Maximum ${DESCRIPTION_MAX} characters.` },
                  })}
                  className={`${inputClass("description")} resize-none pb-6`}
                />
                <span className="absolute right-3 bottom-2.5 text-[11px] text-gray-400">
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
              {errors.description && <p className="text-xs text-danger mt-1">{errors.description.message}</p>}
            </FieldRow>

            <FieldRow label="Permission" alignTop>
              <Controller
                name="permissions"
                control={control}
                render={({ field }) => (
                  <PermissionSelect options={permissionOptions} value={field.value} onChange={field.onChange} />
                )}
              />
            </FieldRow>

            <FieldRow label="Status" required>
              <select {...register("status", { required: true })} className={inputClass("status")}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </FieldRow>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/privilege-master")}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}