import React, { useState, useEffect } from 'react';
import { Card, Space, Select, Input, Row, Col, Button, Typography, Collapse, Form } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';
import { getSpecsForCategory, CategorySpec } from '@types/product-specifications.types';

const { Text } = Typography;
const { Panel } = Collapse;

interface AdvancedFiltersProps {
  searchText: string;
  categoryFilter: string;
  stockFilter: string;
  specificationFilters: Record<string, any>;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStockFilterChange: (value: string) => void;
  onSpecificationFiltersChange: (filters: Record<string, any>) => void;
  onClear: () => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  searchText,
  categoryFilter,
  stockFilter,
  specificationFilters,
  onSearchChange,
  onCategoryChange,
  onStockFilterChange,
  onSpecificationFiltersChange,
  onClear,
}) => {
  const [form] = Form.useForm();
  const [categorySpecs, setCategorySpecs] = useState<CategorySpec[]>([]);

  useEffect(() => {
    if (categoryFilter && categoryFilter !== 'all') {
      const specs = getSpecsForCategory(categoryFilter);
      setCategorySpecs(specs);
      
      // Resetear filtros de especificaciones cuando cambia la categoría
      form.resetFields(specs.map(s => s.field));
    } else {
      setCategorySpecs([]);
    }
  }, [categoryFilter]);

  const handleSpecificationChange = (field: string, value: any) => {
    const newFilters = { ...specificationFilters, [field]: value };
    // Remover filtros vacíos
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key] || newFilters[key] === '') {
        delete newFilters[key];
      }
    });
    onSpecificationFiltersChange(newFilters);
  };

  const renderSpecificationFilter = (spec: CategorySpec) => {
    const commonProps = {
      size: 'large' as const,
      placeholder: `Filtrar por ${spec.label}`,
      allowClear: true,
      style: { width: '100%' },
    };

    switch (spec.type) {
      case 'select':
        return (
          <Select
            {...commonProps}
            value={specificationFilters[spec.field]}
            onChange={(value) => handleSpecificationChange(spec.field, value)}
            options={[
              { value: '', label: `Todos` },
              ...(spec.options?.map(opt => ({ value: opt, label: opt })) || [])
            ]}
          />
        );
      case 'text':
      case 'number':
      default:
        return (
          <Input
            {...commonProps}
            value={specificationFilters[spec.field]}
            onChange={(e) => handleSpecificationChange(spec.field, e.target.value)}
          />
        );
    }
  };

  return (
    <Card
      title={
        <Space>
          <FilterOutlined />
          <span>Filtros de Búsqueda</span>
        </Space>
      }
      extra={
        <Button icon={<ClearOutlined />} onClick={onClear} type="link">
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

        {/* Filtros básicos */}
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
        </Row>

        {/* Filtros de especificaciones (solo si hay una categoría seleccionada) */}
        {categorySpecs.length > 0 && (
          <Collapse ghost>
            <Panel
              header={
                <Space>
                  <FilterOutlined style={{ color: '#1890ff' }} />
                  <Text strong>Filtros Específicos por Categoría</Text>
                  {Object.keys(specificationFilters).length > 0 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({Object.keys(specificationFilters).length} filtros activos)
                    </Text>
                  )}
                </Space>
              }
              key="1"
            >
              <Form form={form}>
                <Row gutter={16}>
                  {categorySpecs.map((spec) => (
                    <Col xs={24} sm={12} md={8} key={spec.field}>
                      <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                          {spec.label}
                        </Text>
                        {renderSpecificationFilter(spec)}
                      </div>
                    </Col>
                  ))}
                </Row>
              </Form>
            </Panel>
          </Collapse>
        )}
      </Space>
    </Card>
  );
};

export default AdvancedFilters;