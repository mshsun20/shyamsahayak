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

    // const handleConnectError = React.useCallback((error) => {
    //     console.error("Socket connection error:", error.message);
    // }, []);
    const refreshInProgress = React.useRef(false);

    const handleConnectError = React.useCallback(async (error) => {
        console.error("Socket connection error:", error.message);
        if (refreshInProgress.current) return;

        if (error.message === "Authentication required" ||
            error.message === "Invalid or expired access token"
        ) {
            refreshInProgress.current = true;

            try {
                const reconnected = await refreshAndReconnectSocket();
                if (!reconnected) console.error("Socket authentication recovery failed.");
            } finally {
                refreshInProgress.current = false;
            }
        }
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