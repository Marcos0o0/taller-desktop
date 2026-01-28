import React, { useState, useEffect } from 'react';
import {
  Modal,
  Card,
  Space,
  Button,
  Typography,
  InputNumber,
  Row,
  Col,
  Statistic,
  Tag,
  Divider,
  message,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  MinusOutlined,
  CheckOutlined,
  BarcodeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Product, inventoryApi } from '@api/inventory.api';
import ProductSpecifications from './ProductSpecifications';


const { Title, Text } = Typography;

interface QuickSaleModalProps {
  open: boolean;
  scannedProduct: Product | null;
  onClose: () => void;
  onSaleComplete: () => void;
}

const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  open,
  scannedProduct,
  onClose,
  onSaleComplete,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && scannedProduct) {
      setQuantity(1); // Reset a 1 cuando se abre
    }
  }, [open, scannedProduct]);

  const handleSell = async () => {
    if (!scannedProduct) return;

    if (quantity > scannedProduct.stock) {
      message.error(`Solo hay ${scannedProduct.stock} unidades disponibles`);
      return;
    }

    setLoading(true);
    try {
      // Registrar salida de stock
      await inventoryApi.addStockMovement(scannedProduct._id, {
        type: 'salida',
        quantity: quantity,
        reason: 'Venta a cliente',
        notes: 'Venta rápida desde escáner',
      });

      message.success(`✅ Venta registrada: ${quantity} unidad(es) de ${scannedProduct.name}`);
      setQuantity(1);
      onSaleComplete();
      onClose();
    } catch (error: any) {
      message.error('Error al registrar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSell = async (qty: number) => {
    setQuantity(qty);
    // Esperar un momento para que se vea el cambio
    setTimeout(() => {
      handleSell();
    }, 100);
  };

  if (!scannedProduct) return null;

  const total = scannedProduct.price * quantity;
  const stockAfterSale = scannedProduct.stock - quantity;
  const isLowStock = stockAfterSale <= scannedProduct.minStock;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      closable={false}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', padding: '20px 0 10px' }}>
          <ShoppingCartOutlined style={{ fontSize: 48, color: '#52c41a' }} />
          <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
            Venta Rápida
          </Title>
        </div>

        {/* Información del Producto */}
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text type="secondary">Producto:</Text>
              <Title level={4} style={{ margin: '4px 0' }}>
                {scannedProduct.name}
              </Title>
            </div>

            <div>
              <Text type="secondary">Código:</Text>
              <div>
                <Tag icon={<BarcodeOutlined />} style={{ fontSize: 14, padding: '4px 12px' }}>
                  {scannedProduct.barcode}
                </Tag>
              </div>
            </div>

            {scannedProduct.specifications && (
              <div>
                <Text type="secondary">Especificaciones:</Text>
                <div style={{ marginTop: 4 }}>
                  <ProductSpecifications
                    category={scannedProduct.category}
                    specifications={scannedProduct.specifications}
                    maxTags={5}
                  />
                </div>
              </div>
            )}

            <Divider style={{ margin: '12px 0' }} />

            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Precio Unitario"
                  value={scannedProduct.price}
                  prefix="$"
                  valueStyle={{ color: '#1890ff', fontSize: 24 }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Stock Disponible"
                  value={scannedProduct.stock}
                  suffix="unidades"
                  valueStyle={{
                    color: scannedProduct.stock <= scannedProduct.minStock ? '#ff4d4f' : '#52c41a',
                    fontSize: 24,
                  }}
                />
              </Col>
            </Row>
          </Space>
        </Card>

        {/* Botones de Venta Rápida */}
        <Card title="🚀 Venta Rápida - Un Clic">
          <Space size="middle" wrap style={{ width: '100%', justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              onClick={() => handleQuickSell(1)}
              loading={loading}
              style={{
                height: 60,
                minWidth: 120,
                fontSize: 18,
                background: '#52c41a',
                borderColor: '#52c41a',
              }}
            >
              Vender 1
            </Button>

            {scannedProduct.stock >= 2 && (
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={() => handleQuickSell(2)}
                loading={loading}
                style={{
                  height: 60,
                  minWidth: 120,
                  fontSize: 18,
                  background: '#52c41a',
                  borderColor: '#52c41a',
                }}
              >
                Vender 2
              </Button>
            )}

            {scannedProduct.stock >= 4 && (
              <Button
                type="primary"
                size="large"
                icon={<CheckOutlined />}
                onClick={() => handleQuickSell(4)}
                loading={loading}
                style={{
                  height: 60,
                  minWidth: 120,
                  fontSize: 18,
                  background: '#52c41a',
                  borderColor: '#52c41a',
                }}
              >
                Vender 4
              </Button>
            )}
          </Space>
        </Card>

        {/* Cantidad Personalizada */}
        <Card title="📝 Cantidad Personalizada">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Button
                icon={<MinusOutlined />}
                size="large"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ height: 50, width: 50 }}
              />

              <InputNumber
                min={1}
                max={scannedProduct.stock}
                value={quantity}
                onChange={(val) => setQuantity(val || 1)}
                size="large"
                style={{
                  width: 120,
                  textAlign: 'center',
                  fontSize: 24,
                  height: 50,
                }}
                controls={false}
              />

              <Button
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setQuantity(Math.min(scannedProduct.stock, quantity + 1))}
                style={{ height: 50, width: 50 }}
              />

              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="large"
                onClick={handleSell}
                loading={loading}
                style={{ height: 50, flex: 1, fontSize: 16 }}
              >
                Vender {quantity}
              </Button>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: '#f0f2f5',
                borderRadius: 8,
              }}
            >
              <div>
                <Text type="secondary">Total a Cobrar:</Text>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 32,
                      color: '#52c41a',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <DollarOutlined />${total.toLocaleString('es-CL')}
                  </Text>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Text type="secondary">Stock después de venta:</Text>
                <div>
                  <Text
                    strong
                    style={{
                      fontSize: 24,
                      color: isLowStock ? '#ff4d4f' : '#1890ff',
                    }}
                  >
                    {stockAfterSale} unidades
                  </Text>
                </div>
              </div>
            </div>

            {isLowStock && (
              <Alert
                message="⚠️ Stock Bajo"
                description={`Después de esta venta quedarán solo ${stockAfterSale} unidades. Considera hacer un pedido.`}
                type="warning"
                showIcon
              />
            )}
          </Space>
        </Card>

        {/* Botón Cancelar */}
        <Button size="large" onClick={onClose} block>
          Cancelar
        </Button>
      </Space>
    </Modal>
  );
};

export default QuickSaleModal;