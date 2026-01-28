import React from 'react';
import { Card, Typography, Space, Tag, Avatar, Button, Tooltip } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CarOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

export interface OrderCardData {
  _id: string;
  quoteNumber: string;
  client: {
    firstName: string;
    lastName1: string;
    lastName2?: string;
  };
  vehicle: {
    brand: string;
    model: string;
    year: number;
  };
  order: {
    orderNumber: string;
    mechanicId?: {
      firstName: string;
      lastName1: string;
    };
    status: string;
    estimatedCost?: number;
    finalCost?: number;
    workDescription: string;
  };
}

interface OrderCardProps {
  order: OrderCardData;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusChange }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendiente_asignacion: '#d9d9d9',
      asignada: '#ffa940',
      en_progreso: '#1890ff',
      listo: '#52c41a',
      entregado: '#8c8c8c',
    };
    return colors[status] || '#d9d9d9';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pendiente_asignacion: '⏳',
      asignada: '🟡',
      en_progreso: '🔵',
      listo: '🟢',
      entregado: '✅',
    };
    return icons[status] || '📋';
  };

  const mechanic = order.order.mechanicId;
  const cost = order.order.finalCost || order.order.estimatedCost || 0;

  return (
    <Card
      hoverable
      size="small"
      style={{
        marginBottom: 12,
        borderLeft: `4px solid ${getStatusColor(order.order.status)}`,
        cursor: 'pointer',
      }}
      onClick={() => navigate(`/ordenes/${order._id}`)}
      bodyStyle={{ padding: '12px' }}
    >
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {/* Header - Número de orden */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: 14 }}>
            {order.order.orderNumber}
          </Text>
          <span style={{ fontSize: 16 }}>{getStatusIcon(order.order.status)}</span>
        </div>

        {/* Cliente */}
        <div>
          <Text style={{ fontSize: 13, color: '#595959' }}>
            {order.client.firstName} {order.client.lastName1}
          </Text>
        </div>

        {/* Vehículo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <CarOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {order.vehicle.brand} {order.vehicle.model} '{order.vehicle.year.toString().slice(-2)}
          </Text>
        </div>

        {/* Descripción del trabajo (truncada) */}
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ fontSize: 12, color: '#8c8c8c', margin: '4px 0' }}
        >
          {order.order.workDescription}
        </Paragraph>

        {/* Mecánico asignado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Avatar
            size={20}
            icon={<UserOutlined />}
            style={{
              backgroundColor: mechanic ? '#1890ff' : '#d9d9d9',
              fontSize: 12,
            }}
          />
          <Text style={{ fontSize: 12 }}>
            {mechanic ? `${mechanic.firstName} ${mechanic.lastName1}` : 'Sin asignar'}
          </Text>
        </div>

        {/* Monto */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 8,
            borderTop: '1px solid #f0f0f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <DollarOutlined style={{ fontSize: 12, color: '#52c41a' }} />
            <Text strong style={{ fontSize: 14, color: '#52c41a' }}>
              ${cost.toLocaleString('es-CL')}
            </Text>
          </div>

          {order.order.status === 'listo' && (
            <Tooltip title="Marcar como entregado">
              <Button
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(order._id, 'entregado');
                }}
              >
                Entregar
              </Button>
            </Tooltip>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default OrderCard;
