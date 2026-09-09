import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";
import { login } from "../redux/store";
import Logo from "../components/Logo";
import skyline from "../assets/skyline.jpg";

export default function Login() {
  const [showPin, setShowPin] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { userId: "", pin: "", remember: false },
    mode: "onSubmit",
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (data) => {
    dispatch(login(data.userId.trim()));
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden px-4">
      <img
        src={skyline}
        alt=""
        className="absolute bottom-0 left-0 w-full object-cover opacity-80 pointer-events-none select-none"
      />

      <div className="relative z-10 flex flex-col items-center">
        <Logo className="h-16 w-auto mb-8" />

        <div className="bg-white border border-gray-100 shadow-xl rounded-2xl w-[380px] px-7 py-7">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center mb-3">
              <ShieldCheck size={20} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Admin Login</h2>
            <p className="text-xs text-gray-400 mt-1">Welcome back! Please sign in to continue.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">User ID</label>
              <input
                type="text"
                placeholder="Enter your User ID"
                {...register("userId", { required: "User ID is required." })}
                className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                  errors.userId ? "border-danger" : "border-gray-200 focus:border-primary"
                }`}
              />
              {errors.userId && <p className="text-xs text-danger mt-1">{errors.userId.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">PIN</label>
              <div className="relative">
                <input
                  type={showPin ? "text" : "password"}
                  maxLength={4}
                  placeholder="Enter your 4-digit PIN"
                  {...register("pin", {
                    required: "PIN is required.",
                    minLength: { value: 4, message: "PIN must be 4 digits." },
                  })}
                  className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    errors.pin ? "border-danger" : "border-gray-200 focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.pin && <p className="text-xs text-danger mt-1">{errors.pin.message}</p>}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-gray-500">
                <input
                  type="checkbox"
                  {...register("remember")}
                  className="rounded border-gray-300 text-primary focus:ring-primary/30"
                />
                Remember User ID
              </label>
              <button type="button" className="text-primary font-medium">
                Forgot PIN?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-sm font-medium text-gray-700 py-2.5 rounded-lg hover:bg-gray-50">
            <ShieldCheck size={15} />
            Login with SSO
          </button>
        </div>

        <p className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-6">
          <Lock size={11} />
          Secure access. All activities are monitored and logged.
        </p>
      </div>
    </div>
  );
}
