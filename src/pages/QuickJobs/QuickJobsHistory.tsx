import React, { useState, useEffect } from 'react';
import {
  Typography,
  Card,
  Table,
  Space,
  Tag,
  Button,
  DatePicker,
  Select,
  Row,
  Col,
  Statistic,
  Modal,
  Descriptions,
  Divider,
} from 'antd';
import {
  HistoryOutlined,
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FilterOutlined,
  DollarOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import PrintReceipt from '@components/quickjobs/PrintReceipt';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface QuickJobRecord {
  _id: string;
  jobId: string;
  jobName: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  clientInfo?: string;
  vehicleInfo?: string;
  selectedParts?: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  notes?: string;
  createdAt: string;
}

const QuickJobsHistory: React.FC = () => {
  const [records, setRecords] = useState<QuickJobRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<QuickJobRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<QuickJobRecord | null>(null);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printRecord, setPrintRecord] = useState<QuickJobRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [records, dateRange, jobTypeFilter]);

  const loadRecords = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('quickJobRecords');
      const data: QuickJobRecord[] = stored ? JSON.parse(stored) : [];
      // Ordenar por más reciente primero
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...records];

    // Filtro por rango de fechas
    if (dateRange) {
      const [start, end] = dateRange;
      filtered = filtered.filter((record) => {
        const recordDate = dayjs(record.createdAt);
        return recordDate.isAfter(start.startOf('day')) && recordDate.isBefore(end.endOf('day'));
      });
    }

    // Filtro por tipo de trabajo
    if (jobTypeFilter !== 'all') {
      filtered = filtered.filter((record) => record.jobId === jobTypeFilter);
    }

    setFilteredRecords(filtered);
  };

  const handleViewDetails = (record: QuickJobRecord) => {
    setSelectedRecord(record);
    setDetailModalOpen(true);
  };

  const handlePrintReceipt = (record: QuickJobRecord) => {
    setPrintRecord(record);
    setPrintModalOpen(true);
  };

  const handleExport = () => {
    // Exportar a CSV
    const headers = ['Fecha', 'Trabajo', 'Cliente', 'Vehículo', 'Mano de Obra', 'Repuestos', 'Total'];
    const rows = filteredRecords.map((r) => [
      dayjs(r.createdAt).format('DD/MM/YYYY HH:mm'),
      r.jobName,
      r.clientInfo || 'Walk-in',
      r.vehicleInfo || '-',
      r.laborCost,
      r.partsCost,
      r.totalCost,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `trabajos_rapidos_${dayjs().format('YYYY-MM-DD')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular estadísticas
  const stats = {
    total: filteredRecords.length,
    totalRevenue: filteredRecords.reduce((sum, r) => sum + r.totalCost, 0),
    totalLabor: filteredRecords.reduce((sum, r) => sum + r.laborCost, 0),
    totalParts: filteredRecords.reduce((sum, r) => sum + r.partsCost, 0),
  };

  // Obtener tipos de trabajos únicos
  const jobTypes = Array.from(new Set(records.map((r) => r.jobId))).map((id) => {
    const record = records.find((r) => r.jobId === id);
    return { id, name: record?.jobName || id };
  });

  const columns: ColumnsType<QuickJobRecord> = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => (
        <Space direction="vertical" size={0}>
          <Text strong>{dayjs(date).format('DD/MM/YYYY')}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format('HH:mm')}
          </Text>
        </Space>
      ),
      sorter: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    },
    {
      title: 'Trabajo',
      dataIndex: 'jobName',
      key: 'jobName',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Cliente',
      dataIndex: 'clientInfo',
      key: 'clientInfo',
      render: (client: string) => client || <Text type="secondary">Walk-in</Text>,
    },
    {
      title: 'Vehículo',
      dataIndex: 'vehicleInfo',
      key: 'vehicleInfo',
      render: (vehicle: string) => vehicle || <Text type="secondary">-</Text>,
    },
    {
      title: 'Mano de Obra',
      dataIndex: 'laborCost',
      key: 'laborCost',
      align: 'right',
      render: (cost: number) => `$${cost.toLocaleString('es-CL')}`,
    },
    {
      title: 'Repuestos',
      dataIndex: 'partsCost',
      key: 'partsCost',
      align: 'right',
      render: (cost: number) => (
        <Text type={cost > 0 ? 'success' : 'secondary'}>
          ${cost.toLocaleString('es-CL')}
        </Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalCost',
      key: 'totalCost',
      align: 'right',
      render: (cost: number) => (
        <Text strong style={{ fontSize: 15, color: '#52c41a' }}>
          ${cost.toLocaleString('es-CL')}
        </Text>
      ),
      sorter: (a, b) => a.totalCost - b.totalCost,
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
            size="small"
          >
            Ver
          </Button>
          <Button
            type="link"
            icon={<PrinterOutlined />}
            onClick={() => handlePrintReceipt(record)}
            size="small"
          >
            Imprimir
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0 }}>
          <Space>
            <HistoryOutlined />
            Historial de Trabajos Rápidos
          </Space>
        </Title>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          disabled={filteredRecords.length === 0}
        >
          Exportar CSV
        </Button>
      </div>

      {/* Estadísticas */}
      <Row gutter={16}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Trabajos"
              value={stats.total}
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Ingresos Totales"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: 28 }}
              suffix="CLP"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Mano de Obra"
              value={stats.totalLabor}
              valueStyle={{ color: '#1890ff', fontSize: 28 }}
              suffix="CLP"
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Repuestos"
              value={stats.totalParts}
              valueStyle={{ color: '#faad14', fontSize: 28 }}
              suffix="CLP"
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Space>
                <FilterOutlined />
                <Text strong>Rango de Fechas:</Text>
              </Space>
              <RangePicker
                style={{ width: '100%', marginTop: 8 }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="DD/MM/YYYY"
                placeholder={['Fecha inicio', 'Fecha fin']}
              />
            </Col>
            <Col xs={24} md={12}>
              <Space>
                <FilterOutlined />
                <Text strong>Tipo de Trabajo:</Text>
              </Space>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={jobTypeFilter}
                onChange={setJobTypeFilter}
              >
                <Select.Option value="all">Todos los trabajos</Select.Option>
                {jobTypes.map((job) => (
                  <Select.Option key={job.id} value={job.id}>
                    {job.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
          </Row>
          
          {(dateRange || jobTypeFilter !== 'all') && (
            <Button onClick={() => { setDateRange(null); setJobTypeFilter('all'); }}>
              Limpiar Filtros
            </Button>
          )}
        </Space>
      </Card>

      {/* Tabla */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} trabajos`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      {/* Modal de Detalles */}
      <Modal
        title={
          <Space>
            <EyeOutlined />
            <span>Detalles del Trabajo</span>
          </Space>
        }
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => selectedRecord && handlePrintReceipt(selectedRecord)}
          >
            Imprimir
          </Button>,
          <Button key="close" type="primary" onClick={() => setDetailModalOpen(false)}>
            Cerrar
          </Button>,
        ]}
        width={700}
      >
        {selectedRecord && (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Fecha y Hora" span={2}>
                {dayjs(selectedRecord.createdAt).format('DD/MM/YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Trabajo" span={2}>
                <Tag color="blue" style={{ fontSize: 14 }}>
                  {selectedRecord.jobName}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cliente" span={2}>
                {selectedRecord.clientInfo || 'Cliente walk-in'}
              </Descriptions.Item>
              <Descriptions.Item label="Vehículo" span={2}>
                {selectedRecord.vehicleInfo || '-'}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Costos</Divider>

            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Mano de Obra:</Text>
                  <Text strong>${selectedRecord.laborCost.toLocaleString('es-CL')}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Repuestos:</Text>
                  <Text strong>${selectedRecord.partsCost.toLocaleString('es-CL')}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: 16 }}>TOTAL:</Text>
                  <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                    ${selectedRecord.totalCost.toLocaleString('es-CL')}
                  </Text>
                </div>
              </Space>
            </div>

            {selectedRecord.selectedParts && selectedRecord.selectedParts.length > 0 && (
              <>
                <Divider>Repuestos Utilizados</Divider>
                <Table
                  dataSource={selectedRecord.selectedParts}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: 'Producto',
                      dataIndex: 'productName',
                      key: 'productName',
                    },
                    {
                      title: 'Cantidad',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      align: 'center',
                    },
                    {
                      title: 'Precio Unit.',
                      dataIndex: 'price',
                      key: 'price',
                      align: 'right',
                      render: (price: number) => `$${price.toLocaleString('es-CL')}`,
                    },
                    {
                      title: 'Subtotal',
                      key: 'subtotal',
                      align: 'right',
                      render: (_: any, record: any) => (
                        <Text strong>
                          ${(record.price * record.quantity).toLocaleString('es-CL')}
                        </Text>
                      ),
                    },
                  ]}
                />
              </>
            )}

            {selectedRecord.notes && (
              <>
                <Divider>Notas</Divider>
                <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                  <Text>{selectedRecord.notes}</Text>
                </div>
              </>
            )}
          </Space>
        )}
      </Modal>

      {/* Modal de Impresión */}
      <PrintReceipt
        record={printRecord}
        open={printModalOpen}
        onClose={() => {
          setPrintModalOpen(false);
          setPrintRecord(null);
        }}
      />
    </Space>
  );
};

export default QuickJobsHistory;