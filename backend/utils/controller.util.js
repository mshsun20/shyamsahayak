import { isValidObjectId } from "./objectValidation.util.js";

export const STATUSES = ["Active", "Inactive"];

// Consistent error response; Mongo duplicate-key errors become 409 instead of 400
export const sendError = (res, error, duplicateMessage = "Record already exists") => {
    console.error(error);
    if (error?.code === 11000) {
        return res.status(409).json({ success: false, message: duplicateMessage });
    }
    return res.status(error?.statusCode || 400).json({ success: false, message: error?.message || "Something went wrong" });
};

// Throwable validation error carrying an HTTP status
export const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

// Keep only the listed keys that are present on the payload
export const pick = (payload = {}, keys = []) =>
    keys.reduce((acc, key) => (payload[key] !== undefined ? { ...acc, [key]: payload[key] } : acc), {});

// Validates a positive number with at most `decimals` decimal places and returns it as a Number
export const parsePositiveNumber = (raw, label, decimals) => {
    const text = String(raw ?? "").trim();
    const pattern = new RegExp(`^\\d+(\\.\\d{1,${decimals}})?$`);
    if (!text) throw httpError(400, `${label} is required`);
    if (!pattern.test(text)) throw httpError(400, `${label} must be a number with up to ${decimals} decimal places`);
    const value = Number(text);
    if (!(value > 0)) throw httpError(400, `${label} must be greater than 0`);
    return value;
};

export const validateStatus = (status) => {
    if (!STATUSES.includes(status)) throw httpError(400, `Status must be one of: ${STATUSES.join(", ")}`);
    return status;
};

export const validateText = (raw, label, { required = false, max = 250 } = {}) => {
    const text = String(raw ?? "").trim();
    if (required && !text) throw httpError(400, `${label} is required`);
    if (text.length > max) throw httpError(400, `${label} must be at most ${max} characters`);
    return text;
};

export const requireObjectId = (id, label = "id") => {
    if (!id || !isValidObjectId(id)) throw httpError(400, `Invalid ${label}`);
    return String(id);
};

// Builds a status filter from ?status=Active|Inactive
export const statusFilter = (query = {}) => (STATUSES.includes(query.status) ? { status: query.status } : {});
