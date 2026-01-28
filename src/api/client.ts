import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL, API_TIMEOUT, STORAGE_KEYS } from '@utils/constants';

// Crear instancia de Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request - Agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor de Response - Manejar errores globalmente
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`[API Response] ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    console.error('[API Response Error]', error.response?.status, error.message);

    // Si el token expiró (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar renovar el token
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken
        });

        // Guardar nuevos tokens
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken);

        // Reintentar request original con nuevo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si falla el refresh, limpiar todo y redirigir a login
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        // Notificar a la app para redirigir a login
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        return Promise.reject(refreshError);
      }
    }

    // Manejar otros errores
    if (error.response?.status === 403) {
      console.error('Acceso denegado - Sin permisos');
    }

    if (error.response?.status === 429) {
      console.error('Demasiadas solicitudes - Rate limit excedido');
    }

    if (error.response?.status >= 500) {
      console.error('Error del servidor');
    }

    return Promise.reject(error);
  }
);

export default apiClient;