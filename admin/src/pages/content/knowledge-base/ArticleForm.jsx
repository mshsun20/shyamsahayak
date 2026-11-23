
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  Table as TableIcon,
  Undo2,
  Redo2,
  Lightbulb,
  UploadCloud,
  Upload,
  FileText,
  X,
  Trash2,
  Download,
} from "lucide-react";

import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { articleAuthors } from "../../../data/content";
import useKbCategories from "../../../hooks/useKbCategories";

// Attachments are intentionally NOT part of react-hook-form values.
// Existing attachments and newly selected File objects are maintained
// in separate React states.
const emptyForm = {
  title: "",
  category: "",
  status: "Draft",
  shortDescription: "",
  content: "",
  author: articleAuthors[0],
  tags: [],
  featured: false,
  metaTitle: "",
  metaDescription: "",
  visibility: "Visible to all users",
  aiEnabled: false,
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const ACCEPTED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "png",
  "jpg",
  "jpeg",
];

function formatFileSize(bytes) {
  const size = Number(bytes);

  if (!Number.isFinite(size) || size < 0) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileName(file) {
  if (!file) return "Unknown file";

  if (typeof file === "string") {
    return file;
  }

  return (
    file.originalName ||
    file.originalname ||
    file.filename ||
    file.fileName ||
    file.name ||
    "Unknown file"
  );
}

function getFileExtension(file) {
  const name = getFileName(file);
  const extension = name.includes(".") ? name.split(".").pop() : "";
  return String(extension || "FILE").split("/").pop();
}

function getExistingFileSize(file) {
  if (file?.size == null) return "—";

  // Some File models store an already formatted size.
  if (typeof file.size === "string" && !Number.isFinite(Number(file.size))) {
    return file.size;
  }

  return formatFileSize(file.size);
}

function getFileUrl(file) {
  if (!file) return "";

  // Handle a populated File document
  if (typeof file === "object") {
    const candidates = [
      file.relativePath, // Actual URL in your File document
      file.url,
      file.fileUrl,
      file.publicUrl,
      file.downloadUrl,
      file.secure_url,
      file.location,
    ];

    const value = candidates.find(
      (candidate) =>
        typeof candidate === "string" && candidate.trim()
    );

    return value ? value.trim() : "";
  }

  // Handle a string URL, if applicable
  if (typeof file === "string") {
    const value = file.trim();

    if (
      /^https?:\/\//i.test(value) ||
      value.startsWith("/") ||
      value.startsWith("data:") ||
      value.startsWith("blob:")
    ) {
      return value;
    }
  }

  return "";
}

function normalizeTags(value) {
  let values = value;

  if (typeof values === "string") {
    const trimmed = values.trim();

    if (!trimmed) return [];

    // Support APIs that return tags as a JSON-serialized array.
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        values = parsed;
      } else {
        values = trimmed.split(",");
      }
    } catch {
      // Also support legacy comma-separated tag strings.
      values = trimmed.split(",");
    }
  }

  if (!Array.isArray(values)) return [];

  const normalized = values
    .map((tag) => {
      if (typeof tag === "string") return tag.trim();

      if (tag && typeof tag === "object") {
        return String(tag.name || tag.label || tag.value || "").trim();
      }

      return "";
    })
    .filter(Boolean);

  return [...new Set(normalized)];
}

function getAttachmentId(file) {
  if (!file) return "";

  if (typeof file === "string") return file;

  return String(file._id || file.id || "");
}

function normalizeExistingAttachments(files) {
  if (!Array.isArray(files)) return [];

  return files
    .filter(Boolean)
    .map((file) => {
      if (typeof file === "string") {
        return {
          _id: file,
          name: file,
        };
      }

      return {
        ...file,
        _id: getAttachmentId(file),
      };
    })
    .filter((file) => file._id);
}

function SectionHeader({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-1 h-4 bg-primary rounded-full" />
      <p className="text-sm font-semibold text-gray-800">{children}</p>
    </div>
  );
}

export default function ArticleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [tagInput, setTagInput] = useState("");

  // Existing database File documents retained by the article.
  const [existingAttachments, setExistingAttachments] = useState([]);

  // Newly selected browser File objects waiting to be uploaded.
  const [newAttachments, setNewAttachments] = useState([]);

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [savedCategory, setSavedCategory] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: emptyForm,
    mode: "onSubmit",
  });

  const shortDescription = watch("shortDescription") || "";
  const content = watch("content") || "";
  const metaTitle = watch("metaTitle") || "";
  const metaDescription = watch("metaDescription") || "";
  const tagsValue = watch("tags");
  const tags = Array.isArray(tagsValue) ? tagsValue : [];
  const featured = Boolean(watch("featured"));
  const status = watch("status");

  // -------------------------------------------------------
  // CATEGORY OPTIONS
  // -------------------------------------------------------

  const {
    categories,
    loaded: categoriesLoaded,
  } = useKbCategories({ status: "Active" });

  const categoryOptions = useMemo(() => {
    const options = categories.map((item) => ({
      _id: item._id,
      name: item.name,
    }));

    // Preserve the current category when editing an article
    // whose category has subsequently become inactive.
    if (
      savedCategory &&
      !options.some((item) => item._id === savedCategory._id)
    ) {
      return [...options, savedCategory];
    }

    return options;
  }, [categories, savedCategory]);

  // Automatically select the first active category for new articles.
  useEffect(() => {
    if (
      !isEdit &&
      categoriesLoaded &&
      !getValues("category") &&
      categories.length > 0
    ) {
      setValue("category", categories[0]._id, {
        shouldDirty: false,
      });
    }
  }, [isEdit, categoriesLoaded, categories, getValues, setValue]);

  // -------------------------------------------------------
  // FETCH EXISTING ARTICLE
  // -------------------------------------------------------

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await axiosInstance.get(`/knowledge-bases/${id}`);

      const article = response?.data?.data;

      if (!article) {
        throw new Error("Knowledge Base article was not found.");
      }

      const values = {
        ...emptyForm,
      };

      Object.keys(emptyForm).forEach((key) => {
        if (article[key] !== undefined && article[key] !== null) {
          values[key] = article[key];
        }
      });

      // Category is populated by the backend.
      values.category =
        article.category?._id ||
        article.category ||
        "";

      // Normalize values which are expected to be arrays/booleans.
      values.tags = normalizeTags(article.tags);

      values.featured = Boolean(article.featured);
      values.aiEnabled = Boolean(article.aiEnabled);

      setSavedCategory(
        article.category?._id
          ? {
              _id: String(article.category._id),
              name: article.category.name,
            }
          : null
      );

      // Reset only the form fields.
      // Populated attachments must never enter form values.
      reset(values);

      // Keep existing File documents in their own state.
      setExistingAttachments(
        normalizeExistingAttachments(article.attachments)
      );

      // Clear pending uploads when loading an article.
      setNewAttachments([]);

      // Reset banner state.
      setBannerFile(null);
      setBannerPreview(getFileUrl(article.banner));

      setTagInput("");
    } catch (error) {
      console.error("Knowledge Base article fetch error:", error);

      dispatch(
        showSnackbar({
          message:
            error.response?.data?.message ||
            error.message ||
            "Unable to load article.",
          type: "error",
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [id, reset, dispatch]);

  useEffect(() => {
    if (isEdit) {
      fetchData();
    } else {
      setExistingAttachments([]);
      setNewAttachments([]);
      setBannerFile(null);
      setBannerPreview("");
      setSavedCategory(null);
      reset(emptyForm);
    }
  }, [isEdit, fetchData, reset]);

  // Revoke only locally-created preview URLs. Existing server URLs are
  // never revoked.
  useEffect(() => {
    return () => {
      if (
        typeof bannerPreview === "string" &&
        bannerPreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(bannerPreview);
      }
    };
  }, [bannerPreview]);

  // -------------------------------------------------------
  // FORM SUBMISSION
  // -------------------------------------------------------

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append ordinary form fields.
      Object.entries(data).forEach(([key, value]) => {
        if (key === "tags") {
          return;
        }

        if (value === undefined || value === null) {
          formData.append(key, "");
          return;
        }

        // Explicitly serialize boolean fields for multipart requests.
        if (typeof value === "boolean") {
          formData.append(key, String(value));
          return;
        }

        formData.append(key, String(value));
      });

      // Send tags as a JSON array.
      // This also allows the backend to clear tags when the array is empty.
      formData.append(
        "tags",
        JSON.stringify(normalizeTags(data.tags))
      );

      // IMPORTANT:
      // Existing attachment IDs are sent separately.
      // They must NOT be appended under the "attachments" field.
      if (isEdit) {
        const keepAttachmentIds = existingAttachments
          .map((file) => getAttachmentId(file))
          .filter(Boolean);

        formData.append(
          "keepAttachmentIds",
          JSON.stringify(keepAttachmentIds)
        );
      }

      // Only actual newly selected File objects are uploaded.
      newAttachments.forEach((attachment) => {
        if (attachment.file instanceof File) {
          formData.append("attachments", attachment.file);
        }
      });

      // Only upload a banner when the user selected a new one.
      if (bannerFile instanceof File) {
        formData.append("banner", bannerFile);
      }

      if (isEdit) {
        await axiosInstance.patch(
          `/knowledge-bases/${id}`,
          formData
        );
      } else {
        await axiosInstance.post(
          "/knowledge-bases",
          formData
        );
      }

      dispatch(
        showSnackbar({
          message: isEdit
            ? "Article updated successfully"
            : "Article created successfully",
          type: "success",
        })
      );

      navigate("/content/knowledge-base");
    } catch (error) {
      console.error("Knowledge Base article save error:", error);

      dispatch(
        showSnackbar({
          message:
            error.response?.data?.message ||
            error.message ||
            "Unable to save article.",
          type: "error",
        })
      );
    }
  };

  // -------------------------------------------------------
  // TAG HANDLERS
  // -------------------------------------------------------

  const addTag = (event) => {
    if (event.key !== "Enter" || !tagInput.trim()) {
      return;
    }

    event.preventDefault();

    const newTag = tagInput.trim();
    const currentTags = normalizeTags(getValues("tags"));

    if (!currentTags.includes(newTag)) {
      setValue("tags", [...currentTags, newTag], {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setValue(
      "tags",
      normalizeTags(getValues("tags")).filter((tag) => tag !== tagToRemove),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  // -------------------------------------------------------
  // ATTACHMENT HANDLERS
  // -------------------------------------------------------

  const handleFilesSelected = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    // Allow selecting the same file again after removing it.
    event.target.value = "";

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = [];
    const rejectedFiles = [];

    selectedFiles.forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (!ACCEPTED_FILE_EXTENSIONS.includes(extension)) {
        rejectedFiles.push(
          `${file.name}: unsupported file type`
        );
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(
          `${file.name}: exceeds the 10 MB limit`
        );
        return;
      }

      validFiles.push(file);
    });

    if (rejectedFiles.length > 0) {
      dispatch(
        showSnackbar({
          message: rejectedFiles.join("; "),
          type: "error",
        })
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    setNewAttachments((previous) => {
      const existingKeys = new Set(
        previous.map(
          (item) =>
            `${item.file.name}-${item.file.size}-${item.file.lastModified}`
        )
      );

      const additions = validFiles
        .filter((file) => {
          const key = `${file.name}-${file.size}-${file.lastModified}`;

          if (existingKeys.has(key)) {
            return false;
          }

          existingKeys.add(key);
          return true;
        })
        .map((file) => ({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          file,
        }));

      return [...previous, ...additions];
    });
  };

  const removeExistingAttachment = (attachmentId) => {
    setExistingAttachments((previous) =>
      previous.filter(
        (file) => getAttachmentId(file) !== attachmentId
      )
    );
  };

  const removeNewAttachment = (attachmentId) => {
    setNewAttachments((previous) =>
      previous.filter((file) => file.id !== attachmentId)
    );
  };

  // -------------------------------------------------------
  // BANNER HANDLERS
  // -------------------------------------------------------

  const handleBannerChange = (event) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    const allowedBannerTypes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!allowedBannerTypes.includes(file.type)) {
      dispatch(
        showSnackbar({
          message: "Please select a PNG, JPG, JPEG, or WEBP image.",
          type: "error",
        })
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      dispatch(
        showSnackbar({
          message: "Banner image must not exceed 10 MB.",
          type: "error",
        })
      );
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setBannerFile(file);
      setBannerPreview(previewUrl);
    } catch (error) {
      console.error("Banner preview creation error:", error);

      dispatch(
        showSnackbar({
          message: "Unable to preview the selected banner image.",
          type: "error",
        })
      );
    }
  };

  // -------------------------------------------------------
  // COMMON INPUT CLASS
  // -------------------------------------------------------

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field]
        ? "border-danger"
        : "border-gray-200 focus:border-primary"
    }`;

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------

  return (
    <AdminLayout title="Content Management">
      {isLoading && <Loader />}

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/content" className="hover:text-primary">
              Content Management
            </Link>

            <ChevronRight size={12} />

            <Link
              to="/content/knowledge-base"
              className="hover:text-primary"
            >
              Knowledge Base
            </Link>

            <ChevronRight size={12} />

            <span className="text-gray-600">
              {isEdit ? "Edit Article" : "Add Article"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/content/knowledge-base")}
              className="text-gray-400 hover:text-gray-700"
            >
              <ArrowLeft size={18} />
            </button>

            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? "Edit Article" : "Add Article"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/content/knowledge-base")}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="article-form"
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60"
          >
            {isSubmitting
              ? "Saving..."
              : isEdit
                ? "Save Changes"
                : status === "Draft"
                  ? "Save Draft"
                  : "Save & Publish"}
          </button>
        </div>
      </div>

      <form
        id="article-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 mt-4 max-w-4xl"
        noValidate
      >
        {/* ================================================== */}
        {/* BASIC INFORMATION */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>Basic Information</SectionHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Article Title *
              </label>

              <input
                placeholder="Enter article title"
                {...register("title", {
                  required: "Article title is required.",
                })}
                className={inputClass("title")}
              />

              {errors.title && (
                <p className="text-xs text-danger mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Category *
              </label>

              <select
                {...register("category", {
                  required: "Please select a category.",
                })}
                className={inputClass("category")}
              >
                <option value="" disabled>
                  Select category
                </option>

                {categoryOptions.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>

              {errors.category && (
                <p className="text-xs text-danger mt-1">
                  {errors.category.message}
                </p>
              )}

              {categoriesLoaded &&
                categories.length === 0 &&
                !category && (
                  <p className="text-xs text-danger mt-1">
                    No active categories. Add one in Configuration
                    → Knowledge Category Master.
                  </p>
                )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Status *
              </label>

              <select
                {...register("status", { required: true })}
                className={inputClass("status")}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Short Description *
            </label>

            <textarea
              rows={2}
              maxLength={180}
              placeholder="Enter short description (summary of the article)"
              {...register("shortDescription", {
                required: "Short description is required.",
              })}
              className={inputClass("shortDescription")}
            />

            <div className="flex items-center justify-between mt-1">
              {errors.shortDescription ? (
                <p className="text-xs text-danger">
                  {errors.shortDescription.message}
                </p>
              ) : (
                <span />
              )}

              <p className="text-xs text-gray-400">
                {shortDescription.length} / 180
              </p>
            </div>
          </div>

          {/* AI KNOWLEDGE BASE SETTINGS */}
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register("aiEnabled")}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />

              <span>
                <span className="block text-sm font-semibold text-gray-800">
                  Enable AI Knowledge Base Search
                </span>

                <span className="block mt-1 text-xs text-gray-600">
                  Allow Sahayak AI to search this article and its
                  uploaded attachments when answering relevant
                  business questions.
                </span>

                <span className="block mt-1 text-xs text-gray-500">
                  Only published articles visible to all users will
                  be indexed by the current public Knowledge Base
                  retrieval workflow.
                </span>
              </span>
            </label>
          </div>
        </div>

        {/* ================================================== */}
        {/* ARTICLE CONTENT */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>Article Content</SectionHeader>

          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Content *
          </label>

          <div
            className={`border rounded-lg overflow-hidden ${
              errors.content
                ? "border-danger"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50 text-gray-400 flex-wrap">
              <span className="text-xs px-1.5 text-gray-500">
                Paragraph
              </span>

              <span className="w-px h-4 bg-gray-200 mx-1" />

              <Bold size={13} />
              <Italic size={13} />
              <Underline size={13} />

              <span className="w-px h-4 bg-gray-200 mx-1" />

              <List size={13} />
              <ListOrdered size={13} />

              <span className="w-px h-4 bg-gray-200 mx-1" />

              <AlignLeft size={13} />
              <AlignCenter size={13} />
              <AlignRight size={13} />

              <span className="w-px h-4 bg-gray-200 mx-1" />

              <Link2 size={13} />
              <ImageIcon size={13} />
              <TableIcon size={13} />

              <span className="ml-auto flex items-center gap-2">
                <Undo2 size={13} />
                <Redo2 size={13} />
              </span>
            </div>

            <textarea
              rows={8}
              maxLength={10000}
              placeholder="Write your article content here..."
              {...register("content", {
                required: "Content is required.",
              })}
              className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
            />

            <div className="flex justify-end px-3 pb-2">
              <p className="text-xs text-gray-400">
                {content.length} / 10000
              </p>
            </div>
          </div>

          {errors.content && (
            <p className="text-xs text-danger mt-1">
              {errors.content.message}
            </p>
          )}

          {/* BANNER IMAGE */}
          <div className="mt-4 max-w-xs">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Banner Image{" "}
              <span className="text-gray-400 font-normal">
                (Optional)
              </span>
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              ref={bannerInputRef}
              onChange={handleBannerChange}
              className="hidden"
            />

            {bannerPreview ? (
              <div>
                <img
                  src={bannerPreview}
                  alt="Article banner preview"
                  className="w-full h-16 object-cover rounded-lg border border-gray-200"
                  onError={(event) => {
                    console.error(
                      "Unable to load article banner preview:",
                      bannerPreview
                    );
                    event.currentTarget.style.display = "none";
                  }}
                />

                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full mt-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50"
                >
                  Change Banner
                </button>

                {bannerFile && (
                  <p className="text-[11px] text-gray-400 mt-1 truncate">
                    Selected: {bannerFile.name}
                  </p>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="w-full h-[72px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary"
              >
                <Upload size={16} />

                <span className="text-[11px] font-medium">
                  Upload banner image
                </span>
              </button>
            )}

            <p className="text-[11px] text-gray-400 mt-1">
              Recommended size: 1200 × 400 px
            </p>
          </div>

          <div className="flex items-start gap-2 bg-amber-50 text-amber-700 text-xs rounded-lg px-3 py-2 mt-3">
            <Lightbulb size={14} className="shrink-0 mt-0.5" />

            Use headings, bullet points, and images to make your
            article easy to read.
          </div>
        </div>

        {/* ================================================== */}
        {/* ADDITIONAL INFORMATION */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>Additional Information</SectionHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* AUTHOR */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Author *
              </label>

              <select
                {...register("author", { required: true })}
                className={inputClass("author")}
              >
                {articleAuthors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* TAGS */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Tags{" "}
                <span className="text-gray-400 font-normal">
                  (Optional)
                </span>
              </label>

              <div className="w-full min-h-[42px] px-2 py-1.5 border border-gray-200 rounded-lg flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}

                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}

                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={addTag}
                  placeholder={
                    tags.length === 0
                      ? "Add tags and press Enter"
                      : ""
                  }
                  className="flex-1 min-w-[80px] text-sm px-1 py-0.5 focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-gray-400 mt-1">
                E.g. policy, workflow, system
              </p>
            </div>

            {/* FEATURED ARTICLE */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Featured Article
              </label>

              <div className="flex items-center gap-2 h-[42px]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={featured}
                  aria-label="Toggle featured article"
                  onClick={() =>
                    setValue("featured", !featured, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    featured ? "bg-primary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      featured ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>

                <span className="text-xs text-gray-400">
                  Show this article on top of Knowledge Base
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================== */}
        {/* ATTACHMENTS */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>
            Attachments{" "}
            <span className="text-gray-400 font-normal">
              (Optional)
            </span>
          </SectionHeader>

          <input
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFilesSelected}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg py-8 text-gray-400 hover:border-primary hover:text-primary"
          >
            <UploadCloud size={22} />

            <span className="text-sm font-medium text-gray-500">
              Drag & drop files here or click to browse
            </span>

            <span className="text-[11px]">
              Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX,
              PNG, JPG (Max 10MB each)
            </span>
          </button>

          {/* ATTACHMENT TABLE */}
          <div className="border border-gray-100 rounded-lg mt-4 overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_90px_90px_55px] sm:grid-cols-[minmax(0,1fr)_120px_100px_80px] bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 px-4 py-2">
              <span>File Name</span>
              <span>File Type</span>
              <span>File Size</span>
              <span className="text-right">Actions</span>
            </div>

            {existingAttachments.length === 0 &&
            newAttachments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-gray-400">
                <FileText size={20} />

                <p className="text-sm">
                  No files attached yet
                </p>

                <p className="text-xs">
                  Add relevant documents or images to support this
                  article
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* EXISTING DATABASE ATTACHMENTS */}
                {existingAttachments.map((file) => {
                  const fileId = getAttachmentId(file);
                  const fileUrl = getFileUrl(file);

                  return (
                    <div
                      key={`existing-${fileId}`}
                      className="grid grid-cols-[minmax(0,1fr)_90px_90px_55px] sm:grid-cols-[minmax(0,1fr)_120px_100px_80px] items-center px-4 py-2.5 text-sm"
                    >
                      <div className="min-w-0 pr-2">
                        <span
                          className="block text-gray-700 truncate"
                          title={getFileName(file)}
                        >
                          {getFileName(file)}
                        </span>

                        <span className="text-[10px] text-gray-400">
                          Existing attachment
                        </span>
                      </div>

                      <span className="text-gray-500 text-xs sm:text-sm">
                        {getFileExtension(file)}
                      </span>

                      <span className="text-gray-500 text-xs sm:text-sm">
                        {getExistingFileSize(file)}
                      </span>

                      <span className="flex items-center justify-end gap-1">
                        {fileUrl && (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            title="Download attachment"
                            className="p-1 text-gray-400 hover:text-info"
                          >
                            <Download size={14} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingAttachment(fileId)
                          }
                          title="Remove attachment"
                          className="p-1 text-gray-400 hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    </div>
                  );
                })}

                {/* NEWLY SELECTED FILES */}
                {newAttachments.map((attachment) => {
                  const file = attachment.file;

                  return (
                    <div
                      key={`new-${attachment.id}`}
                      className="grid grid-cols-[minmax(0,1fr)_90px_90px_55px] sm:grid-cols-[minmax(0,1fr)_120px_100px_80px] items-center px-4 py-2.5 text-sm"
                    >
                      <div className="min-w-0 pr-2">
                        <span
                          className="block text-gray-700 truncate"
                          title={file.name}
                        >
                          {file.name}
                        </span>

                        <span className="text-[10px] text-blue-500">
                          New upload
                        </span>
                      </div>

                      <span className="text-gray-500 text-xs sm:text-sm">
                        {getFileExtension(file)}
                      </span>

                      <span className="text-gray-500 text-xs sm:text-sm">
                        {formatFileSize(file.size)}
                      </span>

                      <span className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            removeNewAttachment(attachment.id)
                          }
                          title="Remove selected file"
                          className="p-1 text-gray-400 hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 mt-2">
            Existing attachments are retained unless removed.
            Newly selected files are uploaded when you save the
            article.
          </p>
        </div>

        {/* ================================================== */}
        {/* SEO & VISIBILITY */}
        {/* ================================================== */}

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>
            SEO & Visibility{" "}
            <span className="text-gray-400 font-normal">
              (Optional)
            </span>
          </SectionHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* META TITLE */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Meta Title
              </label>

              <input
                maxLength={60}
                placeholder="Enter meta title"
                {...register("metaTitle")}
                className={inputClass("metaTitle")}
              />

              <p className="text-[11px] text-gray-400 mt-1">
                {metaTitle.length} / 60
              </p>
            </div>

            {/* META DESCRIPTION */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Meta Description
              </label>

              <input
                maxLength={160}
                placeholder="Enter meta description"
                {...register("metaDescription")}
                className={inputClass("metaDescription")}
              />

              <p className="text-[11px] text-gray-400 mt-1">
                {metaDescription.length} / 160
              </p>
            </div>

            {/* VISIBILITY */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Visibility
              </label>

              <select
                {...register("visibility")}
                className={inputClass("visibility")}
              >
                <option value="Visible to all users">
                  Visible to all users
                </option>

                <option value="Visible to Admins only">
                  Visible to Admins only
                </option>

                <option value="Visible to DGOs & TMs">
                  Visible to DGOs & TMs
                </option>
              </select>

              <p className="text-[11px] text-gray-400 mt-1">
                Choose who can view this article
              </p>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
