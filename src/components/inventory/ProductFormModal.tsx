import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Row,
  Col,
  message,
  Upload,
  Image,
  Button,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
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
  loading,
}) => {
  const [form] = Form.useForm();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (open) {
      if (product) {
        // Editar producto existente
        form.setFieldsValue({
          ...product,
          specifications: product.specifications || {},
        });
        setSelectedCategory(product.category);
        
        // Cargar imagen existente
        if (product.imageUrl) {
          setFileList([
            {
              uid: '-1',
              name: 'image.png',
              status: 'done',
              url: product.imageUrl,
            },
          ]);
        } else {
          setFileList([]);
        }
      } else {
        // Nuevo producto
        form.resetFields();
        setFileList([]);
        
        if (scannedBarcode) {
          form.setFieldValue('barcode', scannedBarcode);
        }
      }
    }
  }, [open, product, scannedBarcode, form]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // Limpiar especificaciones al cambiar categoría
    form.setFieldValue('specifications', {});
  };

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo puedes subir archivos de imagen!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('La imagen debe ser menor a 2MB!');
      return false;
    }
    return false; // Prevenir subida automática
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Convertir imagen a base64 si existe
      let imageBase64 = null;
      if (fileList.length > 0 && fileList[0].originFileObj) {
        imageBase64 = await getBase64(fileList[0].originFileObj as File);
      } else if (fileList.length > 0 && fileList[0].url) {
        // Mantener URL existente
        imageBase64 = fileList[0].url;
      }

      const formData = {
        ...values,
        imageUrl: imageBase64,
      };

      await onOk(formData);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Subir Foto</div>
    </div>
  );

  // Renderizar campos de especificaciones según categoría
  const renderSpecifications = () => {
    if (!selectedCategory) return null;

    switch (selectedCategory) {
      case 'lubricantes':
        return (
          <>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'viscosity']} label="Viscosidad">
                <Input placeholder="Ej: 5W-30" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'volume']} label="Volumen">
                <Input placeholder="Ej: 4L, 1L" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'type']} label="Tipo">
                <Select placeholder="Seleccionar tipo">
                  <Select.Option value="mineral">Mineral</Select.Option>
                  <Select.Option value="sintetico">Sintético</Select.Option>
                  <Select.Option value="semisintetico">Semi-sintético</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </>
        );

      case 'filtros':
        return (
          <>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'filterType']} label="Tipo de Filtro">
                <Select placeholder="Seleccionar tipo">
                  <Select.Option value="aceite">Aceite</Select.Option>
                  <Select.Option value="aire">Aire</Select.Option>
                  <Select.Option value="combustible">Combustible</Select.Option>
                  <Select.Option value="cabina">Cabina</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'compatibility']} label="Compatibilidad">
                <Input placeholder="Ej: Toyota Corolla 2010-2015" />
              </Form.Item>
            </Col>
          </>
        );

      case 'neumaticos':
        return (
          <>
            <Col xs={24} md={6}>
              <Form.Item name={['specifications', 'size']} label="Medida">
                <Input placeholder="Ej: 205/55R16" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name={['specifications', 'brand']} label="Marca">
                <Input placeholder="Ej: Michelin" />
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name={['specifications', 'season']} label="Temporada">
                <Select placeholder="Seleccionar">
                  <Select.Option value="verano">Verano</Select.Option>
                  <Select.Option value="invierno">Invierno</Select.Option>
                  <Select.Option value="todo-terreno">Todo Terreno</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={6}>
              <Form.Item name={['specifications', 'loadIndex']} label="Índice de Carga">
                <Input placeholder="Ej: 91H" />
              </Form.Item>
            </Col>
          </>
        );

      case 'frenos':
        return (
          <>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'type']} label="Tipo">
                <Select placeholder="Seleccionar tipo">
                  <Select.Option value="pastillas">Pastillas</Select.Option>
                  <Select.Option value="discos">Discos</Select.Option>
                  <Select.Option value="tambores">Tambores</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'position']} label="Posición">
                <Select placeholder="Seleccionar">
                  <Select.Option value="delantero">Delantero</Select.Option>
                  <Select.Option value="trasero">Trasero</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'compatibility']} label="Compatibilidad">
                <Input placeholder="Modelos compatibles" />
              </Form.Item>
            </Col>
          </>
        );

      case 'electrico':
        return (
          <>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'voltage']} label="Voltaje">
                <Input placeholder="Ej: 12V" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'amperage']} label="Amperaje">
                <Input placeholder="Ej: 60A" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name={['specifications', 'partType']} label="Tipo de Pieza">
                <Select placeholder="Seleccionar">
                  <Select.Option value="bateria">Batería</Select.Option>
                  <Select.Option value="alternador">Alternador</Select.Option>
                  <Select.Option value="motor-arranque">Motor de Arranque</Select.Option>
                  <Select.Option value="sensor">Sensor</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </>
        );

      default:
        return (
          <Col xs={24}>
            <Form.Item name={['specifications', 'compatibility']} label="Compatibilidad / Notas">
              <Input placeholder="Información adicional del producto" />
            </Form.Item>
          </Col>
        );
    }
  };

  return (
    <>
      <Modal
        title={product ? 'Editar Producto' : 'Nuevo Producto'}
        open={open}
        onOk={handleOk}
        onCancel={onCancel}
        width={900}
        confirmLoading={loading}
        okText={product ? 'Actualizar' : 'Crear'}
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical" size="large">
          <Row gutter={16}>
            {/* Foto del producto */}
            <Col xs={24}>
              <Form.Item label="Foto del Producto">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    beforeUpload={beforeUpload}
                    maxCount={1}
                  >
                    {fileList.length === 0 && uploadButton}
                  </Upload>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    📸 Sube una foto clara del producto. Máximo 2MB. JPG, PNG o WEBP.
                  </Text>
                </Space>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="barcode"
                label="Código de Barras / SKU"
                rules={[{ required: true, message: 'Ingrese el código' }]}
              >
                <Input placeholder="Ej: 123456789" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Nombre del Producto"
                rules={[{ required: true, message: 'Ingrese el nombre' }]}
              >
                <Input placeholder="Ej: Filtro de aceite W712/73" size="large" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="description" label="Descripción">
                <TextArea
                  rows={2}
                  placeholder="Descripción detallada del producto..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label="Categoría"
                rules={[{ required: true, message: 'Seleccione una categoría' }]}
              >
                <Select
                  placeholder="Seleccionar categoría"
                  size="large"
                  onChange={handleCategoryChange}
                >
                  <Select.Option value="lubricantes">🛢️ Lubricantes</Select.Option>
                  <Select.Option value="filtros">🔍 Filtros</Select.Option>
                  <Select.Option value="frenos">🛑 Frenos</Select.Option>
                  <Select.Option value="suspension">⚙️ Suspensión</Select.Option>
                  <Select.Option value="electrico">⚡ Eléctrico</Select.Option>
                  <Select.Option value="neumaticos">⚫ Neumáticos</Select.Option>
                  <Select.Option value="repuestos">🔧 Repuestos</Select.Option>
                  <Select.Option value="herramientas">🔨 Herramientas</Select.Option>
                  <Select.Option value="otros">📦 Otros</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item name="location" label="Ubicación en Bodega">
                <Input placeholder="Ej: Estante A3, Rack 5" size="large" />
              </Form.Item>
            </Col>

            {/* Especificaciones técnicas según categoría */}
            {renderSpecifications()}

            <Col xs={24} md={8}>
              <Form.Item
                name="price"
                label="Precio Venta"
                rules={[{ required: true, message: 'Ingrese el precio' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  prefix="$"
                  precision={0}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/\./g, '')}
                  placeholder="0"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="stock"
                label="Stock Inicial"
                rules={[{ required: true, message: 'Ingrese el stock' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item name="minStock" label="Stock Mínimo" initialValue={5}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="5"
                  size="large"
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item name="isActive" label="Producto Activo" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="Sí" unCheckedChildren="No" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Image
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
        }}
        src={previewImage}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default ProductFormModal;