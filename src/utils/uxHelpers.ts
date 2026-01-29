import React from 'react';

// Marcas y modelos más comunes en Chile
export const CAR_BRANDS = [
  'Chevrolet',
  'Ford',
  'Hyundai',
  'Kia',
  'Mazda',
  'Mitsubishi',
  'Nissan',
  'Peugeot',
  'Renault',
  'Suzuki',
  'Toyota',
  'Volkswagen',
  'Chery',
  'Great Wall',
  'Honda',
  'Subaru',
  'Citroën',
  'Fiat',
  'Jeep',
  'RAM',
].sort();

export const CAR_MODELS: Record<string, string[]> = {
  Toyota: [
    'Corolla',
    'Yaris',
    'RAV4',
    'Hilux',
    'Camry',
    'Prius',
    'Land Cruiser',
    'Fortuner',
    'C-HR',
    'Tacoma',
  ],
  Chevrolet: [
    'Sail',
    'Spark',
    'Cruze',
    'Onix',
    'Tracker',
    'Captiva',
    'Silverado',
    'Colorado',
    'Trailblazer',
  ],
  Nissan: [
    'Versa',
    'Sentra',
    'Kicks',
    'X-Trail',
    'Qashqai',
    'Frontier',
    'Note',
    'Navara',
    'Leaf',
  ],
  Hyundai: [
    'Accent',
    'Elantra',
    'Tucson',
    'Santa Fe',
    'Creta',
    'Venue',
    'Kona',
    'Ioniq',
    'i10',
  ],
  Kia: [
    'Rio',
    'Sportage',
    'Sorento',
    'Seltos',
    'Picanto',
    'Stonic',
    'Soul',
    'Carnival',
    'EV6',
  ],
  Suzuki: [
    'Swift',
    'Baleno',
    'Vitara',
    'Jimny',
    'S-Cross',
    'Dzire',
    'Ertiga',
  ],
  Mazda: [
    'Mazda2',
    'Mazda3',
    'CX-3',
    'CX-5',
    'CX-9',
    'CX-30',
    'BT-50',
    'MX-5',
  ],
  Ford: [
    'Fiesta',
    'Focus',
    'Escape',
    'Explorer',
    'Ranger',
    'F-150',
    'EcoSport',
    'Bronco',
  ],
  Volkswagen: [
    'Gol',
    'Polo',
    'Vento',
    'Jetta',
    'Tiguan',
    'Taos',
    'Amarok',
    'T-Cross',
  ],
  Peugeot: [
    '208',
    '2008',
    '3008',
    '5008',
    'Partner',
    'Rifter',
    'Expert',
  ],
  Renault: [
    'Kwid',
    'Logan',
    'Sandero',
    'Stepway',
    'Duster',
    'Captur',
    'Koleos',
    'Alaskan',
  ],
  Mitsubishi: [
    'Mirage',
    'Attrage',
    'ASX',
    'Eclipse Cross',
    'Outlander',
    'L200',
    'Montero',
  ],
  Chery: [
    'QQ',
    'Fulwin',
    'Arrizo 5',
    'Tiggo 2',
    'Tiggo 3',
    'Tiggo 4',
    'Tiggo 7',
    'Tiggo 8',
  ],
  'Great Wall': [
    'Wingle',
    'Poer',
    'Haval H6',
    'Haval Jolion',
  ],
};

// Función para obtener modelos según la marca
export const getModelsByBrand = (brand: string): string[] => {
  return CAR_MODELS[brand] || [];
};

// Función para formatear patente chilena (ABCD12 o AB1234)
export const formatLicensePlate = (value: string): string => {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
};

// Función para formatear RUT chileno
export const formatRUT = (value: string): string => {
  // Remover todo excepto números y K
  const clean = value.toUpperCase().replace(/[^0-9K]/g, '');
  
  if (clean.length === 0) return '';
  
  // Separar cuerpo y dígito verificador
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  
  if (body.length === 0) return dv;
  
  // Formatear con puntos y guión
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formatted}-${dv}`;
};

// Validar RUT chileno
export const validateRUT = (rut: string): boolean => {
  const clean = rut.replace(/[^0-9K]/gi, '');
  
  if (clean.length < 2) return false;
  
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return dv === calculatedDV;
};

// Función para formatear teléfono chileno (+56 9 1234 5678)
export const formatPhone = (value: string): string => {
  const clean = value.replace(/\D/g, '');
  
  if (clean.length === 0) return '';
  
  // Si empieza con 56, lo mantenemos
  if (clean.startsWith('56')) {
    const phone = clean.slice(2);
    if (phone.length === 0) return '+56';
    if (phone.length <= 1) return `+56 ${phone}`;
    if (phone.length <= 5) return `+56 ${phone.slice(0, 1)} ${phone.slice(1)}`;
    return `+56 ${phone.slice(0, 1)} ${phone.slice(1, 5)} ${phone.slice(5, 9)}`;
  }
  
  // Si empieza con 9 (móvil chileno)
  if (clean.startsWith('9')) {
    if (clean.length <= 1) return `+56 ${clean}`;
    if (clean.length <= 5) return `+56 ${clean.slice(0, 1)} ${clean.slice(1)}`;
    return `+56 ${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5, 9)}`;
  }
  
  // Número sin formato específico
  return clean;
};

// Atajos de teclado comunes
export const KEYBOARD_SHORTCUTS = {
  SEARCH_CLIENT: 'Ctrl+K',
  NEW_QUICK_JOB: 'Ctrl+Q',
  NEW_QUOTE: 'Ctrl+P',
  NEW_CLIENT: 'Ctrl+N',
  SAVE: 'Ctrl+S',
  CANCEL: 'Esc',
};

// Hook para atajos de teclado
export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  deps: any[] = []
) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+K, Ctrl+S, etc.
      if (event.ctrlKey || event.metaKey) {
        const shortcut = `Ctrl+${event.key.toUpperCase()}`;
        
        if (shortcut === key) {
          event.preventDefault();
          callback();
          return;
        }
      }
      
      // Escape
      if (key === 'Esc' && event.key === 'Escape') {
        event.preventDefault();
        callback();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ...deps]);
};