import React from 'react';
import { Modal, Form, Input, InputNumber, Select, Row, Col } from 'antd';

interface ProductFormModalProps {
  open: boolean;
  scannedBarcode?: string;
  onOk: (values: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  scannedBarcode,
  onOk,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (open && scannedBarcode) {
      form.setFieldsValue({ barcode: scannedBarcode });
    }
  }, [open, scannedBarcode, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={scannedBarcode ? `Nuevo Producto - Código: ${scannedBarcode}` : 'Nuevo Producto'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={700}
      okText="Guardar"
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
        }}
      >
        <Form.Item
          name="barcode"
          label="Código de Barras"
          rules={[{ required: true, message: 'Por favor ingrese el código de barras' }]}
        >
          <Input placeholder="Escanee o ingrese el código de barras" size="large" />
        </Form.Item>

        <Form.Item
          name="name"
          label="Nombre del Producto"
          rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
        >
          <Input placeholder="Ej: Filtro de aceite, Pastillas de freno" size="large" />
        </Form.Item>

        <Form.Item name="description" label="Descripción">
          <Input.TextArea 
            placeholder="Descripción detallada del producto" 
            rows={3}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="category"
              label="Categoría"
              rules={[{ required: true, message: 'Seleccione una categoría' }]}
            >
              <Select size="large">
                <Select.Option value="repuestos">Repuestos</Select.Option>
                <Select.Option value="lubricantes">Lubricantes</Select.Option>
                <Select.Option value="herramientas">Herramientas</Select.Option>
                <Select.Option value="accesorios">Accesorios</Select.Option>
                <Select.Option value="consumibles">Consumibles</Select.Option>
                <Select.Option value="otros">Otros</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="price"
              label="Precio"
              rules={[{ required: true, message: 'Ingrese el precio' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                prefix="$"
                precision={2}
                size="large"
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="stock"
              label="Stock Inicial"
              rules={[{ required: true, message: 'Ingrese el stock' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                size="large"
                placeholder="0"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="minStock"
              label="Stock Mínimo"
              rules={[{ required: true, message: 'Ingrese el stock mínimo' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                size="large"
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="location" label="Ubicación">
          <Input placeholder="Ej: Estante A-3, Bodega 2" size="large" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductFormModal;
