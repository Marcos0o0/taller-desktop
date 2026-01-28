import apiClient from './client';
import { ApiResponse, DashboardStats } from '@types/api.types';

export const dashboardApi = {
  // Obtener estadísticas generales
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<ApiResponse<DashboardStats>>(
      '/dashboard/stats'
    );
    return data.data!;
  },

  // Obtener estadísticas por mecánico
  getMechanicsStats: async () => {
    const { data } = await apiClient.get('/dashboard/mechanics-stats');
    return data.data.mechanicsStats;
  },

  // Obtener actividad reciente
  getRecentActivity: async (limit: number = 10) => {
    const { data } = await apiClient.get('/dashboard/recent-activity', {
      params: { limit }
    });
    return data.data;
  },

  // Obtener tendencias (últimos 7 días)
  getTrends: async () => {
    const { data } = await apiClient.get('/dashboard/trends');
    return data.data;
  }
};