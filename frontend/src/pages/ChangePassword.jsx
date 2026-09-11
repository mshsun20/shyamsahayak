import React from 'react'
import { Lock, Eye, EyeOff, CheckCircle2, ChevronLeft } from "lucide-react";

const PinField = React.memo(function PinField({ label, hint, value, onChange }) {
    const [visible, setVisible] = React.useState(false);
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
                    onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
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
    const [current, setCurrent] = React.useState("");
    const [next, setNext] = React.useState("");
    const [confirm, setConfirm] = React.useState("");

    const rules = [
        "4 digits",
        "Only numbers (0-9)",
        "Not same as old PIN",
        "Not in sequence",
    ];

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
                {rules.map((r) => (
                    <div key={r} className="flex items-center gap-2.5">
                        <CheckCircle2 size={17} className="text-emerald-500 shrink-0" />
                        <span className="text-[13.5px] text-neutral-600">{r}</span>
                    </div>
                ))}
            </div>

            <button
                disabled={current.length < 4 || next.length < 4 || confirm.length < 4}
                className="w-full mt-7 rounded-xl bg-brand py-3.5 text-white text-[15px] font-semibold disabled:opacity-50"
            >
                Update PIN
            </button>
            <button className="w-full mt-4 flex items-center justify-center gap-1 text-brand font-semibold text-[14px]">
                <ChevronLeft size={16} />
                Back to Login
            </button>
        </div>
    )
}

export default React.memo(ChangePassword)