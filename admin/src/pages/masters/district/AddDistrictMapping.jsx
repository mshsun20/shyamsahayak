import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft, CheckCircle2, Map, Landmark, Factory, UserCircle2, Users, Home, ArrowLeftRight, } from "lucide-react";
import AdminLayout from "../../../layouts/AdminLayout";
// import { addMapping, updateMapping } from "../../../redux/store";
import { states, districtsByState, fabricatorOptions, dgoOptions, tmOptions, dealerOptions, distributorOptions, } from "../../../data/masterData";

const emptyForm = {
  state: "",
  district: "",
  fabricator: "",
  dgo: "",
  tm: "",
  dealer: "",
  distributor: "",
};

const previewSteps = [
  { key: "state", label: "State", icon: Map },
  { key: "district", label: "District", icon: Landmark },
  { key: "fabricator", label: "Fabricator", icon: Factory },
  { key: "dgo", label: "DGO", icon: UserCircle2 },
  { key: "tm", label: "TM", icon: Users },
  { key: "dealer", label: "Dealer", icon: Home },
  { key: "distributor", label: "DB (Distributor)", icon: ArrowLeftRight },
];

export default function AddDistrictMapping() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const mappings = [];
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm({
    defaultValues: emptyForm,
    mode: "onSubmit",
  });

  const values = watch();

  useEffect(() => {
    if (isEdit) {
      const existing = mappings.find((m) => String(m.id) === id);
      if (existing) reset({ ...emptyForm, ...existing });
    }
  }, [id, isEdit, mappings, reset]);

  const availableDistricts = values.state ? districtsByState[values.state] || [] : [];

  const onSubmit = (data) => {
    if (isEdit) {
      // dispatch(updateMapping({ ...data, id: Number(id) }));
    } else {
      // dispatch(addMapping({ ...data, id: Date.now() }));
    }
    navigate("/district-master");
  };

  const allFilled = previewSteps.every((s) => Boolean(values[s.key]));

  const selectClass = (field) =>
    `w-full text-sm border rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  return (
    <AdminLayout title="Master Data">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/district-master" className="hover:text-primary">District Master</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">{isEdit ? "Edit Mapping" : "Add Mapping"}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit District Mapping" : "Add District Mapping"}</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Map the hierarchy of State → District → Fabricator → DGO → TM → Dealer → DB (Distributor).
          </p>
        </div>
        <button
          onClick={() => navigate("/district-master")}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3.5 py-2 hover:bg-gray-50 shrink-0"
        >
          <ArrowLeft size={14} />
          Back to List
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-4xl" noValidate>
        {/* Location */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Location</p>
              <p className="text-xs text-gray-400 mt-1">Select state and district</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">State *</label>
              <select
                {...register("state", { required: "State is required." })}
                onChange={(e) => {
                  setValue("state", e.target.value);
                  setValue("district", "");
                }}
                className={selectClass("state")}
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">District *</label>
              <select
                {...register("district", { required: "District is required." })}
                disabled={!values.state}
                className={`${selectClass("district")} ${!values.state ? "bg-gray-50 text-gray-400" : ""}`}
              >
                <option value="">Select District</option>
                {availableDistricts.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue("state", "");
                setValue("district", "");
              }}
              className="flex items-center gap-1 text-xs font-medium text-success self-end mb-2.5"
            >
              <CheckCircle2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Fabricator */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Fabricator</p>
              <p className="text-xs text-gray-400 mt-1">Select fabricator under the selected district</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Fabricator *</label>
              <select {...register("fabricator", { required: "Fabricator is required." })} className={selectClass("fabricator")}>
                <option value="">Select Fabricator</option>
                {fabricatorOptions.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </div>
            <div />
            <button
              type="button"
              onClick={() => setValue("fabricator", "")}
              className="flex items-center gap-1 text-xs font-medium text-success self-end mb-2.5"
            >
              <CheckCircle2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Team Mapping */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Team Mapping</p>
              <p className="text-xs text-gray-400 mt-1">Select DGO and TM under the fabricator</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">DGO *</label>
              <select {...register("dgo", { required: "DGO is required." })} className={selectClass("dgo")}>
                <option value="">Select DGO</option>
                {dgoOptions.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">TM *</label>
              <select {...register("tm", { required: "TM is required." })} className={selectClass("tm")}>
                <option value="">Select TM</option>
                {tmOptions.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue("dgo", "");
                setValue("tm", "");
              }}
              className="flex items-center gap-1 text-xs font-medium text-success self-end mb-2.5"
            >
              <CheckCircle2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Channel Mapping */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr_1fr_auto] gap-4 items-start">
            <div>
              <p className="text-sm font-semibold text-gray-800">Channel Mapping</p>
              <p className="text-xs text-gray-400 mt-1">Select dealer and DB under the TM</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Dealer *</label>
              <select {...register("dealer", { required: "Dealer is required." })} className={selectClass("dealer")}>
                <option value="">Select Dealer</option>
                {dealerOptions.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">DB (Distributor) *</label>
              <select {...register("distributor", { required: "Distributor is required." })} className={selectClass("distributor")}>
                <option value="">Select DB</option>
                {distributorOptions.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setValue("dealer", "");
                setValue("distributor", "");
              }}
              className="flex items-center gap-1 text-xs font-medium text-success self-end mb-2.5"
            >
              <CheckCircle2 size={13} />
              Clear
            </button>
          </div>
        </div>

        {/* Mapping Preview */}
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
            <Map size={14} className="text-info" />
            Mapping Preview
          </p>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            {allFilled ? "Full mapping is ready to be saved." : "Please complete all selections to preview the full mapping."}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-4">
            {previewSteps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1 w-24 text-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      values[step.key] ? "bg-primary text-white" : "bg-white text-gray-300 border border-gray-200"
                    }`}
                  >
                    <step.icon size={16} />
                  </div>
                  <span className="text-[11px] text-gray-500">{step.label}</span>
                  {values[step.key] && (
                    <span className="text-[11px] font-medium text-gray-700 truncate w-24">{values[step.key]}</span>
                  )}
                </div>
                {i < previewSteps.length - 1 && <ChevronRight size={14} className="text-gray-300 mb-4" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/district-master")}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark">
            {isEdit ? "Save Changes" : "Save Mapping"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
