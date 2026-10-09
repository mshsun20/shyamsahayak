import React from "react";
import { socket } from "./socket";
import { refreshAndReconnectSocket } from "./socketAuthRefresh";

const SocketConnection = () => {
    const handleConnect = React.useCallback(() => {
        console.log("Socket connected:", socket.id);
    }, []);

    const handleDisconnect = React.useCallback((reason) => {
        console.log("Socket disconnected:", reason);
    }, []);

    const handleConnectError = React.useCallback((error) => {
        console.error("Socket connection error:", error.message);
    }, []);

    const handleAuthExpired = React.useCallback(async () => {
        console.warn("Socket authentication expired. Refreshing authentication...");
        const reconnected = await refreshAndReconnectSocket();

        if (!reconnected) {
            console.error("Socket reconnection failed after authentication refresh.");
        }
    }, []);

    React.useEffect(() => {
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);
        socket.on("auth:expired", handleAuthExpired);
        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
            socket.off("auth:expired", handleAuthExpired);
            socket.disconnect();
        };
    }, [
        handleConnect,
        handleDisconnect,
        handleConnectError,
        handleAuthExpired,
    ]);

    return null;
};

export default SocketConnection;