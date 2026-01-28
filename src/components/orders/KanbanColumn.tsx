import React from 'react';
import { Card, Typography, Badge, Space, Empty } from 'antd';
import OrderCard, { OrderCardData } from './OrderCard';

const { Title, Text } = Typography;

interface KanbanColumnProps {
  title: string;
  status: string;
  color: string;
  icon: string;
  orders: OrderCardData[];
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  color,
  icon,
  orders,
  onStatusChange,
}) => {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 280,
        maxWidth: 350,
      }}
    >
      <Card
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        bodyStyle={{
          flex: 1,
          padding: '16px',
          overflow: 'auto',
          maxHeight: 'calc(100vh - 350px)',
        }}
      >
        {/* Header de la columna */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `2px solid ${color}`,
          }}
        >
          <Space>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <div>
              <Title level={5} style={{ margin: 0, fontSize: 15 }}>
                {title}
              </Title>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
              </Text>
            </div>
          </Space>
          <Badge
            count={orders.length}
            style={{
              backgroundColor: color,
            }}
            showZero
          />
        </div>

        {/* Lista de órdenes */}
        {orders.length === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary" style={{ fontSize: 13 }}>
                  No hay órdenes {title.toLowerCase()}
                </Text>
              }
            />
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} onStatusChange={onStatusChange} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default KanbanColumn;
