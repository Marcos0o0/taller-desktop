import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, List, Avatar, Space, Typography, Tag, Empty } from 'antd';
import { UserOutlined, PhoneOutlined, IdcardOutlined, SearchOutlined } from '@ant-design/icons';
import { Client } from '@types/api.types';
import { clientsApi } from '@api/clients.api';

const { Text } = Typography;

interface QuickSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (client: Client) => void;
}

const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ visible, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      loadClients();
      // Focus en el input cuando se abre el modal
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchTerm('');
      setFilteredClients([]);
    }
  }, [visible]);

  useEffect(() => {
    filterClients();
  }, [searchTerm, clients]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await clientsApi.list({ limit: 200 });
      setClients(response.clients);
      setFilteredClients(response.clients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    if (!searchTerm.trim()) {
      setFilteredClients(clients);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = clients.filter((client) => {
      const fullName = `${client.firstName} ${client.lastName1} ${client.lastName2 || ''}`.toLowerCase();
      const phone = client.phone.replace(/\D/g, '');
      const rut = client.rut.replace(/\D/g, '');
      const searchPhone = term.replace(/\D/g, '');

      return (
        fullName.includes(term) ||
        phone.includes(searchPhone) ||
        rut.includes(term) ||
        client.email.toLowerCase().includes(term)
      );
    });

    setFilteredClients(filtered);
  };

  const handleSelect = (client: Client) => {
    onSelect(client);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    // Si hay solo un resultado y presiona Enter
    if (e.key === 'Enter' && filteredClients.length === 1) {
      handleSelect(filteredClients[0]);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SearchOutlined />
          <span>Búsqueda Rápida de Clientes</span>
          <Tag color="blue">Ctrl+K</Tag>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      bodyStyle={{ maxHeight: '60vh', overflow: 'auto' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Input
          ref={inputRef}
          size="large"
          placeholder="Buscar por nombre, teléfono, RUT o email..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          allowClear
        />

        {filteredClients.length === 0 && searchTerm && (
          <Empty description="No se encontraron clientes" />
        )}

        <List
          loading={loading}
          dataSource={filteredClients}
          renderItem={(client) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '12px 16px' }}
              onClick={() => handleSelect(client)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
                    <UserOutlined />
                  </Avatar>
                }
                title={
                  <Space>
                    <Text strong>
                      {client.firstName} {client.lastName1} {client.lastName2 || ''}
                    </Text>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Space size="small">
                      <PhoneOutlined />
                      <Text type="secondary">{client.phone}</Text>
                    </Space>
                    <Space size="small">
                      <IdcardOutlined />
                      <Text type="secondary">{client.rut}</Text>
                    </Space>
                    {client.email && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {client.email}
                      </Text>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        {!searchTerm && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Text type="secondary">
              💡 Tip: Escribe para buscar, presiona Enter con un solo resultado, o Esc para cerrar
            </Text>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default QuickSearchModal;