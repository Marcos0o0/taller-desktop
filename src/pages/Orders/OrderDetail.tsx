import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Spin,
  message,
  Steps,
  Divider,
  List,
  Row,
  Col,
  Avatar,
  Modal,
  Form,
  InputNumber,
  Input,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  CarOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { ordersApi } from '@api/orders.api';
import AssignMechanicModal from '@components/orders/AssignMechanicModal';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const orderData = await ordersApi.getById(id);
      setOrder(orderData);
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al cargar orden');
      navigate('/ordenes');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignMechanic = async (
    mechanicId: string,
    estimatedDelivery?: string,
    notes?: string
  ) => {
    if (!id) return;

    try {
      await ordersApi.assignMechanic(id, { mechanicId });

      // Si está en pendiente_asignacion, cambiar a asignada
      if (order.order.status === 'pendiente_asignacion') {
        await ordersApi.updateStatus(id, { status: 'asignada', notes });
      }

      message.success('Mecánico asignado exitosamente');
      setAssignModalOpen(false);
      loadOrder();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al asignar mecánico');
    }
  };

  const handleStatusChange = async (status: string) => {
    setNewStatus(status);
    setStatusModalOpen(true);
  };

  const handleStatusModalOk = async () => {
    if (!id) return;

    try {
      const values = await statusForm.validateFields();
      await ordersApi.updateStatus(id, {
        status: newStatus as any,
        notes: values.notes,
      });

      // Si se marca como entregado, actualizar costo final
      if (newStatus === 'entregado' && values.finalCost) {
        await ordersApi.update(id, { finalCost: values.finalCost });
      }

      message.success('Estado actualizado exitosamente');
      setStatusModalOpen(false);
      statusForm.resetFields();
      loadOrder();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al actualizar estado');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      pendiente_asignacion: {
        color: 'default',
        text: 'Pendiente Asignación',
        icon: <ClockCircleOutlined />,
      },
      asignada: { color: 'orange', text: 'Asignada', icon: <UserOutlined /> },
      en_progreso: { color: 'blue', text: 'En Progreso', icon: <ToolOutlined /> },
      listo: { color: 'green', text: 'Listo', icon: <CheckCircleOutlined /> },
      entregado: { color: 'default', text: 'Entregado', icon: <CheckCircleOutlined /> },
    };
    const { color, text, icon } = statusMap[status] || statusMap.pendiente_asignacion;
    return (
      <Tag color={color} icon={icon} style={{ fontSize: 14, padding: '4px 12px' }}>
        {text}
      </Tag>
    );
  };

  const getStatusStep = (status: string) => {
    const steps = ['pendiente_asignacion', 'asignada', 'en_progreso', 'listo', 'entregado'];
    return steps.indexOf(status);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const client = typeof order.clientId === 'object' ? order.clientId : null;
  const mechanic = order.order.mechanicId
    ? typeof order.order.mechanicId === 'object'
      ? order.order.mechanicId
      : null
    : null;

  // Parsear trabajo propuesto
  let services: any[] = [];
  let parts: any[] = [];
  try {
    const proposedWork = JSON.parse(order.proposedWork);
    services = proposedWork.services || [];
    parts = proposedWork.parts || [];
  } catch (error) {
    console.error('Error parsing proposedWork:', error);
  }

  const canChangeStatus = (currentStatus: string, targetStatus: string) => {
    const statusFlow = {
      pendiente_asignacion: ['asignada'],
      asignada: ['en_progreso'],
      en_progreso: ['listo'],
      listo: ['entregado'],
      entregado: [],
    };
    return statusFlow[currentStatus as keyof typeof statusFlow]?.includes(targetStatus) || false;
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/ordenes')}>
            Volver
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Orden {order.order.orderNumber}
          </Title>
          {getStatusTag(order.order.status)}
        </Space>

        <Space>
          {order.order.status === 'pendiente_asignacion' && (
            <Button
              type="primary"
              icon={<UserOutlined />}
              size="large"
              onClick={() => setAssignModalOpen(true)}
            >
              Asignar Mecánico
            </Button>
          )}
          {order.order.status !== 'entregado' && (
            <Button
              icon={<EditOutlined />}
              size="large"
              onClick={() => setAssignModalOpen(true)}
            >
              Reasignar Mecánico
            </Button>
          )}
        </Space>
      </div>

      {/* Progreso del flujo */}
      <Card>
        <Steps
          current={getStatusStep(order.order.status)}
          items={[
            { title: 'Pendiente', icon: <ClockCircleOutlined /> },
            { title: 'Asignada', icon: <UserOutlined /> },
            { title: 'En Progreso', icon: <ToolOutlined /> },
            { title: 'Listo', icon: <CheckCircleOutlined /> },
            { title: 'Entregado', icon: <CheckCircleOutlined /> },
          ]}
        />

        <Divider />

        {/* Acciones de cambio de estado */}
        <Space>
          {canChangeStatus(order.order.status, 'asignada') && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusChange('asignada')}
            >
              Marcar como Asignada
            </Button>
          )}
          {canChangeStatus(order.order.status, 'en_progreso') && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleStatusChange('en_progreso')}
              style={{ background: '#1890ff' }}
            >
              Iniciar Trabajo
            </Button>
          )}
          {canChangeStatus(order.order.status, 'listo') && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleStatusChange('listo')}
              style={{ background: '#52c41a' }}
            >
              Marcar como Listo
            </Button>
          )}
          {canChangeStatus(order.order.status, 'entregado') && (
            <Popconfirm
              title="¿Entregar orden al cliente?"
              description="Esta acción marcará la orden como completada"
              onConfirm={() => handleStatusChange('entregado')}
              okText="Sí, entregar"
              cancelText="Cancelar"
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                style={{ background: '#52c41a' }}
                size="large"
              >
                Entregar al Cliente
              </Button>
            </Popconfirm>
          )}
        </Space>
      </Card>

      {/* Información general */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Card title="Información del Cliente">
            <Descriptions column={1}>
              <Descriptions.Item label="Nombre">
                <Text strong>
                  {client
                    ? `${client.firstName} ${client.lastName1} ${client.lastName2 || ''}`
                    : 'N/A'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Teléfono">{client?.phone || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Email">
                {client?.email || 'No registrado'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Información del Vehículo">
            <Descriptions column={1}>
              <Descriptions.Item label="Vehículo">
                <Space>
                  <CarOutlined />
                  <Text strong>
                    {order.vehicle.brand} {order.vehicle.model} {order.vehicle.year}
                  </Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Patente">
                <Tag>{order.vehicle.licensePlate}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Kilometraje">
                {order.vehicle.mileage.toLocaleString('es-CL')} km
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Información de la orden */}
      <Card title="Detalles de la Orden">
        <Descriptions column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="N° Orden">{order.order.orderNumber}</Descriptions.Item>
          <Descriptions.Item label="N° Presupuesto">{order.quoteNumber}</Descriptions.Item>
          <Descriptions.Item label="Mecánico Asignado">
            {mechanic ? (
              <Space>
                <Avatar size={24} icon={<UserOutlined />} />
                <Text>
                  {mechanic.firstName} {mechanic.lastName1}
                </Text>
              </Space>
            ) : (
              <Tag color="default">Sin asignar</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Costo Estimado">
            ${order.order.estimatedCost?.toLocaleString('es-CL') || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Costo Final">
            {order.order.finalCost ? (
              <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                ${order.order.finalCost.toLocaleString('es-CL')}
              </Text>
            ) : (
              <Text type="secondary">Por definir</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de Creación">
            {dayjs(order.order.createdAt).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Descripción del trabajo */}
      <Card title="Descripción del Problema / Trabajo">
        <Paragraph>{order.description}</Paragraph>
        <Divider />
        <Paragraph>
          <Text strong>Trabajo Realizado:</Text>
          <br />
          {order.order.workDescription}
        </Paragraph>
      </Card>

      {/* Servicios y Repuestos */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title={`Servicios (${services.length})`}>
            <List
              dataSource={services}
              renderItem={(service: any) => (
                <List.Item>
                  <List.Item.Meta title={service.name} description={service.description} />
                  <Text strong>${service.price.toLocaleString('es-CL')}</Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title={`Repuestos (${parts.length})`}>
            <List
              dataSource={parts}
              renderItem={(part: any) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        {part.name}
                        <Tag>{part.category}</Tag>
                      </Space>
                    }
                    description={part.description}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {part.quantity} x ${part.price.toLocaleString('es-CL')}
                      </Text>
                    </div>
                    <Text strong>${(part.price * part.quantity).toLocaleString('es-CL')}</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Notas adicionales */}
      {order.order.additionalNotes && (
        <Card title="Notas Adicionales">
          <Paragraph>{order.order.additionalNotes}</Paragraph>
        </Card>
      )}

      {/* Modal de asignación */}
      <AssignMechanicModal
        open={assignModalOpen}
        orderId={id || ''}
        currentMechanicId={mechanic?._id}
        onOk={handleAssignMechanic}
        onCancel={() => setAssignModalOpen(false)}
      />

      {/* Modal de cambio de estado */}
      <Modal
        title="Actualizar Estado de Orden"
        open={statusModalOpen}
        onOk={handleStatusModalOk}
        onCancel={() => {
          setStatusModalOpen(false);
          statusForm.resetFields();
        }}
        okText="Actualizar"
        cancelText="Cancelar"
      >
        <Form form={statusForm} layout="vertical">
          {newStatus === 'entregado' && (
            <Form.Item
              name="finalCost"
              label="Costo Final"
              rules={[{ required: true, message: 'Ingrese el costo final' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                prefix="$"
                precision={0}
                size="large"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value) => value!.replace(/\./g, '')}
              />
            </Form.Item>
          )}

          <Form.Item name="notes" label="Notas (Opcional)">
            <TextArea rows={3} placeholder="Comentarios adicionales..." />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default OrderDetail;
