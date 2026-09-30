import React from 'react'
import { socket } from './socket';

const SocketConnection = () => {
    const handleConnect = React.useCallback(() => {
        console.log("Socket connected:", socket.id);
    }, [])
    const handleDisconnect = React.useCallback((reason) => {
        console.log(`Socket ${socket.id} disconnected: `, reason);
    }, [])
    const handleConnectError = React.useCallback((error) => {
        console.log(`Socket connection error: `, error.message);
    }, [])
    React.useEffect(() => {
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);

            socket.disconnect();
        }
    }, [handleConnect, handleDisconnect, handleConnectError])
  return null;
}

export default SocketConnection