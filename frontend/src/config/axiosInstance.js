import axios from "axios";
import { clearAuthState } from "../redux/slices/authSlice";
import { refreshAccessToken } from "./authRefresh";


const appenv = import.meta.env.VITE_APP_ENV || "development";
const baseUrl = {
    production: import.meta.env.VITE_APIURL_PRD,
    quality: import.meta.env.VITE_APIURL_QAS,
    development: import.meta.env.VITE_APIURL_DEV,
};


/*
 * Main Axios instance.
 *
 * This instance is used for normal REST API calls.
 */
const axiosInstance = axios.create({
    baseURL: baseUrl[appenv],
    withCredentials: true,
});


/*
 * Requests waiting for the current refresh operation.
 */
let isRefreshing = false;
let failedQueue = [];


/**
 * Resolve/reject all requests waiting for
 * the current token refresh.
 */
const processQueue = (error) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve();
        }
    });

    failedQueue = [];
};


export const setupInterceptors = (store) => {
    //----------------------------------------------------------
    // REQUEST
    //----------------------------------------------------------
    axiosInstance.interceptors.request.use(
        (config) => {
            const isFormData = config.data instanceof FormData;
            if (!isFormData) {
                config.headers["Content-Type"] = "application/json";
                config.headers["Accept"] = "application/json";
            }

            config.headers["X-Requested-With"] = "XMLHttpRequest";
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );


    //----------------------------------------------------------
    // RESPONSE
    //----------------------------------------------------------
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (!originalRequest) return Promise.reject(error);

            //--------------------------------------------------
            // Don't retry regenerate token endpoint
            //--------------------------------------------------
            if (originalRequest.url?.includes("/auth/regenerate-token")) {
                return Promise.reject(error);
            }

            //--------------------------------------------------
            // Skip login/register
            //--------------------------------------------------
            const excludedEndpoints = [
                "/auth/login",
                "/auth/register",
            ];
            const isExcluded = excludedEndpoints.some((endpoint) => originalRequest.url?.includes(endpoint));
            if (isExcluded) return Promise.reject(error);

            //--------------------------------------------------
            // Refresh only for 400 / 401
            //--------------------------------------------------
            const status = error.response?.status;
            if (status !== 401 || originalRequest._retry) {
                return Promise.reject(error);
            }

            //--------------------------------------------------
            // Already refreshing
            //--------------------------------------------------
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return axiosInstance(originalRequest);
                });
            }

            //--------------------------------------------------
            // Start refresh
            //--------------------------------------------------
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                /*
                 * IMPORTANT:
                 *
                 * This is now the COMMON refresh function.
                 *
                 * It is not axiosInstance.post().
                 */
                await refreshAccessToken();

                /*
                 * New access_token cookie has now
                 * been issued by the backend.
                 */
                processQueue(null);

                /*
                 * Retry the original request.
                 */
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                /*
                 * Refresh failed.
                 *
                 * Therefore all queued requests
                 * must fail.
                 */
                processQueue(refreshError);

                /*
                 * Refresh token is invalid/expired
                 * or the session is otherwise invalid.
                 */
                store.dispatch(clearAuthState());

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
    );
};


export default axiosInstance;