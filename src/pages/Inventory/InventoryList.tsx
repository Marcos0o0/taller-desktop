import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Space,
  Table,
  Input,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  message,
  Badge,
  Tooltip,
  Popconfirm,
  Alert,
  Collapse,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  BarcodeOutlined,
  EditOutlined,
  DeleteOutlined,
  SwapOutlined,
  WarningOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { inventoryApi, Product } from '@api/inventory.api';
import { useInventoryStore } from '@store/inventoryStore';
import { useBarcodeScanner } from '@hooks/useBarcodeScanner';
import ProductFormModal from '@components/inventory/ProductFormModal';
import StockMovementModal from '@components/inventory/StockMovementModal';
import BarcodeTester from '@components/inventory/BarcodeTester';

const { Title, Text } = Typography;

const InventoryList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modales
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Store y scanner
  const { scannerEnabled, setScannerEnabled, setLastScannedCode } = useInventoryStore();
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    totalValue: 0,
  });

  // Scanner de código de barras
  const { scanning } = useBarcodeScanner({
    enabled: scannerEnabled,
    onScan: handleBarcodeScanned,
    minLength: 3,
    maxLength: 50,
    timeout: 100,
  });

  useEffect(() => {
    loadProducts();
    loadLowStock();
  }, [pagination.current, pagination.pageSize, searchText, categoryFilter, stockFilter]);

  async function handleBarcodeScanned(barcode: string) {
    try {
      setLastScannedCode(barcode);
      
      // Buscar si el producto ya existe
      const existingProduct = await inventoryApi.getByBarcode(barcode);
      
      if (existingProduct) {
        message.info(`Producto encontrado: ${existingProduct.name}`);
        setEditingProduct(existingProduct);
        setProductModalOpen(true);
      } else {
        message.success(`Código escaneado: ${barcode}. Crear nuevo producto.`);
        setEditingProduct(null);
        setProductModalOpen(true);
      }
    } catch (error) {
      message.error('Error al buscar producto');
    }
  }

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.list({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        lowStock: stockFilter === 'low' ? true : undefined,
        isActive: stockFilter === 'inactive' ? false : true,
      });

      setProducts(response.products);
      setPagination({
        ...pagination,
        total: response.pagination.total,
      });

      // Calcular estadísticas
      const totalValue = response.products.reduce((sum, p) => sum + p.price * p.stock, 0);
      const lowStock = response.products.filter((p) => p.stock <= p.minStock).length;

      setStats({
        total: response.pagination.total,
        lowStock,
        totalValue,
      });
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadLowStock = async () => {
    try {
      const products = await inventoryApi.getLowStock();
      setLowStockProducts(products);
    } catch (error) {
      console.error('Error loading low stock products');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleProductModalOk = async (values: any) => {
    setModalLoading(true);
    try {
      if (editingProduct) {
        await inventoryApi.update(editingProduct._id, values);
        message.success('Producto actualizado exitosamente');
      } else {
        await inventoryApi.create(values);
        message.success('Producto creado exitosamente');
      }
      setProductModalOpen(false);
      loadProducts();
      loadLowStock();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al guardar producto');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await inventoryApi.delete(productId);
      message.success('Producto eliminado exitosamente');
      loadProducts();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al eliminar producto');
    }
  };

  const handleMovement = (product: Product) => {
    setMovementProduct(product);
    setMovementModalOpen(true);
  };

  const handleMovementModalOk = async (values: any) => {
    if (!movementProduct) return;

    setModalLoading(true);
    try {
      await inventoryApi.addStockMovement(movementProduct._id, values);
      message.success('Movimiento de stock registrado exitosamente');
      setMovementModalOpen(false);
      loadProducts();
      loadLowStock();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al registrar movimiento');
    } finally {
      setModalLoading(false);
    }
  };

  const handleScanClick = () => {
    setScannerEnabled(!scannerEnabled);
    if (!scannerEnabled) {
      message.info('Escáner activado. Escanee un código de barras...');
    } else {
      message.info('Escáner desactivado');
    }
  };

  const getStockTag = (stock: number, minStock: number) => {
    if (stock === 0) {
      return (
        <Tag color="red" icon={<WarningOutlined />}>
          Sin Stock
        </Tag>
      );
    }
    if (stock <= minStock) {
      return (
        <Tag color="orange" icon={<WarningOutlined />}>
          Stock Bajo ({stock})
        </Tag>
      );
    }
    return <Tag color="green">{stock} unidades</Tag>;
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      repuestos: '🔩 Repuestos',
      lubricantes: '🛢️ Lubricantes',
      filtros: '🔍 Filtros',
      frenos: '🛑 Frenos',
      suspension: '⚙️ Suspensión',
      electrico: '⚡ Eléctrico',
      carroceria: '🚗 Carrocería',
      neumaticos: '⚫ Neumáticos',
      herramientas: '🔧 Herramientas',
      accesorios: '✨ Accesorios',
      consumibles: '📦 Consumibles',
      otros: '📋 Otros',
    };
    return categories[category] || category;
  };

  const columns = [
    {
      title: 'Código',
      dataIndex: 'barcode',
      key: 'barcode',
      width: 130,
      render: (text: string) => (
        <Space>
          <BarcodeOutlined />
          <Text code>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Producto',
      key: 'product',
      render: (record: Product) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
              {record.description.substring(0, 50)}...
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category: string) => <Text>{getCategoryLabel(category)}</Text>,
    },
    {
      title: 'Stock',
      key: 'stock',
      width: 150,
      render: (record: Product) => getStockTag(record.stock, record.minStock),
      sorter: (a: Product, b: Product) => a.stock - b.stock,
    },
    {
      title: 'Precio',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price: number) => (
        <Text strong style={{ fontSize: 14 }}>
          ${price.toLocaleString('es-CL')}
        </Text>
      ),
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: 'Ubicación',
      dataIndex: 'location',
      key: 'location',
      width: 120,
      render: (location: string) => location || <Text type="secondary">-</Text>,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (record: Product) => (
        <Space size="small">
          <Tooltip title="Movimiento de Stock">
            <Button
              type="link"
              icon={<SwapOutlined />}
              onClick={() => handleMovement(record)}
              size="small"
            >
              Stock
            </Button>
          </Tooltip>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Eliminar producto?"
            description="Esta acción se puede deshacer desde administración"
            onConfirm={() => handleDelete(record._id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Button type="link" danger icon={<DeleteOutlined />} size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          Inventario
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadProducts} loading={loading}>
            Actualizar
          </Button>
          <Badge dot={scanning} status="processing">
            <Button
              icon={<BarcodeOutlined />}
              size="large"
              onClick={handleScanClick}
              type={scannerEnabled ? 'primary' : 'default'}
              danger={scannerEnabled}
            >
              {scannerEnabled ? 'Detener Escáner' : 'Escanear Código'}
            </Button>
          </Badge>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreate}>
            Nuevo Producto
          </Button>
        </Space>
      </div>

      {/* Alertas de stock bajo */}
      {lowStockProducts.length > 0 && (
        <Alert
          message={`⚠️ ${lowStockProducts.length} producto${
            lowStockProducts.length > 1 ? 's' : ''
          } con stock bajo`}
          description={
            <div>
              <Text>Los siguientes productos necesitan reabastecimiento:</Text>
              <div style={{ marginTop: 8 }}>
                {lowStockProducts.slice(0, 3).map((p) => (
                  <Tag key={p._id} color="orange" style={{ marginBottom: 4 }}>
                    {p.name}: {p.stock} unidades
                  </Tag>
                ))}
                {lowStockProducts.length > 3 && (
                  <Text type="secondary"> y {lowStockProducts.length - 3} más...</Text>
                )}
              </div>
            </div>
          }
          type="warning"
          showIcon
          closable
        />
      )}

      {/* Escáner activo */}
      {scannerEnabled && (
        <Alert
          message="🔍 Escáner Activo"
          description="El sistema está esperando que escanees un código de barras. Escanea cualquier producto para agregarlo o editarlo."
          type="success"
          showIcon
          closable
          onClose={() => setScannerEnabled(false)}
        />
      )}

      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total de Productos"
              value={stats.total}
              prefix={<BarcodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Productos con Stock Bajo"
              value={stats.lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: stats.lowStock > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Valor Total del Inventario"
              value={stats.totalValue}
              prefix="$"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              suffix="CLP"
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Input.Search
            placeholder="Buscar por código, nombre o descripción..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => {
              if (!e.target.value) {
                handleSearch('');
              }
            }}
            style={{ maxWidth: 500 }}
          />

          <Space wrap>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 200 }}
              size="large"
            >
              <Select.Option value="all">Todas las categorías</Select.Option>
              <Select.Option value="repuestos">🔩 Repuestos</Select.Option>
              <Select.Option value="lubricantes">🛢️ Lubricantes</Select.Option>
              <Select.Option value="filtros">🔍 Filtros</Select.Option>
              <Select.Option value="frenos">🛑 Frenos</Select.Option>
              <Select.Option value="suspension">⚙️ Suspensión</Select.Option>
              <Select.Option value="electrico">⚡ Eléctrico</Select.Option>
              <Select.Option value="herramientas">🔧 Herramientas</Select.Option>
              <Select.Option value="otros">📋 Otros</Select.Option>
            </Select>

            <Select
              value={stockFilter}
              onChange={setStockFilter}
              style={{ width: 180 }}
              size="large"
            >
              <Select.Option value="all">Todos los productos</Select.Option>
              <Select.Option value="low">Stock bajo</Select.Option>
              <Select.Option value="out">Sin stock</Select.Option>
            </Select>
          </Space>
        </Space>
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={products}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} productos`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          size="middle"
        />
      </Card>

      {/* Simulador para desarrollo */}
      {import.meta.env.DEV && (
        <Collapse
          items={[
            {
              key: '1',
              label: '🧪 Modo Desarrollo: Simulador de Escáner',
              children: <BarcodeTester />,
            },
          ]}
        />
      )}

      {/* Modales */}
      <ProductFormModal
        open={productModalOpen}
        product={editingProduct}
        scannedBarcode={scannerEnabled && !editingProduct ? undefined : undefined}
        onOk={handleProductModalOk}
        onCancel={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        loading={modalLoading}
      />

      <StockMovementModal
        open={movementModalOpen}
        product={movementProduct}
        onOk={handleMovementModalOk}
        onCancel={() => {
          setMovementModalOpen(false);
          setMovementProduct(null);
        }}
        loading={modalLoading}
      />
    </Space>
  );
};

export default InventoryList;