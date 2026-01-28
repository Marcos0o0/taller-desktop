import React, { useState, useEffect } from 'react';
import { Modal, Select, Form, message, DatePicker, Input } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { mechanicsApi } from '@api/mechanics.api';
import { Mechanic } from '@types/api.types';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface AssignMechanicModalProps {
  open: boolean;
  orderId: string;
  currentMechanicId?: string;
  onOk: (mechanicId: string, estimatedDelivery?: string, notes?: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const AssignMechanicModal: React.FC<AssignMechanicModalProps> = ({
  open,
  orderId,
  currentMechanicId,
  onOk,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loadingMechanics, setLoadingMechanics] = useState(false);

  useEffect(() => {
    if (open) {
      loadMechanics();
    }
  }, [open]);

  useEffect(() => {
    if (open && currentMechanicId) {
      form.setFieldsValue({ mechanicId: currentMechanicId });
    } else if (open) {
      form.resetFields();
    }
  }, [open, currentMechanicId, form]);

  const loadMechanics = async () => {
    setLoadingMechanics(true);
    try {
      const mechanicsList = await mechanicsApi.list({ isActive: true });
      setMechanics(mechanicsList);
    } catch (error) {
      message.error('Error al cargar mecánicos');
    } finally {
      setLoadingMechanics(false);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onOk(
        values.mechanicId,
        values.estimatedDelivery ? dayjs(values.estimatedDelivery).toISOString() : undefined,
        values.notes
      );
      form.resetFields();
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined />
          <span>{currentMechanicId ? 'Reasignar Mecánico' : 'Asignar Mecánico'}</span>
        </div>
      }
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText={currentMechanicId ? 'Reasignar' : 'Asignar'}
      cancelText="Cancelar"
      width={500}
    >
      <Form form={form} layout="vertical" size="large">
        <Form.Item
          name="mechanicId"
          label="Mecánico"
          rules={[{ required: true, message: 'Por favor seleccione un mecánico' }]}
        >
          <Select
            showSearch
            placeholder="Seleccionar mecánico..."
            loading={loadingMechanics}
            optionFilterProp="children"
            filterOption={(input, option: any) =>
              option?.label?.toLowerCase().includes(input.toLowerCase())
            }
            options={mechanics.map((m) => ({
              value: m._id,
              label: `${m.firstName} ${m.lastName1} ${m.lastName2 || ''}`,
            }))}
            prefix={<UserOutlined />}
          />
        </Form.Item>

        <Form.Item name="estimatedDelivery" label="Fecha Estimada de Entrega (Opcional)">
          <DatePicker
            style={{ width: '100%' }}
            format="DD/MM/YYYY"
            placeholder="Seleccionar fecha"
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            prefix={<CalendarOutlined />}
          />
        </Form.Item>

        <Form.Item name="notes" label="Notas Adicionales (Opcional)">
          <TextArea
            rows={3}
            placeholder="Instrucciones especiales, prioridad, etc..."
            maxLength={300}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssignMechanicModal;
