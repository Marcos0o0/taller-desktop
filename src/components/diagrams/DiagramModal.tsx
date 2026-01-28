import React, { useState } from 'react';
import {
  Modal,
  Image,
  Descriptions,
  Collapse,
  Table,
  Typography,
  Space,
  Tag,
  Button,
  Divider,
} from 'antd';
import {
  ZoomInOutlined,
  PrinterOutlined,
  DownloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { ElectricalDiagram, FusePosition } from '@types/diagrams.types';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface DiagramModalProps {
  open: boolean;
  diagram: ElectricalDiagram | null;
  onClose: () => void;
}

const DiagramModal: React.FC<DiagramModalProps> = ({ open, diagram, onClose }) => {
  const [activeSection, setActiveSection] = useState<string[]>(['section-0']);

  if (!diagram) return null;

  const getFuseColorTag = (color?: string) => {
    const colorMap: Record<string, string> = {
      rojo: 'red',
      azul: 'blue',
      amarillo: 'gold',
      verde: 'green',
      naranja: 'orange',
      morado: 'purple',
      gris: 'default',
    };

    return (
      <Tag color={colorMap[color?.toLowerCase() || ''] || 'default'}>
        {color || 'N/A'}
      </Tag>
    );
  };

  const fuseColumns = [
    {
      title: 'Posición',
      dataIndex: 'position',
      key: 'position',
      width: 100,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Amperaje',
      dataIndex: 'amperage',
      key: 'amperage',
      width: 100,
      render: (amp: number) => (
        <Space>
          <ThunderboltOutlined style={{ color: '#faad14' }} />
          <Text>{amp}A</Text>
        </Space>
      ),
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (color: string) => getFuseColorTag(color),
    },
    {
      title: 'Función',
      dataIndex: 'function',
      key: 'function',
      render: (text: string) => <Text>{text}</Text>,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implementar descarga de PDF
    console.log('Descargar diagrama');
  };

  return (
    <Modal
      title={
        <Space>
          <ThunderboltOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          <span>{diagram.title}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width="90%"
      style={{ top: 20 }}
      footer={[
        <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>
          Imprimir
        </Button>,
        <Button key="download" icon={<DownloadOutlined />} onClick={handleDownload}>
          Descargar PDF
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Cerrar
        </Button>,
      ]}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Información general */}
        <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="Año">{diagram.year}</Descriptions.Item>
          <Descriptions.Item label="Fuente">{diagram.source || 'N/A'}</Descriptions.Item>
        </Descriptions>

        {diagram.description && (
          <>
            <Divider />
            <Paragraph>{diagram.description}</Paragraph>
          </>
        )}

        <Divider>Cajas de Fusibles</Divider>

        {/* Secciones de fusibles */}
        <Collapse
          activeKey={activeSection}
          onChange={(keys) => setActiveSection(keys as string[])}
          defaultActiveKey={['section-0']}
        >
          {diagram.fuseBoxSections.map((section, index) => (
            <Panel
              header={
                <Space>
                  <ThunderboltOutlined />
                  <Text strong style={{ fontSize: 16 }}>
                    {section.name}
                  </Text>
                  <Tag color="blue">{section.fuses.length} fusibles</Tag>
                </Space>
              }
              key={`section-${index}`}
            >
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Ubicación */}
                <div>
                  <Text type="secondary">📍 Ubicación: </Text>
                  <Text>{section.location}</Text>
                </div>

                {/* Imagen del diagrama */}
                <div style={{ textAlign: 'center', background: '#f5f5f5', padding: '16px' }}>
                  <Image
                    src={section.imageUrl}
                    alt={section.name}
                    style={{ maxWidth: '100%' }}
                    preview={{
                      mask: (
                        <Space direction="vertical" align="center">
                          <ZoomInOutlined style={{ fontSize: 24 }} />
                          <Text style={{ color: 'white' }}>Click para ampliar</Text>
                        </Space>
                      ),
                    }}
                  />
                </div>

                {/* Tabla de fusibles */}
                <Table
                  columns={fuseColumns}
                  dataSource={section.fuses}
                  rowKey="position"
                  pagination={false}
                  size="small"
                  bordered
                />
              </Space>
            </Panel>
          ))}
        </Collapse>

        {/* Notas adicionales */}
        {diagram.notes && (
          <>
            <Divider />
            <div
              style={{
                padding: '12px',
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: '4px',
              }}
            >
              <Space direction="vertical">
                <Text strong>⚠️ Notas Importantes:</Text>
                <Text>{diagram.notes}</Text>
              </Space>
            </div>
          </>
        )}

        {/* Imágenes adicionales */}
        {diagram.additionalImages && diagram.additionalImages.length > 0 && (
          <>
            <Divider>Imágenes Adicionales</Divider>
            <Space wrap size="middle">
              {diagram.additionalImages.map((img, index) => (
                <div key={index}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    {img.title}
                  </Text>
                  <Image
                    src={img.url}
                    alt={img.title}
                    width={200}
                    preview
                  />
                  {img.description && (
                    <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
                      {img.description}
                    </Text>
                  )}
                </div>
              ))}
            </Space>
          </>
        )}
      </Space>
    </Modal>
  );
};

export default DiagramModal;
