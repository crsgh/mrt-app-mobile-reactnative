import { create } from 'zustand';
import { storage } from '../utils/storage';
import { User } from '../types';
import { api } from '../api/endpoints';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (token: string, user: User) => {
    await storage.setToken(token);
    set({ token, user, isAuthenticated: true });
    
    // Fetch fresh profile data including profile picture
    try {
      const profileData = await api.mobile.getProfile();
      if (profileData.success && profileData.passenger) {
        set({ user: profileData.passenger });
      }
    } catch (error) {
      console.log('Failed to fetch profile after login:', error);
      // Still logged in, just with initial user data if profile fetch fails
    }
  },

  logout: async () => {
    await storage.removeToken();
    set({ token: null, user: null, isAuthenticated: false });
  },

  setUser: (user: User) => {
    set({ user });
  },

  checkAuth: async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        // Ideally we should validate the token with an API call (e.g., getProfile)
        // For now, we'll assume if token exists, we are authenticated, 
        // but we might not have user details until we fetch profile.
        set({ token, isAuthenticated: true, isLoading: false });
      } else {
        set({ token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
