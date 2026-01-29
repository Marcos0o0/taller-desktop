import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Card,
  List,
  Tag,
  Button,
  InputNumber,
  Divider,
  Alert,
  message,
  Empty,
} from 'antd';
import {
  UserOutlined,
  CarOutlined,
  DollarOutlined,
  WarningOutlined,
  PlusOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { inventoryApi, Product } from '@api/inventory.api';
import { clientsApi } from '@api/clients.api';
import { Client } from '@types/api.types';
import ProductSpecifications from '@components/inventory/ProductSpecifications';

const { Text, Title } = Typography;

interface QuickJobModalProps {
  open: boolean;
  job: any;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

interface SelectedPart {
  product: Product;
  quantity: number;
}

const QuickJobModal: React.FC<QuickJobModalProps> = ({ open, job, onComplete, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [availableParts, setAvailableParts] = useState<Record<string, Product[]>>({});
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [loadingParts, setLoadingParts] = useState(false);

  useEffect(() => {
    if (open && job) {
      loadClients();
      loadAvailableParts();
      form.resetFields();
      setSelectedParts([]);
    }
  }, [open, job]);

  const loadClients = async () => {
    try {
      const response = await clientsApi.list({ limit: 100 });
      setClients(response.clients);
    } catch (error) {
      console.error('Error loading clients');
    }
  };

  const loadAvailableParts = async () => {
    if (!job || !job.requiredParts || job.requiredParts.length === 0) return;

    setLoadingParts(true);
    try {
      const partsData: Record<string, Product[]> = {};

      for (const requiredPart of job.requiredParts) {
        const response = await inventoryApi.list({
          category: requiredPart.category,
          limit: 100,
          isActive: true,
        });

        // Filtrar por especificaciones adicionales si existen
        let filteredProducts = response.products.filter((p) => p.stock > 0);

        if (requiredPart.filterType && requiredPart.category === 'filtros') {
          filteredProducts = filteredProducts.filter(
            (p) => p.specifications?.filterType === requiredPart.filterType
          );
        }

        if (requiredPart.brakeType && requiredPart.category === 'frenos') {
          filteredProducts = filteredProducts.filter(
            (p) => p.specifications?.brakeType === requiredPart.brakeType
          );
        }

        if (requiredPart.electricType && requiredPart.category === 'electrico') {
          filteredProducts = filteredProducts.filter(
            (p) => p.specifications?.electricType === requiredPart.electricType
          );
        }

        if (requiredPart.partType && requiredPart.category === 'repuestos') {
          filteredProducts = filteredProducts.filter(
            (p) => p.specifications?.partType === requiredPart.partType
          );
        }

        partsData[requiredPart.name] = filteredProducts;
      }

      setAvailableParts(partsData);
    } catch (error) {
      message.error('Error al cargar repuestos disponibles');
    } finally {
      setLoadingParts(false);
    }
  };

  const handleAddPart = (partName: string, productId: string, quantity: number) => {
    const products = availableParts[partName] || [];
    const product = products.find((p) => p._id === productId);

    if (!product) return;

    if (quantity > product.stock) {
      message.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    // Verificar si ya está agregado
    const existingIndex = selectedParts.findIndex((sp) => sp.product._id === productId);

    if (existingIndex >= 0) {
      const updated = [...selectedParts];
      updated[existingIndex] = { product, quantity };
      setSelectedParts(updated);
    } else {
      setSelectedParts([...selectedParts, { product, quantity }]);
    }
  };

  const handleRemovePart = (productId: string) => {
    setSelectedParts(selectedParts.filter((sp) => sp.product._id !== productId));
  };

  const calculateTotal = () => {
    const partsTotal = selectedParts.reduce(
      (sum, sp) => sum + sp.product.price * sp.quantity,
      0
    );
    const laborCost = job?.laborCost || 0;
    return partsTotal + laborCost;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (job.requiredParts.length > 0 && selectedParts.length === 0) {
        message.error('Debe seleccionar al menos un repuesto');
        return;
      }

      setLoading(true);

      // Registrar salida de stock para cada repuesto
      for (const selectedPart of selectedParts) {
        await inventoryApi.addStockMovement(selectedPart.product._id, {
          type: 'salida',
          quantity: selectedPart.quantity,
          reason: 'Venta a cliente',
          notes: `Trabajo rápido: ${job.name} - ${values.clientInfo || 'Cliente walk-in'}`,
        });
      }

      const partsCost = selectedParts.reduce((sum, sp) => sum + sp.product.price * sp.quantity, 0);
      const totalCost = partsCost + (job?.laborCost || 0);

      // Construir info de vehículo si existe
      let vehicleInfo = '';
      if (values.vehicleBrand || values.vehicleModel || values.vehicleYear || values.vehiclePlate) {
        const parts = [];
        if (values.vehicleBrand) parts.push(values.vehicleBrand);
        if (values.vehicleModel) parts.push(values.vehicleModel);
        if (values.vehicleYear) parts.push(values.vehicleYear);
        if (values.vehiclePlate) parts.push(`(${values.vehiclePlate})`);
        vehicleInfo = parts.join(' ');
      }

      onComplete({
        partsCost,
        totalCost,
        clientInfo: values.clientInfo,
        vehicleInfo,
        selectedParts: selectedParts.map(sp => ({
          productId: sp.product._id,
          productName: sp.product.name,
          quantity: sp.quantity,
          price: sp.product.price,
        })),
      });
      
      form.resetFields();
      setSelectedParts([]);
    } catch (error: any) {
      message.error('Error al registrar trabajo');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  const total = calculateTotal();

  return (
    <Modal
      title={
        <Space>
          <span style={{ fontSize: 32 }}>{job.icon}</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>{job.name}</div>
            <Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
              {job.description}
            </Text>
          </div>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" size="large" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleSubmit}
          loading={loading}
        >
          Completar y Registrar
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" size="large">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Información del Cliente */}
          <Card title={<><UserOutlined /> Información del Cliente</>} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Form.Item
                name="clientId"
                label="Cliente (Opcional)"
                tooltip="Selecciona un cliente registrado o deja en blanco para cliente walk-in"
              >
                <Select
                  showSearch
                  placeholder="Buscar cliente o dejar en blanco..."
                  allowClear
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

              <Form.Item name="clientInfo" label="Info Adicional (Nombre, Teléfono, etc.)">
                <Input placeholder="Ej: Juan Pérez - +56912345678" />
              </Form.Item>
            </Space>
          </Card>

          {/* Información del Vehículo */}
          <Card title={<><CarOutlined /> Vehículo</>} size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input.Group compact>
                <Form.Item
                  name="vehicleBrand"
                  label="Marca"
                  style={{ display: 'inline-block', width: '33%' }}
                >
                  <Input placeholder="Toyota" />
                </Form.Item>
                <Form.Item
                  name="vehicleModel"
                  label="Modelo"
                  style={{ display: 'inline-block', width: '33%', paddingLeft: 8 }}
                >
                  <Input placeholder="Corolla" />
                </Form.Item>
                <Form.Item
                  name="vehicleYear"
                  label="Año"
                  style={{ display: 'inline-block', width: '34%', paddingLeft: 8 }}
                >
                  <InputNumber placeholder="2015" style={{ width: '100%' }} />
                </Form.Item>
              </Input.Group>

              <Form.Item name="vehiclePlate" label="Patente">
                <Input placeholder="ABCD12" style={{ textTransform: 'uppercase' }} />
              </Form.Item>
            </Space>
          </Card>

          {/* Selección de Repuestos */}
          {job.requiredParts && job.requiredParts.length > 0 && (
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>Repuestos Necesarios</span>
                  {selectedParts.length > 0 && (
                    <Tag color="blue">{selectedParts.length} seleccionados</Tag>
                  )}
                </Space>
              }
              size="small"
              loading={loadingParts}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {job.requiredParts.map((requiredPart: any, index: number) => {
                  const products = availableParts[requiredPart.name] || [];
                  const selected = selectedParts.find((sp) =>
                    products.some((p) => p._id === sp.product._id)
                  );

                  return (
                    <div key={index}>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        {requiredPart.name}
                        {requiredPart.quantity > 1 && (
                          <Tag color="orange" style={{ marginLeft: 8 }}>
                            Cantidad sugerida: {requiredPart.quantity}
                          </Tag>
                        )}
                      </Text>

                      {products.length === 0 ? (
                        <Alert
                          message="Sin stock disponible"
                          description={`No hay ${requiredPart.name.toLowerCase()} en inventario`}
                          type="warning"
                          showIcon
                          icon={<WarningOutlined />}
                        />
                      ) : (
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <Select
                            placeholder={`Seleccionar ${requiredPart.name.toLowerCase()}...`}
                            style={{ width: '100%' }}
                            onChange={(productId) =>
                              handleAddPart(requiredPart.name, productId, requiredPart.quantity || 1)
                            }
                            value={selected?.product._id}
                          >
                            {products.map((product) => (
                              <Select.Option key={product._id} value={product._id}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Space direction="vertical" size={0}>
                                    <Text strong>{product.name}</Text>
                                    {product.specifications && (
                                      <ProductSpecifications
                                        category={product.category}
                                        specifications={product.specifications}
                                        maxTags={3}
                                        compact
                                      />
                                    )}
                                  </Space>
                                  <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                                    <Text strong style={{ color: '#52c41a' }}>
                                      ${product.price.toLocaleString('es-CL')}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                      Stock: {product.stock}
                                    </Text>
                                  </Space>
                                </div>
                              </Select.Option>
                            ))}
                          </Select>

                          {selected && (
                            <div
                              style={{
                                padding: 12,
                                background: '#f0f2f5',
                                borderRadius: 6,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                              }}
                            >
                              <Space>
                                <Text>Cantidad:</Text>
                                <InputNumber
                                  min={1}
                                  max={selected.product.stock}
                                  value={selected.quantity}
                                  onChange={(qty) =>
                                    handleAddPart(requiredPart.name, selected.product._id, qty || 1)
                                  }
                                  style={{ width: 80 }}
                                />
                                <Text type="secondary">
                                  x ${selected.product.price.toLocaleString('es-CL')} ={' '}
                                  <Text strong style={{ color: '#1890ff' }}>
                                    ${(selected.product.price * selected.quantity).toLocaleString('es-CL')}
                                  </Text>
                                </Text>
                              </Space>
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => handleRemovePart(selected.product._id)}
                              >
                                Quitar
                              </Button>
                            </div>
                          )}
                        </Space>
                      )}

                      {index < job.requiredParts.length - 1 && <Divider style={{ margin: '12px 0' }} />}
                    </div>
                  );
                })}
              </Space>
            </Card>
          )}

          {/* Resumen de Costos */}
          <Card title="Resumen Total">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>Mano de Obra:</Text>
                <Text strong style={{ fontSize: 16 }}>
                  ${job.laborCost.toLocaleString('es-CL')}
                </Text>
              </div>

              {selectedParts.length > 0 && (
                <>
                  <Divider style={{ margin: '8px 0' }} />
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      Repuestos:
                    </Text>
                    {selectedParts.map((sp) => (
                      <div
                        key={sp.product._id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Text type="secondary">
                          {sp.quantity}x {sp.product.name}
                        </Text>
                        <Text>${(sp.product.price * sp.quantity).toLocaleString('es-CL')}</Text>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Divider style={{ margin: '12px 0' }} />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: '#f0f2f5',
                  borderRadius: 8,
                }}
              >
                <Title level={4} style={{ margin: 0 }}>
                  TOTAL A COBRAR:
                </Title>
                <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                  ${total.toLocaleString('es-CL')}
                </Title>
              </div>
            </Space>
          </Card>

          {/* Notas */}
          <Form.Item name="notes" label="Notas Adicionales (Opcional)">
            <Input.TextArea rows={2} placeholder="Observaciones del trabajo..." />
          </Form.Item>
        </Space>
      </Form>
    </Modal>
  );
};

export default QuickJobModal;