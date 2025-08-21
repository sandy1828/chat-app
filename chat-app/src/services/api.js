import axios from 'axios';
import { BACKEND_URL } from '../config';

const instance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
});

const setToken = (t) => {
  if (t) instance.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  else delete instance.defaults.headers.common['Authorization'];
};

const api = {
  instance,
  setToken,
  get: (url, cfg) => instance.get(url, cfg),
  post: (url, data, cfg) => instance.post(url, data, cfg),
  put: (url, data, cfg) => instance.put(url, data, cfg),
  delete: (url, cfg) => instance.delete(url, cfg),
};

export default api;
