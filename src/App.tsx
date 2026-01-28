import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import { useAuthStore } from '@store/authStore';
import AppRouter from './Router';

function App() {
  const { checkAuth } = useAuthStore();

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          // Tamaños de texto más grandes para mejor legibilidad
          fontSize: 15,
          fontSizeHeading1: 38,
          fontSizeHeading2: 30,
          fontSizeHeading3: 24,
          fontSizeHeading4: 20,
          fontSizeHeading5: 16,
          
          // Colores del tema
          colorPrimary: '#1890ff',
          colorSuccess: '#52c41a',
          colorWarning: '#faad14',
          colorError: '#ff4d4f',
          colorInfo: '#13c2c2',
          
          // Espaciado
          marginLG: 24,
          marginMD: 16,
          paddingLG: 24,
          
          // Bordes
          borderRadius: 8,
          borderRadiusLG: 12,
        },
        components: {
          Button: {
            // Botones más grandes y fáciles de presionar
            controlHeight: 40,
            controlHeightLG: 48,
            fontSize: 15,
          },
          Input: {
            // Inputs más grandes
            controlHeight: 40,
            controlHeightLG: 48,
            fontSize: 15,
          },
          Table: {
            // Tablas más espaciadas
            cellPaddingBlock: 12,
            fontSize: 14,
          },
        },
      }}
    >
      <AppRouter />
    </ConfigProvider>
  );
}

export default App;
