import React from 'react'
import "../styles/components/snackbar.css";
import { useDispatch, useSelector } from "react-redux";
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    X,
} from "lucide-react";
import { closeSnackbar } from "../redux/slices/snackbarSlice";

const Snackbar = () => {
    const dispatch = useDispatch();
    const { open, message, type, duration } = useSelector((state) => state.snackbar);

    React.useEffect(() => {
        if (!open || !message) {
            return;
        }
        const timer = setTimeout(() => {
            dispatch(closeSnackbar());
        }, duration);
        return () => {
            clearTimeout(timer);
        };
    }, [open, message, duration, dispatch]);

    if (!open || !message) {
        return null;
    }

    const snackbarConfig = {
        success: { icon: CheckCircle2, title: "Success" },
        error: { icon: XCircle, title: "Error" },
        warning: { icon: AlertTriangle, title: "Warning" },
        info: { icon: Info, title: "Information" },
    };
    const config = snackbarConfig[type] || snackbarConfig.info;
    const Icon = config.icon;

    const handleClose = () => {
        dispatch(closeSnackbar());
    };

  return (
    <div className="snackbar-container">
        <div
            className={`snackbar snackbar-${type}`}
            role="alert"
            aria-live="polite"
        >
            <div className="snackbar-icon">
                <Icon size={22} />
            </div>
            <div className="snackbar-content">
                {/* <div className="snackbar-title">
                    {config.title}
                </div> */}
                <div className="snackbar-message">
                    {message}
                </div>
            </div>
            <button
                type="button"
                className="snackbar-close"
                onClick={handleClose}
                aria-label="Close notification"
            >
                <X size={18} />
            </button>
        </div>
    </div>
  )
}

export default React.memo(Snackbar)