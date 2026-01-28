import React, { useState } from 'react';
import { Typography, Button, Space, Alert, message, Badge, Collapse } from 'antd';
import { PlusOutlined, BarcodeOutlined } from '@ant-design/icons';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import ProductFormModal from '@/components/inventory/ProductFormModal';
import BarcodeTester from '@/components/inventory/BarcodeTester';

const { Title, Paragraph } = Typography;

const InventoryList: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string | undefined>();
  const [scannerEnabled, setScannerEnabled] = useState(false);

  // Hook para detectar el lector de código de barras
  const { scanning } = useBarcodeScanner({
    enabled: scannerEnabled,
    onScan: (barcode) => {
      message.success(`Código escaneado: ${barcode}`);
      setScannedBarcode(barcode);
      setIsModalOpen(true);
    },
    minLength: 3,
    maxLength: 50,
    timeout: 100,
  });

  const handleScanClick = () => {
    setScannerEnabled(!scannerEnabled);
    if (!scannerEnabled) {
      message.info('Escáner activado. Escanee un código de barras...');
    } else {
      message.info('Escáner desactivado');
    }
  };

  const handleNewProduct = () => {
    setScannedBarcode(undefined);
    setIsModalOpen(true);
  };

  const handleModalOk = (values: any) => {
    console.log('Producto a guardar:', values);
    // Aquí irá la lógica para guardar el producto en la base de datos
    message.success('Producto guardado exitosamente');
    setIsModalOpen(false);
    setScannedBarcode(undefined);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setScannedBarcode(undefined);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Inventario
        </Title>
        <Space>
          <Badge dot={scanning} status="processing">
            <Button 
              icon={<BarcodeOutlined />} 
              size="large"
              onClick={handleScanClick}
              type={scannerEnabled ? 'primary' : 'default'}
              danger={scannerEnabled}
            >
              {scannerEnabled ? 'Detener Escáner' : 'Escanear Código'}
            </Button>
          </Badge>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={handleNewProduct}
          >
            Nuevo Producto
          </Button>
        </Space>
      </div>
      
      <Alert
        message="Integración con Lector de Código de Barras"
        description="Conecta tu lector USB y haz clic en 'Escanear Código' para activar la detección automática. El lector funcionará en cualquier parte del sistema."
        type="info"
        showIcon
      />

      {scannerEnabled && (
        <Alert
          message="🔍 Escáner Activo"
          description="El sistema está esperando que escanees un código de barras. Escanea cualquier producto para agregarlo al inventario."
          type="success"
          showIcon
          closable
          onClose={() => setScannerEnabled(false)}
        />
      )}
      
      <Paragraph>
        Control de inventario con alertas de stock bajo y gestión de entradas/salidas.
      </Paragraph>
      <Paragraph type="secondary">
        🚧 Módulo en construcción - Fase 5 del proyecto
      </Paragraph>

      {/* Simulador para desarrollo - Solo visible en modo desarrollo */}
      {import.meta.env.DEV && (
        <Collapse
          items={[
            {
              key: '1',
              label: '🧪 Modo Desarrollo: Simulador de Escáner',
              children: <BarcodeTester />,
            },
          ]}
        />
      )}

      <ProductFormModal
        open={isModalOpen}
        scannedBarcode={scannedBarcode}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </Space>
  );
};

export default InventoryList;
