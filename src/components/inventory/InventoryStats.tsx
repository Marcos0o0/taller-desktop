import React from 'react';
import { Card, Row, Col, Statistic, Progress, Space, Typography, Divider } from 'antd';
import {
  BarcodeOutlined,
  WarningOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  LineChartOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface InventoryStatsProps {
  total: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
  totalCost: number;
  categoriesCount: Record<string, number>;
  mostValuableProducts: Array<{ name: string; value: number }>;
}

const InventoryStats: React.FC<InventoryStatsProps> = ({
  total,
  lowStock,
  outOfStock,
  totalValue,
  totalCost,
  categoriesCount,
  mostValuableProducts,
}) => {
  const profitMargin = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  const stockHealthPercentage = total > 0 ? ((total - lowStock - outOfStock) / total) * 100 : 0;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Estadísticas principales */}
      <Row gutter={16}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total de Productos"
              value={total}
              prefix={<BarcodeOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
            <Progress 
              percent={100} 
              showInfo={false} 
              strokeColor="#1890ff"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Productos con Stock Bajo"
              value={lowStock}
              prefix={<WarningOutlined />}
              valueStyle={{ color: lowStock > 0 ? '#faad14' : '#52c41a', fontSize: 28 }}
            />
            <Progress 
              percent={total > 0 ? (lowStock / total) * 100 : 0}
              status={lowStock > 0 ? 'active' : 'success'}
              strokeColor={lowStock > 0 ? '#faad14' : '#52c41a'}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {total > 0 ? ((lowStock / total) * 100).toFixed(1) : 0}% del inventario
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sin Stock"
              value={outOfStock}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: outOfStock > 0 ? '#ff4d4f' : '#52c41a', fontSize: 28 }}
            />
            <Progress 
              percent={total > 0 ? (outOfStock / total) * 100 : 0}
              status={outOfStock > 0 ? 'exception' : 'success'}
              strokeColor={outOfStock > 0 ? '#ff4d4f' : '#52c41a'}
              showInfo={false}
              style={{ marginTop: 8 }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {total > 0 ? ((outOfStock / total) * 100).toFixed(1) : 0}% del inventario
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Valor Total Inventario"
              value={totalValue}
              prefix={<DollarOutlined />}
              precision={0}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
              suffix="CLP"
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Costo Total: ${totalCost.toLocaleString('es-CL')}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Estadísticas avanzadas */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <LineChartOutlined />
                <span>Salud del Inventario</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Estado General del Stock</Text>
                  <Text strong>{stockHealthPercentage.toFixed(1)}%</Text>
                </div>
                <Progress 
                  percent={stockHealthPercentage}
                  strokeColor={{
                    '0%': '#ff4d4f',
                    '50%': '#faad14',
                    '100%': '#52c41a',
                  }}
                  status={stockHealthPercentage > 80 ? 'success' : stockHealthPercentage > 50 ? 'active' : 'exception'}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {total - lowStock - outOfStock} productos con stock saludable
                </Text>
              </div>

              <Divider style={{ margin: '8px 0' }} />

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text>Margen de Ganancia Estimado</Text>
                  <Text strong style={{ color: profitMargin > 0 ? '#52c41a' : '#ff4d4f' }}>
                    {profitMargin > 0 ? <RiseOutlined /> : <FallOutlined />} {profitMargin.toFixed(1)}%
                  </Text>
                </div>
                <Progress 
                  percent={Math.min(profitMargin, 100)}
                  strokeColor={profitMargin > 30 ? '#52c41a' : profitMargin > 15 ? '#faad14' : '#ff4d4f'}
                  status={profitMargin > 0 ? 'active' : 'exception'}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Ganancia potencial: ${(totalValue - totalCost).toLocaleString('es-CL')}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BarcodeOutlined />
                <span>Distribución por Categoría</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              {Object.entries(categoriesCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, count]) => (
                  <div key={category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text>{category}</Text>
                      <Text strong>{count} productos</Text>
                    </div>
                    <Progress 
                      percent={(count / total) * 100}
                      showInfo={false}
                      strokeColor="#1890ff"
                      style={{ marginBottom: 8 }}
                    />
                  </div>
                ))}
              
              {Object.keys(categoriesCount).length > 5 && (
                <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
                  + {Object.keys(categoriesCount).length - 5} categorías más
                </Text>
              )}

              {Object.keys(categoriesCount).length === 0 && (
                <Text type="secondary">No hay datos de categorías</Text>
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Productos más valiosos */}
      {mostValuableProducts && mostValuableProducts.length > 0 && (
        <Card 
          title={
            <Space>
              <DollarOutlined />
              <span>Productos de Mayor Valor en Stock</span>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {mostValuableProducts.slice(0, 5).map((product, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space>
                    <Text strong style={{ fontSize: 16 }}>#{index + 1}</Text>
                    <Text>{product.name}</Text>
                  </Space>
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                    ${product.value.toLocaleString('es-CL')}
                  </Text>
                </div>
                {index < mostValuableProducts.length - 1 && <Divider style={{ margin: '8px 0' }} />}
              </div>
            ))}
          </Space>
        </Card>
      )}
    </Space>
  );
};

export default InventoryStats;