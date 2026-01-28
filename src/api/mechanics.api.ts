import apiClient from './client';
import { ApiResponse, Mechanic } from '@types/api.types';

export const mechanicsApi = {
  // Listar mecánicos
  list: async (params?: { isActive?: boolean; includeDeleted?: boolean }) => {
    const { data } = await apiClient.get<ApiResponse<{ mechanics: Mechanic[] }>>(
      '/mechanics',
      { params }
    );
    return data.data!.mechanics;
  },

  // Obtener mecánico por ID
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/mechanics/${id}`);
    return data.data;
  },

  // Crear mecánico
  create: async (mechanicData: any) => {
    const { data } = await apiClient.post('/mechanics', mechanicData);
    return data.data.mechanic;
  },

  // Actualizar mecánico
  update: async (id: string, mechanicData: any) => {
    const { data } = await apiClient.put(`/mechanics/${id}`, mechanicData);
    return data.data.mechanic;
  },

  // Obtener órdenes del mecánico
  getOrders: async (id: string, params?: any) => {
    const { data } = await apiClient.get(`/mechanics/${id}/orders`, { params });
    return data.data;
  }
};