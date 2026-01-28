import apiClient from './client';
import { ApiResponse, PaginationMeta } from '@types/api.types';

export interface Product {
  _id: string;
  barcode: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  location?: string;
  supplier?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
  isActive?: boolean;
  sort?: string;
}

export interface ListProductsResponse {
  products: Product[];
  pagination: PaginationMeta;
}

export interface CreateProductRequest {
  barcode: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  minStock: number;
  location?: string;
  supplier?: string;
}

export interface StockMovement {
  _id: string;
  productId: string | Product;
  type: 'entrada' | 'salida' | 'ajuste';
  quantity: number;
  reason?: string;
  notes?: string;
  userId: string;
  createdAt: string;
}

export const inventoryApi = {
  // Listar productos
  list: async (params?: ListProductsParams): Promise<ListProductsResponse> => {
    const { data } = await apiClient.get<ApiResponse<ListProductsResponse>>(
      '/inventory/products',
      { params }
    );
    return data.data!;
  },

  // Obtener producto por ID
  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<ApiResponse<{ product: Product }>>(
      `/inventory/products/${id}`
    );
    return data.data!.product;
  },

  // Buscar por código de barras
  getByBarcode: async (barcode: string): Promise<Product | null> => {
    try {
      const { data } = await apiClient.get<ApiResponse<{ product: Product }>>(
        `/inventory/products/barcode/${barcode}`
      );
      return data.data!.product;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Crear producto
  create: async (productData: CreateProductRequest): Promise<Product> => {
    const { data } = await apiClient.post<ApiResponse<{ product: Product }>>(
      '/inventory/products',
      productData
    );
    return data.data!.product;
  },

  // Actualizar producto
  update: async (id: string, productData: Partial<CreateProductRequest>): Promise<Product> => {
    const { data } = await apiClient.put<ApiResponse<{ product: Product }>>(
      `/inventory/products/${id}`,
      productData
    );
    return data.data!.product;
  },

  // Eliminar producto (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/inventory/products/${id}`);
  },

  // Restaurar producto
  restore: async (id: string): Promise<Product> => {
    const { data } = await apiClient.put<ApiResponse<{ product: Product }>>(
      `/inventory/products/${id}/restore`
    );
    return data.data!.product;
  },

  // Movimientos de stock
  addStockMovement: async (productId: string, movement: {
    type: 'entrada' | 'salida' | 'ajuste';
    quantity: number;
    reason?: string;
    notes?: string;
  }): Promise<StockMovement> => {
    const { data } = await apiClient.post<ApiResponse<{ movement: StockMovement }>>(
      `/inventory/products/${productId}/movements`,
      movement
    );
    return data.data!.movement;
  },

  // Obtener historial de movimientos
  getMovements: async (productId: string, params?: { page?: number; limit?: number }) => {
    const { data } = await apiClient.get(
      `/inventory/products/${productId}/movements`,
      { params }
    );
    return data.data;
  },

  // Obtener productos con stock bajo
  getLowStock: async (): Promise<Product[]> => {
    const { data } = await apiClient.get<ApiResponse<{ products: Product[] }>>(
      '/inventory/products/alerts/low-stock'
    );
    return data.data!.products;
  },

  // Estadísticas de inventario
  getStats: async () => {
    const { data } = await apiClient.get('/inventory/stats');
    return data.data;
  },

  // Exportar inventario
  exportInventory: async (format: 'csv' | 'excel' = 'excel') => {
    const { data } = await apiClient.get(`/inventory/export`, {
      params: { format },
      responseType: 'blob',
    });
    return data;
  },
};