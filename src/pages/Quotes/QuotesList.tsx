import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  FileTextOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { quotesApi } from '@api/quotes.api';
import { Quote } from '@types/api.types';

const { Title, Text } = Typography;

const QuotesList: React.FC = () => {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadQuotes();
  }, [pagination.current, pagination.pageSize, statusFilter]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const response = await quotesApi.list({
        page: pagination.current,
        limit: pagination.pageSize,
        status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      });

      setQuotes(response.quotes);
      setPagination({
        ...pagination,
        total: response.pagination.total,
      });

      // Calcular estadísticas
      const allQuotes = await quotesApi.list({ limit: 1000 });
      setStats({
        pending: allQuotes.quotes.filter((q) => q.status === 'pending').length,
        approved: allQuotes.quotes.filter((q) => q.status === 'approved').length,
        rejected: allQuotes.quotes.filter((q) => q.status === 'rejected').length,
      });
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al cargar presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const handleView = (quoteId: string) => {
    navigate(`/presupuestos/${quoteId}`);
  };

  const handleApprove = async (quoteId: string) => {
    try {
      await quotesApi.approve(quoteId);
      message.success('Presupuesto aprobado exitosamente');
      loadQuotes();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al aprobar presupuesto');
    }
  };

  const handleReject = async (quoteId: string) => {
    try {
      await quotesApi.reject(quoteId);
      message.success('Presupuesto rechazado');
      loadQuotes();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al rechazar presupuesto');
    }
  };

  const handleSendEmail = async (quoteId: string) => {
    try {
      await quotesApi.sendEmail(quoteId);
      message.success('Presupuesto enviado por email exitosamente');
      loadQuotes();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al enviar email');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'orange', text: 'Pendiente', icon: <FileTextOutlined /> },
      approved: { color: 'green', text: 'Aprobado', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: 'Rechazado', icon: <CloseCircleOutlined /> },
    };
    const { color, text, icon } = statusMap[status as keyof typeof statusMap];
    return (
      <Tag color={color} icon={icon}>
        {text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'N° Presupuesto',
      dataIndex: 'quoteNumber',
      key: 'quoteNumber',
      width: 150,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Cliente',
      key: 'client',
      render: (record: Quote) => {
        const client = typeof record.clientId === 'object' ? record.clientId : null;
        return client
          ? `${client.firstName} ${client.lastName1} ${client.lastName2 || ''}`
          : 'Cliente no disponible';
      },
    },
    {
      title: 'Vehículo',
      key: 'vehicle',
      render: (record: Quote) =>
        `${record.vehicle.brand} ${record.vehicle.model} ${record.vehicle.year}`,
    },
    {
      title: 'Monto',
      dataIndex: 'estimatedCost',
      key: 'estimatedCost',
      render: (amount: number) => (
        <Text strong style={{ fontSize: 15 }}>
          ${amount.toLocaleString('es-CL')}
        </Text>
      ),
      sorter: (a: Quote, b: Quote) => a.estimatedCost - b.estimatedCost,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Email',
      key: 'emailSent',
      render: (record: Quote) =>
        record.emailSent ? (
          <Tag color="blue" icon={<MailOutlined />}>
            Enviado
          </Tag>
        ) : (
          <Tag>No enviado</Tag>
        ),
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
      sorter: (a: Quote, b: Quote) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 280,
      render: (record: Quote) => (
        <Space size="small" wrap>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record._id)}
            size="small"
          >
            Ver
          </Button>
          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="¿Aprobar presupuesto?"
                description="Esto creará una orden de trabajo"
                onConfirm={() => handleApprove(record._id)}
                okText="Sí, aprobar"
                cancelText="Cancelar"
              >
                <Button
                  type="link"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                  size="small"
                >
                  Aprobar
                </Button>
              </Popconfirm>
              <Popconfirm
                title="¿Rechazar presupuesto?"
                onConfirm={() => handleReject(record._id)}
                okText="Sí, rechazar"
                cancelText="Cancelar"
              >
                <Button type="link" danger icon={<CloseCircleOutlined />} size="small">
                  Rechazar
                </Button>
              </Popconfirm>
            </>
          )}
          {!record.emailSent && (
            <Button
              type="link"
              icon={<MailOutlined />}
              onClick={() => handleSendEmail(record._id)}
              size="small"
            >
              Enviar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Presupuestos
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/presupuestos/nuevo')}
        >
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Pendientes"
              value={stats.pending}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Aprobados"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Rechazados"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card>
        <Space>
          <Text>Filtrar por estado:</Text>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            size="large"
            options={[
              { value: 'all', label: 'Todos' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'approved', label: 'Aprobados' },
              { value: 'rejected', label: 'Rechazados' },
            ]}
          />
        </Space>
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={quotes}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} presupuestos`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={handleTableChange}
          size="middle"
        />
      </Card>
    </Space>
  );
};

export default QuotesList;
