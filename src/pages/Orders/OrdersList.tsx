import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  message,
  Spin,
  Empty,
} from 'antd';
import {
  ReloadOutlined,
  FilterOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { ordersApi } from '@api/orders.api';
import { mechanicsApi } from '@api/mechanics.api';
import KanbanColumn from '@components/orders/KanbanColumn';
import AssignMechanicModal from '@components/orders/AssignMechanicModal';
import { OrderCardData } from '@components/orders/OrderCard';
import { Mechanic } from '@types/api.types';

const { Title } = Typography;

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<OrderCardData[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [mechanicFilter, setMechanicFilter] = useState<string>('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  // Columnas del Kanban
  const columns = [
    {
      status: 'pendiente_asignacion',
      title: 'Pendiente Asignación',
      color: '#d9d9d9',
      icon: '⏳',
    },
    {
      status: 'asignada',
      title: 'Asignada',
      color: '#ffa940',
      icon: '🟡',
    },
    {
      status: 'en_progreso',
      title: 'En Progreso',
      color: '#1890ff',
      icon: '🔵',
    },
    {
      status: 'listo',
      title: 'Listo para Entrega',
      color: '#52c41a',
      icon: '🟢',
    },
  ];

  useEffect(() => {
    loadData();
  }, [mechanicFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar órdenes
      const response = await ordersApi.list({
        mechanicId: mechanicFilter !== 'all' ? mechanicFilter : undefined,
        limit: 1000, // Cargar todas para el Kanban
      });
      setOrders(response.orders as OrderCardData[]);

      // Cargar mecánicos para el filtro
      const mechanicsList = await mechanicsApi.list({ isActive: true });
      setMechanics(mechanicsList);
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, { status: newStatus as any });
      message.success('Estado actualizado exitosamente');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al actualizar estado');
    }
  };

  const handleAssignMechanic = async (
    mechanicId: string,
    estimatedDelivery?: string,
    notes?: string
  ) => {
    if (!selectedOrderId) return;

    setAssignLoading(true);
    try {
      await ordersApi.assignMechanic(selectedOrderId, { mechanicId });

      // Actualizar estado a 'asignada' si está en 'pendiente_asignacion'
      const order = orders.find((o) => o._id === selectedOrderId);
      if (order?.order.status === 'pendiente_asignacion') {
        await ordersApi.updateStatus(selectedOrderId, {
          status: 'asignada',
          notes,
        });
      }

      message.success('Mecánico asignado exitosamente');
      setAssignModalOpen(false);
      setSelectedOrderId(null);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al asignar mecánico');
    } finally {
      setAssignLoading(false);
    }
  };

  // Calcular estadísticas
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.order.status === 'pendiente_asignacion').length,
    inProgress: orders.filter((o) => o.order.status === 'en_progreso').length,
    ready: orders.filter((o) => o.order.status === 'listo').length,
  };

  // Filtrar órdenes por columna (excluyendo 'entregado')
  const getOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.order.status === status);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Órdenes de Trabajo
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
            Actualizar
          </Button>
        </Space>
      </div>

      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Activas"
              value={stats.total}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pendientes Asignación"
              value={stats.pending}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#d9d9d9' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="En Progreso"
              value={stats.inProgress}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Listo para Entrega"
              value={stats.ready}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card>
        <Space>
          <FilterOutlined />
          <span>Filtrar por mecánico:</span>
          <Select
            value={mechanicFilter}
            onChange={setMechanicFilter}
            style={{ width: 250 }}
            size="large"
          >
            <Select.Option value="all">Todos los mecánicos</Select.Option>
            {mechanics.map((mechanic) => (
              <Select.Option key={mechanic._id} value={mechanic._id}>
                {mechanic.firstName} {mechanic.lastName1}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </Card>

      {/* Vista Kanban */}
      {orders.length === 0 ? (
        <Card>
          <Empty
            description="No hay órdenes de trabajo activas"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 16,
            overflowX: 'auto',
            paddingBottom: 16,
          }}
        >
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              title={column.title}
              status={column.status}
              color={column.color}
              icon={column.icon}
              orders={getOrdersByStatus(column.status)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Modal para asignar mecánico */}
      <AssignMechanicModal
        open={assignModalOpen}
        orderId={selectedOrderId || ''}
        currentMechanicId={
          orders.find((o) => o._id === selectedOrderId)?.order.mechanicId
            ? typeof orders.find((o) => o._id === selectedOrderId)?.order.mechanicId === 'string'
              ? (orders.find((o) => o._id === selectedOrderId)?.order.mechanicId as string)
              : (
                  orders.find((o) => o._id === selectedOrderId)?.order.mechanicId as {
                    _id: string;
                  }
                )?._id
            : undefined
        }
        onOk={handleAssignMechanic}
        onCancel={() => {
          setAssignModalOpen(false);
          setSelectedOrderId(null);
        }}
        loading={assignLoading}
      />
    </Space>
  );
};

export default OrdersList;
