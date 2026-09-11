import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
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
  FileText,
  X,
  Download,
  Trash2,
} from "lucide-react";
import AdminLayout from "../layouts/AdminLayout";
import { addArticle, updateArticle } from "../redux/store";
import { articleCategories, articleAuthors } from "../data/content";

const emptyForm = {
  title: "",
  category: articleCategories[0],
  status: "Draft",
  shortDescription: "",
  content: "",
  author: articleAuthors[0],
  tags: [],
  featured: false,
  metaTitle: "",
  metaDescription: "",
  visibility: "Visible to all users",
};

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
  const articles = useSelector((state) => state.articles);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tagInput, setTagInput] = useState("");
  const [attachments, setAttachments] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, mode: "onSubmit" });

  const shortDescription = watch("shortDescription") || "";
  const content = watch("content") || "";
  const metaTitle = watch("metaTitle") || "";
  const metaDescription = watch("metaDescription") || "";
  const tags = watch("tags") || [];
  const featured = watch("featured");
  const status = watch("status");

  useEffect(() => {
    if (isEdit) {
      const existing = articles.find((a) => String(a.id) === id);
      if (existing) reset({ ...emptyForm, ...existing });
    }
  }, [id, isEdit, articles, reset]);

  const onSubmit = (data) => {
    if (isEdit) {
      dispatch(
        updateArticle({
          ...data,
          id: Number(id),
          lastUpdated: "Today",
          lastUpdatedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })
      );
    } else {
      dispatch(
        addArticle({
          ...data,
          id: Date.now(),
          views: null,
          lastUpdated: "Today",
          lastUpdatedTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        })
      );
    }
    navigate("/content/knowledge-base");
  };

  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setValue("tags", [...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) => setValue("tags", tags.filter((t) => t !== tag));

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${f.size}-${Date.now()}`,
        name: f.name,
        type: f.type || f.name.split(".").pop()?.toUpperCase() || "FILE",
        size: formatFileSize(f.size),
      })),
    ]);
    e.target.value = "";
  };

  const removeAttachment = (fileId) => {
    setAttachments((prev) => prev.filter((f) => f.id !== fileId));
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  return (
    <AdminLayout title="Content Management">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/content" className="hover:text-primary">Content Management</Link>
            <ChevronRight size={12} />
            <Link to="/content/knowledge-base" className="hover:text-primary">Knowledge Base</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">{isEdit ? "Edit Article" : "Add Article"}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/content/knowledge-base")}
              className="text-gray-400 hover:text-gray-700"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Article" : "Add Article"}</h2>
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
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          >
            {isEdit ? "Save Changes" : status === "Draft" ? "Save Draft" : "Save & Publish"}
          </button>
        </div>
      </div>

      <form id="article-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4 max-w-4xl" noValidate>
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>Basic Information</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Article Title *</label>
              <input
                placeholder="Enter article title"
                {...register("title", { required: "Article title is required." })}
                className={inputClass("title")}
              />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Category *</label>
              <select {...register("category", { required: true })} className={inputClass("category")}>
                {articleCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status *</label>
              <select {...register("status", { required: true })} className={inputClass("status")}>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Short Description *</label>
            <textarea
              rows={2}
              maxLength={180}
              placeholder="Enter short description (summary of the article)"
              {...register("shortDescription", { required: "Short description is required." })}
              className={inputClass("shortDescription")}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.shortDescription ? (
                <p className="text-xs text-danger">{errors.shortDescription.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-400">{shortDescription.length} / 180</p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>Article Content</SectionHeader>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Content *</label>
          <div className={`border rounded-lg overflow-hidden ${errors.content ? "border-danger" : "border-gray-200"}`}>
            <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50 text-gray-400 flex-wrap">
              <span className="text-xs px-1.5 text-gray-500">Paragraph</span>
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
              {...register("content", { required: "Content is required." })}
              className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
            />
            <div className="flex justify-end px-3 pb-2">
              <p className="text-xs text-gray-400">{content.length} / 10000</p>
            </div>
          </div>
          {errors.content && <p className="text-xs text-danger mt-1">{errors.content.message}</p>}

          <div className="flex items-start gap-2 bg-amber-50 text-amber-700 text-xs rounded-lg px-3 py-2 mt-3">
            <Lightbulb size={14} className="shrink-0 mt-0.5" />
            Use headings, bullet points, and images to make your article easy to read.
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>Additional Information</SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Author *</label>
              <select {...register("author", { required: true })} className={inputClass("author")}>
                {articleAuthors.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Tags <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="w-full min-h-[42px] px-2 py-1.5 border border-gray-200 rounded-lg flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>
                      <X size={11} />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? "Add tags and press Enter" : ""}
                  className="flex-1 min-w-[80px] text-sm px-1 py-0.5 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">E.g. policy, workflow, system</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Featured Article</label>
              <div className="flex items-center gap-2 h-[42px]">
                <button
                  type="button"
                  onClick={() => setValue("featured", !featured)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${featured ? "bg-primary" : "bg-gray-200"}`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      featured ? "translate-x-[18px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-xs text-gray-400">Show this article on top of Knowledge Base</span>
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>
            Attachments <span className="text-gray-400 font-normal">(Optional)</span>
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
            <span className="text-sm font-medium text-gray-500">Drag & drop files here or click to browse</span>
            <span className="text-[11px]">Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PNG, JPG (Max 10MB each)</span>
          </button>

          <div className="border border-gray-100 rounded-lg mt-4 overflow-hidden">
            <div className="grid grid-cols-[1fr_120px_100px_80px] bg-gray-50 text-[11px] uppercase tracking-wide text-gray-400 px-4 py-2">
              <span>File Name</span>
              <span>File Type</span>
              <span>File Size</span>
              <span className="text-right">Actions</span>
            </div>
            {attachments.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-1.5 py-8 text-gray-400">
                <FileText size={20} />
                <p className="text-sm">No files attached yet</p>
                <p className="text-xs">Add relevant documents or images to support this article</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {attachments.map((f) => (
                  <div key={f.id} className="grid grid-cols-[1fr_120px_100px_80px] items-center px-4 py-2.5 text-sm">
                    <span className="text-gray-700 truncate pr-2">{f.name}</span>
                    <span className="text-gray-500">{f.type}</span>
                    <span className="text-gray-500">{f.size}</span>
                    <span className="flex items-center justify-end gap-1">
                      <button type="button" className="p-1 text-gray-400 hover:text-info">
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeAttachment(f.id)}
                        className="p-1 text-gray-400 hover:text-danger"
                      >
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SEO & Visibility */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionHeader>
            SEO & Visibility <span className="text-gray-400 font-normal">(Optional)</span>
          </SectionHeader>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Meta Title</label>
              <input
                maxLength={60}
                placeholder="Enter meta title"
                {...register("metaTitle")}
                className={inputClass("metaTitle")}
              />
              <p className="text-[11px] text-gray-400 mt-1">{metaTitle.length} / 60</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Meta Description</label>
              <input
                maxLength={160}
                placeholder="Enter meta description"
                {...register("metaDescription")}
                className={inputClass("metaDescription")}
              />
              <p className="text-[11px] text-gray-400 mt-1">{metaDescription.length} / 160</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Visibility</label>
              <select {...register("visibility")} className={inputClass("visibility")}>
                <option>Visible to all users</option>
                <option>Visible to Admins only</option>
                <option>Visible to DGOs & TMs</option>
              </select>
              <p className="text-[11px] text-gray-400 mt-1">Choose who can view this article</p>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
