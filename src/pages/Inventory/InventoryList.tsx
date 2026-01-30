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
  Image,
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
  HistoryOutlined,
} from '@ant-design/icons';
import { inventoryApi, Product } from '@api/inventory.api';
import { useInventoryStore } from '@store/inventoryStore';
import { useBarcodeScanner } from '@hooks/useBarcodeScanner';
import ProductFormModal from '@components/inventory/ProductFormModal';
import StockMovementModal from '@components/inventory/StockMovementModal';
import StockHistoryModal from '@components/inventory/StockHistoryModal';
import QuickSaleModal from '@components/inventory/QuickSaleModal';
import ProductSpecifications from '@components/inventory/ProductSpecifications';

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
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [quickSaleModalOpen, setQuickSaleModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [quickSaleProduct, setQuickSaleProduct] = useState<Product | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Store y scanner
  const { scannerEnabled, setScannerEnabled, lastScannedCode, setLastScannedCode } = useInventoryStore();
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

  // Búsqueda automática al escanear
  useEffect(() => {
    if (scannerEnabled && lastScannedCode) {
      handleQuickSearch(lastScannedCode);
    }
  }, [lastScannedCode]);

  async function handleBarcodeScanned(barcode: string) {
    try {
      setLastScannedCode(barcode);
      
      // Buscar si el producto ya existe
      const existingProduct = await inventoryApi.getByBarcode(barcode);
      
      if (existingProduct) {
        message.success(`Producto encontrado: ${existingProduct.name}`);
        // 🔥 CAMBIO: Abrir modal de venta rápida en lugar de edición
        setQuickSaleProduct(existingProduct);
        setQuickSaleModalOpen(true);
      } else {
        message.info(`Código ${barcode} no registrado. Crear nuevo producto.`);
        setEditingProduct(null);
        setProductModalOpen(true);
      }
    } catch (error) {
      message.error('Error al buscar producto');
    }
  }

  const handleQuickSearch = async (code: string) => {
    try {
      const product = await inventoryApi.getByBarcode(code);
      if (product) {
        // Resaltar el producto en la tabla
        const productIndex = products.findIndex(p => p._id === product._id);
        if (productIndex === -1) {
          // Si no está en la página actual, mostrar info
          message.info({
            content: (
              <Space direction="vertical">
                <Text strong>Producto: {product.name}</Text>
                <Text>Stock: {product.stock} unidades</Text>
                <Text>Precio: ${product.price.toLocaleString('es-CL')}</Text>
              </Space>
            ),
            duration: 5,
          });
        }
      }
    } catch (error) {
      // Producto no encontrado, silenciosamente continuar
    }
  };

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

  const handleExport = async () => {
    const hide = message.loading('Generando archivo Excel...', 0);
    try {
      const blob = await inventoryApi.exportInventory('excel');
      
      // Crear link de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventario-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      hide();
      message.success('Inventario exportado exitosamente');
    } catch (error) {
      hide();
      message.error('Error al exportar inventario');
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

  const handleHistory = (product: Product) => {
    setMovementProduct(product);
    setHistoryModalOpen(true);
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

  const handleQuickSaleComplete = () => {
    loadProducts();
    loadLowStock();
  };

  const handleScanClick = () => {
    setScannerEnabled(!scannerEnabled);
    if (!scannerEnabled) {
      message.success({
        content: 'Escáner activado. Escanee un código de barras...',
        duration: 3,
      });
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
      repuestos: 'Repuestos',
      lubricantes: 'Lubricantes',
      filtros: 'Filtros',
      frenos: 'Frenos',
      suspension: 'Suspensión',
      electrico: 'Eléctrico',
      carroceria: 'Carrocería',
      neumaticos: 'Neumáticos',
      herramientas: 'Herramientas',
      accesorios: 'Accesorios',
      consumibles: 'Consumibles',
      otros: 'Otros',
    };
    return categories[category] || category;
  };

  const columns = [
    {
      title: 'Foto',
      key: 'image',
      width: 80,
      fixed: 'left' as const,
      render: (record: Product) => (
        record.imageUrl ? (
          <Image
            src={record.imageUrl}
            alt={record.name}
            width={70}
            height={70}
            style={{ 
              objectFit: 'cover', 
              borderRadius: '8px',
              border: '1px solid #f0f0f0'
            }}
            preview={{
              mask: <div style={{ fontSize: 12 }}>Ver</div>,
            }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '8px',
              border: '1px dashed #d9d9d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fafafa',
            }}
          >
            <Text type="secondary" style={{ fontSize: 20 }}>
              📦
            </Text>
          </div>
        )
      ),
    },
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
      width: 350,
      render: (record: Product) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text strong>{record.name}</Text>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
              {record.description.substring(0, 60)}
              {record.description.length > 60 ? '...' : ''}
            </Text>
          )}
          {/* 🔥 NUEVO: Mostrar especificaciones técnicas */}
          {record.specifications && Object.keys(record.specifications).length > 0 && (
            <div style={{ marginTop: 4 }}>
              <ProductSpecifications
                category={record.category}
                specifications={record.specifications}
                maxTags={4}
              />
            </div>
          )}
        </Space>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'category',
      key: 'category',
      width: 130,
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
      title: 'Acciones',
      key: 'actions',
      width: 280,
      fixed: 'right' as const,
      render: (record: Product) => (
        <Space size="small" wrap>
          <Tooltip title="Ver Historial">
            <Button
              type="link"
              icon={<HistoryOutlined />}
              onClick={() => handleHistory(record)}
              size="small"
            >
              Historial
            </Button>
          </Tooltip>
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
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            size="large"
          >
            Exportar Excel
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadProducts} loading={loading}>
            Actualizar
          </Button>
          <Tooltip title={scannerEnabled ? "Escáner activo - Escanee un código" : "Activar escáner de código de barras"}>
            <Badge 
              dot={scanning} 
              status="processing"
              offset={[-5, 5]}
            >
              <Button
                icon={<BarcodeOutlined />}
                size="large"
                onClick={handleScanClick}
                type={scannerEnabled ? 'primary' : 'default'}
                danger={scannerEnabled}
                className={scannerEnabled ? 'scanner-pulse' : ''}
              >
                {scannerEnabled ? 'Detener Escáner' : 'Escanear Código'}
              </Button>
            </Badge>
          </Tooltip>
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreate}>
            Nuevo Producto
          </Button>
        </Space>
      </div>

      {/* Alertas de stock bajo */}
      {lowStockProducts.length > 0 && (
        <Alert
          message={`${lowStockProducts.length} producto${
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
          message="Escáner Activo"
          description={
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>El sistema está esperando que escanees un código de barras.</Text>
            </Space>
          }
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
              <Select.Option value="repuestos">Repuestos</Select.Option>
              <Select.Option value="lubricantes">Lubricantes</Select.Option>
              <Select.Option value="filtros">Filtros</Select.Option>
              <Select.Option value="frenos">Frenos</Select.Option>
              <Select.Option value="suspension">Suspensión</Select.Option>
              <Select.Option value="electrico">Eléctrico</Select.Option>
              <Select.Option value="herramientas">Herramientas</Select.Option>
              <Select.Option value="otros">Otros</Select.Option>
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
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Modales */}
      <ProductFormModal
        open={productModalOpen}
        product={editingProduct}
        scannedBarcode={scannerEnabled && !editingProduct ? lastScannedCode || undefined : undefined}
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

      <StockHistoryModal
        open={historyModalOpen}
        product={movementProduct}
        onClose={() => {
          setHistoryModalOpen(false);
          setMovementProduct(null);
        }}
      />

      {/* 🔥 NUEVO: Modal de venta rápida */}
      <QuickSaleModal
        open={quickSaleModalOpen}
        scannedProduct={quickSaleProduct}
        onClose={() => {
          setQuickSaleModalOpen(false);
          setQuickSaleProduct(null);
        }}
        onSaleComplete={handleQuickSaleComplete}
      />

      {/* CSS para animación */}
      <style>{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.7);
          }
          50% { 
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
          }
        }
        
        .scanner-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
    </Space>
  );
};

export default InventoryList;