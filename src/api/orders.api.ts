import apiClient from './client';
import { 
  ApiResponse, 
  Quote, 
  UpdateOrderStatusRequest, 
  AssignMechanicRequest,
  PaginationMeta 
} from '@types/api.types';

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
  mechanicId?: string;
  clientId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
}

export interface ListOrdersResponse {
  orders: Array<{
    _id: string;
    quoteNumber: string;
    client: any;
    vehicle: any;
    order: any;
  }>;
  pagination: PaginationMeta;
}

export const ordersApi = {
  // Listar órdenes
  list: async (params?: ListOrdersParams): Promise<ListOrdersResponse> => {
    const { data } = await apiClient.get<ApiResponse<ListOrdersResponse>>(
      '/orders',
      { params }
    );
    return data.data!;
  },

  // Obtener orden por ID
  getById: async (id: string) => {
    const { data } = await apiClient.get(`/orders/${id}`);
    return data.data.order;
  },

  // Actualizar orden (detalles adicionales, costo final, etc)
  update: async (id: string, updateData: any) => {
    const { data } = await apiClient.put(`/orders/${id}`, updateData);
    return data.data.order;
  },

  // Cambiar estado de orden
  updateStatus: async (id: string, statusData: UpdateOrderStatusRequest) => {
    const { data } = await apiClient.put(`/orders/${id}/status`, statusData);
    return data.data.order;
  },

  // Asignar mecánico
  assignMechanic: async (id: string, mechanicData: AssignMechanicRequest) => {
    const { data } = await apiClient.put(`/orders/${id}/assign`, mechanicData);
    return data.data.order;
  },

  // Eliminar orden (solo si está en pendiente_asignacion)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/orders/${id}`);
  }
};