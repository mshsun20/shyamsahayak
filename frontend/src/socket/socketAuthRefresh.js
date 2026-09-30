// import axiosInstance from "../config/axiosInstance";
// import { socket } from "./socket";


// let refreshPromise = null;


// /**
//  * Refresh the access token.
//  *
//  * Concurrent refresh requests share the same promise.
//  */
// export const refreshSocketAuthentication = async () => {
//     if (!refreshPromise) {
//         refreshPromise = axiosInstance.post("/auth/regenerate-token").then((response) => {
//             return response;
//         }).finally(() => {
//             refreshPromise = null;
//         });
//     }

//     return refreshPromise;
// };


// /**
//  * Refresh authentication and reconnect Socket.IO.
//  */
// export const refreshAndReconnectSocket = async () => {
//     try {
//         await refreshSocketAuthentication();
//         if (socket.connected) return true;
//         socket.connect();
//         return true;
//     } catch (error) {
//         console.error("Socket authentication refresh failed:", error);
//         return false;
//     }
// };







import { refreshAccessToken } from "../config/authRefresh";
import { socket } from "./socket";


/**
 * Refresh authentication for Socket.IO.
 *
 * This uses the same refresh operation as Axios.
 */
export const refreshSocketAuthentication = async () => {
    try {
        return await refreshAccessToken();
    } catch (error) {
        console.error("Socket authentication refresh failed:", error);
        throw error;
    }
};


/**
 * Refresh authentication and reconnect
 * the Socket.IO connection.
 */
export const refreshAndReconnectSocket = async () => {
    try {
        /*
         * This uses the COMMON refresh function.
         *
         * If Axios is already refreshing the token,
         * this call waits for the same refresh promise.
         */
        await refreshSocketAuthentication();

        /*
         * The browser now has the new HttpOnly
         * access_token cookie.
         */
        if (socket.connected) return true;

        /*
         * Socket.IO creates a new handshake.
         *
         * Browser automatically sends the updated
         * HttpOnly access_token cookie.
         */
        socket.connect();
        return true;
    } catch (error) {
        console.error("Socket authentication refresh failed:", error);
        return false;
    }
};