import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Space,
  Table,
  Input,
  Tag,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '@api/clients.api';
import { Client } from '@types/api.types';
import ClientFormModal from '@components/forms/ClientFormModal';

const { Title } = Typography;

const ClientsList: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, newThisMonth: 0 });

  // Cargar clientes al montar y cuando cambian los filtros
  useEffect(() => {
    loadClients();
  }, [pagination.current, pagination.pageSize, searchText]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientsApi.list({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        isDeleted: false,
      });

      setClients(response.clients);
      setPagination({
        ...pagination,
        total: response.pagination.total,
      });

      // Actualizar estadísticas
      setStats({
        total: response.pagination.total,
        newThisMonth: response.clients.filter((c) => {
          const clientDate = new Date(c.createdAt);
          const now = new Date();
          return (
            clientDate.getMonth() === now.getMonth() &&
            clientDate.getFullYear() === now.getFullYear()
          );
        }).length,
      });
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const handleCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleView = (clientId: string) => {
    navigate(`/clientes/${clientId}`);
  };

  const handleModalOk = async (values: any) => {
    setModalLoading(true);
    try {
      if (editingClient) {
        // Actualizar cliente existente
        await clientsApi.update(editingClient._id, values);
        message.success('Cliente actualizado exitosamente');
      } else {
        // Crear nuevo cliente
        await clientsApi.create(values);
        message.success('Cliente creado exitosamente');
      }
      setIsModalOpen(false);
      loadClients();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al guardar cliente');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (clientId: string) => {
    try {
      await clientsApi.delete(clientId);
      message.success('Cliente eliminado exitosamente');
      loadClients();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al eliminar cliente');
    }
  };

  const columns = [
    {
      title: 'Nombre Completo',
      key: 'fullName',
      render: (record: Client) => (
        <Space direction="vertical" size={0}>
          <strong>
            {record.firstName} {record.lastName1} {record.lastName2 || ''}
          </strong>
        </Space>
      ),
      sorter: (a: Client, b: Client) => a.firstName.localeCompare(b.firstName),
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => (
        <Space>
          <PhoneOutlined />
          {phone}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          {email || <Tag>Sin email</Tag>}
        </Space>
      ),
    },
    {
      title: 'Fecha de Registro',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => {
        const d = new Date(date);
        return d.toLocaleDateString('es-CL', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
      sorter: (a: Client, b: Client) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (record: Client) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record._id)}
            size="small"
          >
            Ver
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar cliente?"
            description="Esta acción se puede deshacer desde el panel de administración"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Clientes
        </Title>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreate}>
          Nuevo Cliente
        </Button>
      </div>

      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Total de Clientes"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic
              title="Nuevos este Mes"
              value={stats.newThisMonth}
              prefix={<PlusOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Búsqueda */}
      <Card>
        <Input.Search
          placeholder="Buscar por nombre, teléfono o email..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={handleSearch}
          onChange={(e) => {
            if (!e.target.value) {
              handleSearch('');
            }
          }}
          style={{ maxWidth: 500 }}
        />
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={clients}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} clientes`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          size="middle"
        />
      </Card>

      {/* Modal de formulario */}
      <ClientFormModal
        open={isModalOpen}
        client={editingClient}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        loading={modalLoading}
      />
    </Space>
  );
};

export default ClientsList;