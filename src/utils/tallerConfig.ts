// Configuración del taller para PDFs y documentos
// IMPORTANTE: Actualiza estos datos con la información real del taller

export interface TallerConfig {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  web?: string;
  jefe: {
    nombre: string;
    cargo: string;
  };
  logo?: {
    path: string; // Ruta al archivo de imagen (ej: '/logo.png' en la carpeta public)
    width: number; // Ancho en mm
    height: number; // Alto en mm
  };
  terminos: string[];
  validezPresupuesto: number; // días
  iva: number; // porcentaje (ej: 19)
}

export const TALLER_CONFIG: TallerConfig = {
  nombre: 'Automotriz Portezuelo',
  direccion: 'Av. Gabriela Oriente 02176',
  ciudad: 'Santiago, Chile',
  telefono: '+56 9 6475 8776',
  email: 'automotrizf16@gmail.com',
  jefe: {
    nombre: 'Marcos Godoy',
    cargo: 'Jefe de Taller',
  },
  // 🔥 LOGO: Coloca tu imagen (PNG/JPG) en la carpeta public/ 
  // y actualiza la ruta aquí. Si no tienes logo, comenta esta sección.
  logo: {
    path: '/car.svg', // CAMBIAR por tu logo: '/logo.png'
    width: 40, // Ancho en milímetros
    height: 20, // Alto en milímetros
  },
  
  // Términos y condiciones que aparecen al final del presupuesto
  terminos: [
    'Este presupuesto tiene una validez de 30 días desde la fecha de emisión.',
    'Los precios incluyen IVA y están sujetos a cambios sin previo aviso.',
    'Los repuestos adicionales no contemplados serán cotizados aparte.',
    'El pago debe realizarse al momento de retirar el vehículo.',
    'La garantía de los trabajos realizados es de 3 meses o 2.000 km.',
    'El taller no se hace responsable por objetos de valor dejados en el vehículo.',
  ],
  
  validezPresupuesto: 30, // días
  iva: 19, // porcentaje
};

// Función helper para actualizar la configuración en runtime si es necesario
export const updateTallerConfig = (updates: Partial<TallerConfig>) => {
  Object.assign(TALLER_CONFIG, updates);
};