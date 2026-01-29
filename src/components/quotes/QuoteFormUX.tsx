import React, { useState, useEffect, useCallback } from 'react';
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
  Table,
  AutoComplete,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  CarOutlined,
  ToolOutlined,
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { clientsApi } from '@api/clients.api';
import { inventoryApi, Product } from '@api/inventory.api';
import { Client } from '@types/api.types';
import ProductSpecifications from '@components/inventory/ProductSpecifications';
import QuickSearchModal from '@components/common/QuickSearchModal';
import {
  CAR_BRANDS,
  getModelsByBrand,
  formatLicensePlate,
  formatRUT,
  validateRUT,
  formatPhone,
  useKeyboardShortcut,
} from '@utils/uxHelpers';

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

interface SelectedPart {
  product: Product;
  quantity: number;
}

interface QuoteFormProps {
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

const QuoteFormUX: React.FC<QuoteFormProps> = ({ onSubmit, loading = false }) => {
  const [form] = Form.useForm();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loadingClients, setLoadingClients] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedParts, setSelectedParts] = useState<SelectedPart[]>([]);
  const [externalParts, setExternalParts] = useState<any[]>([]);
  const [quickSearchVisible, setQuickSearchVisible] = useState(false);

  // Estados para agregar servicios
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState<number>(0);

  // Estados para agregar repuestos
  const [searchCategory, setSearchCategory] = useState<string>('all');
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Estados para repuestos externos
  const [externalPartName, setExternalPartName] = useState('');
  const [externalPartDescription, setExternalPartDescription] = useState('');
  const [externalPartPrice, setExternalPartPrice] = useState<number>(0);
  const [externalPartQuantity, setExternalPartQuantity] = useState<number>(1);

  // Estados para autocompletar
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Handlers con useCallback para atajos de teclado
  const handleOpenQuickSearch = useCallback(() => {
    setQuickSearchVisible(true);
  }, []);

  const handleCloseQuickSearch = useCallback(() => {
    if (quickSearchVisible) setQuickSearchVisible(false);
  }, [quickSearchVisible]);

  // Atajos de teclado
  useKeyboardShortcut('Ctrl+K', handleOpenQuickSearch);
  useKeyboardShortcut('Esc', handleCloseQuickSearch);

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchCategory]);

  useEffect(() => {
    if (selectedBrand) {
      setAvailableModels(getModelsByBrand(selectedBrand));
    } else {
      setAvailableModels([]);
    }
  }, [selectedBrand]);

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

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await inventoryApi.list({
        category: searchCategory !== 'all' ? searchCategory : undefined,
        limit: 100,
        isActive: true,
      });
      const withStock = response.products.filter((p) => p.stock > 0);
      setAvailableProducts(withStock);
    } catch (error) {
      message.error('Error al cargar productos');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    // Asegurarse de que el clientId se guarde correctamente en el formulario
    form.setFieldsValue({ clientId: client._id });
    // También forzar la validación del campo
    form.validateFields(['clientId']).catch(() => {});
    message.success(`Cliente seleccionado: ${client.firstName} ${client.lastName1}`);
    
    console.log('Cliente seleccionado:', client._id); // DEBUG
  };

  const handleBrandChange = (value: string) => {
    setSelectedBrand(value);
    form.setFieldValue('model', undefined);
  };

  const handleAddService = () => {
    if (!serviceName || !servicePrice || servicePrice <= 0) {
      message.error('Complete todos los campos del servicio');
      return;
    }

    const newService: Service = {
      id: Date.now().toString(),
      name: serviceName,
      description: serviceDescription,
      price: servicePrice,
    };

    setServices([...services, newService]);
    setServiceName('');
    setServiceDescription('');
    setServicePrice(0);
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleAddPart = () => {
    if (!selectedProductId) {
      message.error('Seleccione un producto');
      return;
    }

    const product = availableProducts.find((p) => p._id === selectedProductId);
    if (!product) return;

    if (selectedQuantity > product.stock) {
      message.error(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    const existingIndex = selectedParts.findIndex((sp) => sp.product._id === selectedProductId);

    if (existingIndex >= 0) {
      const updated = [...selectedParts];
      updated[existingIndex] = { product, quantity: selectedQuantity };
      setSelectedParts(updated);
      message.success('Cantidad actualizada');
    } else {
      setSelectedParts([...selectedParts, { product, quantity: selectedQuantity }]);
      message.success('Repuesto agregado');
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
  };

  const handleRemovePart = (productId: string) => {
    setSelectedParts(selectedParts.filter((sp) => sp.product._id !== productId));
  };

  const handleAddExternalPart = () => {
    if (!externalPartName || !externalPartPrice || externalPartPrice <= 0) {
      message.error('Complete nombre y precio del repuesto');
      return;
    }

    if (externalPartQuantity <= 0) {
      message.error('La cantidad debe ser mayor a 0');
      return;
    }

    const newExternalPart = {
      id: Date.now().toString(),
      name: externalPartName,
      description: externalPartDescription,
      price: externalPartPrice,
      quantity: externalPartQuantity,
      isExternal: true,
    };

    setExternalParts([...externalParts, newExternalPart]);
    setExternalPartName('');
    setExternalPartDescription('');
    setExternalPartPrice(0);
    setExternalPartQuantity(1);
    message.success('Repuesto externo agregado');
  };

  const handleRemoveExternalPart = (id: string) => {
    setExternalParts(externalParts.filter((ep) => ep.id !== id));
  };

  const calculateSubtotalServices = () => {
    return services.reduce((sum, s) => sum + s.price, 0);
  };

  const calculateSubtotalParts = () => {
    const inventoryTotal = selectedParts.reduce((sum, sp) => sum + sp.product.price * sp.quantity, 0);
    const externalTotal = externalParts.reduce((sum, ep) => sum + ep.price * ep.quantity, 0);
    return inventoryTotal + externalTotal;
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

  // FUNCIÓN MEJORADA: Genera un resumen corto del trabajo propuesto
  const generateProposedWorkSummary = () => {
    let summary = '';

    // Agregar servicios
    if (services.length > 0) {
      summary += 'SERVICIOS:\n';
      services.forEach((s, idx) => {
        summary += `${idx + 1}. ${s.name} - $${s.price.toLocaleString('es-CL')}\n`;
        if (s.description) {
          summary += `   ${s.description}\n`;
        }
      });
      summary += '\n';
    }

    // Agregar repuestos de inventario
    if (selectedParts.length > 0) {
      summary += 'REPUESTOS (Inventario):\n';
      selectedParts.forEach((sp, idx) => {
        summary += `${idx + 1}. ${sp.product.name} - Cant: ${sp.quantity} - $${(sp.product.price * sp.quantity).toLocaleString('es-CL')}\n`;
      });
      summary += '\n';
    }

    // Agregar repuestos externos
    if (externalParts.length > 0) {
      summary += 'REPUESTOS EXTERNOS (A comprar):\n';
      externalParts.forEach((ep, idx) => {
        summary += `${idx + 1}. ${ep.name} - Cant: ${ep.quantity} - $${(ep.price * ep.quantity).toLocaleString('es-CL')}\n`;
      });
      summary += '\n';
    }

    // Agregar totales
    summary += `SUBTOTAL SERVICIOS: $${calculateSubtotalServices().toLocaleString('es-CL')}\n`;
    summary += `SUBTOTAL REPUESTOS: $${calculateSubtotalParts().toLocaleString('es-CL')}\n`;
    summary += `SUBTOTAL: $${calculateSubtotal().toLocaleString('es-CL')}\n`;
    summary += `IVA (19%): $${calculateIVA().toLocaleString('es-CL')}\n`;
    summary += `TOTAL: $${calculateTotal().toLocaleString('es-CL')}`;

    // Truncar si excede 2000 caracteres (límite del backend)
    if (summary.length > 1900) {
      summary = summary.substring(0, 1900) + '\n...(contenido truncado)';
    }

    return summary;
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // 🔍 VALIDACIÓN CRÍTICA: Verificar que clientId existe
      if (!values.clientId) {
        message.error('Debe seleccionar un cliente. Use el botón "Búsqueda Rápida" o el selector de clientes.');
        console.error('❌ clientId is missing from form values:', values);
        return;
      }

      if (services.length === 0) {
        message.error('Debe agregar al menos un servicio');
        return;
      }

      // Generar el resumen del trabajo propuesto
      const proposedWorkText = generateProposedWorkSummary();

      // Verificar longitud mínima (20 caracteres)
      if (proposedWorkText.length < 20) {
        message.error('El trabajo propuesto debe tener al menos 20 caracteres');
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
        // ✅ CAMBIO PRINCIPAL: Ahora envía un string formateado en lugar de JSON
        proposedWork: proposedWorkText,
        estimatedCost: calculateTotal(),
        notes: values.notes || '',
      };

      // 🔍 DEBUG - Mostrar datos antes de enviar
      console.log('=== DATOS A ENVIAR ===');
      console.log('clientId:', quoteData.clientId);
      console.log('vehicle:', quoteData.vehicle);
      console.log('description length:', quoteData.description.length);
      console.log('proposedWork length:', quoteData.proposedWork.length);
      console.log('proposedWork:', quoteData.proposedWork);
      console.log('estimatedCost:', quoteData.estimatedCost);
      console.log('======================');

      await onSubmit(quoteData);
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const productColumns = [
    {
      title: 'Producto',
      key: 'product',
      render: (_: any, record: SelectedPart) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.product.name}</Text>
          {record.product.specifications && (
            <ProductSpecifications
              category={record.product.category}
              specifications={record.product.specifications}
              maxTags={3}
              compact
            />
          )}
        </Space>
      ),
    },
    {
      title: 'Precio Unit.',
      key: 'price',
      align: 'right' as const,
      render: (_: any, record: SelectedPart) => `$${record.product.price.toLocaleString('es-CL')}`,
    },
    {
      title: 'Cantidad',
      key: 'quantity',
      align: 'center' as const,
      render: (_: any, record: SelectedPart) => (
        <InputNumber
          min={1}
          max={record.product.stock}
          value={record.quantity}
          onChange={(val) => {
            const updated = selectedParts.map((sp) =>
              sp.product._id === record.product._id ? { ...sp, quantity: val || 1 } : sp
            );
            setSelectedParts(updated);
          }}
          size="small"
          style={{ width: 60 }}
        />
      ),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      align: 'right' as const,
      render: (_: any, record: SelectedPart) => (
        <Text strong>${(record.product.price * record.quantity).toLocaleString('es-CL')}</Text>
      ),
    },
    {
      title: 'Acción',
      key: 'action',
      width: 80,
      render: (_: any, record: SelectedPart) => (
        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleRemovePart(record.product._id)} />
      ),
    },
  ];

  return (
    <>
      <QuickSearchModal
        visible={quickSearchVisible}
        onClose={() => setQuickSearchVisible(false)}
        onSelect={handleClientSelect}
      />

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Form form={form} layout="vertical" size="large">
          {/* Información del Cliente */}
          <Card
            title={<><UserOutlined /> Información del Cliente</>}
            extra={
              <Tooltip title="Búsqueda rápida (Ctrl+K)">
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => setQuickSearchVisible(true)}
                >
                  Búsqueda Rápida
                </Button>
              </Tooltip>
            }
          >
            <Row gutter={16}>
              <Col xs={24} md={selectedClient ? 24 : 12}>
                {selectedClient ? (
                  <>
                    {/* Campo oculto para mantener el clientId en el formulario */}
                    <Form.Item name="clientId" hidden>
                      <Input />
                    </Form.Item>
                    <Card size="small" style={{ backgroundColor: '#f0f5ff' }}>
                      <Space direction="vertical" size="small">
                        <Text strong style={{ fontSize: 16 }}>
                          {selectedClient.firstName} {selectedClient.lastName1} {selectedClient.lastName2 || ''}
                        </Text>
                        <Text type="secondary">📞 {selectedClient.phone}</Text>
                        <Text type="secondary">🆔 ID: {selectedClient._id}</Text>
                        {selectedClient.email && <Text type="secondary">✉️ {selectedClient.email}</Text>}
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            setSelectedClient(null);
                            form.setFieldValue('clientId', undefined);
                          }}
                        >
                          Cambiar cliente
                        </Button>
                      </Space>
                    </Card>
                  </>
                ) : (
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
                      onChange={(clientId) => {
                        const client = clients.find((c) => c._id === clientId);
                        if (client) setSelectedClient(client);
                      }}
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>

            {!selectedClient && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text type="secondary">
                  💡 Presiona <Tag>Ctrl+K</Tag> para búsqueda rápida
                </Text>
              </div>
            )}
          </Card>

          {/* Información del Vehículo */}
          <Card title={<><CarOutlined /> Información del Vehículo</>}>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="brand" label="Marca" rules={[{ required: true, message: 'Ingrese la marca' }]}>
                  <AutoComplete
                    options={CAR_BRANDS.map((brand) => ({ value: brand }))}
                    placeholder="Ej: Toyota, Nissan"
                    filterOption={(inputValue, option) =>
                      option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                    onChange={handleBrandChange}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="model" label="Modelo" rules={[{ required: true, message: 'Ingrese el modelo' }]}>
                  <AutoComplete
                    options={availableModels.map((model) => ({ value: model }))}
                    placeholder="Ej: Corolla, Versa"
                    disabled={!selectedBrand}
                    filterOption={(inputValue, option) =>
                      option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                    }
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="year" label="Año" rules={[{ required: true, message: 'Ingrese el año' }]}>
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
                  normalize={formatLicensePlate}
                >
                  <Input placeholder="ABCD12" maxLength={6} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="mileage" label="Kilometraje" rules={[{ required: true, message: 'Ingrese el kilometraje' }]}>
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
              <TextArea rows={3} placeholder="Describa detalladamente el problema reportado por el cliente..." maxLength={500} showCount />
            </Form.Item>
          </Card>

          {/* Servicios */}
          <Card
            title={
              <Space>
                <ToolOutlined />
                <span>Servicios</span>
                {services.length > 0 && <Tag color="blue">{services.length}</Tag>}
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Input
                placeholder="Nombre del servicio (ej: Cambio de aceite)"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                size="large"
                onPressEnter={handleAddService}
              />
              <TextArea
                placeholder="Descripción (opcional)"
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={2}
              />
              <Row gutter={16}>
                <Col flex="auto">
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Precio"
                    value={servicePrice}
                    onChange={(val) => setServicePrice(val || 0)}
                    min={0}
                    prefix="$"
                    precision={0}
                    size="large"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => value!.replace(/\./g, '')}
                    onPressEnter={handleAddService}
                  />
                </Col>
                <Col>
                  <Tooltip title="Enter para agregar rápido">
                    <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddService} size="large">
                      Agregar Servicio
                    </Button>
                  </Tooltip>
                </Col>
              </Row>
            </Space>

            {services.length > 0 && (
              <>
                <Divider />
                <List
                  dataSource={services}
                  renderItem={(service) => (
                    <List.Item
                      actions={[
                        <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleRemoveService(service.id)}>
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
              </>
            )}
          </Card>

          {/* Repuestos desde Inventario */}
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Repuestos desde Inventario</span>
                {selectedParts.length > 0 && <Tag color="green">{selectedParts.length}</Tag>}
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Select style={{ width: '100%' }} value={searchCategory} onChange={setSearchCategory} size="large">
                    <Select.Option value="all">Todas las categorías</Select.Option>
                    <Select.Option value="lubricantes">🛢️ Lubricantes</Select.Option>
                    <Select.Option value="filtros">🔍 Filtros</Select.Option>
                    <Select.Option value="frenos">🛑 Frenos</Select.Option>
                    <Select.Option value="suspension">⚙️ Suspensión</Select.Option>
                    <Select.Option value="electrico">⚡ Eléctrico</Select.Option>
                    <Select.Option value="neumaticos">⚫ Neumáticos</Select.Option>
                    <Select.Option value="repuestos">🔧 Repuestos</Select.Option>
                  </Select>
                </Col>
                <Col xs={24} md={10}>
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Seleccionar producto..."
                    value={selectedProductId}
                    onChange={setSelectedProductId}
                    loading={loadingProducts}
                    size="large"
                    optionFilterProp="children"
                    filterOption={(input, option: any) => option?.children?.toLowerCase().includes(input.toLowerCase())}
                  >
                    {availableProducts.map((product) => (
                      <Select.Option key={product._id} value={product._id}>
                        {product.name} - ${product.price.toLocaleString('es-CL')} (Stock: {product.stock})
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={12} md={3}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    value={selectedQuantity}
                    onChange={(val) => setSelectedQuantity(val || 1)}
                    size="large"
                    placeholder="Cant."
                  />
                </Col>
                <Col xs={12} md={3}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPart} size="large" block>
                    Agregar
                  </Button>
                </Col>
              </Row>

              {selectedParts.length > 0 && (
                <>
                  <Divider />
                  <Table
                    dataSource={selectedParts}
                    columns={productColumns}
                    rowKey={(record) => record.product._id}
                    pagination={false}
                    size="small"
                  />
                </>
              )}
            </Space>
          </Card>

          {/* Repuestos Externos (a comprar) */}
          <Card
            title={
              <Space>
                <InboxOutlined />
                <span>Repuestos Externos (a comprar)</span>
                {externalParts.length > 0 && <Tag color="orange">{externalParts.length}</Tag>}
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row gutter={16}>
                <Col xs={24} md={10}>
                  <Input
                    placeholder="Nombre del repuesto (ej: Filtro de aceite Mann W712/73)"
                    value={externalPartName}
                    onChange={(e) => setExternalPartName(e.target.value)}
                    size="large"
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Input
                    placeholder="Descripción / Especificaciones (opcional)"
                    value={externalPartDescription}
                    onChange={(e) => setExternalPartDescription(e.target.value)}
                    size="large"
                  />
                </Col>
                <Col xs={12} md={3}>
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="Precio"
                    value={externalPartPrice}
                    onChange={(val) => setExternalPartPrice(val || 0)}
                    min={0}
                    prefix="$"
                    precision={0}
                    size="large"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => value!.replace(/\./g, '')}
                  />
                </Col>
                <Col xs={6} md={2}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    value={externalPartQuantity}
                    onChange={(val) => setExternalPartQuantity(val || 1)}
                    size="large"
                    placeholder="Cant."
                  />
                </Col>
                <Col xs={6} md={1}>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddExternalPart} size="large" block>
                    +
                  </Button>
                </Col>
              </Row>

              {externalParts.length > 0 && (
                <>
                  <Divider />
                  <List
                    dataSource={externalParts}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Text strong key="total">
                            ${(item.price * item.quantity).toLocaleString('es-CL')}
                          </Text>,
                          <Button
                            key="delete"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveExternalPart(item.id)}
                          />,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              {item.name}
                              <Tag color="orange">Externo</Tag>
                            </Space>
                          }
                          description={
                            <Space>
                              {item.description && <Text type="secondary">{item.description}</Text>}
                              <Text type="secondary">•</Text>
                              <Text>
                                ${item.price.toLocaleString('es-CL')} × {item.quantity}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Space>
          </Card>

          {/* Notas */}
          <Card title="Notas Adicionales (Opcional)">
            <Form.Item name="notes">
              <TextArea rows={3} placeholder="Notas internas, condiciones especiales, etc..." maxLength={300} showCount />
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
              <Tooltip title="Ctrl+S para guardar">
                <Button type="primary" size="large" onClick={handleSubmit} loading={loading}>
                  Crear Presupuesto
                </Button>
              </Tooltip>
            </Space>
          </Card>
        </Form>
      </Space>
    </>
  );
};

export default QuoteFormUX;