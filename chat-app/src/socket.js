import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  socket = io('http://10.130.84.248:3000', {
    auth: { token },
  });
  return socket;
};

export const getSocket = () => socket;
