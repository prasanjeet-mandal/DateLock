import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set());
  const [activeMatchNotification, setActiveMatchNotification] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // In dev mode on port 5173, connect directly to backend to avoid Vite proxy ECONNRESET aborts
    const isViteDev = window.location.port === '5173';
    const socketUrl = import.meta.env.VITE_SOCKET_URL || (isViteDev ? 'http://127.0.0.1:5000' : window.location.origin);

    const newSocket = io(socketUrl, {
      query: { userId: user.id },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time socket:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      // Graceful warning without throwing uncaught exceptions
      console.warn('Real-time socket waiting for backend server:', err.message);
    });

    newSocket.on('user:online', ({ userId }) => {
      setOnlineUserIds(prev => new Set(prev).add(userId));
    });

    newSocket.on('user:offline', ({ userId }) => {
      setOnlineUserIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id]);

  const isUserOnline = (userId) => onlineUserIds.has(userId);

  return (
    <SocketContext.Provider value={{
      socket,
      isUserOnline,
      activeMatchNotification,
      setActiveMatchNotification
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  return context || { socket: null, isUserOnline: () => false };
}
