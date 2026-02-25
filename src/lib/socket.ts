import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? `${window.location.protocol}//${window.location.hostname}:3001`
            : `${window.location.protocol}//${window.location.hostname}`)
        : 'http://localhost:3001');

// En el cliente, si no hay URL definida, intentamos usar el host actual
const getSocketUrl = () => {
    if (typeof window !== 'undefined') {
        const protocol = window.location.protocol;
        const host = window.location.hostname;

        if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;

        // Si estamos en un VPS (no localhost), preferimos no usar puerto
        // para que Nginx maneje el proxy a través de /socket.io/
        if (host !== 'localhost' && host !== '127.0.0.1') {
            return `${protocol}//${host}`;
        }
    }
    return SOCKET_URL;
};

let socketInstance: any = null;

export const getSocket = () => {
    if (typeof window === 'undefined') return null;

    if (!socketInstance) {
        socketInstance = io(getSocketUrl(), {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
    }
    return socketInstance;
};
