// Definiciones de especificaciones por categoría de producto

export interface CategorySpec {
    field: string;
    label: string;
    type: 'text' | 'select' | 'number';
    options?: string[];
    required?: boolean;
    placeholder?: string;
    suffix?: string;
  }
  
  // Especificaciones para cada categoría
  export const categorySpecifications: Record<string, CategorySpec[]> = {
    lubricantes: [
      {
        field: 'viscosity',
        label: 'Viscosidad',
        type: 'select',
        options: ['5W-20', '5W-30', '5W-40', '10W-30', '10W-40', '15W-40', '20W-50', 'SAE 90', 'SAE 140'],
        required: true,
      },
      {
        field: 'oilType',
        label: 'Tipo de Aceite',
        type: 'select',
        options: ['Sintético', 'Semi-sintético', 'Mineral', 'Sintético de Alto Rendimiento'],
        required: true,
      },
      {
        field: 'volume',
        label: 'Volumen',
        type: 'number',
        suffix: 'litros',
        required: true,
      },
      {
        field: 'application',
        label: 'Aplicación',
        type: 'select',
        options: ['Motor Gasolina', 'Motor Diesel', 'Transmisión Manual', 'Transmisión Automática', 'Diferencial', 'Hidráulico', 'Refrigerante'],
        required: true,
      },
      {
        field: 'apiSpec',
        label: 'Especificación API',
        type: 'select',
        options: ['SP', 'SN Plus', 'SN', 'SM', 'SL', 'CJ-4', 'CI-4', 'CH-4'],
      },
    ],
    filtros: [
      {
        field: 'filterType',
        label: 'Tipo de Filtro',
        type: 'select',
        options: ['Aceite', 'Aire', 'Combustible', 'Cabina/Polen', 'Hidráulico', 'Transmisión'],
        required: true,
      },
      {
        field: 'oemCode',
        label: 'Código OEM',
        type: 'text',
        placeholder: 'Ej: 04152-YZZA1',
      },
      {
        field: 'compatibility',
        label: 'Compatible con',
        type: 'text',
        placeholder: 'Ej: Toyota Corolla 2010-2020',
      },
      {
        field: 'dimensions',
        label: 'Dimensiones',
        type: 'text',
        placeholder: 'Ej: Ø80mm x H90mm',
      },
    ],
    frenos: [
      {
        field: 'brakeType',
        label: 'Tipo',
        type: 'select',
        options: ['Pastillas', 'Discos', 'Tambores', 'Líquido de Frenos', 'Zapatas', 'Disco + Pastillas Kit'],
        required: true,
      },
      {
        field: 'position',
        label: 'Posición',
        type: 'select',
        options: ['Delantero', 'Trasero', 'Delantero y Trasero', 'N/A'],
      },
      {
        field: 'material',
        label: 'Material',
        type: 'select',
        options: ['Cerámico', 'Semi-metálico', 'Orgánico', 'Bajo contenido metálico', 'N/A'],
      },
      {
        field: 'dotSpec',
        label: 'Especificación DOT',
        type: 'select',
        options: ['DOT 3', 'DOT 4', 'DOT 5', 'DOT 5.1', 'N/A'],
      },
    ],
    neumaticos: [
      {
        field: 'size',
        label: 'Medida',
        type: 'text',
        placeholder: 'Ej: 195/65R15',
        required: true,
      },
      {
        field: 'loadIndex',
        label: 'Índice de Carga',
        type: 'text',
        placeholder: 'Ej: 91',
      },
      {
        field: 'speedIndex',
        label: 'Índice de Velocidad',
        type: 'text',
        placeholder: 'Ej: H',
      },
      {
        field: 'brand',
        label: 'Marca de Neumático',
        type: 'text',
        placeholder: 'Ej: Michelin, Bridgestone',
        required: true,
      },
      {
        field: 'tireType',
        label: 'Tipo',
        type: 'select',
        options: ['Verano', 'Invierno', 'All Season', 'Performance', 'SUV/4x4'],
      },
    ],
    suspension: [
      {
        field: 'suspensionType',
        label: 'Tipo',
        type: 'select',
        options: ['Amortiguador', 'Espiral/Resorte', 'Barra Estabilizadora', 'Rótula', 'Terminal', 'Brazo', 'Buje', 'Kit Completo'],
        required: true,
      },
      {
        field: 'position',
        label: 'Posición',
        type: 'select',
        options: ['Delantero Izquierdo', 'Delantero Derecho', 'Trasero Izquierdo', 'Trasero Derecho', 'Delantero (Par)', 'Trasero (Par)', 'Completo (4 unidades)'],
      },
      {
        field: 'shockType',
        label: 'Tipo de Amortiguador',
        type: 'select',
        options: ['Gas', 'Aceite', 'Gas-Oil', 'Regulable', 'N/A'],
      },
    ],
    electrico: [
      {
        field: 'electricType',
        label: 'Tipo',
        type: 'select',
        options: ['Batería', 'Alternador', 'Motor de Arranque', 'Bujía', 'Bobina', 'Cable', 'Sensor', 'Relé', 'Fusible', 'Foco/Ampolleta'],
        required: true,
      },
      {
        field: 'voltage',
        label: 'Voltaje',
        type: 'select',
        options: ['12V', '24V', 'N/A'],
      },
      {
        field: 'amperage',
        label: 'Amperaje',
        type: 'text',
        placeholder: 'Ej: 45Ah, 70Ah',
      },
      {
        field: 'sparkPlugType',
        label: 'Tipo de Bujía',
        type: 'select',
        options: ['Cobre', 'Platino', 'Iridio', 'N/A'],
      },
    ],
    carroceria: [
      {
        field: 'bodyType',
        label: 'Tipo',
        type: 'select',
        options: ['Parachoques', 'Guardabarro', 'Capó', 'Puerta', 'Espejo', 'Óptica/Faro', 'Moldura', 'Rejilla', 'Spoiler'],
        required: true,
      },
      {
        field: 'position',
        label: 'Posición',
        type: 'select',
        options: ['Delantero', 'Trasero', 'Izquierdo', 'Derecho', 'Delantero Izquierdo', 'Delantero Derecho', 'Trasero Izquierdo', 'Trasero Derecho'],
      },
      {
        field: 'color',
        label: 'Color',
        type: 'text',
        placeholder: 'Ej: Negro, Gris, Sin pintar',
      },
    ],
    repuestos: [
      {
        field: 'partType',
        label: 'Tipo de Repuesto',
        type: 'select',
        options: ['Correa', 'Manguera', 'Polea', 'Tensor', 'Bomba', 'Radiador', 'Termostato', 'Sensor', 'Junta', 'Retén', 'Rodamiento', 'Otro'],
        required: true,
      },
      {
        field: 'oemCode',
        label: 'Código OEM',
        type: 'text',
        placeholder: 'Código del fabricante',
      },
      {
        field: 'compatibility',
        label: 'Compatibilidad',
        type: 'text',
        placeholder: 'Marcas y modelos compatibles',
      },
    ],
    herramientas: [
      {
        field: 'toolType',
        label: 'Tipo de Herramienta',
        type: 'select',
        options: ['Manual', 'Eléctrica', 'Neumática', 'Hidráulica', 'Medición', 'Diagnóstico'],
        required: true,
      },
      {
        field: 'toolSize',
        label: 'Medida/Tamaño',
        type: 'text',
        placeholder: 'Ej: 1/2", 10mm, 3/8"',
      },
    ],
    accesorios: [
      {
        field: 'accessoryType',
        label: 'Tipo',
        type: 'select',
        options: ['Tapiz', 'Alfombra', 'Cubreasiento', 'Volante', 'Limpieza', 'Protección', 'Decorativo', 'Audio', 'Otro'],
      },
    ],
    consumibles: [
      {
        field: 'consumableType',
        label: 'Tipo',
        type: 'select',
        options: ['Limpiador', 'Desengrasante', 'Sellador', 'Adhesivo', 'Pintura', 'Cera', 'Pulidor', 'Grasa', 'Trapo', 'Guante', 'Otro'],
      },
      {
        field: 'volume',
        label: 'Volumen/Cantidad',
        type: 'text',
        placeholder: 'Ej: 500ml, 1L, Pack 10 unidades',
      },
    ],
    otros: [],
  };
  
  // Función helper para obtener especificaciones de una categoría
  export const getSpecsForCategory = (category: string): CategorySpec[] => {
    return categorySpecifications[category] || [];
  };
  
  // Función helper para formatear las especificaciones para mostrar
  export const formatSpecifications = (category: string, specs: Record<string, any>): string => {
    if (!specs || Object.keys(specs).length === 0) return '';
    
    const categorySpecs = getSpecsForCategory(category);
    const formatted = categorySpecs
      .filter(spec => specs[spec.field])
      .map(spec => {
        const value = specs[spec.field];
        const suffix = spec.suffix ? ` ${spec.suffix}` : '';
        return `${spec.label}: ${value}${suffix}`;
      })
      .join(' | ');
    
    return formatted;
  };