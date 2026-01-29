import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Row,
  Col,
  Space,
  Tag,
  Button,
  message,
  Statistic,
  Spin,
} from 'antd';
import {
  ToolOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import QuickJobModal from '@components/quickjobs/QuickJobModal';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

// SVG Icons como componentes
const OilIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M12 2v20M6 6h12M6 18h12M8 10h8M8 14h8" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const BrakeIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
  </svg>
);

const FilterIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M4 4h16v2.172a2 2 0 01-.586 1.414l-5 5A2 2 0 0014 13.828V20l-4-2v-4.172a2 2 0 00-.586-1.414l-5-5A2 2 0 014 6.172V4z" strokeWidth="2"/>
  </svg>
);

const BatteryIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <rect x="2" y="7" width="18" height="12" rx="2" strokeWidth="2"/>
    <path d="M20 10h2v4h-2M6 11h4M8 9v4" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const AlignmentIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="7" cy="17" r="3" strokeWidth="2"/>
    <circle cx="17" cy="17" r="3" strokeWidth="2"/>
    <path d="M7 14V7l10 0v7M12 7V3" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TireIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="9" strokeWidth="2"/>
    <circle cx="12" cy="12" r="5" strokeWidth="2"/>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SparkPlugIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M10 2h4v6h-4V2zM9 8h6v3H9V8z" strokeWidth="2"/>
    <path d="M11 11h2v8h-2v-8zM8 19h8v2H8v-2z" strokeWidth="2"/>
    <path d="M7 14l5-3 5 3" strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

const BeltIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="7" cy="12" r="4" strokeWidth="2"/>
    <circle cx="17" cy="12" r="4" strokeWidth="2"/>
    <path d="M7 8c5 0 5 8 10 8M7 16c5 0 5-8 10-8" strokeWidth="2"/>
  </svg>
);

// Definición de trabajos rápidos comunes
const QUICK_JOBS = [
  {
    id: 'oil-change',
    name: 'Cambio de Aceite',
    icon: <OilIcon />,
    description: 'Cambio de aceite motor + filtro',
    laborCost: 15000,
    requiredParts: [
      { category: 'lubricantes', name: 'Aceite Motor', quantity: 1 },
      { category: 'filtros', filterType: 'Aceite', name: 'Filtro de Aceite', quantity: 1 },
    ],
  },
  {
    id: 'brake-change',
    name: 'Cambio de Frenos',
    icon: <BrakeIcon />,
    description: 'Pastillas o zapatas de freno',
    laborCost: 25000,
    requiredParts: [
      { category: 'frenos', brakeType: 'Pastillas', name: 'Pastillas de Freno', quantity: 1 },
    ],
  },
  {
    id: 'filters',
    name: 'Cambio de Filtros',
    icon: <FilterIcon />,
    description: 'Filtros de aire, aceite y combustible',
    laborCost: 12000,
    requiredParts: [
      { category: 'filtros', filterType: 'Aire', name: 'Filtro de Aire', quantity: 1 },
      { category: 'filtros', filterType: 'Aceite', name: 'Filtro de Aceite', quantity: 1 },
      { category: 'filtros', filterType: 'Combustible', name: 'Filtro de Combustible', quantity: 1 },
    ],
  },
  {
    id: 'battery',
    name: 'Cambio de Batería',
    icon: <BatteryIcon />,
    description: 'Instalación de batería nueva',
    laborCost: 8000,
    requiredParts: [
      { category: 'electrico', electricType: 'Batería', name: 'Batería', quantity: 1 },
    ],
  },
  {
    id: 'alignment',
    name: 'Alineación',
    icon: <AlignmentIcon />,
    description: 'Alineación de ruedas',
    laborCost: 18000,
    requiredParts: [],
  },
  {
    id: 'tire-change',
    name: 'Cambio de Neumáticos',
    icon: <TireIcon />,
    description: 'Montaje y balanceo incluido',
    laborCost: 12000,
    requiredParts: [
      { category: 'neumaticos', name: 'Neumático', quantity: 4 },
    ],
  },
  {
    id: 'spark-plugs',
    name: 'Cambio de Bujías',
    icon: <SparkPlugIcon />,
    description: 'Bujías nuevas + limpieza',
    laborCost: 15000,
    requiredParts: [
      { category: 'electrico', electricType: 'Bujía', name: 'Bujías', quantity: 4 },
    ],
  },
  {
    id: 'timing-belt',
    name: 'Cambio de Correa',
    icon: <BeltIcon />,
    description: 'Correa de distribución o alternador',
    laborCost: 45000,
    requiredParts: [
      { category: 'repuestos', partType: 'Correa', name: 'Correa de Distribución', quantity: 1 },
    ],
  },
];

interface QuickJobRecord {
  _id: string;
  jobId: string;
  jobName: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  clientInfo?: string;
  vehicleInfo?: string;
  createdAt: string;
}

const QuickJobsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [stats, setStats] = useState({
    todayJobs: 0,
    todayRevenue: 0,
    weekJobs: 0,
  });
  const [loading, setLoading] = useState(false);
  const [jobRecords, setJobRecords] = useState<QuickJobRecord[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    // Cargar desde localStorage por ahora
    const records = getJobRecords();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    
    const todayJobs = records.filter(r => {
      const recordDate = new Date(r.createdAt);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime();
    });
    
    const weekJobs = records.filter(r => {
      const recordDate = new Date(r.createdAt);
      return recordDate >= weekAgo;
    });
    
    setStats({
      todayJobs: todayJobs.length,
      todayRevenue: todayJobs.reduce((sum, r) => sum + r.totalCost, 0),
      weekJobs: weekJobs.length,
    });
    
    setJobRecords(records);
  };

  const getJobRecords = (): QuickJobRecord[] => {
    try {
      const stored = localStorage.getItem('quickJobRecords');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  };

  const saveJobRecord = (record: Omit<QuickJobRecord, '_id' | 'createdAt'>) => {
    const records = getJobRecords();
    const newRecord: QuickJobRecord = {
      ...record,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    records.push(newRecord);
    localStorage.setItem('quickJobRecords', JSON.stringify(records));
    setJobRecords(records);
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const handleJobComplete = (completedJobData: any) => {
    // Guardar registro del trabajo
    saveJobRecord({
      jobId: selectedJob.id,
      jobName: selectedJob.name,
      laborCost: selectedJob.laborCost,
      partsCost: completedJobData.partsCost || 0,
      totalCost: completedJobData.totalCost || selectedJob.laborCost,
      clientInfo: completedJobData.clientInfo,
      vehicleInfo: completedJobData.vehicleInfo,
    });
    
    message.success('✅ Trabajo registrado exitosamente');
    setModalOpen(false);
    setSelectedJob(null);
    loadStats();
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <Space>
            <ThunderboltOutlined />
            Trabajos Rápidos
          </Space>
        </Title>
        <Button
          icon={<HistoryOutlined />}
          size="large"
          onClick={() => navigate('/trabajos-rapidos/historial')}
        >
          Ver Historial
        </Button>
      </div>

      {/* Descripción */}
      <Card>
        <Space direction="vertical" size="small">
          <Text strong style={{ fontSize: 15 }}>
            ⚡ Servicios Express - Sin Presupuesto
          </Text>
          <Text type="secondary">
            Para trabajos comunes que no requieren presupuesto previo. Los repuestos se descuentan
            automáticamente del inventario.
          </Text>
        </Space>
      </Card>

      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Trabajos Hoy"
              value={stats.todayJobs}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 32 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ingresos Hoy"
              value={stats.todayRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 32 }}
              suffix="CLP"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Trabajos Esta Semana"
              value={stats.weekJobs}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: 32 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Grid de Trabajos Rápidos */}
      <Row gutter={[16, 16]}>
        {QUICK_JOBS.map((job) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={job.id}>
            <Card
              hoverable
              onClick={() => handleJobClick(job)}
              style={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              bodyStyle={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                padding: '24px',
              }}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%', flex: 1 }}>
                {/* Icono y nombre */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#1890ff', marginBottom: 12 }}>
                    {job.icon}
                  </div>
                  <Text strong style={{ fontSize: 16, display: 'block' }}>
                    {job.name}
                  </Text>
                </div>

                {/* Descripción */}
                <Text 
                  type="secondary" 
                  style={{ 
                    fontSize: 13, 
                    textAlign: 'center',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {job.description}
                </Text>

                {/* Precio de mano de obra */}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px',
                    background: '#f5f5f5',
                    borderRadius: 8,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                    Mano de obra
                  </Text>
                  <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                    ${job.laborCost.toLocaleString('es-CL')}
                  </Text>
                </div>

                {/* Tags de repuestos */}
                {job.requiredParts.length > 0 && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 6 }}>
                      Repuestos necesarios:
                    </Text>
                    <Space size={[4, 4]} wrap>
                      {job.requiredParts.map((part: any, index: number) => (
                        <Tag key={index} style={{ fontSize: 11, margin: 0 }}>
                          {part.quantity > 1 ? `${part.quantity}x ` : ''}
                          {part.name}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}

                {/* Botón */}
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ThunderboltOutlined />}
                >
                  Iniciar Servicio
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal de trabajo rápido */}
      <QuickJobModal
        open={modalOpen}
        job={selectedJob}
        onComplete={handleJobComplete}
        onCancel={() => {
          setModalOpen(false);
          setSelectedJob(null);
        }}
      />
    </Space>
  );
};

export default QuickJobsPage;