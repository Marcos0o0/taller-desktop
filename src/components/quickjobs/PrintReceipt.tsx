import React from 'react';
import { Modal, Button, Space, Divider, Typography } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

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

interface PrintReceiptProps {
  record: QuickJobRecord | null;
  open: boolean;
  onClose: () => void;
}

const PrintReceipt: React.FC<PrintReceiptProps> = ({ record, open, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  if (!record) return null;

  return (
    <Modal
      title="Vista Previa de Recibo"
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
          Cerrar
        </Button>,
        <Button key="print" type="primary" onClick={handlePrint} icon={<PrinterOutlined />}>
          Imprimir
        </Button>,
      ]}
    >
      <div id="receipt-content" style={{ padding: '20px' }}>
        {/* Header del Taller */}
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
            TALLER PORTEZUELO
          </Title>
          <Text type="secondary">Servicios Automotrices</Text>
          <br />
          <Text type="secondary">Teléfono: +56 9 XXXX XXXX</Text>
          <br />
          <Text type="secondary">Dirección del Taller</Text>
        </div>

        <Divider style={{ borderColor: '#d9d9d9', borderWidth: 2 }} />

        {/* Información del Recibo */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong>RECIBO N°:</Text>
            <Text>{record._id.slice(-8).toUpperCase()}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong>FECHA:</Text>
            <Text>{dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text strong>SERVICIO:</Text>
            <Text>{record.jobName}</Text>
          </div>
        </div>

        <Divider />

        {/* Información del Cliente */}
        {(record.clientInfo || record.vehicleInfo) && (
          <>
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
                DATOS DEL CLIENTE
              </Text>
              {record.clientInfo && (
                <div style={{ marginBottom: 4 }}>
                  <Text>Cliente: {record.clientInfo}</Text>
                </div>
              )}
              {record.vehicleInfo && (
                <div>
                  <Text>Vehículo: {record.vehicleInfo}</Text>
                </div>
              )}
            </div>
            <Divider />
          </>
        )}

        {/* Detalles del Servicio */}
        <div style={{ marginBottom: 20 }}>
          <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 12 }}>
            DETALLE DEL SERVICIO
          </Text>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d9d9d9' }}>
                <th style={{ textAlign: 'left', padding: '8px 0' }}>Concepto</th>
                <th style={{ textAlign: 'center', padding: '8px 0' }}>Cant.</th>
                <th style={{ textAlign: 'right', padding: '8px 0' }}>P. Unit.</th>
                <th style={{ textAlign: 'right', padding: '8px 0' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {/* Mano de Obra */}
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 0' }}>
                  <Text>Mano de Obra - {record.jobName}</Text>
                </td>
                <td style={{ textAlign: 'center', padding: '8px 0' }}>1</td>
                <td style={{ textAlign: 'right', padding: '8px 0' }}>
                  ${record.laborCost.toLocaleString('es-CL')}
                </td>
                <td style={{ textAlign: 'right', padding: '8px 0' }}>
                  <Text strong>${record.laborCost.toLocaleString('es-CL')}</Text>
                </td>
              </tr>

              {/* Repuestos */}
              {record.selectedParts &&
                record.selectedParts.map((part, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 0' }}>
                      <Text>{part.productName}</Text>
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px 0' }}>{part.quantity}</td>
                    <td style={{ textAlign: 'right', padding: '8px 0' }}>
                      ${part.price.toLocaleString('es-CL')}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 0' }}>
                      <Text strong>${(part.price * part.quantity).toLocaleString('es-CL')}</Text>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Divider />

        {/* Totales */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>Subtotal Mano de Obra:</Text>
            <Text>${record.laborCost.toLocaleString('es-CL')}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text>Subtotal Repuestos:</Text>
            <Text>${record.partsCost.toLocaleString('es-CL')}</Text>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '12px',
              background: '#f5f5f5',
              borderRadius: 8,
            }}
          >
            <Text strong style={{ fontSize: 18 }}>
              TOTAL A PAGAR:
            </Text>
            <Text strong style={{ fontSize: 20, color: '#52c41a' }}>
              ${record.totalCost.toLocaleString('es-CL')}
            </Text>
          </div>
        </div>

        {/* Notas */}
        {record.notes && (
          <>
            <Divider />
            <div style={{ marginBottom: 20 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                OBSERVACIONES:
              </Text>
              <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4 }}>
                <Text>{record.notes}</Text>
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <Divider />
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Gracias por su preferencia
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>
            Este documento es un comprobante de servicio
          </Text>
        </div>
      </div>

      {/* Estilos de impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
          
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </Modal>
  );
};

export default PrintReceipt;