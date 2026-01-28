import React from 'react';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const OrderDetail: React.FC = () => {
  return (
    <div>
      <Title level={2}>Detalle de Orden</Title>
      <Paragraph type="secondary">
        🚧 Página en construcción
      </Paragraph>
    </div>
  );
};

export default OrderDetail;
