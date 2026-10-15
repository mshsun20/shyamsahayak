import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, Search, Info } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";

const DESCRIPTION_MAX = 250;

const emptyForm = {
  code: "",
  name: "",
  level: "",
  description: "",
  permissions: [],
  status: "Active",
};

// Checkbox table of permissions from Permission Master. `value` is an array of permission ids.
function PermissionTable({ options, value = [], onChange }) {
  const [query, setQuery] = useState("");
  const [show, setShow] = useState("All");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => {
      const matchesQuery =
        !q || o.name?.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q);
      const isSelected = value.includes(o._id);
      const matchesShow = show === "All" || (show === "Selected" ? isSelected : !isSelected);
      return matchesQuery && matchesShow;
    });
  }, [options, value, query, show]);

  const allVisibleSelected = visible.length > 0 && visible.every((o) => value.includes(o._id));

  const toggle = (id) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const toggleAllVisible = () => {
    const visibleIds = visible.map((o) => o._id);
    if (allVisibleSelected) {
      onChange(value.filter((v) => !visibleIds.includes(v)));
    } else {
      onChange([...new Set([...value, ...visibleIds])]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search permissions..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Show:</span>
          <select
            value={show}
            onChange={(e) => setShow(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="All">All</option>
            <option value="Selected">Selected</option>
            <option value="Unselected">Unselected</option>
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-[1]">
              <tr className="bg-gray-50 text-left text-xs text-gray-700 border-b border-gray-200">
                <th className="px-4 py-2.5 w-12">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    disabled={visible.length === 0}
                    className="w-4 h-4 rounded border-gray-300 accent-primary align-middle"
                  />
                </th>
                <th className="px-4 py-2.5 font-semibold w-2/5">Permission Name</th>
                <th className="px-4 py-2.5 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visible.map((option) => (
                <tr
                  key={option._id}
                  onClick={() => toggle(option._id)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={value.includes(option._id)}
                      onChange={() => toggle(option._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-gray-300 accent-primary align-middle"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{option.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{option.description || "-"}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">
                    No permissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        {value.length} permission{value.length === 1 ? "" : "s"} selected
      </p>
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

export default function RoleForm() {
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
        // keep any already-assigned permissions that came from the role itself
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
      const response = await axiosInstance.get(`/roles/${id}`);
      const role = response?.data?.data;
      if (role) {
        const assigned = role.permissions || [];
        const populated = assigned.filter((p) => typeof p === "object");
        if (populated.length) {
          setPermissionOptions((prev) => {
            const ids = new Set(prev.map((p) => p._id));
            return [...prev, ...populated.filter((p) => !ids.has(p._id))];
          });
        }
        reset({
          ...emptyForm,
          code: role.code ?? "",
          name: role.name ?? "",
          level: role.level ?? "",
          description: role.description ?? "",
          permissions: assigned.map((p) => (typeof p === "object" ? p._id : p)),
          status: role.status || "Active",
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
      level: Number(data.level),
      description: data.description?.trim() || "",
      status: data.status,
    };
    // role code is fixed once created
    if (!isEdit) payload.code = data.code.trim().toUpperCase();

    try {
      if (isEdit) {
        await axiosInstance.patch(`/roles/${id}`, payload);
        // permissions are assigned through their own endpoint
        await axiosInstance.put(`/roles/${id}/permissions`, { permissions: data.permissions || [] });
      } else {
        await axiosInstance.post(`/roles`, { ...payload, permissions: data.permissions || [] });
      }
      dispatch(
        showSnackbar({
          message: isEdit ? "Role updated successfully" : "Role created successfully",
          type: "success",
        })
      );
      navigate("/role-master");
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  const title = isEdit ? "Edit Role" : "Add Role";

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="mb-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          <span>Configuration</span>
          <ChevronRight size={12} />
          <Link to="/role-master" className="hover:text-primary">Role Master</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">{title}</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {isEdit ? "Update the role details and assigned permissions." : "Create a new role and assign required permissions."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5" noValidate>
        {/* Role Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-semibold text-gray-900 mb-5">Role Details</p>

          <div className="space-y-5">
            <FieldRow label="Code" required={!isEdit} alignTop>
              <div className="relative">
                <input
                  placeholder="Enter unique role code"
                  disabled={isEdit}
                  {...register("code", {
                    validate: (v) => isEdit || v.trim() !== "" || "Role code is required.",
                    pattern: { value: /^[A-Za-z0-9_-]+$/, message: "Use letters, numbers, - or _ only." },
                  })}
                  className={`${inputClass("code")} pr-10 uppercase placeholder:normal-case ${
                    isEdit ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-gray-50"
                  }`}
                />
                <span
                  title={isEdit ? "Role code cannot be changed." : "Role code must be unique."}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  <Info size={16} />
                </span>
              </div>
              {errors.code ? (
                <p className="text-xs text-danger mt-1">{errors.code.message}</p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">
                  {isEdit ? "Role code cannot be changed." : "Role code must be unique."}
                </p>
              )}
            </FieldRow>

            <FieldRow label="Name" required>
              <input
                placeholder="Enter role name"
                {...register("name", {
                  required: "Role name is required.",
                  validate: (v) => v.trim() !== "" || "Role name is required.",
                })}
                className={inputClass("name")}
              />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </FieldRow>

            <FieldRow label="Level" required>
              <input
                type="number"
                min={1}
                step={1}
                placeholder="Enter role level"
                {...register("level", {
                  required: "Level is required.",
                  min: { value: 1, message: "Level must be 1 or more." },
                  validate: (v) => Number.isInteger(Number(v)) || "Level must be a whole number.",
                })}
                className={inputClass("level")}
              />
              {errors.level && <p className="text-xs text-danger mt-1">{errors.level.message}</p>}
            </FieldRow>

            <FieldRow label="Description" alignTop>
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={DESCRIPTION_MAX}
                  placeholder="Enter role description (optional)"
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
          </div>
        </div>

        {/* Permissions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-semibold text-gray-900">{isEdit ? "Assigned Permissions" : "Assign Permissions"}</p>
          <p className="text-xs text-gray-500 mt-0.5 mb-4">Select one or more permissions from Permission Master.</p>
          <Controller
            name="permissions"
            control={control}
            render={({ field }) => (
              <PermissionTable options={permissionOptions} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm font-semibold text-gray-900 mb-5">Status</p>
          <FieldRow label="Status" required>
            <select {...register("status", { required: true })} className={inputClass("status")}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </FieldRow>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={() => navigate("/role-master")}
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
      </form>
    </AdminLayout>
  );
}