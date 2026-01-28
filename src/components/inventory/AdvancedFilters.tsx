import React from 'react';
import { Card, Space, Select, Input, Slider, DatePicker, Row, Col, Button, Typography } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface AdvancedFiltersProps {
  searchText: string;
  categoryFilter: string;
  stockFilter: string;
  priceRange: [number, number];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStockFilterChange: (value: string) => void;
  onPriceRangeChange: (value: [number, number]) => void;
  onClear: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  searchText,
  categoryFilter,
  stockFilter,
  priceRange,
  onSearchChange,
  onCategoryChange,
  onStockFilterChange,
  onPriceRangeChange,
  onClear,
}) => {
  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          <span>Filtros de Búsqueda</span>
        </Space>
      }
      extra={
        <Button 
          icon={<ClearOutlined />} 
          onClick={onClear}
          type="link"
        >
          Limpiar Filtros
        </Button>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* Búsqueda principal */}
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>
            Búsqueda General
          </Text>
          <Input.Search
            placeholder="Buscar por código, nombre o descripción..."
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchText}
            onSearch={onSearchChange}
            onChange={(e) => {
              if (!e.target.value) {
                onSearchChange('');
              }
            }}
          />
        </div>

        {/* Filtros de categoría y stock */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Categoría
              </Text>
              <Select
                value={categoryFilter}
                onChange={onCategoryChange}
                style={{ width: '100%' }}
                size="large"
              >
                <Select.Option value="all">Todas las categorías</Select.Option>
                <Select.Option value="repuestos">🔩 Repuestos</Select.Option>
                <Select.Option value="lubricantes">🛢️ Lubricantes</Select.Option>
                <Select.Option value="filtros">🔍 Filtros</Select.Option>
                <Select.Option value="frenos">🛑 Frenos</Select.Option>
                <Select.Option value="suspension">⚙️ Suspensión</Select.Option>
                <Select.Option value="electrico">⚡ Eléctrico</Select.Option>
                <Select.Option value="carroceria">🚗 Carrocería</Select.Option>
                <Select.Option value="neumaticos">⚫ Neumáticos</Select.Option>
                <Select.Option value="herramientas">🔧 Herramientas</Select.Option>
                <Select.Option value="accesorios">✨ Accesorios</Select.Option>
                <Select.Option value="consumibles">📦 Consumibles</Select.Option>
                <Select.Option value="otros">📋 Otros</Select.Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Estado de Stock
              </Text>
              <Select
                value={stockFilter}
                onChange={onStockFilterChange}
                style={{ width: '100%' }}
                size="large"
              >
                <Select.Option value="all">Todos los productos</Select.Option>
                <Select.Option value="available">Con stock disponible</Select.Option>
                <Select.Option value="low">Stock bajo</Select.Option>
                <Select.Option value="out">Sin stock</Select.Option>
              </Select>
            </div>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <div>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                Rango de Precio: ${priceRange[0].toLocaleString('es-CL')} - ${priceRange[1].toLocaleString('es-CL')}
              </Text>
              <Slider
                range
                min={0}
                max={1000000}
                step={1000}
                value={priceRange}
                onChange={onPriceRangeChange}
                tooltip={{
                  formatter: (value) => `$${value?.toLocaleString('es-CL')}`
                }}
              />
            </div>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default AdvancedFilters;