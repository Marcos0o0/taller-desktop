import React, { useState, useEffect } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Button,
  Space,
  Breadcrumb,
  Spin,
  Empty,
  List,
  Tag,
  Input,
  message,
  Alert,
} from 'antd';
import {
  ArrowLeftOutlined,
  SearchOutlined,
  CarOutlined,
  ThunderboltOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { diagramsApi } from '@api/diagrams.api';
import { CarBrand, CarModel, ElectricalDiagram } from '@types/diagrams.types';
import BrandCard from '@components/diagrams/BrandCard';
import DiagramModal from '@components/diagrams/DiagramModal';

const { Title, Text } = Typography;

type ViewMode = 'brands' | 'models' | 'years';

const FuseDiagramsViewer: React.FC = () => {
  // Estados
  const [viewMode, setViewMode] = useState<ViewMode>('brands');
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<CarBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState<CarModel | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [diagram, setDiagram] = useState<ElectricalDiagram | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [diagramModalOpen, setDiagramModalOpen] = useState(false);

  // Cargar marcas al montar
  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const brandsData = await diagramsApi.getBrands();
      setBrands(brandsData);
    } catch (error) {
      message.error('Error al cargar marcas');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandClick = async (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;

    setSelectedBrand(brand);
    setLoading(true);
    try {
      const modelsData = await diagramsApi.getModelsByBrand(brandId);
      setModels(modelsData);
      setViewMode('models');
    } catch (error) {
      message.error('Error al cargar modelos');
    } finally {
      setLoading(false);
    }
  };

  const handleModelClick = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (!model) return;

    setSelectedModel(model);
    setViewMode('years');
  };

  const handleYearClick = async (year: number) => {
    if (!selectedBrand || !selectedModel) return;

    setSelectedYear(year);
    setLoading(true);
    try {
      const diagramData = await diagramsApi.getDiagram(
        selectedBrand.id,
        selectedModel.id,
        year
      );

      if (diagramData) {
        setDiagram(diagramData);
        setDiagramModalOpen(true);
      } else {
        message.warning('No hay diagrama disponible para este año');
      }
    } catch (error) {
      message.error('Error al cargar diagrama');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (viewMode === 'years') {
      setViewMode('models');
      setSelectedModel(null);
      setSelectedYear(null);
    } else if (viewMode === 'models') {
      setViewMode('brands');
      setSelectedBrand(null);
      setModels([]);
    }
  };

  const handleReset = () => {
    setViewMode('brands');
    setSelectedBrand(null);
    setSelectedModel(null);
    setSelectedYear(null);
    setModels([]);
  };

  // Filtrar marcas por búsqueda
  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Filtrar modelos por búsqueda
  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          {viewMode !== 'brands' && (
            <Button icon={<ArrowLeftOutlined />} onClick={handleBack} size="large">
              Volver
            </Button>
          )}
          <Title level={2} style={{ margin: 0 }}>
            <Space>
              <ThunderboltOutlined />
              Diagramas Eléctricos
            </Space>
          </Title>
        </Space>
      </div>

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          {
            title: (
              <a onClick={handleReset}>
                <HomeOutlined /> Marcas
              </a>
            ),
          },
          ...(selectedBrand
            ? [
                {
                  title: (
                    <a onClick={() => setViewMode('models')}>
                      <CarOutlined /> {selectedBrand.name}
                    </a>
                  ),
                },
              ]
            : []),
          ...(selectedModel
            ? [
                {
                  title: selectedModel.name,
                },
              ]
            : []),
          ...(selectedYear
            ? [
                {
                  title: selectedYear.toString(),
                },
              ]
            : []),
        ]}
      />

      {/* Info */}
      <Alert
        message="Base de Datos de Diagramas Eléctricos"
        description="Encuentra diagramas de fusibles, relés y sistemas eléctricos organizados por marca, modelo y año."
        type="info"
        showIcon
        icon={<ThunderboltOutlined />}
      />

      {/* Búsqueda */}
      <Card>
        <Input
          placeholder={`Buscar ${viewMode === 'brands' ? 'marca' : 'modelo'}...`}
          prefix={<SearchOutlined />}
          size="large"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ maxWidth: 500 }}
        />
      </Card>

      {/* Contenido según modo de vista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* Vista de Marcas */}
          {viewMode === 'brands' && (
            <Row gutter={[16, 16]}>
              {filteredBrands.length === 0 ? (
                <Col span={24}>
                  <Empty description="No se encontraron marcas" />
                </Col>
              ) : (
                filteredBrands.map((brand) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={brand.id}>
                    <BrandCard brand={brand} onClick={handleBrandClick} />
                  </Col>
                ))
              )}
            </Row>
          )}

          {/* Vista de Modelos */}
          {viewMode === 'models' && (
            <Card title={`Modelos de ${selectedBrand?.name}`}>
              {filteredModels.length === 0 ? (
                <Empty description="No se encontraron modelos" />
              ) : (
                <Row gutter={[16, 16]}>
                  {filteredModels.map((model) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={model.id}>
                      <Card
                        hoverable
                        onClick={() => handleModelClick(model.id)}
                        bodyStyle={{ textAlign: 'center', padding: '24px' }}
                      >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                          <CarOutlined style={{ fontSize: 48, color: '#1890ff' }} />
                          <Text strong style={{ fontSize: 16 }}>
                            {model.name}
                          </Text>
                          <Tag color="blue">
                            {model.years.length} {model.years.length === 1 ? 'año' : 'años'}
                          </Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {Math.min(...model.years)} - {Math.max(...model.years)}
                          </Text>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Card>
          )}

          {/* Vista de Años */}
          {viewMode === 'years' && selectedModel && (
            <Card
              title={`${selectedBrand?.name} ${selectedModel.name} - Selecciona el Año`}
            >
              <List
                grid={{
                  gutter: 16,
                  xs: 2,
                  sm: 3,
                  md: 4,
                  lg: 6,
                  xl: 8,
                  xxl: 10,
                }}
                dataSource={selectedModel.years.sort((a, b) => b - a)}
                renderItem={(year) => (
                  <List.Item>
                    <Card
                      hoverable
                      onClick={() => handleYearClick(year)}
                      bodyStyle={{
                        textAlign: 'center',
                        padding: '20px',
                      }}
                    >
                      <Text strong style={{ fontSize: 18 }}>
                        {year}
                      </Text>
                    </Card>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </>
      )}

      {/* Modal de diagrama */}
      <DiagramModal
        open={diagramModalOpen}
        diagram={diagram}
        onClose={() => {
          setDiagramModalOpen(false);
          setDiagram(null);
        }}
      />
    </Space>
  );
};

export default FuseDiagramsViewer;