import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Space,
  Table,
  Tag,
  Progress,
  List,
  Avatar,
  Divider,
  Select,
  DatePicker,
} from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  ThunderboltOutlined,
  ToolOutlined,
  WarningOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Colores para gráficos
const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

const DashboardPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  const loadDashboardData = () => {
    setLoading(true);
    
    // Cargar datos de trabajos rápidos
    const quickJobsStr = localStorage.getItem('quickJobs');
    const quickJobs = quickJobsStr ? JSON.parse(quickJobsStr) : [];

    // Calcular fecha de inicio según el rango
    let startDate = dayjs();
    if (dateRange === 'week') {
      startDate = dayjs().subtract(7, 'days');
    } else if (dateRange === 'month') {
      startDate = dayjs().subtract(30, 'days');
    } else {
      startDate = dayjs().subtract(365, 'days');
    }

    // Filtrar trabajos en el rango
    const filteredJobs = quickJobs.filter((job: any) => {
      return dayjs(job.createdAt).isAfter(startDate);
    });

    // Calcular estadísticas
    const totalRevenue = filteredJobs.reduce((sum: number, job: any) => sum + job.totalCost, 0);
    const totalLabor = filteredJobs.reduce((sum: number, job: any) => sum + job.laborCost, 0);
    const totalParts = filteredJobs.reduce((sum: number, job: any) => sum + job.partsCost, 0);
    const totalJobs = filteredJobs.length;
    const avgJobValue = totalJobs > 0 ? Math.round(totalRevenue / totalJobs) : 0;

    // Comparación con periodo anterior
    const prevStartDate = startDate.subtract(
      dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365,
      'days'
    );
    const prevJobs = quickJobs.filter((job: any) => {
      const date = dayjs(job.createdAt);
      return date.isAfter(prevStartDate) && date.isBefore(startDate);
    });
    const prevRevenue = prevJobs.reduce((sum: number, job: any) => sum + job.totalCost, 0);
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    // Top servicios
    const serviceCount: any = {};
    filteredJobs.forEach((job: any) => {
      serviceCount[job.jobName] = (serviceCount[job.jobName] || 0) + 1;
    });
    const topServices = Object.entries(serviceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 5);

    // Ingresos por servicio
    const revenueByService: any = {};
    filteredJobs.forEach((job: any) => {
      revenueByService[job.jobName] = (revenueByService[job.jobName] || 0) + job.totalCost;
    });
    const topRevenueServices = Object.entries(revenueByService)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5);

    // Gráfico de ingresos diarios
    const dailyRevenue: any = {};
    filteredJobs.forEach((job: any) => {
      const date = dayjs(job.createdAt).format('YYYY-MM-DD');
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { date, revenue: 0, jobs: 0 };
      }
      dailyRevenue[date].revenue += job.totalCost;
      dailyRevenue[date].jobs += 1;
    });

    const revenueChartData = Object.values(dailyRevenue)
      .sort((a: any, b: any) => a.date.localeCompare(b.date))
      .map((item: any) => ({
        date: dayjs(item.date).format('DD/MM'),
        revenue: item.revenue,
        jobs: item.jobs,
      }));

    // Distribución de ingresos (mano de obra vs repuestos)
    const revenueDistribution = [
      { name: 'Mano de Obra', value: totalLabor },
      { name: 'Repuestos', value: totalParts },
    ];

    // Últimos trabajos
    const recentJobs = filteredJobs
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    setStats({
      totalRevenue,
      totalLabor,
      totalParts,
      totalJobs,
      avgJobValue,
      revenueChange,
      topServices,
      topRevenueServices,
      revenueChartData,
      revenueDistribution,
      recentJobs,
    });

    setLoading(false);
  };

  // Cargar inventario con stock bajo
  const getLowStockProducts = () => {
    const inventoryStr = localStorage.getItem('inventory');
    if (!inventoryStr) return [];
    
    const inventory = JSON.parse(inventoryStr);
    return inventory
      .filter((p: any) => p.stock <= (p.minStock || 5))
      .sort((a: any, b: any) => a.stock - b.stock)
      .slice(0, 5);
  };

  const lowStockProducts = getLowStockProducts();

  if (loading || !stats) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>Panel de Control</Title>
          <Select
            value={dateRange}
            onChange={setDateRange}
            style={{ width: 150 }}
            size="large"
          >
            <Select.Option value="week">Última semana</Select.Option>
            <Select.Option value="month">Último mes</Select.Option>
            <Select.Option value="year">Último año</Select.Option>
          </Select>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Ingresos Totales"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                suffix="CLP"
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => `$${value.toLocaleString('es-CL')}`}
              />
              <div style={{ marginTop: 8 }}>
                {stats.revenueChange >= 0 ? (
                  <Text type="success">
                    <RiseOutlined /> +{stats.revenueChange.toFixed(1)}% vs periodo anterior
                  </Text>
                ) : (
                  <Text type="danger">
                    <FallOutlined /> {stats.revenueChange.toFixed(1)}% vs periodo anterior
                  </Text>
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Trabajos Realizados"
                value={stats.totalJobs}
                prefix={<ThunderboltOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Promedio: ${stats.avgJobValue.toLocaleString('es-CL')} por trabajo
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Mano de Obra"
                value={stats.totalLabor}
                prefix={<ToolOutlined />}
                suffix="CLP"
                valueStyle={{ color: '#722ed1' }}
                formatter={(value) => `$${value.toLocaleString('es-CL')}`}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {stats.totalRevenue > 0 ? ((stats.totalLabor / stats.totalRevenue) * 100).toFixed(1) : 0}% del total
                </Text>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Repuestos"
                value={stats.totalParts}
                prefix={<ShoppingCartOutlined />}
                suffix="CLP"
                valueStyle={{ color: '#faad14' }}
                formatter={(value) => `$${value.toLocaleString('es-CL')}`}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {stats.totalRevenue > 0 ? ((stats.totalParts / stats.totalRevenue) * 100).toFixed(1) : 0}% del total
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Gráficos */}
        <Row gutter={[16, 16]}>
          {/* Gráfico de ingresos */}
          <Col xs={24} lg={16}>
            <Card title="Ingresos Diarios">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any) => `$${value.toLocaleString('es-CL')}`}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1890ff"
                    strokeWidth={2}
                    name="Ingresos"
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Distribución de ingresos */}
          <Col xs={24} lg={8}>
            <Card title="Distribución de Ingresos">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.revenueDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: $${(entry.value / 1000).toFixed(0)}k`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.revenueDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${value.toLocaleString('es-CL')}`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Top servicios */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title={<><TrophyOutlined /> Servicios Más Populares</>}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.topServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#52c41a" name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title={<><DollarOutlined /> Servicios Más Rentables</>}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.topRevenueServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip formatter={(value: any) => `$${value.toLocaleString('es-CL')}`} />
                  <Bar dataKey="revenue" fill="#1890ff" name="Ingresos" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Trabajos recientes y alertas */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="⚡ Últimos Trabajos Realizados">
              <List
                itemLayout="horizontal"
                dataSource={stats.recentJobs}
                renderItem={(item: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{item.jobName[0]}</Avatar>}
                      title={item.jobName}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary">{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
                          <Text type="secondary">{item.vehicleInfo}</Text>
                        </Space>
                      }
                    />
                    <Text strong style={{ fontSize: 16 }}>
                      ${item.totalCost.toLocaleString('es-CL')}
                    </Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <WarningOutlined style={{ color: '#faad14' }} />
                  <span>Alertas de Inventario</span>
                </Space>
              }
            >
              {lowStockProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text type="secondary">Todo el inventario tiene stock suficiente</Text>
                </div>
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={lowStockProducts}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<Avatar icon={<WarningOutlined />} style={{ backgroundColor: '#faad14' }} />}
                        title={item.name}
                        description={
                          <Space>
                            <Tag color="red">Stock: {item.stock}</Tag>
                            <Text type="secondary">Mínimo: {item.minStock || 5}</Text>
                          </Space>
                        }
                      />
                      <Progress
                        type="circle"
                        percent={Math.round((item.stock / (item.minStock || 5)) * 100)}
                        width={50}
                        status={item.stock === 0 ? 'exception' : 'normal'}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default DashboardPage;