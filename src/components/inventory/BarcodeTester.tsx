import React, { useState } from 'react';
import { Card, Input, Button, Space, Typography, Divider } from 'antd';
import { BarcodeOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

/**
 * Componente de prueba para simular un lector de código de barras
 * Útil para desarrollo sin tener el hardware físico
 */
const BarcodeTester: React.FC = () => {
  const [testCode, setTestCode] = useState('7501234567890');

  const simulateScan = (code: string) => {
    // Simular la entrada del lector escribiendo carácter por carácter
    const chars = code.split('');
    let index = 0;

    const interval = setInterval(() => {
      if (index < chars.length) {
        const event = new KeyboardEvent('keypress', {
          key: chars[index],
          code: `Key${chars[index].toUpperCase()}`,
          charCode: chars[index].charCodeAt(0),
          bubbles: true,
        });
        window.dispatchEvent(event);
        index++;
      } else {
        // Enviar Enter al final
        const enterEvent = new KeyboardEvent('keypress', {
          key: 'Enter',
          code: 'Enter',
          charCode: 13,
          bubbles: true,
        });
        window.dispatchEvent(enterEvent);
        clearInterval(interval);
      }
    }, 20); // 20ms entre caracteres simula un lector rápido
  };

  const presetCodes = [
    { label: 'EAN-13 Ejemplo', code: '7501234567890' },
    { label: 'UPC-A Ejemplo', code: '012345678905' },
    { label: 'Code 128 Ejemplo', code: 'ABC123XYZ' },
    { label: 'Código Corto', code: '12345' },
    { label: 'Filtro Aceite', code: 'FLT001' },
    { label: 'Pastillas Freno', code: 'BRK001' },
  ];

  return (
    <Card
      title={
        <Space>
          <BarcodeOutlined />
          <span>Simulador de Lector de Código de Barras</span>
        </Space>
      }
      style={{ maxWidth: 600, margin: '20px auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Title level={5}>Modo de Prueba</Title>
          <Paragraph type="secondary">
            Este componente simula un lector de código de barras USB para pruebas. Ingresa un
            código y presiona "Simular Escaneo" para probarlo.
          </Paragraph>
        </div>

        <div>
          <Text strong>Código de Prueba:</Text>
          <Input
            size="large"
            value={testCode}
            onChange={(e) => setTestCode(e.target.value)}
            placeholder="Ingresa un código"
            prefix={<BarcodeOutlined />}
          />
        </div>

        <Button
          type="primary"
          size="large"
          icon={<ThunderboltOutlined />}
          onClick={() => simulateScan(testCode)}
          block
        >
          Simular Escaneo
        </Button>

        <Divider>Códigos de Ejemplo</Divider>

        <Space direction="vertical" style={{ width: '100%' }}>
          {presetCodes.map((preset) => (
            <Button
              key={preset.code}
              onClick={() => {
                setTestCode(preset.code);
                simulateScan(preset.code);
              }}
              block
            >
              {preset.label}: <Text code>{preset.code}</Text>
            </Button>
          ))}
        </Space>

        <Divider />

        <div
          style={{
            backgroundColor: '#f0f0f0',
            padding: '12px',
            borderRadius: '4px',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            💡 <strong>Consejo:</strong> Primero activa el escáner en la página de Inventario
            haciendo clic en "Escanear Código", luego usa este simulador para probar la
            funcionalidad sin necesidad de un lector físico.
          </Text>
        </div>
      </Space>
    </Card>
  );
};

export default BarcodeTester;