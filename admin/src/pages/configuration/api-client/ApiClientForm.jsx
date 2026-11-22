import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, RefreshCw, Ban, ShieldAlert } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Modal from "../../../components/Modal";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { formatDate } from "../privilege/privilegeUtils";
import ApiClientPermissionPicker from "./ApiClientPermissionPicker";
import ApiKeyRevealModal from "./ApiKeyRevealModal";
import { ApiClientStatusBadge, toDateInput, fromDateInput, addDaysInput, timeAgo } from "./apiClientUtils";

const DESC_MAX = 250;

const emptyForm = {
  clientId: "",
  name: "",
  description: "",
  expiresAt: "",
  status: "active",
  permissions: [],
};

const EXPIRY_PRESETS = [
  { label: "30 days", days: 30 },
  { label: "90 days", days: 90 },
  { label: "1 year", days: 365 },
];

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

export default function ApiClientForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState(null);
  const [permissionOptions, setPermissionOptions] = useState([]);
  const [revealKey, setRevealKey] = useState(null); // { apiKey, title, afterClose }
  const [confirm, setConfirm] = useState(null); // "regenerate" | "revoke"
  const [isActing, setIsActing] = useState(false);
  const original = useRef({ permissions: [], expiresAt: "" });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: emptyForm, mode: "onSubmit" });

  const description = watch("description") || "";
  const status = watch("status");

  const showError = useCallback(
    (error) => {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    },
    [dispatch]
  );

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await axiosInstance.get(`/permissions`);
      const data = response?.data?.data;
      const list = Array.isArray(data) ? data : data?.permissions || [];
      setPermissionOptions(list.filter((p) => p.status === "Active"));
    } catch (error) {
      showError(error);
    }
  }, [showError]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/api-clients/${id}`);
      const data = response?.data?.data;
      if (data) {
        setClient(data);
        original.current = { permissions: data.permissions || [], expiresAt: toDateInput(data.expiresAt) };
        reset({
          clientId: data.clientId ?? "",
          name: data.name ?? "",
          description: data.description ?? "",
          expiresAt: toDateInput(data.expiresAt),
          status: data.status || "active",
          permissions: data.permissions || [],
        });
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, reset, showError]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (isEdit) {
      fetchData();
    }
  }, [isEdit, fetchData]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await axiosInstance.patch(`/api-clients/${id}`, {
          name: data.name.trim(),
          description: data.description?.trim() || "",
          status: data.status,
          expiresAt: fromDateInput(data.expiresAt),
        });

        // Permissions have dedicated endpoints: add the new ones, remove the dropped ones.
        const before = original.current.permissions;
        const toAdd = data.permissions.filter((p) => !before.includes(p));
        const toRemove = before.filter((p) => !data.permissions.includes(p));
        if (toAdd.length) await axiosInstance.patch(`/api-clients/${id}/permissions`, { permissions: toAdd });
        for (const permission of toRemove) {
          await axiosInstance.delete(`/api-clients/${id}/permissions`, { data: { permission } });
        }

        dispatch(showSnackbar({ message: "API client updated successfully", type: "success" }));
        navigate("/api-client-master");
      } else {
        const response = await axiosInstance.post(`/api-clients`, {
          clientId: data.clientId.trim(),
          name: data.name.trim(),
          description: data.description?.trim() || "",
          expiresAt: fromDateInput(data.expiresAt),
          permissions: data.permissions,
        });
        dispatch(showSnackbar({ message: "API client created successfully", type: "success" }));
        // The raw key is only returned now — show it before leaving the page.
        setRevealKey({
          apiKey: response?.data?.data?.apiKey,
          title: "API Client Created",
          afterClose: () => navigate("/api-client-master"),
        });
      }
    } catch (error) {
      showError(error);
    }
  };

  const runAction = async () => {
    setIsActing(true);
    try {
      if (confirm === "regenerate") {
        const response = await axiosInstance.post(`/api-clients/${id}/regenerate-key`);
        setConfirm(null);
        setRevealKey({
          apiKey: response?.data?.data?.apiKey,
          title: "New API Key Generated",
          afterClose: fetchData,
        });
      } else {
        await axiosInstance.patch(`/api-clients/${id}/revoke`);
        setConfirm(null);
        dispatch(showSnackbar({ message: "API client revoked successfully", type: "success" }));
        await fetchData();
      }
    } catch (error) {
      setConfirm(null);
      showError(error);
    } finally {
      setIsActing(false);
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

  const title = isEdit ? "Edit API Client" : "Add API Client";
  const isRevoked = client?.status === "revoked";

  const actions = (
    <div className="flex items-center justify-end gap-3">
      <button
        type="button"
        onClick={() => navigate("/api-client-master")}
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
          <Link to="/api-client-master" className="hover:text-primary">API Client Master</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">{title}</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-xs text-gray-500 mt-1">
          {isEdit
            ? "Update the client details, expiry and the permissions it is allowed to use."
            : "Register an external application. An API key is generated when you save."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-5" noValidate>
        {/* ---------------- Client details ---------------- */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Client Details</p>
          </div>
          <div className="px-5 py-5 space-y-5">
            <FieldRow
              label="Client ID"
              required
              hint={hint("clientId", isEdit ? "The client ID cannot be changed after creation." : "Unique identifier. Lowercase letters, numbers, hyphen and underscore.")}
            >
              <input
                type="text"
                placeholder="e.g. erp-integration"
                disabled={isEdit}
                {...register("clientId", {
                  onChange: (e) => {
                    e.target.value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                  },
                  required: "Client ID is required.",
                  pattern: {
                    value: /^[a-z0-9][a-z0-9_-]{2,59}$/,
                    message: "Use 3-60 characters, starting with a letter or number.",
                  },
                })}
                className={`${inputClass("clientId")} font-mono disabled:bg-gray-50 disabled:text-gray-500`}
              />
            </FieldRow>

            <FieldRow label="Name" required hint={hint("name", "Friendly name shown in the list. Example: ERP Integration")}>
              <input
                type="text"
                placeholder="Enter client name"
                {...register("name", {
                  required: "Client name is required.",
                  validate: (v) => v.trim().length > 0 || "Client name is required.",
                })}
                className={inputClass("name")}
              />
            </FieldRow>

            <FieldRow label="Description">
              <div className="relative">
                <textarea
                  rows={3}
                  maxLength={DESC_MAX}
                  placeholder="What is this client used for? (optional)"
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
                <p className="text-[11px] text-gray-400 mt-1">Helps your team remember why this key exists.</p>
              )}
            </FieldRow>
          </div>
        </div>

        {/* ---------------- Access ---------------- */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Access & Expiry</p>
          </div>
          <div className="px-5 py-5 space-y-5">
            <FieldRow label="Expires On" hint={hint("expiresAt", "Leave empty for a key that never expires.")}>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  {...register("expiresAt", {
                    validate: (v) =>
                      !v ||
                      v === original.current.expiresAt ||
                      new Date(`${v}T23:59:59`) > new Date() ||
                      "Expiry date must be in the future.",
                  })}
                  className={`${inputClass("expiresAt")} sm:w-48`}
                />
                {EXPIRY_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setValue("expiresAt", addDaysInput(p.days), { shouldDirty: true })}
                    className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setValue("expiresAt", "", { shouldDirty: true })}
                  className="px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Never
                </button>
              </div>
            </FieldRow>

            {isEdit && (
              <FieldRow label="Status" required hint={hint("status", "Inactive or revoked clients are rejected by the API.")}>
                <select
                  {...register("status", { required: "Status is required." })}
                  className={`${inputClass("status")} sm:w-48 ${status ? "text-gray-800" : "text-gray-400"}`}
                >
                  <option value="active" className="text-gray-800">Active</option>
                  <option value="inactive" className="text-gray-800">Inactive</option>
                  {isRevoked && <option value="revoked" className="text-gray-800">Revoked</option>}
                </select>
              </FieldRow>
            )}
          </div>
        </div>

        {/* ---------------- Permissions ---------------- */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">Permissions</p>
          </div>
          <div className="px-5 py-5">
            <p className="text-xs text-gray-500 mb-4">Select the actions this client may perform. Only active permissions from Permission Master are listed.</p>
            <Controller
              name="permissions"
              control={control}
              render={({ field }) => (
                <ApiClientPermissionPicker options={permissionOptions} value={field.value} onChange={field.onChange} />
              )}
            />
            {!isEdit && <div className="mt-6 pt-5 border-t border-gray-100">{actions}</div>}
          </div>
        </div>

        {/* ---------------- Security (edit only) ---------------- */}
        {isEdit && client && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">Security</p>
            </div>
            <div className="px-5 py-5 space-y-5">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Key prefix</p>
                  <p className="font-mono text-xs text-gray-800">{client.keyPrefix}••••••••</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current status</p>
                  <ApiClientStatusBadge status={client.status} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Last used</p>
                  <p className="text-gray-800">{timeAgo(client.lastUsedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Created on</p>
                  <p className="text-gray-800">{formatDate(client.createdAt, true)}</p>
                </div>
              </div>

              {isRevoked ? (
                <div className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                  <ShieldAlert size={16} className="text-danger shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 leading-relaxed">
                    This client is revoked. Its key can’t be regenerated. Set the status to Active above to re-enable it, or delete the client.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setConfirm("regenerate")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <RefreshCw size={14} />
                    Regenerate Key
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm("revoke")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    <Ban size={14} />
                    Revoke Client
                  </button>
                </div>
              )}

              {/* Edit design keeps the buttons inside the last card */}
              <div className="pt-5 border-t border-gray-100">{actions}</div>
            </div>
          </div>
        )}
      </form>

      {revealKey && (
        <ApiKeyRevealModal
          apiKey={revealKey.apiKey}
          title={revealKey.title}
          onClose={() => {
            const next = revealKey.afterClose;
            setRevealKey(null);
            next?.();
          }}
        />
      )}

      {confirm && (
        <Modal
          title={confirm === "regenerate" ? "Regenerate API Key" : "Revoke API Client"}
          onClose={() => setConfirm(null)}
          footer={
            <>
              <button
                onClick={() => setConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={runAction}
                disabled={isActing}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-60 ${
                  confirm === "regenerate" ? "bg-primary hover:bg-primary-dark" : "bg-danger hover:bg-red-700"
                }`}
              >
                {isActing ? "Please wait..." : confirm === "regenerate" ? "Regenerate" : "Revoke"}
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            {confirm === "regenerate" ? (
              <>The current key for <span className="font-semibold text-gray-800">{client?.name}</span> will stop working immediately. A new key will be shown once.</>
            ) : (
              <><span className="font-semibold text-gray-800">{client?.name}</span> will no longer be able to access the API. You can re-enable it later by setting its status to Active.</>
            )}
          </p>
        </Modal>
      )}
    </AdminLayout>
  );
}
