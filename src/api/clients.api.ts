import apiClient from './client';
import { ApiResponse, Client, PaginationMeta } from '@types/api.types';

export interface ListClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  isDeleted?: boolean;
  sort?: string;
}

export interface ListClientsResponse {
  clients: Client[];
  pagination: PaginationMeta;
}

export interface CreateClientRequest {
  firstName: string;
  lastName1: string;
  lastName2?: string;
  phone: string;
  email: string;
}

export const clientsApi = {
  // Listar clientes con paginación y búsqueda
  list: async (params?: ListClientsParams): Promise<ListClientsResponse> => {
    const { data } = await apiClient.get<ApiResponse<ListClientsResponse>>(
      '/clients',
      { params }
    );
    return data.data!;
  },

  // Obtener cliente por ID
  getById: async (id: string): Promise<Client> => {
    const { data } = await apiClient.get<ApiResponse<{ client: Client }>>(
      `/clients/${id}`
    );
    return data.data!.client;
  },

  // Crear nuevo cliente
  create: async (clientData: CreateClientRequest): Promise<Client> => {
    const { data } = await apiClient.post<ApiResponse<{ client: Client }>>(
      '/clients',
      clientData
    );
    return data.data!.client;
  },

  // Actualizar cliente
  update: async (id: string, clientData: Partial<CreateClientRequest>): Promise<Client> => {
    const { data } = await apiClient.put<ApiResponse<{ client: Client }>>(
      `/clients/${id}`,
      clientData
    );
    return data.data!.client;
  },

  // Eliminar cliente (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },

  // Restaurar cliente eliminado
  restore: async (id: string): Promise<Client> => {
    const { data } = await apiClient.put<ApiResponse<{ client: Client }>>(
      `/clients/${id}/restore`
    );
    return data.data!.client;
  },

  // Obtener historial de órdenes del cliente
  getOrders: async (id: string, params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get(`/clients/${id}/orders`, { params });
    return data.data;
  },

  // Obtener presupuestos del cliente
  getQuotes: async (id: string, params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get(`/clients/${id}/quotes`, { params });
    return data.data;
  }
};