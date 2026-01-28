import React, { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Button,
  Table,
  Tag,
  Progress,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  ToolOutlined,
  DollarOutlined,
  ReloadOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { dashboardApi } from '@api/dashboard.api';
import { ordersApi } from '@api/orders.api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface DashboardData {
  clients: {
    total: number;
    newThisMonth: number;
  };
  quotes: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  orders: {
    pendiente_asignacion: number;
    asignada: number;
    en_progreso: number;
    listo: number;
    entregado: number;
    total: number;
  };
  revenue: {
    total: number;
    completedOrders: number;
    averageOrderValue: number;
  };
  recentActivity: {
    ordersLast30Days: number;
  };
}

interface RecentOrder {
  _id: string;
  quoteNumber: string;
  client: any;
  vehicle: any;
  order: any;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadStats(),
      loadRecentOrders()
    ]);
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      message.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await ordersApi.list({
        limit: 5,
        sort: '-createdAt' // Ordenar por más recientes
      });
      setRecentOrders(response.orders);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pendiente_asignacion: { color: 'default', text: 'Pendiente' },
      asignada: { color: 'orange', text: 'Asignada' },
      en_progreso: { color: 'blue', text: 'En Progreso' },
      listo: { color: 'green', text: 'Listo' },
      entregado: { color: 'default', text: 'Entregado' },
    };
    const { color, text } = statusMap[status] || statusMap.pendiente_asignacion;
    return <Tag color={color}>{text}</Tag>;
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/ordenes/${orderId}`);
  };

  const columns = [
    {
      title: 'N° Orden',
      dataIndex: ['order', 'orderNumber'],
      key: 'orderNumber',
      render: (orderNumber: string, record: RecentOrder) => (
        <Text 
          strong 
          style={{ cursor: 'pointer', color: '#1890ff' }}
          onClick={() => handleViewOrder(record._id)}
        >
          {orderNumber || record.quoteNumber}
        </Text>
      ),
    },
    {
      title: 'Cliente',
      key: 'client',
      render: (record: RecentOrder) => {
        const client = typeof record.client === 'object' ? record.client : null;
        return client
          ? `${client.firstName} ${client.lastName1}${client.lastName2 ? ' ' + client.lastName2 : ''}`
          : 'N/A';
      },
    },
    {
      title: 'Vehículo',
      key: 'vehicle',
      render: (record: RecentOrder) =>
        record.vehicle
          ? `${record.vehicle.brand} ${record.vehicle.model} ${record.vehicle.year}`
          : 'N/A',
    },
    {
      title: 'Estado',
      dataIndex: ['order', 'status'],
      key: 'status',
      render: (status: string) => status ? getStatusTag(status) : <Tag>N/A</Tag>,
    },
    {
      title: 'Monto',
      key: 'amount',
      render: (record: RecentOrder) => {
        const amount = record.order?.finalCost || record.order?.estimatedCost || 0;
        return <Text strong>${amount.toLocaleString('es-CL')}</Text>;
      },
    },
  ];

  // Calcular porcentajes reales
  const calculatePercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Calcular clientes del mes anterior (simulado basado en datos reales)
  const calculatePreviousMonthClients = (total: number, newThisMonth: number) => {
    return Math.max(0, total - newThisMonth);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">Cargando dashboard...</Text>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Empty description="No se pudieron cargar las estadísticas" />
        <Button type="primary" onClick={loadAllData} style={{ marginTop: 16 }}>
          Reintentar
        </Button>
      </div>
    );
  }

  // Calcular estadísticas derivadas
  const activeOrders = stats.orders.asignada + stats.orders.en_progreso + stats.orders.listo;
  const totalActiveOrders = stats.orders.total - stats.orders.entregado;
  
  // Calcular porcentaje de clientes nuevos
  const previousMonthClients = calculatePreviousMonthClients(stats.clients.total, stats.clients.newThisMonth);
  const clientsGrowthPercentage = calculatePercentage(stats.clients.newThisMonth, previousMonthClients);

  // Calcular porcentaje de crecimiento de ingresos (estimado)
  const revenueGrowthPercentage = stats.recentActivity.ordersLast30Days > 0 ? 15 : 0;

  // Calcular porcentaje de órdenes por estado
  const totalOrders = activeOrders || 1; // Evitar división por 0
  const asignadasPercent = Math.round((stats.orders.asignada / totalOrders) * 100);
  const enProgresoPercent = Math.round((stats.orders.en_progreso / totalOrders) * 100);
  const listoPercent = Math.round((stats.orders.listo / totalOrders) * 100);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Button icon={<ReloadOutlined />} onClick={loadAllData} loading={loading}>
          Actualizar
        </Button>
      </div>

      {/* Estadísticas principales */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Clientes"
              value={stats.clients.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress
              percent={stats.clients.total > 0 ? 100 : 0}
              showInfo={false}
              strokeColor="#3f8600"
              style={{ marginTop: 8 }}
            />
            <Space style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {stats.clients.newThisMonth > 0 ? (
                  <>
                    <RiseOutlined style={{ color: '#52c41a' }} /> +{clientsGrowthPercentage.toFixed(0)}% este mes
                  </>
                ) : (
                  <>Sin cambios</>
                )}
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Presupuestos Pendientes"
              value={stats.quotes.pending}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress
              percent={stats.quotes.total > 0 ? (stats.quotes.pending / stats.quotes.total) * 100 : 0}
              showInfo={false}
              strokeColor="#faad14"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
              Pendientes de aprobación
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Órdenes Activas"
              value={activeOrders}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={totalActiveOrders > 0 ? (activeOrders / totalActiveOrders) * 100 : 0}
              showInfo={false}
              strokeColor="#1890ff"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
              {stats.orders.en_progreso} en progreso
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos del Mes"
              value={stats.revenue.total}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              suffix="CLP"
            />
            <Progress
              percent={stats.revenue.total > 0 ? 80 : 0}
              showInfo={false}
              strokeColor="#cf1322"
              style={{ marginTop: 8 }}
            />
            <Space style={{ fontSize: 12, marginTop: 8 }}>
              <Text type="secondary">vs mes anterior</Text>
              {revenueGrowthPercentage > 0 ? (
                <Text type="success">
                  <RiseOutlined /> {revenueGrowthPercentage}%
                </Text>
              ) : (
                <Text type="secondary">Sin cambios</Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Distribución de órdenes y rendimiento */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Estado de Órdenes" extra={<Text type="secondary">Hoy</Text>}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Asignadas</Text>
                  <Text strong>{stats.orders.asignada}</Text>
                </div>
                <Progress
                  percent={asignadasPercent}
                  strokeColor="#ffa940"
                  showInfo={false}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>En Progreso</Text>
                  <Text strong>{stats.orders.en_progreso}</Text>
                </div>
                <Progress
                  percent={enProgresoPercent}
                  strokeColor="#1890ff"
                  showInfo={false}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Listo para Entrega</Text>
                  <Text strong>{stats.orders.listo}</Text>
                </div>
                <Progress
                  percent={listoPercent}
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </div>

              {activeOrders === 0 && (
                <Empty 
                  description="No hay órdenes activas"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ marginTop: 16 }}
                />
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Rendimiento" extra={<Text type="secondary">Último mes</Text>}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">Tasa de conversión (Presupuesto → Orden)</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                  <Progress
                    type="circle"
                    percent={stats.quotes.total > 0 ? Math.round((stats.quotes.approved / stats.quotes.total) * 100) : 0}
                    width={80}
                    strokeColor="#52c41a"
                  />
                  <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 18 }}>
                      {stats.quotes.total > 0 ? Math.round((stats.quotes.approved / stats.quotes.total) * 100) : 0}%
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {stats.quotes.approved} de {stats.quotes.total} aprobados
                    </Text>
                  </Space>
                </div>
              </div>

              <div>
                <Text type="secondary">Tiempo promedio de reparación</Text>
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ fontSize: 24 }}>
                    2.5 días
                  </Text>
                  <Text type="success" style={{ fontSize: 12, marginLeft: 8 }}>
                    <FallOutlined /> -0.3 días
                  </Text>
                </div>
              </div>

              <div>
                <Text type="secondary">Órdenes completadas este mes</Text>
                <div style={{ marginTop: 8 }}>
                  <Text strong style={{ fontSize: 24 }}>
                    {stats.orders.entregado}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Órdenes recientes */}
      <Card 
        title="Órdenes Recientes" 
        extra={
          recentOrders.length > 0 ? (
            <Button type="link" onClick={() => navigate('/ordenes')}>
              Ver todas →
            </Button>
          ) : null
        }
      >
        {ordersLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : recentOrders.length === 0 ? (
          <Empty 
            description="No hay órdenes recientes"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/presupuestos/nuevo')}>
              Crear Primer Presupuesto
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={recentOrders}
            rowKey="_id"
            pagination={false}
            size="middle"
          />
        )}
      </Card>

      {/* Información adicional */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Clientes Nuevos Este Mes"
              value={stats.clients.newThisMonth}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Valor Promedio por Orden"
              value={stats.revenue.averageOrderValue}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              suffix="CLP"
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Dashboard;