import apiClient from './client';
import { ApiResponse } from '@types/api.types';
import { CarBrand, CarModel, ElectricalDiagram, DiagramSearchParams } from '@types/diagrams.types';

// API para diagramas eléctricos
export const diagramsApi = {
  // Listar marcas
  getBrands: async (): Promise<CarBrand[]> => {
    // TODO: Conectar con backend real
    // const { data } = await apiClient.get<ApiResponse<{ brands: CarBrand[] }>>('/diagrams/brands');
    // return data.data!.brands;
    
    // Datos de ejemplo mientras
    return Promise.resolve([
      {
        id: '1',
        name: 'Toyota',
        logo: 'https://www.carlogos.org/car-logos/toyota-logo.png',
        country: 'Japón',
        modelsCount: 15
      },
      {
        id: '2',
        name: 'Nissan',
        logo: 'https://www.carlogos.org/car-logos/nissan-logo.png',
        country: 'Japón',
        modelsCount: 12
      },
      {
        id: '3',
        name: 'Chevrolet',
        logo: 'https://www.carlogos.org/car-logos/chevrolet-logo.png',
        country: 'EE.UU.',
        modelsCount: 10
      },
      {
        id: '4',
        name: 'Hyundai',
        logo: 'https://www.carlogos.org/car-logos/hyundai-logo.png',
        country: 'Corea del Sur',
        modelsCount: 14
      },
      {
        id: '5',
        name: 'Kia',
        logo: 'https://www.carlogos.org/car-logos/kia-logo.png',
        country: 'Corea del Sur',
        modelsCount: 11
      },
      {
        id: '6',
        name: 'Mazda',
        logo: 'https://www.carlogos.org/car-logos/mazda-logo.png',
        country: 'Japón',
        modelsCount: 8
      },
      {
        id: '7',
        name: 'Suzuki',
        logo: 'https://www.carlogos.org/car-logos/suzuki-logo.png',
        country: 'Japón',
        modelsCount: 7
      },
      {
        id: '8',
        name: 'Ford',
        logo: 'https://www.carlogos.org/car-logos/ford-logo.png',
        country: 'EE.UU.',
        modelsCount: 9
      }
    ]);
  },

  // Listar modelos de una marca
  getModelsByBrand: async (brandId: string): Promise<CarModel[]> => {
    // TODO: Conectar con backend real
    
    // Datos de ejemplo
    const modelsMap: Record<string, CarModel[]> = {
      '1': [ // Toyota
        { id: '1-1', brandId: '1', name: 'Corolla', years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020] },
        { id: '1-2', brandId: '1', name: 'Yaris', years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020] },
        { id: '1-3', brandId: '1', name: 'RAV4', years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018] },
        { id: '1-4', brandId: '1', name: 'Hilux', years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020] },
      ],
      '2': [ // Nissan
        { id: '2-1', brandId: '2', name: 'Versa', years: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020] },
        { id: '2-2', brandId: '2', name: 'Sentra', years: [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017] },
        { id: '2-3', brandId: '2', name: 'X-Trail', years: [2014, 2015, 2016, 2017, 2018, 2019, 2020] },
        { id: '2-4', brandId: '2', name: 'Qashqai', years: [2014, 2015, 2016, 2017, 2018, 2019, 2020] },
      ],
      '3': [ // Chevrolet
        { id: '3-1', brandId: '3', name: 'Spark', years: [2010, 2011, 2012, 2013, 2014, 2015, 2016] },
        { id: '3-2', brandId: '3', name: 'Sail', years: [2014, 2015, 2016, 2017, 2018, 2019, 2020] },
        { id: '3-3', brandId: '3', name: 'Cruze', years: [2010, 2011, 2012, 2013, 2014, 2015, 2016] },
      ],
    };

    return Promise.resolve(modelsMap[brandId] || []);
  },

  // Obtener diagrama específico
  getDiagram: async (brandId: string, modelId: string, year: number): Promise<ElectricalDiagram | null> => {
    // TODO: Conectar con backend real
    
    // Datos de ejemplo
    if (brandId === '1' && modelId === '1-1' && year === 2015) {
      return Promise.resolve({
        id: 'diag-1',
        brandId: '1',
        modelId: '1-1',
        year: 2015,
        title: 'Diagrama Eléctrico - Toyota Corolla 2015',
        description: 'Diagrama completo de fusibles y relés para Toyota Corolla 2015',
        fuseBoxSections: [
          {
            id: 'section-1',
            name: 'Tablero Principal',
            location: 'Debajo del volante, lado izquierdo',
            imageUrl: 'https://via.placeholder.com/800x600?text=Tablero+Principal+Fusibles',
            fuses: [
              { position: 'F1', amperage: 10, function: 'Luces interiores', color: 'rojo' },
              { position: 'F2', amperage: 15, function: 'Radio y multimedia', color: 'azul' },
              { position: 'F3', amperage: 20, function: 'Ventilador climatización', color: 'amarillo' },
              { position: 'F4', amperage: 10, function: 'Limpiaparabrisas', color: 'rojo' },
              { position: 'F5', amperage: 15, function: 'Bocina', color: 'azul' },
              { position: 'F6', amperage: 30, function: 'Motor arranque', color: 'verde' },
              { position: 'F7', amperage: 10, function: 'Luces tablero', color: 'rojo' },
              { position: 'F8', amperage: 15, function: 'Computadora bordo', color: 'azul' },
            ]
          },
          {
            id: 'section-2',
            name: 'Compartimento Motor',
            location: 'Junto a la batería, lado derecho',
            imageUrl: 'https://via.placeholder.com/800x600?text=Motor+Fusibles',
            fuses: [
              { position: 'M1', amperage: 40, function: 'Sistema ABS', color: 'naranja' },
              { position: 'M2', amperage: 30, function: 'Ventilador radiador', color: 'verde' },
              { position: 'M3', amperage: 25, function: 'Bomba combustible', color: 'verde' },
              { position: 'M4', amperage: 20, function: 'Sistema inyección', color: 'amarillo' },
              { position: 'M5', amperage: 15, function: 'Bobinas encendido', color: 'azul' },
            ]
          }
        ],
        notes: 'Verificar siempre el manual del propietario para información específica del vehículo.',
        source: 'Manual de Servicio Toyota 2015',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      });
    }

    return Promise.resolve(null);
  },

  // Buscar diagramas
  searchDiagrams: async (params: DiagramSearchParams): Promise<ElectricalDiagram[]> => {
    // TODO: Implementar búsqueda real
    return Promise.resolve([]);
  }
};