import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col, Space, Typography, Divider } from 'antd';
import { BarcodeOutlined, DollarOutlined, InboxOutlined, ShopOutlined } from '@ant-design/icons';
import { Product } from '@api/inventory.api';

const { TextArea } = Input;
const { Text } = Typography;

interface ProductFormModalProps {
  open: boolean;
  product?: Product | null;
  scannedBarcode?: string;
  onOk: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  product,
  scannedBarcode,
  onOk,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && product) {
      // Editar producto existente
      form.setFieldsValue({
        barcode: product.barcode,
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price,
        costPrice: product.costPrice || 0,
        stock: product.stock,
        minStock: product.minStock,
        location: product.location || '',
        supplier: product.supplier || '',
      });
    } else if (open && scannedBarcode) {
      // Nuevo producto con código escaneado
      form.setFieldsValue({ barcode: scannedBarcode });
    } else if (open) {
      // Nuevo producto sin código
      form.resetFields();
    }
  }, [open, product, scannedBarcode, form]);

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

  const categories = [
    { value: 'repuestos', label: '🔩 Repuestos' },
    { value: 'lubricantes', label: '🛢️ Lubricantes y Aceites' },
    { value: 'filtros', label: '🔍 Filtros' },
    { value: 'frenos', label: '🛑 Frenos' },
    { value: 'suspension', label: '⚙️ Suspensión' },
    { value: 'electrico', label: '⚡ Eléctrico' },
    { value: 'carroceria', label: '🚗 Carrocería' },
    { value: 'neumaticos', label: '⚫ Neumáticos' },
    { value: 'herramientas', label: '🔧 Herramientas' },
    { value: 'accesorios', label: '✨ Accesorios' },
    { value: 'consumibles', label: '📦 Consumibles' },
    { value: 'otros', label: '📋 Otros' },
  ];

  return (
    <Modal
      title={
        product
          ? `Editar Producto: ${product.name}`
          : scannedBarcode
          ? `Nuevo Producto - Código: ${scannedBarcode}`
          : 'Nuevo Producto'
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={800}
      okText={product ? 'Actualizar' : 'Guardar'}
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        name="product_form"
        initialValues={{
          barcode: scannedBarcode || '',
          stock: 0,
          minStock: 0,
          category: 'repuestos',
          price: 0,
          costPrice: 0,
        }}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Información Básica */}
          <div>
            <Text strong style={{ fontSize: 15 }}>
              📋 Información Básica
            </Text>
            <Divider style={{ margin: '8px 0' }} />

            <Form.Item
              name="barcode"
              label="Código de Barras"
              rules={[
                { required: true, message: 'Por favor ingrese el código de barras' },
                { min: 3, message: 'Mínimo 3 caracteres' },
                { max: 50, message: 'Máximo 50 caracteres' },
              ]}
            >
              <Input
                placeholder="Escanee o ingrese el código de barras"
                size="large"
                prefix={<BarcodeOutlined />}
                disabled={!!product} // No editable en modo edición
              />
            </Form.Item>

            <Form.Item
              name="name"
              label="Nombre del Producto"
              rules={[
                { required: true, message: 'Por favor ingrese el nombre' },
                { min: 3, message: 'Mínimo 3 caracteres' },
                { max: 100, message: 'Máximo 100 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Filtro de aceite Toyota" size="large" />
            </Form.Item>

            <Form.Item name="description" label="Descripción">
              <TextArea
                placeholder="Descripción detallada del producto, especificaciones, compatibilidad..."
                rows={3}
                maxLength={500}
                showCount
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Categoría"
              rules={[{ required: true, message: 'Seleccione una categoría' }]}
            >
              <Select size="large" options={categories} />
            </Form.Item>
          </div>

          {/* Precios */}
          <div>
            <Text strong style={{ fontSize: 15 }}>
              💰 Precios
            </Text>
            <Divider style={{ margin: '8px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="costPrice"
                  label="Precio de Costo"
                  tooltip="Cuánto te cuesta a ti este producto"
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
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Precio de Venta"
                  rules={[{ required: true, message: 'Ingrese el precio de venta' }]}
                  tooltip="Precio al que vendes el producto"
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
              </Col>
            </Row>

            <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => 
              prevValues.costPrice !== currentValues.costPrice || 
              prevValues.price !== currentValues.price
            }>
              {({ getFieldValue }) => {
                const cost = getFieldValue('costPrice') || 0;
                const price = getFieldValue('price') || 0;
                const margin = cost > 0 ? ((price - cost) / cost) * 100 : 0;
                
                return margin > 0 ? (
                  <div style={{ marginTop: -8, marginBottom: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Margen de ganancia: <Text strong style={{ color: margin > 30 ? '#52c41a' : '#faad14' }}>
                        {margin.toFixed(1)}%
                      </Text>
                    </Text>
                  </div>
                ) : null;
              }}
            </Form.Item>
          </div>

          {/* Stock */}
          <div>
            <Text strong style={{ fontSize: 15 }}>
              📦 Control de Stock
            </Text>
            <Divider style={{ margin: '8px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="stock"
                  label="Stock Actual"
                  rules={[{ required: true, message: 'Ingrese el stock' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    size="large"
                    placeholder="0"
                    suffix="unidades"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="minStock"
                  label="Stock Mínimo"
                  rules={[{ required: true, message: 'Ingrese el stock mínimo' }]}
                  tooltip="Recibirás una alerta cuando el stock sea menor a este valor"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    size="large"
                    placeholder="0"
                    suffix="unidades"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Ubicación y Proveedor */}
          <div>
            <Text strong style={{ fontSize: 15 }}>
              📍 Ubicación y Proveedor
            </Text>
            <Divider style={{ margin: '8px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="location" label="Ubicación en Bodega">
                  <Input
                    placeholder="Ej: Estante A-3, Bodega 2"
                    size="large"
                    prefix={<InboxOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="supplier" label="Proveedor">
                  <Input
                    placeholder="Ej: Repuestos Chile S.A."
                    size="large"
                    prefix={<ShopOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Space>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;