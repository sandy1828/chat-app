import { io } from 'socket.io-client';
import { BACKEND_URL, SOCKET_PATH } from '../config';
let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;
  const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  socket = io(BACKEND_URL, {
    path: SOCKET_PATH,
    transports: ['websocket', 'polling'],
    auth: { token: authToken },
  });

  socket.on('connect', () => console.log('Socket connected', socket.id));
  socket.on('connect_error', (err) => console.warn('Socket connect error', err.message));

  return socket;
};

export const getSocket = () => socket;
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
