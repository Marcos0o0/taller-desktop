import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, List, Space, Typography, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface ServicesModalProps {
  open: boolean;
  services: Service[];
  onOk: (services: Service[]) => void;
  onCancel: () => void;
}

const ServicesModal: React.FC<ServicesModalProps> = ({
  open,
  services: initialServices,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [services, setServices] = useState<Service[]>(initialServices);

  const handleAddService = () => {
    form
      .validateFields()
      .then((values) => {
        const newService: Service = {
          id: Date.now().toString(),
          name: values.serviceName,
          description: values.description || '',
          price: values.price || 0,
        };
        setServices([...services, newService]);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleOk = () => {
    onOk(services);
  };

  const handleCancel = () => {
    setServices(initialServices);
    form.resetFields();
    onCancel();
  };

  const total = services.reduce((sum, s) => sum + s.price, 0);

  return (
    <Modal
      title="Agregar Servicios"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      okText="Confirmar Servicios"
      cancelText="Cancelar"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Formulario para agregar servicio */}
        <Form form={form} layout="vertical">
          <Form.Item
            name="serviceName"
            label="Nombre del Servicio"
            rules={[{ required: true, message: 'Ingrese el nombre del servicio' }]}
          >
            <Input placeholder="Ej: Cambio de aceite, Revisión de frenos" size="large" />
          </Form.Item>

          <Form.Item name="description" label="Descripción (Opcional)">
            <TextArea
              placeholder="Detalles del servicio..."
              rows={2}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="price"
            label="Precio"
            rules={[{ required: true, message: 'Ingrese el precio' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              prefix="$"
              precision={0}
              size="large"
              placeholder="0"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              parser={(value) => value!.replace(/\./g, '')}
            />
          </Form.Item>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddService}
            block
            size="large"
          >
            Agregar Servicio
          </Button>
        </Form>

        {/* Lista de servicios agregados */}
        {services.length > 0 && (
          <>
            <div>
              <Text strong>Servicios Agregados ({services.length})</Text>
            </div>
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
                      size="small"
                    >
                      Eliminar
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={service.name}
                    description={service.description}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Text strong style={{ fontSize: 16 }}>
                      ${service.price.toLocaleString('es-CL')}
                    </Text>
                  </div>
                </List.Item>
              )}
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#f0f2f5',
                borderRadius: '8px',
              }}
            >
              <Text strong style={{ fontSize: 16 }}>
                Subtotal Servicios:
              </Text>
              <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                ${total.toLocaleString('es-CL')}
              </Text>
            </div>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default ServicesModal;
