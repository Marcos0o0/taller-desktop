import React from 'react';
import { Modal, Form, InputNumber, Select, Input, Space, Typography, Divider, Tag } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Product } from '@api/inventory.api';

const { TextArea } = Input;
const { Text } = Typography;

interface StockMovementModalProps {
  open: boolean;
  product: Product | null;
  onOk: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({
  open,
  product,
  onOk,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);
      form.resetFields();
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const movementTypes = [
    {
      value: 'entrada',
      label: 'Entrada de Stock',
      icon: <PlusCircleOutlined />,
      color: 'green',
      description: 'Agregar unidades al inventario',
    },
    {
      value: 'salida',
      label: 'Salida de Stock',
      icon: <MinusCircleOutlined />,
      color: 'red',
      description: 'Retirar unidades del inventario',
    },
    {
      value: 'ajuste',
      label: 'Ajuste de Inventario',
      icon: <SyncOutlined />,
      color: 'blue',
      description: 'Corregir diferencias de stock',
    },
  ];

  const reasons = {
    entrada: [
      'Compra a proveedor',
      'Devolución de cliente',
      'Transferencia desde otra bodega',
      'Corrección de inventario',
      'Otro',
    ],
    salida: [
      'Venta a cliente',
      'Uso en orden de trabajo',
      'Devolución a proveedor',
      'Producto dañado/vencido',
      'Transferencia a otra bodega',
      'Otro',
    ],
    ajuste: [
      'Conteo físico',
      'Corrección de error',
      'Pérdida/Robo',
      'Otro',
    ],
  };

  const selectedType = Form.useWatch('type', form);
  const selectedTypeData = movementTypes.find((t) => t.value === selectedType);

  return (
    <Modal
      title={
        <Space>
          <Text>Movimiento de Stock</Text>
          {product && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {product.name}
            </Tag>
          )}
        </Space>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
      okText="Registrar Movimiento"
      cancelText="Cancelar"
    >
      {product && (
        <div style={{ marginBottom: 16, padding: 12, background: '#f0f2f5', borderRadius: 8 }}>
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Stock Actual:</Text>
              <Text strong style={{ fontSize: 16 }}>
                {product.stock} unidades
              </Text>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text type="secondary">Stock Mínimo:</Text>
              <Text>{product.minStock} unidades</Text>
            </div>
            {product.location && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Ubicación:</Text>
                <Text>{product.location}</Text>
              </div>
            )}
          </Space>
        </div>
      )}

      <Form form={form} layout="vertical" initialValues={{ type: 'entrada' }}>
        <Form.Item
          name="type"
          label="Tipo de Movimiento"
          rules={[{ required: true, message: 'Seleccione el tipo de movimiento' }]}
        >
          <Select size="large">
            {movementTypes.map((type) => (
              <Select.Option key={type.value} value={type.value}>
                <Space>
                  {type.icon}
                  <span>{type.label}</span>
                </Space>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        {selectedTypeData && (
          <div
            style={{
              marginBottom: 16,
              padding: 12,
              background: `${selectedTypeData.color}1a`,
              border: `1px solid ${selectedTypeData.color}33`,
              borderRadius: 8,
            }}
          >
            <Text type="secondary" style={{ fontSize: 13 }}>
              {selectedTypeData.description}
            </Text>
          </div>
        )}

        <Form.Item
          name="quantity"
          label="Cantidad"
          rules={[
            { required: true, message: 'Ingrese la cantidad' },
            {
              validator: (_, value) => {
                if (!value || value <= 0) {
                  return Promise.reject('La cantidad debe ser mayor a 0');
                }
                if (selectedType === 'salida' && product && value > product.stock) {
                  return Promise.reject(
                    `No puede sacar más unidades de las que hay en stock (${product.stock})`
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            size="large"
            placeholder="0"
            suffix="unidades"
          />
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
          prevValues.quantity !== currentValues.quantity || 
          prevValues.type !== currentValues.type
        }>
          {({ getFieldValue }) => {
            const quantity = getFieldValue('quantity') || 0;
            const type = getFieldValue('type');
            
            if (product && quantity > 0) {
              const newStock =
                type === 'entrada'
                  ? product.stock + quantity
                  : type === 'salida'
                  ? product.stock - quantity
                  : quantity; // Para ajuste, quantity es el nuevo valor

              return (
                <div style={{ marginTop: -8, marginBottom: 16 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Stock después del movimiento:{' '}
                    <Text
                      strong
                      style={{
                        color:
                          newStock < product.minStock
                            ? '#ff4d4f'
                            : newStock === product.stock
                            ? '#8c8c8c'
                            : '#52c41a',
                        fontSize: 14,
                      }}
                    >
                      {type === 'ajuste' ? quantity : newStock} unidades
                    </Text>
                    {newStock < product.minStock && (
                      <Text type="danger" style={{ fontSize: 11, marginLeft: 8 }}>
                        ⚠️ Por debajo del stock mínimo
                      </Text>
                    )}
                  </Text>
                </div>
              );
            }
            return null;
          }}
        </Form.Item>

        <Form.Item
          name="reason"
          label="Motivo"
          rules={[{ required: true, message: 'Seleccione el motivo' }]}
        >
          <Select size="large" placeholder="Seleccione el motivo del movimiento">
            {selectedType &&
              reasons[selectedType as keyof typeof reasons].map((reason) => (
                <Select.Option key={reason} value={reason}>
                  {reason}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item name="notes" label="Notas Adicionales (Opcional)">
          <TextArea
            rows={3}
            placeholder="Información adicional sobre este movimiento..."
            maxLength={300}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StockMovementModal;