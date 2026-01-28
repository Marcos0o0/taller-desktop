import React from 'react';
import { Card, Typography, Space, Tag } from 'antd';
import { CarOutlined } from '@ant-design/icons';
import { CarBrand } from '@types/diagrams.types';

const { Text } = Typography;

interface BrandCardProps {
  brand: CarBrand;
  onClick: (brandId: string) => void;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand, onClick }) => {
  return (
    <Card
      hoverable
      onClick={() => onClick(brand.id)}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px',
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
        {/* Logo de la marca */}
        <div
          style={{
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
          }}
        >
          <img
            src={brand.logo}
            alt={brand.name}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
            onError={(e) => {
              // Fallback si la imagen no carga
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLImageElement).parentElement;
              if (parent) {
                parent.innerHTML = `<div style="width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 8px;"><span style="font-size: 48px;"><CarOutlined /></span></div>`;
              }
            }}
          />
        </div>

        {/* Nombre de la marca */}
        <Text strong style={{ fontSize: 18 }}>
          {brand.name}
        </Text>

        {/* País de origen */}
        <Tag color="blue" style={{ margin: 0 }}>
          {brand.country}
        </Tag>

        {/* Cantidad de modelos */}
        <Text type="secondary" style={{ fontSize: 13 }}>
          {brand.modelsCount} {brand.modelsCount === 1 ? 'modelo' : 'modelos'}
        </Text>
      </Space>
    </Card>
  );
};

export default BrandCard;
