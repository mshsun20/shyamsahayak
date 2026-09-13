import crypto from "crypto";

export const generateApiKey = () => {
    const secret = crypto.randomBytes(32).toString("hex");
    return `sk_ky_${secret}`;
};

export const hashApiKey = (apiKey) => {
    return crypto.createHash("sha256").update(apiKey).digest("hex");
};

export const getApiKeyPrefix = (apiKey) => {
    return apiKey.substring(0, 18);
};