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
import { dashboardApi } from '@api/dashboard.api';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Datos de ejemplo para órdenes recientes
  const recentOrders = [
    {
      key: '1',
      orderNumber: 'ORD-001',
      client: 'Juan Pérez',
      vehicle: 'Toyota Corolla 2015',
      status: 'en_progreso',
      amount: 250000,
    },
    {
      key: '2',
      orderNumber: 'ORD-002',
      client: 'María González',
      vehicle: 'Nissan Versa 2018',
      status: 'listo',
      amount: 180000,
    },
    {
      key: '3',
      orderNumber: 'ORD-003',
      client: 'Carlos Ramírez',
      vehicle: 'Chevrolet Sail 2020',
      status: 'asignada',
      amount: 320000,
    },
  ];

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      asignada: { color: 'orange', text: 'Asignada' },
      en_progreso: { color: 'blue', text: 'En Progreso' },
      listo: { color: 'green', text: 'Listo' },
      entregada: { color: 'default', text: 'Entregada' },
    };
    const { color, text } = statusMap[status] || statusMap.asignada;
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'N° Orden',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
    },
    {
      title: 'Cliente',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Vehículo',
      dataIndex: 'vehicle',
      key: 'vehicle',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `$${amount.toLocaleString('es-CL')}`,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text>Cargando dashboard...</Text>
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Dashboard
        </Title>
        <Button icon={<ReloadOutlined />} onClick={loadStats} loading={loading}>
          Actualizar
        </Button>
      </div>

      {/* Estadísticas principales */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Clientes"
              value={stats?.clients?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress
              percent={75}
              showInfo={false}
              strokeColor="#3f8600"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              +12% este mes
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Presupuestos Pendientes"
              value={stats?.quotes?.pending || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress
              percent={45}
              showInfo={false}
              strokeColor="#faad14"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Pendientes de aprobación
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Órdenes Activas"
              value={
                (stats?.orders?.asignada || 0) +
                (stats?.orders?.en_progreso || 0) +
                (stats?.orders?.listo || 0)
              }
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress
              percent={60}
              showInfo={false}
              strokeColor="#1890ff"
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {stats?.orders?.en_progreso || 0} en progreso
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ingresos del Mes"
              value={stats?.revenue?.total || 0}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              suffix="CLP"
            />
            <Progress
              percent={80}
              showInfo={false}
              strokeColor="#cf1322"
              style={{ marginTop: 8 }}
            />
            <Space style={{ fontSize: 12 }}>
              <Text type="secondary">vs mes anterior</Text>
              <Text type="success">
                <RiseOutlined /> 15%
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Distribución de órdenes */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Estado de Órdenes" extra={<Text type="secondary">Hoy</Text>}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Asignadas</Text>
                  <Text strong>{stats?.orders?.asignada || 0}</Text>
                </div>
                <Progress
                  percent={((stats?.orders?.asignada || 0) / 10) * 100}
                  strokeColor="#ffa940"
                  showInfo={false}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>En Progreso</Text>
                  <Text strong>{stats?.orders?.en_progreso || 0}</Text>
                </div>
                <Progress
                  percent={((stats?.orders?.en_progreso || 0) / 10) * 100}
                  strokeColor="#1890ff"
                  showInfo={false}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Listo para Entrega</Text>
                  <Text strong>{stats?.orders?.listo || 0}</Text>
                </div>
                <Progress
                  percent={((stats?.orders?.listo || 0) / 10) * 100}
                  strokeColor="#52c41a"
                  showInfo={false}
                />
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Rendimiento" extra={<Text type="secondary">Último mes</Text>}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text type="secondary">Tasa de conversión (Presupuesto → Orden)</Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Progress
                    type="circle"
                    percent={73}
                    width={60}
                    strokeColor="#52c41a"
                  />
                  <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 16 }}>
                      73%
                    </Text>
                    <Text type="success" style={{ fontSize: 12 }}>
                      <RiseOutlined /> +8% vs mes anterior
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
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Órdenes recientes */}
      <Card title="Órdenes Recientes" extra={<Button type="link">Ver todas</Button>}>
        <Table
          columns={columns}
          dataSource={recentOrders}
          pagination={false}
          size="middle"
        />
      </Card>
    </Space>
  );
};

export default Dashboard;
