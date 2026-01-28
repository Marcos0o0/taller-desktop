// URL del backend - cambiar según entorno
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api'  // Desarrollo
  : 'http://localhost:3001/api'; // Producción (cambiar después)

export const API_TIMEOUT = 10000; // 10 segundos

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user'
} as const;