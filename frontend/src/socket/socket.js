import { io } from "socket.io-client";

const appenv = import.meta.env.VITE_APP_ENV || "development";

const socketUrl = {
    production: import.meta.env.VITE_SOCKET_APIURL_PRD,
    quality: import.meta.env.VITE_SOCKET_APIURL_QAS,
    development: import.meta.env.VITE_SOCKET_APIURL_DEV,
};

export const socket = io(socketUrl[appenv], { autoConnect: false, withCredentials: true, reconnection: false });