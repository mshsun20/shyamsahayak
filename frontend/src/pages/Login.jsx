import React from "react";
import "../styles/login.css";
import {
    Eye,
    EyeOff,
    UserRound,
    LockKeyhole,
    ShieldCheck,
    ChevronRight,
    X,
} from "lucide-react";
import loginWall from "../assets/images/login-wall.png";
import companyLogo from "../assets/logos/company-logo.png";
import axiosInstance from "../config/axiosInstance";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice";
import { NavLink } from "react-router";

const DEMO_USER = {
    employeeId: "EMP001",
    pin: "1234",
    name: "Demo Employee",
};

const Login = () => {
    const dispatch = useDispatch();
    const [employeeId, setEmployeeId] = React.useState("");
    const [pin, setPin] = React.useState("");
    const [showPin, setShowPin] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState("");
    const [error, setError] = React.useState("");
    const [showForgot, setShowForgot] = React.useState(false);
    const [showSupport, setShowSupport] = React.useState(false);

    const submitLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const normalizedId = employeeId.trim();

        if (!normalizedId) {
            setError("Please enter your employee ID.");
            return;
        }

        // if (!/^\d{4}$/.test(pin)) {
        //     setError("PIN must contain exactly 4 digits.");
        //     return;
        // }

        setLoading(true);

        // Simulated API request using static data.
        // await new Promise((resolve) => setTimeout(resolve, 800));

        // if (normalizedId === DEMO_USER.employeeId && pin === DEMO_USER.pin) {
        //     setMessage(`Welcome, ${DEMO_USER.name}. Login successful.`);
        // } else {
        //     setError("Invalid employee ID or PIN.");
        // }

        try {
            const response = await dispatch(login({ username: normalizedId, password: pin }));
            console.log(response);
        } catch (error) {
            setLoading(false);
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePinChange = (value) => {
        // setPin(value.replace(/\D/g, "").slice(0, 4));
        setPin(value)
    };

    return (
        <main className="login-page">
            <section className="login-shell" aria-label="Seltiger Sahayak login">
                <div className="brand-panel">
                    <img
                        src={loginWall}
                        alt="Seltiger Sahayak branding"
                        className="brand-reference"
                    />
                    <img src={companyLogo} alt="login logo" className="brand-logo" />
                </div>

                <form className="login-form" onSubmit={submitLogin} noValidate>
                    <div className="field-group">
                        <label htmlFor="employeeId">Employee ID</label>
                        <div
                            className={`input-box ${error && !employeeId ? "invalid" : ""}`}
                        >
                            <UserRound size={20} strokeWidth={1.8} />
                            <input
                                id="employeeId"
                                type="text"
                                value={employeeId}
                                onChange={(e) => setEmployeeId(e.target.value)}
                                placeholder="Enter employee ID"
                                autoComplete="username"
                            />
                        </div>
                    </div>

                    <div className="field-group pin-group">
                        <label htmlFor="pin">PIN</label>
                        <div className="input-box">
                            <LockKeyhole size={20} strokeWidth={1.8} />
                            <input
                                id="pin"
                                type={showPin ? "text" : "password"}
                                inputMode="numeric"
                                // maxLength={4}
                                value={pin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                placeholder="Enter 4-digit PIN"
                                autoComplete="current-password"
                            />
                            <button
                                type="button"
                                className="icon-button"
                                aria-label={showPin ? "Hide PIN" : "Show PIN"}
                                onClick={() => setShowPin((value) => !value)}
                            >
                                {showPin ? <EyeOff size={21} /> : <Eye size={21} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="forgot-link"
                        onClick={() => {
                            setShowForgot(true);
                            setMessage("");
                            setError("");
                        }}
                    >
                        Forgot PIN?
                    </button>

                    <button className="login-button" disabled={loading}>
                        {loading ? <span className="spinner" /> : "Login"}
                    </button>

                    {(error || message) && (
                        <div className={`form-message ${error ? "error" : "success"}`}>
                            {error || message}
                        </div>
                    )}

                    <div className="or-divider">
                        <span />
                        <em>or</em>
                        <span />
                    </div>

                    <button
                        type="button"
                        className="support-card"
                        onClick={() => setShowSupport(true)}
                    >
                        <span className="support-icon">
                            <ShieldCheck size={24} strokeWidth={2} />
                        </span>

                        <span className="support-text">Need help? Contact support</span>

                        <ChevronRight
                            className="support-arrow"
                            size={22}
                            strokeWidth={1.8}
                        />
                    </button>
                </form>

                <div className="login-footer">
                    <span className="login-disclaimer">© SEL Tiger. All rights reserved.</span>
                </div>
            </section>

            {showForgot && (
                <div
                    className="modal-backdrop"
                    onMouseDown={() => setShowForgot(false)}
                >
                    <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => setShowForgot(false)}
                        ><X size={20} /></button>
                        <h2>Forgot PIN?</h2>
                        <p>Please contact your administrator or support team to reset your employee PIN.</p>
                        <button
                            className="modal-primary"
                            onClick={() => setShowForgot(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {showSupport && (
                <div
                    className="modal-backdrop"
                    onMouseDown={() => setShowSupport(false)}
                >
                    <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                        <button
                            className="modal-close"
                            onClick={() => setShowSupport(false)}
                        ><X size={20} /></button>
                        <h2>Contact Support</h2>
                        <p>For login assistance, please contact the Seltiger Sahayak support team.</p>
                        <div className="support-details">
                            <strong>Support hours</strong>
                            <span>Monday - Saturday, 9:00 AM - 6:00 PM</span>
                            <strong>Email</strong>
                            <span>support@example.com</span>
                        </div>
                        <button
                            className="modal-primary"
                            onClick={() => setShowSupport(false)}
                        >Close</button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Login;
