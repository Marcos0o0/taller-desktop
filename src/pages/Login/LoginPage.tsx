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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              margin: '0 auto',
            }}
          >
            <ToolOutlined style={{ fontSize: 40, color: 'white' }} />
          </div>

          <div>
            <Title level={2} style={{ margin: 0 }}>
              Taller Mecánico
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Sistema de Gestión Integral
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
            username: 'admin',
            password: 'admin123',
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
              style={{ height: 48, fontSize: 16 }}
            >
              Iniciar Sesión
            </Button>
          </Form.Item>
        </Form>

        {/* Footer */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Sistema desarrollado para gestión de talleres automotrices
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
