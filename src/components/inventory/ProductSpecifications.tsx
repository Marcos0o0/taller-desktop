import React from 'react';
import { Tag, Space } from 'antd';
import { getSpecsForCategory, CategorySpec } from '@types/product-specifications.types';

interface ProductSpecificationsProps {
  category: string;
  specifications?: Record<string, any>;
  maxTags?: number;
  compact?: boolean;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  category,
  specifications,
  maxTags = 4,
  compact = false,
}) => {
  if (!specifications || Object.keys(specifications).length === 0) {
    return null;
  }

  const categorySpecs = getSpecsForCategory(category);
  
  // Filtrar solo las especificaciones que existen y tienen valor
  const validSpecs = categorySpecs
    .filter(spec => specifications[spec.field])
    .map(spec => ({
      ...spec,
      value: specifications[spec.field],
    }));

  if (validSpecs.length === 0) {
    return null;
  }

  // Formatear el valor con sufijo si existe
  const formatValue = (spec: CategorySpec & { value: any }) => {
    const suffix = spec.suffix ? ` ${spec.suffix}` : '';
    return `${spec.value}${suffix}`;
  };

  // Definir colores por tipo de campo para mejor identificación visual
  const getTagColor = (fieldName: string) => {
    const colorMap: Record<string, string> = {
      viscosity: 'blue',
      oilType: 'cyan',
      volume: 'geekblue',
      application: 'purple',
      apiSpec: 'magenta',
      filterType: 'orange',
      brakeType: 'red',
      size: 'green',
      brand: 'gold',
      // Puedes agregar más...
    };
    return colorMap[fieldName] || 'default';
  };

  if (compact) {
    // Versión compacta: mostrar todo en una línea sin límite
    return (
      <div style={{ marginTop: 4 }}>
        <Space size={[4, 4]} wrap>
          {validSpecs.map((spec) => (
            <Tag 
              key={spec.field}
              color={getTagColor(spec.field)}
              style={{ 
                margin: 0,
                fontSize: 12,
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              <strong>{spec.label}:</strong> {formatValue(spec)}
            </Tag>
          ))}
        </Space>
      </div>
    );
  }

  // Versión normal: mostrar con límite
  const visibleSpecs = maxTags > 0 ? validSpecs.slice(0, maxTags) : validSpecs;
  const hiddenCount = validSpecs.length - visibleSpecs.length;

  return (
    <div style={{ marginTop: 6 }}>
      <Space size={[6, 6]} wrap>
        {visibleSpecs.map((spec) => (
          <Tag 
            key={spec.field}
            color={getTagColor(spec.field)}
            style={{ 
              margin: 0,
              fontSize: 12,
              padding: '3px 10px',
              borderRadius: 6,
              fontWeight: 500,
              border: 'none',
            }}
          >
            <span style={{ fontWeight: 600 }}>{spec.label}:</span>{' '}
            <span style={{ fontWeight: 400 }}>{formatValue(spec)}</span>
          </Tag>
        ))}
        
        {hiddenCount > 0 && (
          <Tag
            style={{ 
              margin: 0,
              fontSize: 11,
              padding: '3px 8px',
              borderRadius: 6,
              background: '#f5f5f5',
              color: '#666',
              border: '1px dashed #d9d9d9',
              cursor: 'default',
            }}
          >
            +{hiddenCount}
          </Tag>
        )}
      </Space>
    </div>
  );
};

export default ProductSpecifications;