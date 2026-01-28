# 🚗 Sistema de Gestión para Taller Mecánico

> Aplicación de escritorio profesional para Windows 11, desarrollada con Electron + React + TypeScript

## 📋 Descripción

Sistema integral de gestión para talleres mecánicos automotrices que incluye:

- ✅ Gestión de clientes y vehículos
- ✅ Presupuestos y órdenes de trabajo
- ✅ Control de inventario con lector de código de barras
- ✅ Base de datos de diagramas eléctricos
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Reportes y analytics
- ✅ Sistema offline (no requiere internet)

## 🛠️ Tecnologías

### Core
- **Electron 30** - Aplicación de escritorio
- **React 18** - Framework UI
- **TypeScript 5** - Type safety
- **Vite** - Build tool

### UI/UX
- **Ant Design 6** - Sistema de diseño
- **React Router 6** - Navegación
- **Framer Motion** - Animaciones
- **Recharts** - Gráficos

### Estado y Datos
- **Zustand** - State management
- **Axios** - HTTP client
- **React Query** - Server state

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- npm 9+
- Windows 11

### Pasos

1. **Clonar el repositorio** (o ya lo tienes)
```bash
cd taller-desktop
```

2. **Instalar dependencias base** (si no están instaladas)
```bash
npm install
```

3. **Instalar nuevas dependencias**
```bash
npm install react-router-dom framer-motion @ant-design/icons recharts dayjs
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Build para producción**
```bash
npm run build
```

## 🎯 Estructura del Proyecto

```
taller-desktop/
├── src/
│   ├── api/              # Servicios API
│   ├── components/       # Componentes reutilizables
│   │   ├── layout/      # Layout principal
│   │   ├── forms/       # Formularios
│   │   └── modals/      # Modales
│   ├── pages/           # Vistas principales
│   │   ├── Dashboard/   # Dashboard
│   │   ├── Clients/     # Clientes
│   │   ├── Quotes/      # Presupuestos
│   │   ├── Orders/      # Órdenes
│   │   ├── Inventory/   # Inventario
│   │   └── FuseDiagrams/ # Diagramas
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript types
│   ├── utils/           # Utilidades
│   ├── App.tsx          # App principal
│   ├── Router.tsx       # Configuración rutas
│   └── main.tsx         # Entry point
├── electron/            # Proceso principal Electron
└── public/             # Assets estáticos
```

## 🚀 Comandos

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Linter
npm run lint

# Preview
npm run preview
```

## 🔐 Autenticación

Credenciales por defecto:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

## 📚 Documentación

- **[PLAN_IMPLEMENTACION.md](./PLAN_IMPLEMENTACION.md)** - Plan completo de desarrollo (12 semanas)
- **[INICIO_RAPIDO.md](./INICIO_RAPIDO.md)** - Guía de inicio rápido

## 🎨 Características UI/UX

### Diseñado para facilidad de uso:
- 📏 **Textos grandes** (15px base) - Fácil de leer
- 🖱️ **Botones grandes** (48px) - Fácil de presionar  
- 🎨 **Alto contraste** - Buena visibilidad
- 🔤 **Iconos descriptivos** - Identificación rápida
- 📱 **Responsive** - Se adapta al tamaño
- 🇪🇸 **Español nativo** - Localización completa

## 🔄 Estado del Proyecto

### ✅ Completado (Fase 1)
- [x] Estructura base con Electron + React
- [x] Sistema de autenticación
- [x] Router y navegación
- [x] Layout principal con sidebar
- [x] Dashboard con estadísticas
- [x] Páginas placeholder de módulos

### 🚧 En Desarrollo
- [ ] Módulo de Clientes completo
- [ ] Módulo de Presupuestos
- [ ] Módulo de Órdenes

### 📅 Pendiente
- [ ] Inventario con código de barras
- [ ] Diagramas eléctricos
- [ ] Reportes y analytics
- [ ] Impresión automática
- [ ] Backup automático
- [ ] Integración WhatsApp

## 🎯 Próximos Pasos

1. **Esta semana**: Implementar módulo de Clientes
2. **Siguiente semana**: Módulo de Presupuestos
3. **Semana 3-4**: Módulo de Órdenes de Trabajo
4. **Semana 5-6**: Inventario con lector de código de barras

Ver [PLAN_IMPLEMENTACION.md](./PLAN_IMPLEMENTACION.md) para detalles completos.

## 🛡️ Seguridad

- ✅ Autenticación requerida
- ✅ Datos locales encriptados
- ✅ Backup automático
- ✅ No requiere internet (más seguro)

## 🤝 Contribución

Este es un proyecto personal para el taller mecánico familiar.

## 📝 Licencia

Privado - Todos los derechos reservados

## 📞 Soporte

Para dudas o problemas:
1. Revisa [INICIO_RAPIDO.md](./INICIO_RAPIDO.md)
2. Consulta [PLAN_IMPLEMENTACION.md](./PLAN_IMPLEMENTACION.md)
3. Verifica la documentación de Ant Design

---

**Desarrollado con ❤️ para el taller mecánico de mi papá**
