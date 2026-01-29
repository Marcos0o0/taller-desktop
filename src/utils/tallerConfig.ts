// Configuración del taller para PDFs y documentos
// IMPORTANTE: Actualiza estos datos con la información real del taller

export interface TallerConfig {
    nombre: string;
    rut: string;
    direccion: string;
    ciudad: string;
    telefono: string;
    email: string;
    web?: string;
    jefe: {
      nombre: string;
      cargo: string;
    };
    logo?: string; // Base64 o URL del logo
    terminos: string[];
    validezPresupuesto: number; // días
    iva: number; // porcentaje (ej: 19)
  }
  
  export const TALLER_CONFIG: TallerConfig = {
    nombre: 'Automotriz Portezuelo',
    rut: '12.968.530-1', // TODO: Actualizar con RUT real
    direccion: 'Av. Gabriela Oriente 02176',
    ciudad: 'Santiago, Chile',
    telefono: '+56 9 6475 8776', // TODO: Actualizar con teléfono real
    email: 'automotrizf16@gmail.com', // TODO: Actualizar con email real
    // web: 'www.portezuelo.cl', // Opcional
    jefe: {
      nombre: 'Marcos Godoy', // TODO: Actualizar con nombre del jefe/gerente
      cargo: 'Jefe de Taller',
    },
    // Logo en base64 (puedes convertir tu imagen en https://base64.guru/converter/encode/image)
    // O dejar undefined y se usará solo texto
    logo: undefined,
    
    // Términos y condiciones que aparecen al final del presupuesto
    terminos: [
      'Este presupuesto tiene una validez de 30 días desde la fecha de emisión.',
      'Los precios incluyen IVA y están sujetos a cambios sin previo aviso.',
      'Los repuestos adicionales no contemplados serán cotizados aparte.',
      'El pago debe realizarse al momento de retirar el vehículo.',
      'La garantía de los trabajos realizados es de 3 meses o 2.00 km.',
      'El taller no se hace responsable por objetos de valor dejados en el vehículo.',
    ],
    
    validezPresupuesto: 30, // días
    iva: 19, // porcentaje
  };
  
  // Función helper para actualizar la configuración en runtime si es necesario
  export const updateTallerConfig = (updates: Partial<TallerConfig>) => {
    Object.assign(TALLER_CONFIG, updates);
  };