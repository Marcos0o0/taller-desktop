import { useEffect, useRef, useState } from 'react';

interface BarcodeScannerOptions {
  onScan: (barcode: string) => void;
  minLength?: number;
  maxLength?: number;
  timeout?: number;
  enabled?: boolean;
}

/**
 * Hook para detectar lectores de código de barras USB
 * Los lectores USB funcionan como teclados, escribiendo el código y presionando Enter
 */
export const useBarcodeScanner = ({
  onScan,
  minLength = 3,
  maxLength = 50,
  timeout = 100,
  enabled = true,
}: BarcodeScannerOptions) => {
  const [scanning, setScanning] = useState(false);
  const barcodeBuffer = useRef<string>('');
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignorar si el foco está en un input, textarea o select
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      // Si es Enter, procesar el código escaneado
      if (event.key === 'Enter') {
        event.preventDefault();
        
        const barcode = barcodeBuffer.current.trim();
        
        if (barcode.length >= minLength && barcode.length <= maxLength) {
          onScan(barcode);
        }
        
        barcodeBuffer.current = '';
        setScanning(false);
        
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
          timeoutId.current = null;
        }
        
        return;
      }

      // Si es un caracter imprimible, agregarlo al buffer
      if (event.key.length === 1) {
        event.preventDefault();
        setScanning(true);
        barcodeBuffer.current += event.key;

        // Resetear el timeout
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }

        // Si pasa mucho tiempo sin más teclas, resetear el buffer
        timeoutId.current = setTimeout(() => {
          barcodeBuffer.current = '';
          setScanning(false);
          timeoutId.current = null;
        }, timeout);
      }
    };

    window.addEventListener('keypress', handleKeyPress);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [enabled, minLength, maxLength, onScan, timeout]);

  return { scanning };
};
