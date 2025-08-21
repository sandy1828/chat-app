import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  socket = io('http://10.130.84.248:3000', { //- update with ur wifi ip
    auth: { token },
  });
  return socket;
};

export const getSocket = () => socket;
