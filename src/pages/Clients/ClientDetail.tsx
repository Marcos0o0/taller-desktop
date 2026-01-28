import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Table,
  Tag,
  Spin,
  message,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ToolOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { clientsApi } from '@api/clients.api';
import { Client } from '@types/api.types';
import ClientFormModal from '@components/forms/ClientFormModal';

const { Title, Text } = Typography;

const ClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadClientData();
    }
  }, [id]);

  const loadClientData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      // Cargar cliente
      const clientData = await clientsApi.getById(id);
      setClient(clientData);

      // Cargar órdenes del cliente
      try {
        const ordersData = await clientsApi.getOrders(id, { limit: 10 });
        setOrders(ordersData.orders || []);
      } catch (error) {
        console.log('No se pudieron cargar las órdenes');
      }

      // Cargar presupuestos del cliente
      try {
        const quotesData = await clientsApi.getQuotes(id, { limit: 10 });
        setQuotes(quotesData.quotes || []);
      } catch (error) {
        console.log('No se pudieron cargar los presupuestos');
      }
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al cargar cliente');
      navigate('/clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = async (values: any) => {
    if (!id) return;

    setModalLoading(true);
    try {
      await clientsApi.update(id, values);
      message.success('Cliente actualizado exitosamente');
      setIsModalOpen(false);
      loadClientData();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al actualizar cliente');
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: 'Pendiente' },
      approved: { color: 'green', text: 'Aprobado' },
      rejected: { color: 'red', text: 'Rechazado' },
      pendiente_asignacion: { color: 'default', text: 'Pend. Asignación' },
      asignada: { color: 'orange', text: 'Asignada' },
      en_progreso: { color: 'blue', text: 'En Progreso' },
      listo: { color: 'green', text: 'Listo' },
      entregado: { color: 'default', text: 'Entregado' },
    };
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const quotesColumns = [
    {
      title: 'N° Presupuesto',
      dataIndex: 'quoteNumber',
      key: 'quoteNumber',
    },
    {
      title: 'Vehículo',
      key: 'vehicle',
      render: (record: any) =>
        record.vehicle
          ? `${record.vehicle.brand} ${record.vehicle.model} ${record.vehicle.year}`
          : '-',
    },
    {
      title: 'Monto',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (amount: number) => `$${amount.toLocaleString('es-CL')}`,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) =>
        new Date(date).toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
  ];

  const ordersColumns = [
    {
      title: 'N° Orden',
      key: 'orderNumber',
      render: (record: any) => record.order?.orderNumber || record.quoteNumber,
    },
    {
      title: 'Vehículo',
      key: 'vehicle',
      render: (record: any) =>
        record.vehicle
          ? `${record.vehicle.brand} ${record.vehicle.model} ${record.vehicle.year}`
          : '-',
    },
    {
      title: 'Monto',
      key: 'cost',
      render: (record: any) => {
        const cost = record.order?.finalCost || record.estimatedCost;
        return `$${cost?.toLocaleString('es-CL') || 0}`;
      },
    },
    {
      title: 'Estado',
      key: 'status',
      render: (record: any) => getStatusTag(record.order?.status || 'pending'),
    },
    {
      title: 'Fecha',
      key: 'date',
      render: (record: any) =>
        new Date(record.order?.createdAt || record.createdAt).toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!client) {
    return null;
  }

  // Calcular estadísticas
  const totalOrders = orders.length;
  const totalSpent = orders.reduce(
    (sum, order) => sum + (order.order?.finalCost || order.estimatedCost || 0),
    0
  );
  const activeOrders = orders.filter(
    (o) =>
      o.order?.status === 'asignada' ||
      o.order?.status === 'en_progreso' ||
      o.order?.status === 'listo'
  ).length;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/clientes')}>
            Volver
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            {client.firstName} {client.lastName1} {client.lastName2 || ''}
          </Title>
        </Space>
        <Button type="primary" icon={<EditOutlined />} size="large" onClick={handleEdit}>
          Editar Cliente
        </Button>
      </div>

      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total de Órdenes"
              value={totalOrders}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Órdenes Activas"
              value={activeOrders}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Gastado"
              value={totalSpent}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="CLP"
            />
          </Card>
        </Col>
      </Row>

      {/* Información del cliente */}
      <Card title="Información del Cliente">
        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} size="middle">
          <Descriptions.Item label="Nombre Completo">
            <Text strong>
              {client.firstName} {client.lastName1} {client.lastName2 || ''}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Teléfono">
            <Space>
              <PhoneOutlined />
              <Text>{client.phone}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space>
              <MailOutlined />
              <Text>{client.email || 'No registrado'}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Cliente desde">
            <Space>
              <CalendarOutlined />
              <Text>
                {new Date(client.createdAt).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Presupuestos */}
      <Card
        title={`Presupuestos (${quotes.length})`}
        extra={
          <Button type="link" onClick={() => navigate('/presupuestos')}>
            Ver todos →
          </Button>
        }
      >
        <Table
          columns={quotesColumns}
          dataSource={quotes}
          rowKey="_id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No hay presupuestos' }}
        />
      </Card>

      {/* Órdenes de trabajo */}
      <Card
        title={`Órdenes de Trabajo (${orders.length})`}
        extra={
          <Button type="link" onClick={() => navigate('/ordenes')}>
            Ver todas →
          </Button>
        }
      >
        <Table
          columns={ordersColumns}
          dataSource={orders}
          rowKey="_id"
          pagination={false}
          size="middle"
          locale={{ emptyText: 'No hay órdenes de trabajo' }}
        />
      </Card>

      {/* Modal de edición */}
      <ClientFormModal
        open={isModalOpen}
        client={client}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        loading={modalLoading}
      />
    </Space>
  );
};

export default ClientDetail;