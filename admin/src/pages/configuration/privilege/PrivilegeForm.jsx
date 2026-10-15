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

const DESCRIPTION_MAX = 250;

const emptyForm = {
  name: "",
  heirarchy: "",
  sameLevel: false,
  description: "",
  permissions: [],
  status: "Active",
};

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
      const active = list.filter((p) => !p.status || p.status === "Active");
      setPermissionOptions((prev) => {
        // keep any already-assigned permissions that came from the privilege itself
        const ids = new Set(active.map((p) => p._id));
        return [...active, ...prev.filter((p) => !ids.has(p._id))];
      });
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
                  <PermissionTable options={permissionOptions} value={field.value} onChange={field.onChange} />
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