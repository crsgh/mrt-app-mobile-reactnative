import axios from 'axios';
import { storage } from '../utils/storage';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

const getBaseUrl = () => {
  // Replace with your computer's LAN IP (e.g., from ipconfig)
  // When using Hotspot, it's usually 172.20.10.x or 192.168.x.x
  return 'http://172.20.10.3:3000'; 
};

export const BASE_URL = getBaseUrl();

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized globally if needed
    if (error.response && error.response.status === 401) {
      // potentially logout user
    }
    return Promise.reject(error);
  }
);
