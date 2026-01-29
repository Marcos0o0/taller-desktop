import React from 'react';
import { Typography, Button, Space, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { quotesApi } from '@api/quotes.api';
import QuoteForm from '@/components/quotes/QuoteFormUX';

const { Title } = Typography;

const NewQuote: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const newQuote = await quotesApi.create(values);
      message.success('Presupuesto creado exitosamente');
      navigate(`/presupuestos/${newQuote._id}`);
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || 'Error al crear presupuesto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/presupuestos')}>
            Volver
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            Nuevo Presupuesto
          </Title>
        </Space>
      </div>

      {/* Formulario */}
      <QuoteForm onSubmit={handleSubmit} loading={loading} />
    </Space>
  );
};

export default NewQuote;
