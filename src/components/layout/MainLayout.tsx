import React, { useState } from 'react';
import { Layout, Menu, Button, Typography, Avatar, Space, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  ToolOutlined,
  InboxOutlined,
  CarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  // Menú items
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/clientes',
      icon: <UserOutlined />,
      label: 'Clientes',
    },
    {
      key: '/presupuestos',
      icon: <FileTextOutlined />,
      label: 'Presupuestos',
    },
    {
      key: '/ordenes',
      icon: <ToolOutlined />,
      label: 'Órdenes de Trabajo',
    },
    {
      key: '/inventario',
      icon: <InboxOutlined />,
      label: 'Inventario',
    },
    {
      key: '/diagramas',
      icon: <CarOutlined />,
      label: 'Diagramas Eléctricos',
    },
  ];

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={260}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: token.colorBgContainer,
        }}
      >
        {/* Logo / Título */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '0 16px',
          }}
        >
          {!collapsed ? (
            <Space>
              <ToolOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
              <Text strong style={{ fontSize: 18 }}>
                Taller Mecánico
              </Text>
            </Space>
          ) : (
            <ToolOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
          )}
        </div>

        {/* Menú de navegación */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, fontSize: 15 }}
        />

        {/* Información de usuario en la parte inferior */}
        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              padding: 16,
              borderTop: `1px solid ${token.colorBorderSecondary}`,
              background: token.colorBgContainer,
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
              <Space>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <Text strong style={{ display: 'block', fontSize: 14 }}>
                    {user?.username}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {user?.role}
                  </Text>
                </div>
              </Space>
              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                block
              >
                Cerrar Sesión
              </Button>
            </Space>
          </div>
        )}
      </Sider>

      {/* Layout principal */}
      <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s' }}>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18 }}
          />

          <Space>
            <Button type="text" icon={<SettingOutlined />}>
              Configuración
            </Button>
          </Space>
        </Header>

        {/* Contenido */}
        <Content
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 280,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
