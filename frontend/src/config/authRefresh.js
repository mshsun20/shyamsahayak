import axios from "axios";


const appenv = import.meta.env.VITE_APP_ENV || "development";
const baseUrl = {
    production: import.meta.env.VITE_APIURL_PRD,
    quality: import.meta.env.VITE_APIURL_QAS,
    development: import.meta.env.VITE_APIURL_DEV,
};


/*
 * IMPORTANT:
 *
 * This is intentionally a separate Axios instance.
 *
 * It does NOT use axiosInstance.js because axiosInstance
 * has the response interceptor which itself performs
 * token refresh.
 *
 * Using a separate instance prevents:
 *
 * refresh request
 *      ↓
 * interceptor
 *      ↓
 * refresh request
 *      ↓
 * infinite loop
 */
const refreshClient = axios.create({
    baseURL: baseUrl[appenv],
    withCredentials: true,
});


/*
 * Shared refresh promise.
 *
 * If multiple requests simultaneously discover that
 * the access token has expired, only ONE refresh request
 * will actually be sent.
 *
 * All callers wait for the same promise.
 */
let refreshPromise = null;


/**
 * Refresh the access token.
 *
 * This function is shared by:
 *
 * 1. Axios REST authentication
 * 2. Socket.IO authentication
 *
 * The refresh_token remains HttpOnly and is automatically
 * sent by the browser because withCredentials is enabled.
 */
export const refreshAccessToken = async () => {
    if (!refreshPromise) {
        refreshPromise = refreshClient.post("/auth/regenerate-token").finally(() => { refreshPromise = null });
    }

    return refreshPromise;
};


export default refreshAccessToken;