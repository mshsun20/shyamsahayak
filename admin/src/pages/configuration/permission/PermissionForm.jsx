import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import PermissionTable from "../PermissionTable";
import { permissionModules, permissionActions } from "../../../data/configuration";

const DESCRIPTION_MAX = 250;

const emptyForm = {
  code: "",
  module: "",
  action: "",
  name: "",
  description: "",
  status: "Active",
  permissions: [],
};

function FieldRow({ label, required, hint, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
      <label className="sm:w-44 shrink-0 text-sm font-semibold text-gray-800 sm:pt-2.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <div className="flex-1 min-w-0">
        {children}
        {hint}
      </div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
      </div>
      <div className="px-5 py-5 space-y-5">{children}</div>
    </div>
  );
}

export default function PermissionForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  // keep values coming from the API selectable even if they are not in the static lists
  const [moduleOptions, setModuleOptions] = useState(permissionModules);
  const [actionOptions, setActionOptions] = useState(permissionActions);
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
      // a permission cannot be assigned to itself
      const active = list.filter((p) => p._id !== id && (!p.status || p.status === "Active"));
      setPermissionOptions((prev) => {
        const ids = new Set(active.map((p) => p._id));
        return [...active, ...prev.filter((p) => !ids.has(p._id))];
      });
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  }, [id, dispatch]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/permissions/${id}`);
      const permission = response?.data?.data;
      if (permission) {
        if (permission.module) {
          setModuleOptions((prev) =>
            prev.some((m) => m.value === permission.module)
              ? prev
              : [...prev, { label: permission.module, value: permission.module }]
          );
        }
        if (permission.action) {
          setActionOptions((prev) => (prev.includes(permission.action) ? prev : [...prev, permission.action]));
        }
        const assigned = permission.permissions || [];
        const populated = assigned.filter((p) => typeof p === "object");
        if (populated.length) {
          setPermissionOptions((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            return [...prev, ...populated.filter((p) => !ids.has(p._id))];
          });
        }
        reset({
          ...emptyForm,
          permissions: assigned.map((p) => (typeof p === "object" ? p._id : p)),
          code: permission.code ?? "",
          module: permission.module ?? "",
          action: permission.action ?? "",
          name: permission.name ?? "",
          description: permission.description ?? "",
          status: permission.status || "Active",
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
    if (isEdit) {
      fetchData();
    }
  }, [isEdit, fetchData]);

  const onSubmit = async (data) => {
    const payload = {
      module: data.module,
      action: data.action,
      name: data.name?.trim() || "",
      description: data.description?.trim() || "",
      status: data.status,
      permissions: data.permissions || [],
    };

    try {
      if (isEdit) {
        await axiosInstance.patch(`/permissions/${id}`, payload);
      } else {
        await axiosInstance.post(`/permissions`, payload);
      }
      dispatch(
        showSnackbar({
          message: isEdit ? "Permission updated successfully" : "Permission created successfully",
          type: "success",
        })
      );
      navigate("/permission-master");
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;
  const readOnlyClass =
    "w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed";

  const hint = (field, text) =>
    errors[field] ? (
      <p className="text-xs text-danger mt-1">{errors[field].message}</p>
    ) : (
      <p className="text-[11px] text-gray-400 mt-1">{text}</p>
    );

  const title = isEdit ? "Edit Permission" : "Add Permission";

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="mb-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          <span>Configuration</span>
          <ChevronRight size={12} />
          <Link to="/permission-master" className="hover:text-primary">Permission Master</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">{title}</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {isEdit ? "Update permission details and configuration." : "Create a new permission for defining system access controls."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5" noValidate>
        <SectionCard title="Permission Details">
          {isEdit && (
            <FieldRow label="Code" hint={hint("code", "Permission code is auto-generated and cannot be changed.")}>
              <input {...register("code")} disabled className={readOnlyClass} />
            </FieldRow>
          )}

          <FieldRow label="Module" required hint={hint("module", "Select the module to which this permission belongs.")}>
            <select
              {...register("module", { required: "Module is required." })}
              className={`${inputClass("module")} ${watch("module") ? "text-gray-800" : "text-gray-400"}`}
            >
              <option value="" disabled>
                Select module
              </option>
              {moduleOptions.map((m) => (
                <option key={m.value} value={m.value} className="text-gray-800">
                  {m.label}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Action" required hint={hint("action", "Select the action for this permission.")}>
            <select
              {...register("action", { required: "Action is required." })}
              className={`${inputClass("action")} ${watch("action") ? "text-gray-800" : "text-gray-400"}`}
            >
              <option value="" disabled>
                Select action
              </option>
              {actionOptions.map((a) => (
                <option key={a} value={a} className="text-gray-800">
                  {a}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow
            label="Name"
            hint={hint("name", "Provide a unique and meaningful name for this permission.")}
          >
            <input
              placeholder="Enter permission name"
              {...register("name")}
              className={inputClass("name")}
            />
          </FieldRow>

          <FieldRow label="Description">
            <div className="relative">
              <textarea
                rows={3}
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
        </SectionCard>

        <SectionCard title={isEdit ? "Assigned Permissions" : "Assign Permissions"}>
          <p className="text-xs text-gray-500 -mt-2">Select one or more permissions from Permission Master.</p>
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <PermissionTable options={permissionOptions} value={field.value} onChange={field.onChange} />
            )}
          />
        </SectionCard>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Status</p>
          </div>
          <div className="px-5 py-5">
            <FieldRow
              label="Status"
              required
              hint={hint("status", "Set the permission status. Inactive permissions will not be available for role or privilege mapping.")}
            >
              <select {...register("status", { required: true })} className={inputClass("status")}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </FieldRow>

            <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate("/permission-master")}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Save"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}