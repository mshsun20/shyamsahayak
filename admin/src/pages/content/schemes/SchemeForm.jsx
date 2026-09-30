import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ChevronRight,
  Upload,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Indent,
  AlignLeft,
  AlignRight,
} from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
import { addScheme, updateScheme } from "../../../redux/store";
import { schemeTypes, applicableOnOptions, benefitTypes, productCategories } from "../../../data/content";

const emptyForm = {
  name: "",
  schemeType: schemeTypes[0],
  applicableOn: applicableOnOptions[0],
  status: "Active",
  shortDescription: "",
  description: "",
  termsConditions: "",
  startDate: "",
  endDate: "",
  noExpiry: false,
  benefitType: benefitTypes[0],
  benefitValue: "",
  maxDiscountValue: "",
  minPurchase: "",
  applicableProducts: "",
  applicableCategories: "",
  priority: "",
  banner: "",
};

function daysBetween(start, end) {
  if (!start || !end) return "";
  const d1 = new Date(start);
  const d2 = new Date(end);
  const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  if (isNaN(diff) || diff < 0) return "";
  return `${diff + 1} day${diff === 0 ? "" : "s"}`;
}

export default function SchemeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const schemes = [];
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bannerInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, mode: "onSubmit" });

  const shortDescription = watch("shortDescription") || "";
  const description = watch("description") || "";
  const termsConditions = watch("termsConditions") || "";
  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const noExpiry = watch("noExpiry");
  const banner = watch("banner");

  useEffect(() => {
    if (isEdit) {
      const existing = schemes.find((s) => String(s.id) === id);
      if (existing) reset({ ...emptyForm, ...existing });
    }
  }, [id, isEdit, schemes, reset]);

  const onSubmit = (data) => {
    if (isEdit) {
      dispatch(updateScheme({ ...data, id: Number(id) }));
    } else {
      dispatch(
        addScheme({
          ...data,
          id: Date.now(),
          createdOn: "Today",
          createdTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          createdBy: "Admin User",
        })
      );
    }
    navigate("/content/schemes");
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setValue("banner", reader.result);
    reader.readAsDataURL(file);
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  const Toolbar = () => (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50 text-gray-400">
      <span className="text-xs px-1.5 text-gray-500">Paragraph</span>
      <span className="w-px h-4 bg-gray-200 mx-1" />
      <Bold size={13} />
      <Italic size={13} />
      <Underline size={13} />
      <span className="w-px h-4 bg-gray-200 mx-1" />
      <List size={13} />
      <ListOrdered size={13} />
      <span className="w-px h-4 bg-gray-200 mx-1" />
      <Indent size={13} />
      <AlignLeft size={13} />
      <AlignRight size={13} />
    </div>
  );

  return (
    <AdminLayout title="Content Management">
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/content" className="hover:text-primary">Content Management</Link>
            <ChevronRight size={12} />
            <Link to="/content/schemes" className="hover:text-primary">Schemes</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">{isEdit ? "Edit Scheme" : "Add Scheme"}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit Scheme" : "Add Scheme"}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/content/schemes")}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="scheme-form"
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          >
            {isEdit ? "Save Changes" : "Save Scheme"}
          </button>
        </div>
      </div>

      <form id="scheme-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4 max-w-5xl" noValidate>
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Basic Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Scheme Name *</label>
              <input
                placeholder="Enter scheme name"
                {...register("name", { required: "Scheme name is required." })}
                className={inputClass("name")}
              />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Scheme Type *</label>
              <select {...register("schemeType", { required: true })} className={inputClass("schemeType")}>
                {schemeTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Applicable On *</label>
              <select {...register("applicableOn", { required: true })} className={inputClass("applicableOn")}>
                {applicableOnOptions.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status *</label>
              <select {...register("status", { required: true })} className={inputClass("status")}>
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Expired">Expired</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Short Description *</label>
            <textarea
              rows={2}
              maxLength={150}
              placeholder="Enter short description"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Scheme Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-800">Scheme Details</p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Description *</label>
              <div className={`border rounded-lg overflow-hidden ${errors.description ? "border-danger" : "border-gray-200"}`}>
                <Toolbar />
                <textarea
                  rows={5}
                  maxLength={2000}
                  placeholder="Enter detailed description"
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
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Terms & Conditions <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Toolbar />
                <textarea
                  rows={4}
                  maxLength={2000}
                  placeholder="Enter terms and conditions"
                  {...register("termsConditions")}
                  className="w-full px-3 py-2.5 text-sm focus:outline-none resize-none"
                />
                <div className="flex justify-end px-3 pb-2">
                  <p className="text-xs text-gray-400">{termsConditions.length} / 2000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Schedule & Validity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-4">Schedule & Validity</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Start Date *</label>
                  <input
                    type="date"
                    {...register("startDate", { required: "Start date is required." })}
                    className={inputClass("startDate")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">End Date *</label>
                  <input
                    type="date"
                    disabled={noExpiry}
                    {...register("endDate", { required: !noExpiry && "End date is required." })}
                    className={`${inputClass("endDate")} ${noExpiry ? "bg-gray-50 text-gray-400" : ""}`}
                  />
                </div>
              </div>
              {(errors.startDate || errors.endDate) && (
                <p className="text-xs text-danger mt-1">{errors.startDate?.message || errors.endDate?.message}</p>
              )}
              <div className="mt-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Validity Period</label>
                <input
                  disabled
                  value={noExpiry ? "No Expiry Date" : daysBetween(startDate, endDate) || "Automatically calculated"}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                <input
                  type="checkbox"
                  {...register("noExpiry")}
                  className="rounded border-gray-300 text-primary focus:ring-primary/30"
                />
                No Expiry Date
              </label>
            </div>

            {/* Benefits / Offer */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-800 mb-4">Benefits / Offer</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Benefit Type *</label>
                  <select {...register("benefitType", { required: true })} className={inputClass("benefitType")}>
                    {benefitTypes.map((b) => (
                      <option key={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Benefit Value *</label>
                  <div className="relative">
                    <input
                      placeholder="Enter value"
                      {...register("benefitValue", { required: "Benefit value is required." })}
                      className={`${inputClass("benefitValue")} pr-7`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  {errors.benefitValue && <p className="text-xs text-danger mt-1">{errors.benefitValue.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Max Discount Value <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      placeholder="Enter amount"
                      {...register("maxDiscountValue")}
                      className={`${inputClass("maxDiscountValue")} pl-7`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Min Purchase <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      placeholder="Enter amount"
                      {...register("minPurchase")}
                      className={`${inputClass("minPurchase")} pl-7`}
                    />
                  </div>
                </div>
              </div>
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
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Applicable Products *</label>
              <select
                {...register("applicableProducts", { required: "Applicable products is required." })}
                className={inputClass("applicableProducts")}
              >
                <option value="">Select products</option>
                {applicableOnOptions.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              {errors.applicableProducts && <p className="text-xs text-danger mt-1">{errors.applicableProducts.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Applicable Categories <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <select {...register("applicableCategories")} className={inputClass("applicableCategories")}>
                <option value="">Select categories</option>
                {productCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority / Sort Order</label>
              <input
                type="number"
                placeholder="Enter priority"
                {...register("priority")}
                className={inputClass("priority")}
              />
              <p className="text-[11px] text-gray-400 mt-1">Lower numbers appear first</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Display Banner <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                ref={bannerInputRef}
                onChange={handleBannerChange}
                className="hidden"
              />
              {banner ? (
                <div>
                  <img src={banner} alt="Banner" className="w-full h-16 object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full mt-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg py-1.5 hover:bg-gray-50"
                  >
                    Change Banner
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  className="w-full h-[72px] flex flex-col items-center justify-center gap-1 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-primary hover:text-primary"
                >
                  <Upload size={16} />
                  <span className="text-[11px] font-medium">Upload banner image</span>
                </button>
              )}
              <p className="text-[11px] text-gray-400 mt-1">Recommended size: 1200 × 400 px</p>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
