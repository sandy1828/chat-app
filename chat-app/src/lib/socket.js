import { io } from 'socket.io-client';
let socket = null;


export const initSocket = (baseUrl, token) => {
if (socket) return socket;
socket = io(baseUrl, {
auth: { token },
transports: ['websocket'],
autoConnect: true,
});
return socket;
};


export const getSocket = () => socket;


export const disconnectSocket = () => {
if (socket) {
socket.disconnect();
socket = null;
}
};