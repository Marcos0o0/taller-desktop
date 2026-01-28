import apiClient from './client';
import { ApiResponse, LoginRequest, LoginResponse, User } from '@types/api.types';
import { STORAGE_KEYS } from '@utils/constants';

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      credentials
    );
    
    // Guardar tokens en localStorage
    if (data.data) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.data.user));
    }
    
    return data.data!;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // Limpiar localStorage siempre
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  // Obtener usuario actual
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return data.data!.user;
  },

  // Verificar si hay sesión activa
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },

  // Obtener usuario guardado
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  }
};