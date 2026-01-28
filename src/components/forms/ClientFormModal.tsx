import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, message } from 'antd';
import { Client } from '@types/api.types';

interface ClientFormModalProps {
  open: boolean;
  client?: Client | null;
  onOk: (values: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const ClientFormModal: React.FC<ClientFormModalProps> = ({
  open,
  client,
  onOk,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && client) {
      form.setFieldsValue({
        firstName: client.firstName,
        lastName1: client.lastName1,
        lastName2: client.lastName2 || '',
        phone: client.phone,
        email: client.email,
      });
    } else if (open && !client) {
      form.resetFields();
    }
  }, [open, client, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(values);
      form.resetFields();
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  // Validación de teléfono chileno
  const validatePhone = (_: any, value: string) => {
    if (!value) {
      return Promise.reject('Por favor ingrese el teléfono');
    }
    // Remover espacios y caracteres especiales
    const cleaned = value.replace(/\D/g, '');
    // Validar formato chileno: +56 9 XXXX XXXX
    if (cleaned.length < 9 || cleaned.length > 11) {
      return Promise.reject('Formato inválido. Ej: +56912345678 o 912345678');
    }
    return Promise.resolve();
  };

  // Validación de email
  const validateEmail = (_: any, value: string) => {
    if (!value) {
      return Promise.resolve(); // Email es opcional
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Promise.reject('Email inválido');
    }
    return Promise.resolve();
  };

  return (
    <Modal
      title={client ? 'Editar Cliente' : 'Nuevo Cliente'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={700}
      okText={client ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
    >
      <Form
        form={form}
        layout="vertical"
        name="client_form"
        initialValues={{
          firstName: '',
          lastName1: '',
          lastName2: '',
          phone: '',
          email: '',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="Nombre"
              rules={[
                { required: true, message: 'Por favor ingrese el nombre' },
                { min: 2, message: 'Mínimo 2 caracteres' },
                { max: 50, message: 'Máximo 50 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Juan" size="large" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName1"
              label="Apellido Paterno"
              rules={[
                { required: true, message: 'Por favor ingrese el apellido paterno' },
                { min: 2, message: 'Mínimo 2 caracteres' },
                { max: 50, message: 'Máximo 50 caracteres' },
              ]}
            >
              <Input placeholder="Ej: Pérez" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="lastName2"
          label="Apellido Materno (Opcional)"
          rules={[
            { max: 50, message: 'Máximo 50 caracteres' },
          ]}
        >
          <Input placeholder="Ej: González" size="large" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="Teléfono"
              rules={[{ validator: validatePhone }]}
              tooltip="Formato: +56912345678 o 912345678"
            >
              <Input
                placeholder="+56912345678"
                size="large"
                prefix="+56"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Por favor ingrese el email' }, { validator: validateEmail }]}
            >
              <Input
                placeholder="correo@ejemplo.com"
                size="large"
                type="email"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ClientFormModal;