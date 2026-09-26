import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Eye, EyeOff, ChevronRight, Plus } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout";
// import { addUser, updateUser } from "../../redux/store";
import { reportingManagers, territories, districts } from "../../data/users";
import axiosInstance from "../../config/axiosInstance";

const emptyForm = {
  fullName: "",
  employeeId: "",
  email: "",
  phone: "",
  status: "Active",
  role: "DGO",
  reportingManagerId: reportingManagers[0].id,
  territory: territories[0],
  district: districts[0],
  username: "",
  password: "",
  confirmPassword: "",
  mustChangePassword: false,
  remarks: "",
};

const AddUser = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  // const users = useSelector((state) => state.users);
  const [user, setUser] = React.useState(null);
  const [accounts, setAccounts] = React.useState([]);
  const [roles, setRoles] = React.useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const fetchAllMasters = React.useCallback(async () => {
    try {
      const [accountResponse, roleResponse] = await Promise.allSettled([
        axiosInstance.get(`/accounts`).then(res => res.data.data?.accounts),
        axiosInstance.get(`/roles`).then(res => res.data.data),
      ])

      // console.log(accountResponse);
      // console.log(roleResponse);

      if (accountResponse.status === "fulfilled" || roleResponse.status === "fulfilled") {
        const allAccounts = accountResponse?.value?.length>0 ? accountResponse?.value?.map(acc => acc?.fullName) : [];
        const allRoles = roleResponse?.value?.length>0 ? roleResponse?.value?.map(rol => rol?.name) : []
        setAccounts(allAccounts);
        setRoles(allRoles);
      }
      else {
        setAccounts([]);
        setRoles([]);
      }
    } catch (error) {
      console.error(error.message);
    }
  }, [])
  React.useEffect(() => {
    fetchAllMasters();
  }, [fetchAllMasters]);

  // const masterDataSet = await fetchAllMasters();
  // console.log(masterDataSet);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, mode: "onSubmit" });

  const passwordValue = watch("password");

  const fetchData = React.useCallback(async () => {
    try {
      const respone = await axiosInstance.get(`/accounts/${id}`);
      // console.log(respone.data?.data);
      if (respone.status === 200) {
        setUser(respone?.data?.data);
      }
      else {
        setUser(null);
      }
    } catch (error) {
      console.error(error.message);
    }
  }, []);
  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (isEdit) {
      if (user !== null) {
        reset({
          ...emptyForm,
          ...user,
          password: "",
          confirmPassword: "",
          mustChangePassword: false,
        });
      }
    }
  }, [id, isEdit, user, reset]);

  const onSubmit = (data) => {
    // const manager = reportingManagers.find((m) => m.id === data.reportingManagerId);
    // const payload = {
    //   ...data,
    //   reportingManager: manager?.name || "",
    //   reportingManagerId: manager?.id || "",
    // };
    // delete payload.password;
    // delete payload.confirmPassword;
    // delete payload.mustChangePassword;

    // if (isEdit) {
    //   dispatch(updateUser({ ...payload, id: Number(id) }));
    // } else {
    //   dispatch(
    //     addUser({
    //       ...payload,
    //       id: Date.now(),
    //       lastLogin: "-",
    //       loginTime: "-",
    //     })
    //   );
    // }
    // navigate("/users");
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
      errors[field] ? "border-danger" : "border-gray-200 focus:border-primary"
    }`;

  return (
    <AdminLayout title={isEdit ? "Edit User" : "Add User"}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
            <Link to="/users" className="hover:text-primary">Users & Mapping</Link>
            <ChevronRight size={12} />
            <Link to="/users" className="hover:text-primary">User List</Link>
            <ChevronRight size={12} />
            <span className="text-gray-600">{isEdit ? "Edit User" : "Add User"}</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{isEdit ? "Edit User" : "Add User"}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/users")}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="user-form"
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          >
            Save
          </button>
        </div>
      </div>

      <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4" noValidate>
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Basic Information</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
              <input {...register("fullName", { required: "Full name is required." })} className={inputClass("fullName")} />
              {errors.fullName && <p className="text-xs text-danger mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Employee ID *</label>
              <input {...register("employeeId", { required: "Employee ID is required." })} className={inputClass("employeeId")} />
              {errors.employeeId && <p className="text-xs text-danger mt-1">{errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address</label>
              <input
                type="email"
                {...register("email", {
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
                })}
                className={inputClass("email")}
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number</label>
              <input {...register("phone")} className={inputClass("phone")} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Status *</label>
              <select {...register("status", { required: true })} className={inputClass("status")}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Role *</label>
              <select {...register("role", { required: true })} className={inputClass("role")}>
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Reporting & Territory */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Reporting & Territory</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Reporting Manager *</label>
              <div className="flex gap-2">
                <select
                  {...register("reportingManagerId", { required: true })}
                  className={inputClass("reportingManagerId")}
                >
                  {accounts.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <button type="button" title="Add manager" className="shrink-0 w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-primary hover:border-primary">
                  <Plus size={15} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Territory *</label>
              <div className="flex gap-2">
                <select {...register("territory", { required: true })} className={inputClass("territory")}>
                  {territories.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <button type="button" title="Add territory" className="shrink-0 w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-primary hover:border-primary">
                  <Plus size={15} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">District *</label>
              <div className="flex gap-2">
                <select {...register("district", { required: true })} className={inputClass("district")}>
                  {districts.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <button type="button" title="Add district" className="shrink-0 w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-primary hover:border-primary">
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Access & Security */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-4">Access & Security</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="">
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Username *</label>
              <input {...register("username", { required: "Username is required." })} className={inputClass("username")} />
              {errors.username && <p className="text-xs text-danger mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password{!isEdit && " *"}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={isEdit ? "Leave blank to keep current" : ""}
                  {...register("password", {
                    required: isEdit ? false : "Password is required.",
                    minLength: { value: 4, message: "Password must be at least 4 characters." },
                  })}
                  className={inputClass("password")}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm Password{!isEdit && " *"}</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  {...register("confirmPassword", {
                    validate: (value) =>
                      !passwordValue || value === passwordValue || "Passwords do not match.",
                  })}
                  className={inputClass("confirmPassword")}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                {...register("mustChangePassword")}
                className="rounded border-gray-300 text-primary focus:ring-primary/30"
              />
              User must change password on next login
            </label>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-semibold text-gray-800 mb-1">Additional Information (Optional)</p>
          <label className="block text-xs font-medium text-gray-600 mb-1.5 mt-3">Remarks</label>
          <textarea
            {...register("remarks")}
            rows={3}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </form>
    </AdminLayout>
  );
}

export default React.memo(AddUser);