import axios from 'axios';
const API_URL = 'http://10.130.84.248:3000'; //- update with ur wifi ip

export const register = (data) => axios.post(`${API_URL}/auth/register`, data);
export const login = (data) => axios.post(`${API_URL}/auth/login`, data);
export const getUsers = (token) =>
  axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
export const getMessages = (recipientId, token) =>
  axios.get(`${API_URL}/conversations/${recipientId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const sendMessage = (message, token) =>
  axios.post(`${API_URL}/messages/send`, message, {
    headers: { Authorization: `Bearer ${token}` },
  });
