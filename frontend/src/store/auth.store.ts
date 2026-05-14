import { create } from 'zustand';
import { User } from '../types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isInitialized: true });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, token, isInitialized: true });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false });
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      throw new Error(msg);
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/signup', { name, email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      set({ user, token, isLoading: false });
    } catch (err: unknown) {
      set({ isLoading: false });
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Signup failed';
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));
