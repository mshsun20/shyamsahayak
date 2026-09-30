import { useState, useRef, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Upload,
  X,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Maximize2,
  Trash2,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import Loader from "../../../components/Loader";
import axiosInstance from "../../../config/axiosInstance";
import { showSnackbar } from "../../../redux/slices/snackbarSlice";
import { productCategories, units } from "../../../data/content";

const emptyForm = {
  name: "",
  code: "",
  category: productCategories[0],
  unit: units[0],
  shortDescription: "",
  description: "",
  image: "",
  price: "",
  priceUnit: units[0],
  gstRate: "",
  status: "Active",
  tags: [],
  sortOrder: "",
  metaTitle: "",
  metaDescription: "",
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: emptyForm, mode: "onSubmit" });

  const shortDescription = watch("shortDescription") || "";
  const description = watch("description") || "";
  const metaTitle = watch("metaTitle") || "";
  const metaDescription = watch("metaDescription") || "";
  const image = watch("image");
  const tags = watch("tags") || [];

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      const product = response?.data?.data;
      if (product) {
        reset({ ...emptyForm, ...product });
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
    const formData = new FormData();
    Object.keys(emptyForm).forEach((key) => {
      if (key === "image") return;
      if (key === "tags") {
        (data.tags || []).forEach((tag) => formData.append("tags", tag));
        return;
      }
      if (data[key] !== "" && data[key] != null) {
        formData.append(key, data[key]);
      }
    });
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (isEdit) {
        await axiosInstance.patch(`/products/${id}`, formData);
      } else {
        await axiosInstance.post(`/products`, formData);
      }
      dispatch(showSnackbar({ message: isEdit ? "Product updated successfully" : "Product created successfully", type: "success" }));
      navigate("/content/products");
    } catch (error) {
      console.error(error.message);
      dispatch(showSnackbar({ message: error.response?.data?.message || error.message, type: "error" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setValue("image", reader.result);
    reader.readAsDataURL(file);
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

  const removeTag = (tag) => {
    setValue("tags", tags.filter((t) => t !== tag));
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  return (
    <AdminLayout title="Content Management">
      {isLoading && <Loader />}
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/content" className="hover:text-primary">Content Management</Link>
            <ChevronRight size={12} />
            <Link to="/content/products" className="hover:text-primary">Products</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">{isEdit ? "Edit Product" : "Add Product"}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Product" : "Add Product"}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/content/products")}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="product-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark disabled:opacity-60"
          >
            {isEdit ? "Save Changes" : "Save Product"}
          </button>
        </div>
      </div>

      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4 max-w-4xl" noValidate>
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Basic Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Product Name *</label>
              <input
                placeholder="Enter product name"
                {...register("name", { required: "Product name is required." })}
                className={inputClass("name")}
              />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">SKU / Code *</label>
              <input
                placeholder="Enter SKU or code"
                {...register("code", { required: "SKU / Code is required." })}
                className={inputClass("code")}
              />
              {errors.code && <p className="text-xs text-danger mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Category *</label>
              <select {...register("category", { required: true })} className={inputClass("category")}>
                {productCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Unit Type *</label>
              <select {...register("unit", { required: true })} className={inputClass("unit")}>
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Short Description *</label>
            <textarea
              rows={2}
              maxLength={150}
              placeholder="Enter a short description of the product"
              {...register("shortDescription", { required: "Short description is required." })}
              className={inputClass("shortDescription")}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.shortDescription ? (
                <p className="text-xs text-danger">{errors.shortDescription.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-gray-400">{shortDescription.length} / 150</p>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Product Details</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Description *</label>
              <div className={`border rounded-lg overflow-hidden ${errors.description ? "border-danger" : "border-gray-200"}`}>
                <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50 text-gray-400 flex-wrap">
                  <span className="text-xs px-1.5 text-gray-500">Paragraph</span>
                  <span className="w-px h-4 bg-gray-200 mx-1" />
                  <Bold size={14} />
                  <Italic size={14} />
                  <Underline size={14} />
                  <span className="w-px h-4 bg-gray-200 mx-1" />
                  <List size={14} />
                  <ListOrdered size={14} />
                  <span className="w-px h-4 bg-gray-200 mx-1" />
                  <AlignLeft size={14} />
                  <AlignCenter size={14} />
                  <AlignRight size={14} />
                  <span className="w-px h-4 bg-gray-200 mx-1" />
                  <Link2 size={14} />
                  <Maximize2 size={14} className="ml-auto" />
                </div>
                <textarea
                  rows={7}
                  maxLength={2000}
                  placeholder="Enter detailed description of the product..."
                  {...register("description", { required: "Description is required." })}
                  className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                />
                <div className="flex justify-end px-3 pb-2">
                  <p className="text-xs text-gray-400">{description.length} / 2000</p>
                </div>
              </div>
              {errors.description && <p className="text-xs text-danger mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Product Image</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
              />
              {image ? (
                <div>
                  <img src={image} alt="Product" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg py-2 hover:bg-gray-50"
                    >
                      <Upload size={13} />
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("image", "");
                        setImageFile(null);
                      }}
                      className="p-2 text-danger border border-gray-200 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary"
                >
                  <Upload size={20} />
                  <span className="text-xs font-medium">Click to upload or drag and drop</span>
                  <span className="text-[11px]">JPG, PNG, WebP (Max. 2MB)</span>
                </button>
              )}
              <p className="text-[11px] text-gray-400 mt-1.5">Recommended size: 1200 × 900 px</p>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Pricing & Inventory</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  placeholder="Enter price"
                  {...register("price", { required: "Price is required." })}
                  className={`${inputClass("price")} pl-7`}
                />
              </div>
              {errors.price && <p className="text-xs text-danger mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Price Unit *</label>
              <select {...register("priceUnit", { required: true })} className={inputClass("priceUnit")}>
                {units.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">GST Rate (%) *</label>
              <div className="relative">
                <input
                  placeholder="Enter GST rate"
                  {...register("gstRate", { required: "GST rate is required." })}
                  className={`${inputClass("gstRate")} pr-7`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
              </div>
              {errors.gstRate && <p className="text-xs text-danger mt-1">{errors.gstRate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status *</label>
              <select {...register("status", { required: true })} className={inputClass("status")}>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">
            Additional Information <span className="text-gray-400 font-normal">(Optional)</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags</label>
              <div className="w-full min-h-[42px] px-2 py-1.5 border border-gray-200 rounded-lg flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
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
                  placeholder={tags.length === 0 ? "Enter tags and press Enter" : ""}
                  className="flex-1 min-w-[80px] text-sm px-1 py-0.5 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Add relevant tags for easy search</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Sort Order</label>
              <input
                type="number"
                placeholder="Enter sort order"
                {...register("sortOrder")}
                className={inputClass("sortOrder")}
              />
              <p className="text-[11px] text-gray-400 mt-1">Lower numbers appear first</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Meta Title</label>
              <input
                maxLength={60}
                placeholder="Enter meta title"
                {...register("metaTitle")}
                className={inputClass("metaTitle")}
              />
              <p className="text-[11px] text-gray-400 mt-1">For SEO (Max. 60 characters) · {metaTitle.length} / 60</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Meta Description</label>
              <input
                maxLength={160}
                placeholder="Enter meta description"
                {...register("metaDescription")}
                className={inputClass("metaDescription")}
              />
              <p className="text-[11px] text-gray-400 mt-1">For SEO (Max. 160 characters) · {metaDescription.length} / 160</p>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}