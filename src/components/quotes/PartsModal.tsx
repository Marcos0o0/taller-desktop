import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, Button, List, Space, Typography, Select } from 'antd';
import { PlusOutlined, DeleteOutlined, InboxOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface Part {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  category: string;
}

interface PartsModalProps {
  open: boolean;
  parts: Part[];
  onOk: (parts: Part[]) => void;
  onCancel: () => void;
}

const PartsModal: React.FC<PartsModalProps> = ({
  open,
  parts: initialParts,
  onOk,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [parts, setParts] = useState<Part[]>(initialParts);

  const categories = [
    { value: 'repuestos', label: 'Repuestos' },
    { value: 'lubricantes', label: 'Lubricantes' },
    { value: 'filtros', label: 'Filtros' },
    { value: 'frenos', label: 'Frenos' },
    { value: 'electrico', label: 'Eléctrico' },
    { value: 'suspension', label: 'Suspensión' },
    { value: 'otros', label: 'Otros' },
  ];

  const handleAddPart = () => {
    form
      .validateFields()
      .then((values) => {
        const newPart: Part = {
          id: Date.now().toString(),
          name: values.partName,
          description: values.description || '',
          quantity: values.quantity || 1,
          price: values.price || 0,
          category: values.category,
        };
        setParts([...parts, newPart]);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleOk = () => {
    onOk(parts);
  };

  const handleCancel = () => {
    setParts(initialParts);
    form.resetFields();
    onCancel();
  };

  const total = parts.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <Modal
      title="Agregar Repuestos"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={800}
      okText="Confirmar Repuestos"
      cancelText="Cancelar"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Formulario para agregar repuesto */}
        <Form form={form} layout="vertical" initialValues={{ quantity: 1, category: 'repuestos' }}>
          <Form.Item
            name="partName"
            label="Nombre del Repuesto"
            rules={[{ required: true, message: 'Ingrese el nombre del repuesto' }]}
          >
            <Input
              placeholder="Ej: Pastillas de freno delanteras, Filtro de aceite"
              size="large"
              prefix={<InboxOutlined />}
            />
          </Form.Item>

          <Form.Item name="category" label="Categoría">
            <Select size="large" options={categories} />
          </Form.Item>

          <Form.Item name="description" label="Descripción (Opcional)">
            <TextArea
              placeholder="Marca, modelo, especificaciones..."
              rows={2}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Space style={{ width: '100%' }} size="middle">
            <Form.Item
              name="quantity"
              label="Cantidad"
              rules={[{ required: true, message: 'Ingrese la cantidad' }]}
              style={{ marginBottom: 0, flex: 1 }}
            >
              <InputNumber style={{ width: '100%' }} min={1} size="large" placeholder="1" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Precio Unitario"
              rules={[{ required: true, message: 'Ingrese el precio' }]}
              style={{ marginBottom: 0, flex: 2 }}
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
          </Space>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddPart}
            block
            size="large"
          >
            Agregar Repuesto
          </Button>
        </Form>

        {/* Lista de repuestos agregados */}
        {parts.length > 0 && (
          <>
            <div>
              <Text strong>Repuestos Agregados ({parts.length})</Text>
            </div>
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
                      size="small"
                    >
                      Eliminar
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {part.name}
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          ({part.category})
                        </Text>
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
                Subtotal Repuestos:
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

export default PartsModal;
