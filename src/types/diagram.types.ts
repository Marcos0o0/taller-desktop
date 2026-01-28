// ============================================
// TIPOS PARA MÓDULO DE DIAGRAMAS ELÉCTRICOS
// ============================================

export interface CarBrand {
    id: string;
    name: string;
    logo: string; // URL del logo de la marca
    country: string;
    modelsCount: number;
  }
  
  export interface CarModel {
    id: string;
    brandId: string;
    name: string;
    years: number[]; // Años disponibles
    thumbnail?: string; // Imagen del modelo
  }
  
  export interface FusePosition {
    position: string; // "F1", "F2", etc.
    amperage: number; // 10, 15, 20, etc.
    function: string; // "Luces delanteras", etc.
    color?: string; // Color del fusible
  }
  
  export interface FuseBoxSection {
    id: string;
    name: string; // "Tablero principal", "Motor", "Baúl"
    location: string; // Descripción de ubicación
    imageUrl: string; // Imagen del diagrama
    fuses: FusePosition[];
  }
  
  export interface ElectricalDiagram {
    id: string;
    brandId: string;
    modelId: string;
    year: number;
    title: string;
    description?: string;
    fuseBoxSections: FuseBoxSection[];
    additionalImages?: {
      title: string;
      url: string;
      description?: string;
    }[];
    relayDiagrams?: {
      title: string;
      url: string;
      description?: string;
    }[];
    notes?: string;
    source?: string; // Fuente del diagrama
    createdAt: string;
    updatedAt: string;
  }
  
  export interface DiagramSearchParams {
    brandId?: string;
    modelId?: string;
    year?: number;
    search?: string;
  }