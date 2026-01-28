import React from 'react';
import { Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const ClientsList: React.FC = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Clientes
        </Title>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Nuevo Cliente
        </Button>
      </div>
      
      <Paragraph>
        Aquí se mostrará la lista completa de clientes con búsqueda y filtros.
      </Paragraph>
      <Paragraph type="secondary">
        🚧 Módulo en construcción - Fase 2 del proyecto
      </Paragraph>
    </Space>
  );
};

export default ClientsList;
