import apiClient from './client';
import { ApiResponse, Quote, CreateQuoteRequest, PaginationMeta } from '@types/api.types';

export interface ListQuotesParams {
  page?: number;
  limit?: number;
  status?: Quote['status'];
  clientId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sort?: string;
}

export interface ListQuotesResponse {
  quotes: Quote[];
  pagination: PaginationMeta;
}

export const quotesApi = {
  // Listar presupuestos
  list: async (params?: ListQuotesParams): Promise<ListQuotesResponse> => {
    const { data } = await apiClient.get<ApiResponse<ListQuotesResponse>>(
      '/quotes',
      { params }
    );
    return data.data!;
  },

  // Obtener presupuesto por ID
  getById: async (id: string): Promise<Quote> => {
    const { data } = await apiClient.get<ApiResponse<{ quote: Quote }>>(
      `/quotes/${id}`
    );
    return data.data!.quote;
  },

  // Crear presupuesto
  create: async (quoteData: CreateQuoteRequest): Promise<Quote> => {
    const { data } = await apiClient.post<ApiResponse<{ quote: Quote }>>(
      '/quotes',
      quoteData
    );
    return data.data!.quote;
  },

  // Actualizar presupuesto
  update: async (id: string, quoteData: Partial<CreateQuoteRequest>): Promise<Quote> => {
    const { data } = await apiClient.put<ApiResponse<{ quote: Quote }>>(
      `/quotes/${id}`,
      quoteData
    );
    return data.data!.quote;
  },

  // Enviar presupuesto por email
  sendEmail: async (id: string): Promise<void> => {
    await apiClient.post(`/quotes/${id}/send-email`);
  },

  // Aprobar presupuesto (admin)
  approve: async (id: string): Promise<Quote> => {
    const { data } = await apiClient.put<ApiResponse<{ quote: Quote }>>(
      `/quotes/${id}/approve`
    );
    return data.data!.quote;
  },

  // Rechazar presupuesto (admin)
  reject: async (id: string): Promise<Quote> => {
    const { data } = await apiClient.put<ApiResponse<{ quote: Quote }>>(
      `/quotes/${id}/reject`
    );
    return data.data!.quote;
  },

  // Eliminar presupuesto
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quotes/${id}`);
  }
};