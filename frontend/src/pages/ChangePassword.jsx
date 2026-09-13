import React from 'react'
import { Lock, Eye, EyeOff, CheckCircle2, ChevronLeft } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { logout } from "../redux/slices/authSlice";
import { Navigate, NavLink, useNavigate } from 'react-router';
import axiosInstance from '../config/axiosInstance';

const PinField = React.memo(function PinField({ label, hint, value, onChange }) {
    const [visible, setVisible] = React.useState(false);
    const handleChange = (e) => {
        onChange(e.target.value.replace(/\D/g, ""));
        // onChange(e.target.value);
    }

    return (
        <div className="mt-5">
            <p className="text-[15px] font-bold text-neutral-900">{label}</p>
            <p className="text-[12.5px] text-neutral-500 mt-0.5">{hint}</p>
            <div className="relative mt-2">
                <input
                    type={visible ? "text" : "password"}
                    inputMode="numeric"
                    maxLength={4}
                    value={value}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-neutral-200 py-3.5 px-4 text-[20px] tracking-[10px] font-semibold text-neutral-800 outline-none focus:border-brand"
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400"
                >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
})

const ChangePassword = () => {
    const dispatch = useDispatch();
    const [current, setCurrent] = React.useState("");
    const [next, setNext] = React.useState("");
    const [confirm, setConfirm] = React.useState("");
    const [validationError, setValidationError] = React.useState("");
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);
    const userPassChangeFlag = user?.passwordChangeFlag;
    // console.log(userPassChangeFlag);

    const rules = [
        "4 digits",
        "Only numbers (0-9)",
        "Not same as old PIN",
        "Not in sequence",
        "New and Confirm both should be same"
    ];
    React.useEffect(() => {
        if (!confirm) {
            setValidationError("");
            return;
        }
        if (next !== confirm) {
            setValidationError(rules[4]);
        }
        else {
            setValidationError("");
        }
    }, [next, confirm])

    const handleLogout = React.useCallback(async () => {
        try {
            await dispatch(logout());
        } catch (error) {
            console.error(error.message);
        }
    }, [dispatch])

    const handlePassChange = React.useCallback(async () => {
        // console.log(current);
        // console.log(next);
        // console.log(confirm);

        if (next !== confirm) {
            setValidationError(rules[4]);
            return;
        }

        try {
            const response = await axiosInstance.post("/auth/change-pass", { current, next });
            console.log(response);
            if (response.status === 201) {
                if (response.data?.success) {
                    handleLogout();
                }
                else {
                    alert(response.data.mesasge)
                }
            }
        } catch (error) {
            console.error(error.message);
        }
    }, [handleLogout, rules]);

    const isConfirmValid = !confirm || next === confirm;

    return (
        <div className="min-h-dvh px-4 pt-6 pb-10">
            <h1 className="text-[19px] font-bold text-neutral-900">Change PIN</h1>

            <div className="flex items-start gap-3 mt-4">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                    <Lock size={19} className="text-brand" strokeWidth={2.25} />
                </div>
                <p className="text-[13.5px] text-neutral-600 leading-snug pt-1">
                    For your security, you must change your PIN before continuing.
                </p>
            </div>

            <PinField
                label="Current PIN"
                hint="Enter your current 4-digit PIN"
                value={current}
                onChange={setCurrent}
            />
            <PinField
                label="New PIN"
                hint="Enter a new 4-digit PIN"
                value={next}
                onChange={setNext}
            />
            <PinField
                label="Confirm New PIN"
                hint="Re-enter the new 4-digit PIN"
                value={confirm}
                onChange={setConfirm}
            />

            <div className="flex flex-col gap-2.5 mt-5">
                {rules.map((r, i) => {
                    const isInvalid = i === 4 && validationError === r;
                    const isValid = i === 4 && confirm.length > 0 && isConfirmValid;
                    return (
                        <div key={r} className="flex items-center gap-2.5">
                            <CheckCircle2
                                size={17}
                                className={isInvalid ? `text-red-500 shrink-0` : `text-emerald-500 shrink-0`}
                            />
                            <span
                                className={`text-[13.5px] ${isInvalid && "text-red-500"} text-neutral-600`}
                            >
                                {r}
                            </span>
                        </div>
                    )
                })}
            </div>

            <button
                disabled={current.length < 4 || next.length < 4 || confirm.length < 4 || validationError}
                className={`w-full mt-7 rounded-xl bg-brand py-3.5 text-white text-[15px] font-semibold disabled:cursor-not-allowed! disabled:opacity-50`}
                onClick={handlePassChange}
            >
                Update PIN
            </button>

            {userPassChangeFlag
            ? <button
                onClick={handleLogout}
                className="w-full mt-4 flex items-center justify-center gap-1 text-amber-950 font-semibold text-[14px]"
            >
                <ChevronLeft size={16} />
                Back to Login
            </button>
            : <button
                onClick={() => navigate("/dashboard")}
                className="w-full mt-4 flex items-center justify-center gap-1 text-brand font-semibold text-[14px]"
            >
                <ChevronLeft size={16} />
                Back to Home
            </button>}
        </div>
    )
}

export default React.memo(ChangePassword)