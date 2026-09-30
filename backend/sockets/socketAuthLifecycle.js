const SOCKET_AUTH_EXPIRY_BUFFER = 5000;


/**
 * Handles the lifetime of an authenticated socket.
 *
 * The socket is authenticated using the access token
 * that existed when the handshake happened.
 *
 * When that access token expires, the socket is disconnected.
 *
 * The React client will then:
 *
 * 1. call the refresh endpoint
 * 2. receive a new access_token cookie
 * 3. reconnect Socket.IO
 * 4. socketAuth validates the new access token
 */
export const setupSocketAuthLifecycle = (io, socket) => {
    const expiresAt = socket.auth?.expiresAt;
    if (!expiresAt) return;

    const remainingTime = expiresAt - Date.now();
    const disconnectDelay = Math.max(remainingTime + SOCKET_AUTH_EXPIRY_BUFFER, 0);
    socket.data.authExpiryTimer = setTimeout(() => {
        if (socket.connected) {
            console.log(`Socket access token expired: ${socket.id}`);
            socket.emit("auth:expired", { message: "Access token expired" });

            /*
             * Force the connection closed.
             *
             * Client will refresh the access token
             * and reconnect.
             */
            socket.disconnect(true);
        }
    }, disconnectDelay);
};


export const clearSocketAuthLifecycle = (socket) => {
    if (socket.data.authExpiryTimer) {
        clearTimeout(socket.data.authExpiryTimer);
        socket.data.authExpiryTimer = null;
    }
};