import axios from 'axios';
import { storage } from '../utils/storage';
import { Platform } from 'react-native';
import { useAuthStore } from '../store/authStore';

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  // Tunnel URL for Office Wi-Fi Access
  return 'https://fuzzy-gifts-act.loca.lt'; 
};

export const BASE_URL = getBaseUrl();

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true', // Required to skip Localtunnel warning page
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
