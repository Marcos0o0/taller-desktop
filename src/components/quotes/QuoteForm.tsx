import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  Input,
  InputNumber,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Divider,
  List,
  Tag,
  message,
  DatePicker,
} from 'antd';
import {
  UserOutlined,
  CarOutlined,
  ToolOutlined,
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { clientsApi } from '@api/clients.api';
import { Client } from '@types/api.types';
import ServicesModal from '@components/quotes/ServicesModal';
import PartsModal from '@components/quotes/PartsModal';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface Vehicle {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface Part {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
}

interface QuoteFormProps {
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ onSubmit, loading = false }) => {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [partsModalOpen, setPartsModalOpen] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoadingClients(true);
    try {
      const response = await clientsApi.list({ limit: 100 });
      setClients(response.clients);
    } catch (error) {
      message.error('Error al cargar clientes');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (services.length === 0) {
        message.error('Debe agregar al menos un servicio');
        return;
      }

      const quoteData = {
        clientId: values.clientId,
        vehicle: {
          brand: values.brand,
          model: values.model,
          year: values.year,
          licensePlate: values.licensePlate,
          mileage: values.mileage,
        },
        description: values.description,
        proposedWork: JSON.stringify({
          services,
          parts,
        }),
        estimatedCost: calculateTotal(),
        notes: values.notes || '',
      };

      await onSubmit(quoteData);
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const calculateSubtotalServices = () => {
    return services.reduce((sum, s) => sum + s.price, 0);
  };

  const calculateSubtotalParts = () => {
    return parts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  };

  const calculateSubtotal = () => {
    return calculateSubtotalServices() + calculateSubtotalParts();
  };

  const calculateIVA = () => {
    return Math.round(calculateSubtotal() * 0.19);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateIVA();
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Form form={form} layout="vertical" size="large">
        {/* Información del Cliente */}
        <Card title={<><UserOutlined /> Información del Cliente</>}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="clientId"
                label="Cliente"
                rules={[{ required: true, message: 'Seleccione un cliente' }]}
              >
                <Select
                  showSearch
                  placeholder="Buscar cliente..."
                  loading={loadingClients}
                  optionFilterProp="children"
                  filterOption={(input, option: any) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={clients.map((c) => ({
                    value: c._id,
                    label: `${c.firstName} ${c.lastName1} ${c.lastName2 || ''} - ${c.phone}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Información del Vehículo */}
        <Card title={<><CarOutlined /> Información del Vehículo</>}>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="brand"
                label="Marca"
                rules={[{ required: true, message: 'Ingrese la marca' }]}
              >
                <Input placeholder="Ej: Toyota, Nissan" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="model"
                label="Modelo"
                rules={[{ required: true, message: 'Ingrese el modelo' }]}
              >
                <Input placeholder="Ej: Corolla, Versa" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="year"
                label="Año"
                rules={[{ required: true, message: 'Ingrese el año' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  placeholder="2020"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="licensePlate"
                label="Patente"
                rules={[{ required: true, message: 'Ingrese la patente' }]}
              >
                <Input placeholder="ABCD12" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="mileage"
                label="Kilometraje"
                rules={[{ required: true, message: 'Ingrese el kilometraje' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="85000"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/\./g, '')}
                  suffix="km"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Descripción del Problema / Solicitud"
            rules={[{ required: true, message: 'Describa el problema o solicitud' }]}
          >
            <TextArea
              rows={3}
              placeholder="Describa detalladamente el problema reportado por el cliente o el trabajo solicitado..."
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Card>

        {/* Servicios */}
        <Card
          title={<><ToolOutlined /> Servicios</>}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setServicesModalOpen(true)}
            >
              Agregar Servicios
            </Button>
          }
        >
          {services.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">No hay servicios agregados</Text>
              <br />
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => setServicesModalOpen(true)}
                style={{ marginTop: 16 }}
              >
                Agregar Primer Servicio
              </Button>
            </div>
          ) : (
            <List
              dataSource={services}
              renderItem={(service) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveService(service.id)}
                    >
                      Eliminar
                    </Button>,
                  ]}
                >
                  <List.Item.Meta title={service.name} description={service.description} />
                  <Text strong style={{ fontSize: 16 }}>
                    ${service.price.toLocaleString('es-CL')}
                  </Text>
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Repuestos */}
        <Card
          title={<><InboxOutlined /> Repuestos</>}
          extra={
            <Button
              type="default"
              icon={<PlusOutlined />}
              onClick={() => setPartsModalOpen(true)}
            >
              Agregar Repuestos
            </Button>
          }
        >
          {parts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Text type="secondary">No hay repuestos agregados (opcional)</Text>
            </div>
          ) : (
            <List
              dataSource={parts}
              renderItem={(part) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemovePart(part.id)}
                    >
                      Eliminar
                    </Button>,
                  ]}
                >
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
                    <Text strong style={{ fontSize: 16 }}>
                      ${(part.price * part.quantity).toLocaleString('es-CL')}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Card>

        {/* Notas */}
        <Card title="Notas Adicionales (Opcional)">
          <Form.Item name="notes">
            <TextArea
              rows={3}
              placeholder="Notas internas, condiciones especiales, etc..."
              maxLength={300}
              showCount
            />
          </Form.Item>
        </Card>

        {/* Resumen de Costos */}
        <Card title="Resumen de Costos">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Subtotal Servicios:</Text>
              <Text strong>${calculateSubtotalServices().toLocaleString('es-CL')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Subtotal Repuestos:</Text>
              <Text strong>${calculateSubtotalParts().toLocaleString('es-CL')}</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>Subtotal:</Text>
              <Text strong>${calculateSubtotal().toLocaleString('es-CL')}</Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text>IVA (19%):</Text>
              <Text strong>${calculateIVA().toLocaleString('es-CL')}</Text>
            </div>
            <Divider style={{ margin: '12px 0' }} />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px',
                background: '#f0f2f5',
                borderRadius: '8px',
              }}
            >
              <Title level={4} style={{ margin: 0 }}>
                TOTAL:
              </Title>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                ${calculateTotal().toLocaleString('es-CL')}
              </Title>
            </div>
          </Space>
        </Card>

        {/* Botones */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button size="large">Cancelar</Button>
            <Button type="primary" size="large" onClick={handleSubmit} loading={loading}>
              Crear Presupuesto
            </Button>
          </Space>
        </Card>
      </Form>

      {/* Modales */}
      <ServicesModal
        open={servicesModalOpen}
        services={services}
        onOk={(newServices) => {
          setServices(newServices);
          setServicesModalOpen(false);
        }}
        onCancel={() => setServicesModalOpen(false)}
      />

      <PartsModal
        open={partsModalOpen}
        parts={parts}
        onOk={(newParts) => {
          setParts(newParts);
          setPartsModalOpen(false);
        }}
        onCancel={() => setPartsModalOpen(false)}
      />
    </Space>
  );
};

export default QuoteForm;
