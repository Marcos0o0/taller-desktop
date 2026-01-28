import React from 'react';
import { Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const OrdersList: React.FC = () => {
  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Órdenes de Trabajo
        </Title>
        <Button type="primary" icon={<PlusOutlined />} size="large">
          Nueva Orden
        </Button>
      </div>
      
      <Paragraph>
        Vista Kanban de órdenes: Asignada → En Progreso → Listo → Entregada
      </Paragraph>
      <Paragraph type="secondary">
        🚧 Módulo en construcción - Fase 4 del proyecto
      </Paragraph>
    </Space>
  );
};

export default OrdersList;
