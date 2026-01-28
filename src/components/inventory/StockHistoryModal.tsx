import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Typography, Space, Spin, Empty } from 'antd';
import { 
  ClockCircleOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  SyncOutlined,
  HistoryOutlined 
} from '@ant-design/icons';
import { inventoryApi, Product, StockMovement } from '@api/inventory.api';
import dayjs from 'dayjs';

const { Text } = Typography;

interface StockHistoryModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ open, product, onClose }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (open && product) {
      loadMovements();
    }
  }, [open, product, pagination.current]);

  const loadMovements = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      const data = await inventoryApi.getMovements(product._id, {
        page: pagination.current,
        limit: pagination.pageSize,
      });
      setMovements(data.movements || []);
      setPagination({
        ...pagination,
        total: data.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Error loading movements');
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    const icons = {
      entrada: <ArrowUpOutlined style={{ color: '#52c41a', fontSize: 16 }} />,
      salida: <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />,
      ajuste: <SyncOutlined style={{ color: '#1890ff', fontSize: 16 }} />
    };
    return icons[type as keyof typeof icons];
  };

  const getMovementTag = (type: string) => {
    const config = {
      entrada: { color: 'green', text: 'ENTRADA' },
      salida: { color: 'red', text: 'SALIDA' },
      ajuste: { color: 'blue', text: 'AJUSTE' }
    };
    const { color, text } = config[type as keyof typeof config] || { color: 'default', text: type };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          <div>
            <div>
              <Text strong style={{ fontSize: 13 }}>
                {dayjs(date).format('DD/MM/YYYY')}
              </Text>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {dayjs(date).format('HH:mm:ss')}
              </Text>
            </div>
          </div>
        </Space>
      ),
      sorter: (a: StockMovement, b: StockMovement) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 140,
      render: (type: string) => (
        <Space>
          {getMovementIcon(type)}
          {getMovementTag(type)}
        </Space>
      ),
      filters: [
        { text: 'Entrada', value: 'entrada' },
        { text: 'Salida', value: 'salida' },
        { text: 'Ajuste', value: 'ajuste' },
      ],
      onFilter: (value: any, record: StockMovement) => record.type === value,
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 110,
      align: 'center' as const,
      render: (quantity: number, record: StockMovement) => {
        const color = 
          record.type === 'entrada' ? '#52c41a' : 
          record.type === 'salida' ? '#ff4d4f' : 
          '#1890ff';
        const prefix = 
          record.type === 'entrada' ? '+' : 
          record.type === 'salida' ? '-' : 
          '=';
        
        return (
          <Text 
            strong 
            style={{ 
              color,
              fontSize: 15,
              fontWeight: 600
            }}
          >
            {prefix}{quantity}
          </Text>
        );
      },
      sorter: (a: StockMovement, b: StockMovement) => a.quantity - b.quantity,
    },
    {
      title: 'Motivo',
      dataIndex: 'reason',
      key: 'reason',
      render: (reason: string) => reason || <Text type="secondary">-</Text>
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes ? (
        <Text style={{ fontSize: 12 }}>{notes}</Text>
      ) : (
        <Text type="secondary">-</Text>
      )
    }
  ];

  const handleTableChange = (newPagination: any) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total,
    });
  };

  return (
    <Modal
      title={
        <Space size="middle">
          <HistoryOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              Historial de Movimientos
            </div>
            <div style={{ fontSize: 13, fontWeight: 400, color: '#8c8c8c' }}>
              {product?.name}
            </div>
          </div>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1000}
      footer={null}
      style={{ top: 20 }}
    >
      {product && (
        <div style={{ 
          marginBottom: 16, 
          padding: 12, 
          background: '#f5f5f5', 
          borderRadius: 8 
        }}>
          <Space size="large">
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Stock Actual</Text>
              <div>
                <Text strong style={{ fontSize: 18 }}>
                  {product.stock} unidades
                </Text>
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Stock Mínimo</Text>
              <div>
                <Text strong style={{ fontSize: 18 }}>
                  {product.minStock} unidades
                </Text>
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Total de Movimientos</Text>
              <div>
                <Text strong style={{ fontSize: 18 }}>
                  {pagination.total}
                </Text>
              </div>
            </div>
          </Space>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Cargando historial...</Text>
          </div>
        </div>
      ) : movements.length === 0 ? (
        <Empty 
          description="No hay movimientos registrados para este producto"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={movements}
          rowKey="_id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} movimientos`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={handleTableChange}
          size="middle"
          scroll={{ x: 800 }}
        />
      )}
    </Modal>
  );
};

export default StockHistoryModal;