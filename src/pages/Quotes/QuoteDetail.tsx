import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Space,
  Card,
  Descriptions,
  Tag,
  Spin,
  message,
  Row,
  Col,
  Divider,
  List,
  Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  ToolOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { quotesApi } from '@api/quotes.api';
import { Quote } from '@types/api.types';
import { downloadQuotePDF, printQuotePDF } from '@utils/quotePdfGenerator';

const { Title, Text } = Typography;

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  // 🔧 Función helper para parsear proposedWork (maneja JSON y texto plano)
  const parseProposedWork = (proposedWork: string) => {
    if (!proposedWork) {
      return {
        isJSON: false,
        text: 'No hay información de trabajo propuesto',
        services: [],
        parts: [],
        externalParts: [],
      };
    }

    try {
      // Intentar parsear como JSON (formato antiguo)
      const parsed = JSON.parse(proposedWork);
      return {
        isJSON: true,
        text: proposedWork,
        services: parsed.services || [],
        parts: parsed.parts || [],
        externalParts: parsed.externalParts || [],
      };
    } catch (error) {
      // Es texto plano (formato nuevo)
      console.log('proposedWork es texto plano (nuevo formato)');
      return {
        isJSON: false,
        text: proposedWork,
        services: [],
        parts: [],
        externalParts: [],
      };
    }
  };

  useEffect(() => {
    if (id) {
      loadQuote();
    }
  }, [id]);

  const loadQuote = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const quoteData = await quotesApi.getById(id);
      setQuote(quoteData);
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al cargar presupuesto');
      navigate('/presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      await quotesApi.approve(id);
      message.success('Presupuesto aprobado. Se ha creado una orden de trabajo.');
      loadQuote();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al aprobar presupuesto');
    }
  };

  const handleReject = async () => {
    if (!id) return;
    try {
      await quotesApi.reject(id);
      message.success('Presupuesto rechazado');
      loadQuote();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al rechazar presupuesto');
    }
  };

  const handleSendEmail = async () => {
    if (!id) return;
    try {
      await quotesApi.sendEmail(id);
      message.success('Presupuesto enviado por email exitosamente');
      loadQuote();
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al enviar email');
    }
  };

  const handleDownloadPDF = () => {
    if (!quote) return;

    setPdfLoading(true);
    try {
      const client = typeof quote.clientId === 'object' ? quote.clientId : null;
      
      if (!client) {
        message.error('No se puede generar PDF sin datos del cliente');
        return;
      }

      // Parsear servicios y repuestos usando la nueva función
      const proposedWorkData = parseProposedWork(quote.proposedWork);

      downloadQuotePDF({
        quote,
        client,
        services: proposedWorkData.services,
        parts: [...proposedWorkData.parts, ...proposedWorkData.externalParts],
      });

      message.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      message.error('Error al generar PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrintPDF = () => {
    if (!quote) return;

    setPdfLoading(true);
    try {
      const client = typeof quote.clientId === 'object' ? quote.clientId : null;
      
      if (!client) {
        message.error('No se puede imprimir sin datos del cliente');
        return;
      }

      // Parsear servicios y repuestos usando la nueva función
      const proposedWorkData = parseProposedWork(quote.proposedWork);

      printQuotePDF({
        quote,
        client,
        services: proposedWorkData.services,
        parts: [...proposedWorkData.parts, ...proposedWorkData.externalParts],
      });

      message.success('Abriendo vista de impresión...');
    } catch (error) {
      console.error('Error printing PDF:', error);
      message.error('Error al imprimir');
    } finally {
      setPdfLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      pending: { color: 'orange', text: 'Pendiente', icon: <MailOutlined /> },
      approved: { color: 'green', text: 'Aprobado', icon: <CheckCircleOutlined /> },
      rejected: { color: 'red', text: 'Rechazado', icon: <CloseCircleOutlined /> },
    };
    const { color, text, icon } = statusMap[status as keyof typeof statusMap];
    return (
      <Tag color={color} icon={icon} style={{ fontSize: 14, padding: '4px 12px' }}>
        {text}
      </Tag>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!quote) {
    return null;
  }

  const client = typeof quote.clientId === 'object' ? quote.clientId : null;

  // ✅ Parsear proposedWork usando la función helper
  const proposedWorkData = parseProposedWork(quote.proposedWork);
  const services = proposedWorkData.services;
  const parts = proposedWorkData.parts;
  const externalParts = proposedWorkData.externalParts;

  const subtotalServices = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const subtotalParts = parts.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);
  const subtotalExternalParts = externalParts.reduce((sum, p) => sum + (p.price || 0) * (p.quantity || 1), 0);
  
  // ✅ ARREGLO: Si proposedWork es texto plano, usar estimatedCost directamente
  let subtotal, iva, total;
  
  if (proposedWorkData.isJSON) {
    // Formato JSON: calcular desde los items
    subtotal = subtotalServices + subtotalParts + subtotalExternalParts;
    iva = Math.round(subtotal * 0.19);
    total = subtotal + iva;
  } else {
    // Formato texto: usar estimatedCost que viene del backend
    total = quote.estimatedCost;
    // Calcular hacia atrás el IVA y subtotal
    subtotal = Math.round(total / 1.19);
    iva = total - subtotal;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/presupuestos')}>
            Volver
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Presupuesto {quote.quoteNumber}
          </Title>
          {getStatusTag(quote.status)}
        </Space>

        <Space wrap>
          {/* Botones de PDF */}
          <Button
            icon={<DownloadOutlined />}
            size="large"
            onClick={handleDownloadPDF}
            loading={pdfLoading}
            style={{ background: '#52c41a', color: 'white', borderColor: '#52c41a' }}
          >
            Descargar PDF
          </Button>
          
          <Button
            icon={<PrinterOutlined />}
            size="large"
            onClick={handlePrintPDF}
            loading={pdfLoading}
          >
            Imprimir
          </Button>

          {quote.status === 'pending' && (
            <>
              <Popconfirm
                title="¿Aprobar presupuesto?"
                description="Esto creará automáticamente una orden de trabajo"
                onConfirm={handleApprove}
                okText="Sí, aprobar"
                cancelText="Cancelar"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="large"
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Aprobar
                </Button>
              </Popconfirm>
              <Popconfirm
                title="¿Rechazar presupuesto?"
                onConfirm={handleReject}
                okText="Sí, rechazar"
                cancelText="Cancelar"
              >
                <Button danger icon={<CloseCircleOutlined />} size="large">
                  Rechazar
                </Button>
              </Popconfirm>
            </>
          )}
          {!quote.emailSent && (
            <Button icon={<MailOutlined />} size="large" onClick={handleSendEmail}>
              Enviar por Email
            </Button>
          )}
        </Space>
      </div>

      {/* Información del Cliente */}
      <Card title="Información del Cliente">
        <Descriptions column={{ xs: 1, sm: 2 }} size="middle">
          <Descriptions.Item label="Nombre">
            {client ? `${client.firstName} ${client.lastName1} ${client.lastName2 || ''}` : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Teléfono">{client?.phone || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Email">
            {client?.email || 'No registrado'}
          </Descriptions.Item>
          <Descriptions.Item label="Email enviado">
            {quote.emailSent ? (
              <Tag color="blue" icon={<MailOutlined />}>
                Enviado el {new Date(quote.emailSentAt!).toLocaleDateString('es-CL')}
              </Tag>
            ) : (
              <Tag>No enviado</Tag>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Información del Vehículo */}
      <Card title="Información del Vehículo">
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="middle">
          <Descriptions.Item label="Marca">{quote.vehicle.brand}</Descriptions.Item>
          <Descriptions.Item label="Modelo">{quote.vehicle.model}</Descriptions.Item>
          <Descriptions.Item label="Año">{quote.vehicle.year}</Descriptions.Item>
          <Descriptions.Item label="Patente">
            <Tag>{quote.vehicle.licensePlate}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Kilometraje">
            {quote.vehicle.mileage.toLocaleString('es-CL')} km
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Descripción del Problema */}
      <Card title="Descripción del Problema / Solicitud">
        <Text>{quote.description}</Text>
      </Card>

      {/* Trabajo Propuesto - ACTUALIZADO para manejar ambos formatos */}
      <Card title="Trabajo Propuesto">
        {proposedWorkData.isJSON ? (
          // Formato JSON (antiguo) - Mostrar servicios y repuestos estructurados
          <>
            {/* Servicios */}
            {services.length > 0 && (
              <>
                <Title level={5}>Servicios ({services.length})</Title>
                <List
                  dataSource={services}
                  renderItem={(service: any) => (
                    <List.Item>
                      <List.Item.Meta title={service.name} description={service.description} />
                      <Text strong style={{ fontSize: 16 }}>
                        ${(service.price || 0).toLocaleString('es-CL')}
                      </Text>
                    </List.Item>
                  )}
                />
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Subtotal Servicios:</Text>
                  <Text strong style={{ fontSize: 16 }}>
                    ${subtotalServices.toLocaleString('es-CL')}
                  </Text>
                </div>
              </>
            )}

            {/* Repuestos */}
            {parts.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Repuestos ({parts.length})</Title>
                <List
                  dataSource={parts}
                  renderItem={(part: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            {part.name}
                            {part.category && <Tag>{part.category}</Tag>}
                          </Space>
                        }
                        description={part.description}
                      />
                      <div style={{ textAlign: 'right' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {part.quantity} x ${(part.price || 0).toLocaleString('es-CL')}
                          </Text>
                        </div>
                        <Text strong style={{ fontSize: 16 }}>
                          ${((part.price || 0) * (part.quantity || 1)).toLocaleString('es-CL')}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Subtotal Repuestos:</Text>
                  <Text strong style={{ fontSize: 16 }}>
                    ${subtotalParts.toLocaleString('es-CL')}
                  </Text>
                </div>
              </>
            )}

            {/* Repuestos Externos */}
            {externalParts.length > 0 && (
              <>
                <Divider />
                <Title level={5}>Repuestos Externos ({externalParts.length})</Title>
                <List
                  dataSource={externalParts}
                  renderItem={(part: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            {part.name}
                            <Tag color="orange">Externo</Tag>
                          </Space>
                        }
                        description={part.description}
                      />
                      <div style={{ textAlign: 'right' }}>
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {part.quantity} x ${(part.price || 0).toLocaleString('es-CL')}
                          </Text>
                        </div>
                        <Text strong style={{ fontSize: 16 }}>
                          ${((part.price || 0) * (part.quantity || 1)).toLocaleString('es-CL')}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Subtotal Repuestos Externos:</Text>
                  <Text strong style={{ fontSize: 16 }}>
                    ${subtotalExternalParts.toLocaleString('es-CL')}
                  </Text>
                </div>
              </>
            )}
          </>
        ) : (
          // Formato texto plano (nuevo) - Mostrar como está
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '14px',
            backgroundColor: '#fafafa',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #f0f0f0',
            margin: 0,
            lineHeight: '1.8'
          }}>
            {proposedWorkData.text}
          </pre>
        )}
      </Card>

      {/* Resumen de Costos */}
      <Card title="Resumen de Costos">
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Subtotal:</Text>
            <Text strong style={{ fontSize: 16 }}>
              ${subtotal.toLocaleString('es-CL')}
            </Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>IVA (19%):</Text>
            <Text strong style={{ fontSize: 16 }}>
              ${iva.toLocaleString('es-CL')}
            </Text>
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px',
              background: '#f0f2f5',
              borderRadius: '8px',
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              TOTAL:
            </Title>
            <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
              ${total.toLocaleString('es-CL')}
            </Title>
          </div>
        </Space>
      </Card>

      {/* Notas */}
      {quote.notes && (
        <Card title="Notas Adicionales">
          <Text>{quote.notes}</Text>
        </Card>
      )}

      {/* Información Adicional */}
      <Card>
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Fecha de creación">
            {new Date(quote.createdAt).toLocaleDateString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Descriptions.Item>
          <Descriptions.Item label="Válido hasta">
            {new Date(quote.validUntil).toLocaleDateString('es-CL', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Descriptions.Item>
          {quote.workOrder && (
            <Descriptions.Item label="Orden de Trabajo">
              <Tag color="blue" icon={<ToolOutlined />}>
                {quote.workOrder.orderNumber}
              </Tag>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </Space>
  );
};

export default QuoteDetail;