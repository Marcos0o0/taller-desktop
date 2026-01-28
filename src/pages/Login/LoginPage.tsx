import React, { useEffect } from 'react';
import { Button, Card, Form, Input, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, ToolOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, login } = useAuthStore();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (values: { username: string; password: string }) => {
    try {
      await login(values);
      message.success('¡Bienvenido al sistema!');
      navigate('/');
    } catch (error) {
      message.error('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: `
          radial-gradient(circle at top, #3a3a3a 0%, #1c1c1c 60%),
          linear-gradient(135deg, #2b2b2b 0%, #0f0f0f 100%)
        `,
      }}
    >

      <Card
        style={{
          width: 450,
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          borderRadius: 16,
        }}
        bordered={false}
      >
        {/* Header */}
        <Space
          direction="vertical"
          size="large"
          style={{ width: '100%', textAlign: 'center', marginBottom: 24 }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #3a3a3a, #1f1f1f)',
              boxShadow: `
                inset 4px 4px 8px rgba(255,255,255,0.08),
                inset -4px -4px 8px rgba(0,0,0,0.8),
                0 8px 20px rgba(0,0,0,0.6)
              `,
              margin: '0 auto',
            }}
          >

            <ToolOutlined style={{ fontSize: 40, color: 'white' }} />
          </div>

          <div>
            <Title level={2} style={{ margin: 0 }}>
              Taller Portezuelo
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Sistema de Gestión de Taller Mecanico
            </Text>
          </div>
        </Space>

        {/* Formulario */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          size="large"
          initialValues={{
            username: 'marcos',
            password: '199616',
          }}
        >
          <Form.Item
            label="Usuario"
            name="username"
            rules={[{ required: true, message: 'Por favor ingrese su usuario' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Ingrese su usuario"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="Contraseña"
            name="password"
            rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Ingrese su contraseña"
              autoComplete="current-password"
            />
          </Form.Item>

          {error && (
            <Text type="danger" style={{ display: 'block', marginBottom: 16 }}>
              {error}
            </Text>
          )}

          <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={isLoading}
            style={{
              height: 48,
              fontSize: 16,
              borderRadius: 8,
              background: 'linear-gradient(145deg, #3a3a3a, #1f1f1f)',
              border: '1px solid #2a2a2a',
              color: '#e0e0e0',
              boxShadow: `
                inset 2px 2px 4px rgba(255,255,255,0.08),
                inset -2px -2px 4px rgba(0,0,0,0.8),
                0 8px 20px rgba(0,0,0,0.6)
              `,
            }}
          >
            Iniciar Sesión
          </Button>
          
          </Form.Item>
        </Form>

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Sistema desarrollado por Marcos Godoy
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
