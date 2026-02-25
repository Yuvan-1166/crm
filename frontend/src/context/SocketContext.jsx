import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

/**
 * SocketContext — manages a single Socket.IO connection per authenticated user.
 *
 * v2 — Organization Namespace Isolation:
 *  - Connects to /org/<companyId> instead of the shared root namespace
 *  - A user from org 42 connects to /org/42; they cannot receive events from /org/99
 */

const SocketContext = createContext(null);

const SOCKET_SERVER = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated, user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Resolve companyId: prefer user object, fall back to JWT payload decode
    // (needed for sessions created before companyId was added to the user object)
    let companyId = user?.companyId;
    if (!companyId && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        companyId = payload?.companyId;
      } catch { /* ignore malformed token */ }
    }

    if (!isAuthenticated || !token || !companyId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const orgNamespace = `/org/${companyId}`;

    const socket = io(`${SOCKET_SERVER}${orgNamespace}`, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log(`🔌 Socket connected [org:${user.companyId}]:`, socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('🔌 Socket connection error:', err.message);
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, token, user?.companyId]);

  // emit always reads socketRef.current at call time — never stale
  const emit = useCallback((event, data, ack) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data, ack);
    } else {
      console.warn(`[Socket] emit('${event}') skipped — socket not connected`);
    }
  }, []);

  const value = {
    // Expose socketRef (not .current) so consumers always get the live socket
    socketRef,
    connected,
    emit,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

/**
 * Hook to access the socket ref, connection status, and emit helper
 */
export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

/**
 * Hook to subscribe to a socket event with automatic cleanup.
 * Uses socketRef so it always binds to the live socket instance.
 */
export const useSocketEvent = (event, handler) => {
  const { socketRef, connected } = useSocket();

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !event || !connected) return;
    socket.on(event, handler);
    return () => socket.off(event, handler);
  // connected ensures we re-subscribe after reconnection
  // handler should be a stable ref (useCallback) in the consumer
  }, [connected, event, handler, socketRef]);
};
