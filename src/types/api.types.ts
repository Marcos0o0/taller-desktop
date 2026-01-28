// ============================================
// TIPOS DE RESPUESTA DE LA API
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    cached?: boolean;
  }
  
  export interface ApiError {
    success: false;
    error: {
      code: string;
      message: string;
      details?: Array<{
        field: string;
        message: string;
        value?: any;
      }>;
    };
  }
  
  export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
  
  // ============================================
  // MODELOS DE DATOS
  // ============================================
  
  export interface User {
    _id: string;
    username: string;
    role: 'admin' | 'mechanic';
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Client {
    _id: string;
    firstName: string;
    lastName1: string;
    lastName2?: string;
    phone: string;
    email: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Vehicle {
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    mileage: number;
  }
  
  export interface Quote {
    _id: string;
    quoteNumber: string;
    clientId: Client | string;
    vehicle: Vehicle;
    description: string;
    proposedWork: string;
    estimatedCost: number;
    validUntil: string;
    status: 'pending' | 'approved' | 'rejected';
    emailSent: boolean;
    emailSentAt?: string;
    workOrder?: WorkOrder;
    notes?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface WorkOrder {
    orderNumber: string;
    mechanicId?: Mechanic | string;
    workDescription: string;
    estimatedCost: number;
    finalCost?: number;
    status: 'pendiente_asignacion' | 'asignada' | 'en_progreso' | 'listo' | 'entregado';
    estimatedDelivery?: string;
    actualDelivery?: string;
    additionalNotes?: string;
    additionalWork?: string;
    readyEmailSent: boolean;
    readyEmailSentAt?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Mechanic {
    _id: string;
    userId: User | string;
    firstName: string;
    lastName1: string;
    lastName2?: string;
    phone: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DashboardStats {
    clients: {
      total: number;
      newThisMonth: number;
    };
    quotes: {
      pending: number;
      approved: number;
      rejected: number;
      total: number;
    };
    orders: {
      pendiente_asignacion: number;
      asignada: number;
      en_progreso: number;
      listo: number;
      entregado: number;
      total: number;
    };
    mechanics: {
      total: number;
      active: number;
    };
    revenue: {
      total: number;
      completedOrders: number;
      averageOrderValue: number;
    };
    recentActivity: {
      ordersLast30Days: number;
    };
  }
  
  // ============================================
  // REQUEST PAYLOADS
  // ============================================
  
  export interface LoginRequest {
    username: string;
    password: string;
  }
  
  export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
  }
  
  export interface CreateClientRequest {
    firstName: string;
    lastName1: string;
    lastName2?: string;
    phone: string;
    email: string;
  }
  
  export interface CreateQuoteRequest {
    clientId: string;
    vehicle: Vehicle;
    description: string;
    proposedWork: string;
    estimatedCost: number;
    notes?: string;
  }
  
  export interface UpdateOrderStatusRequest {
    status: WorkOrder['status'];
    notes?: string;
  }
  
  export interface AssignMechanicRequest {
    mechanicId: string;
  }