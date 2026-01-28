import React from 'react';
import { Typography, Space, Input, Select, Alert } from 'antd';
import { SearchOutlined, CarOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const FuseDiagramsViewer: React.FC = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Title level={2}>Diagramas Eléctricos y Fusibles</Title>
      
      <Alert
        message="Base de Datos de Diagramas"
        description="Busca diagramas eléctricos y ubicación de fusibles por marca, modelo y año del vehículo."
        type="info"
        showIcon
        icon={<CarOutlined />}
      />
      
      <Space size="middle" style={{ width: '100%' }}>
        <Select
          placeholder="Marca"
          style={{ width: 200 }}
          size="large"
          options={[
            { value: 'toyota', label: 'Toyota' },
            { value: 'nissan', label: 'Nissan' },
            { value: 'chevrolet', label: 'Chevrolet' },
          ]}
        />
        <Select
          placeholder="Modelo"
          style={{ width: 200 }}
          size="large"
          disabled
        />
        <Select
          placeholder="Año"
          style={{ width: 150 }}
          size="large"
          disabled
        />
        <Input
          placeholder="Buscar..."
          prefix={<SearchOutlined />}
          size="large"
          style={{ width: 250 }}
        />
      </Space>
      
      <Paragraph type="secondary">
        🚧 Módulo en construcción - Fase 6 del proyecto
      </Paragraph>
      
      <Paragraph>
        Este módulo permitirá:
      </Paragraph>
      <ul>
        <li>Buscar diagramas por marca, modelo y año</li>
        <li>Visualizar imágenes con zoom</li>
        <li>Identificar ubicación de fusibles</li>
        <li>Agregar anotaciones personalizadas</li>
        <li>Imprimir diagramas</li>
      </ul>
    </Space>
  );
};

export default FuseDiagramsViewer;
