import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import {
  ICON_NAMES, THEMES, DEFAULT_THEME, CategoryIcon, CategoryPreview, matchTheme, makeCode,
} from "./knowledgeBaseCategoryUtils";

const NAME_MAX = 60;
const DESC_MAX = 120;

const emptyForm = {
  name: "",
  // code: "",
  description: "",
  icon: "Layers",
  bg: DEFAULT_THEME.bg,
  iconBg: DEFAULT_THEME.iconBg,
  arrow: DEFAULT_THEME.arrow,
  border: DEFAULT_THEME.border,
  status: "Active",
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

export default function KnowledgeBaseCategoryForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: emptyForm, mode: "onSubmit" });

  const name = watch("name") || "";
  // const code = watch("code") || "";
  const description = watch("description") || "";
  const icon = watch("icon");
  const status = watch("status");
  const style = { bg: watch("bg"), iconBg: watch("iconBg"), arrow: watch("arrow"), border: watch("border") };
  const activeTheme = matchTheme(style);

  // The API has no "get one" endpoint for categories, so the record is picked out of the list.
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/knowledge-bases/categories`, { params: { status: "all" } });
      const data = response?.data?.data;
      const list = Array.isArray(data) ? data : data?.categories || [];
      const category = list.find((c) => c._id === id);
      if (!category) {
        dispatch(showSnackbar({ message: "Category not found", type: "error" }));
        navigate("/kb-category-master");
        return;
      }
      reset({
        ...emptyForm,
        name: category.name ?? "",
        // code: category.code ?? "",
        description: category.description ?? "",
        icon: category.icon || emptyForm.icon,
        bg: category.bg ?? "",
        iconBg: category.iconBg ?? "",
        arrow: category.arrow ?? "",
        border: category.border ?? "",
        status: category.status || "Active",
      });
      if (matchTheme(category) === "custom") setShowAdvanced(true);
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    } finally {
      setIsLoading(false);
    }
  }, [id, reset, dispatch, navigate]);

  useEffect(() => {
    if (isEdit) {
      fetchData();
    }
  }, [isEdit, fetchData]);

  const applyTheme = (theme) => {
    ["bg", "iconBg", "arrow", "border"].forEach((k) => setValue(k, theme[k], { shouldDirty: true }));
  };

  const onSubmit = async (data) => {
    const payload = {
      name: data.name.trim(),
      description: data.description?.trim() || "",
      icon: data.icon,
      bg: data.bg?.trim() || "",
      iconBg: data.iconBg?.trim() || "",
      arrow: data.arrow?.trim() || "",
      border: data.border?.trim() || "",
      status: data.status,
    };
    // An empty code must not be sent: the server generates one from the name.
    // if (data.code?.trim()) payload.code = data.code.trim();

    try {
      if (isEdit) {
        await axiosInstance.patch(`/knowledge-bases/categories/${id}`, payload);
      } else {
        await axiosInstance.post(`/knowledge-bases/categories`, payload);
      }
      dispatch(
        showSnackbar({
          message: isEdit ? "Category updated successfully" : "Category created successfully",
          type: "success",
        })
      );
      navigate("/kb-category-master");
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  const hint = (field, text) =>
    errors[field] ? (
      <p className="text-xs text-danger mt-1">{errors[field].message}</p>
    ) : (
      <p className="text-[11px] text-gray-400 mt-1">{text}</p>
    );

  const title = isEdit ? "Edit Category" : "Add Category";

  const actions = (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={() => navigate("/kb-category-master")}
        className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60"
      >
        {isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
      </button>
    </div>
  );

  return (
    <AdminLayout title="Configuration">
      {isLoading && <Loader />}
      <div className="mb-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
          <span>Configuration</span>
          <ChevronRight size={12} />
          <Link to="/kb-category-master" className="hover:text-primary">Knowledge Category Master</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">{title}</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {isEdit ? "Update the category details and how it appears in the app." : "Create a new category for Knowledge Base articles."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5" noValidate>
        {/* ---------------- Details ---------------- */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Category Details</p>
          </div>
          <div className="px-5 py-5 space-y-5">
            <FieldRow label="Name" required hint={hint("name", "Shown to users in the mobile app. Example: Installation")}>
              <input
                type="text"
                maxLength={NAME_MAX}
                placeholder="Enter category name"
                {...register("name", {
                  required: "Category name is required.",
                  validate: (v) => v.trim().length > 0 || "Category name is required.",
                  maxLength: { value: NAME_MAX, message: `Maximum ${NAME_MAX} characters.` },
                })}
                className={inputClass("name")}
              />
            </FieldRow>

            {/* <FieldRow
              label="Code"
              hint={hint(
                "code",
                isEdit
                  ? "Unique identifier. Change with care — it may be referenced elsewhere."
                  : `Unique identifier. Leave blank to auto-generate${name.trim() ? ` (${makeCode(name) || "GENERAL"})` : ""}.`
              )}
            >
              <input
                type="text"
                maxLength={40}
                placeholder="e.g. INSTALLATION"
                {...register("code", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_");
                  },
                  validate: (v) => !v || /^[A-Z0-9_]{2,40}$/.test(v) || "Use 2-40 characters: A-Z, 0-9 and underscore.",
                })}
                className={`${inputClass("code")} font-mono`}
              />
            </FieldRow> */}

            <FieldRow label="Description">
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={DESC_MAX}
                  placeholder="Enter a short description (optional)"
                  {...register("description", {
                    maxLength: { value: DESC_MAX, message: `Maximum ${DESC_MAX} characters.` },
                  })}
                  className={`${inputClass("description")} resize-none pb-6`}
                />
                <span className="absolute right-3 bottom-2.5 text-[11px] text-gray-400">
                  {description.length}/{DESC_MAX}
                </span>
              </div>
              {errors.description ? (
                <p className="text-xs text-danger mt-1">{errors.description.message}</p>
              ) : (
                <p className="text-[11px] text-gray-400 mt-1">Appears under the name on the category card.</p>
              )}
            </FieldRow>
          </div>
        </div>

        {/* ---------------- Appearance ---------------- */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Appearance</p>
          </div>
          <div className="px-5 py-5 space-y-5">
            <FieldRow label="Icon" hint={<p className="text-[11px] text-gray-400 mt-1">Stored by name, e.g. “{icon}”.</p>}>
              <input type="hidden" {...register("icon")} />
              <div className="grid grid-cols-8 gap-2 max-w-md">
                {ICON_NAMES.map((n) => (
                  <button
                    key={n}
                    type="button"
                    title={n}
                    onClick={() => setValue("icon", n, { shouldDirty: true })}
                    className={`h-10 rounded-lg border flex items-center justify-center ${
                      icon === n
                        ? "border-primary bg-primary-light text-primary"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <CategoryIcon name={n} size={17} strokeWidth={2} />
                  </button>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="Colour Theme" hint={<p className="text-[11px] text-gray-400 mt-1">Sets background, icon, arrow and border together.</p>}>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => applyTheme(t)}
                    className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border text-xs font-medium ${
                      activeTheme === t.key
                        ? "border-primary bg-primary-light text-primary"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full" style={{ background: t.swatch }} />
                    {t.label}
                  </button>
                ))}
                {activeTheme === "custom" && (
                  <span className="flex items-center px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500">
                    Custom
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowAdvanced((v) => !v)}
                className="mt-3 flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800"
              >
                <ChevronDown size={14} className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                Advanced style tokens
              </button>
              {showAdvanced && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    ["bg", "Card background", "bg-orange-50"],
                    ["iconBg", "Icon background", "bg-brand"],
                    ["arrow", "Arrow colour", "text-brand"],
                    ["border", "Card border (CSS)", "0.1rem solid #ffeed9"],
                  ].map(([field, label, ph]) => (
                    <div key={field}>
                      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
                      <input
                        type="text"
                        placeholder={ph}
                        {...register(field)}
                        className={`${inputClass(field)} font-mono text-xs`}
                      />
                    </div>
                  ))}
                  <p className="sm:col-span-2 text-[11px] text-gray-400">
                    Class names must exist in the mobile app’s Tailwind build; presets above are always safe.
                  </p>
                </div>
              )}
            </FieldRow>

            <FieldRow label="Preview" hint={<p className="text-[11px] text-gray-400 mt-1">How the card looks under “Browse by Category”.</p>}>
              <div className="inline-flex rounded-lg bg-gray-50 border border-gray-100 p-4">
                <CategoryPreview name={name.trim()} description={description.trim()} icon={icon} {...style} />
              </div>
            </FieldRow>
          </div>
        </div>

        {/* ---------------- Status ---------------- */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Status</p>
          </div>
          <div className="px-5 py-5">
            <FieldRow label="Status" required hint={hint("status", "Inactive categories are hidden from the mobile app.")}>
              <select
                {...register("status", { required: "Status is required." })}
                className={`${inputClass("status")} ${status ? "text-gray-800" : "text-gray-400"}`}
              >
                <option value="Active" className="text-gray-800">Active</option>
                <option value="Inactive" className="text-gray-800">Inactive</option>
              </select>
            </FieldRow>

            {/* Edit design keeps the buttons inside the Status card */}
            {isEdit && <div className="mt-6 pt-5 border-t border-gray-100">{actions}</div>}
          </div>
        </div>

        {/* Add design places the buttons below the cards */}
        {!isEdit && actions}
      </form>
    </AdminLayout>
  );
}
