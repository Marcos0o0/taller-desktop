# 📦 INSTALACIÓN DE DEPENDENCIAS

## ⚡ Instalación Rápida (Recomendado)

Copia y pega este comando en tu terminal:

```bash
npm install react-router-dom@6 framer-motion@11 @ant-design/icons@5 recharts@2 dayjs@1
```

---

## 📝 Instalación Detallada (Paso a Paso)

Si prefieres instalar una por una para entender cada paquete:

### 1. React Router (Navegación)
```bash
npm install react-router-dom@6
```
**Para qué:** Sistema de rutas y navegación entre páginas

### 2. Framer Motion (Animaciones)
```bash
npm install framer-motion@11
```
**Para qué:** Animaciones suaves y transiciones

### 3. Ant Design Icons (Iconos)
```bash
npm install @ant-design/icons@5
```
**Para qué:** Iconos consistentes con Ant Design

### 4. Recharts (Gráficos)
```bash
npm install recharts@2
```
**Para qué:** Gráficos y estadísticas en el Dashboard

### 5. Day.js (Manejo de fechas)
```bash
npm install dayjs@1
```
**Para qué:** Formato y manejo de fechas

---

## 🔍 Verificar Instalación

Después de instalar, verifica que todo esté correcto:

```bash
npm list react-router-dom framer-motion @ant-design/icons recharts dayjs
```

Deberías ver algo como:
```
taller-desktop@0.0.0
├── @ant-design/icons@5.x.x
├── dayjs@1.x.x
├── framer-motion@11.x.x
├── react-router-dom@6.x.x
└── recharts@2.x.x
```

---

## 🚀 Iniciar el Proyecto

Una vez instaladas las dependencias:

```bash
npm run dev
```

Esto debería:
1. ✅ Compilar el proyecto sin errores
2. ✅ Abrir la ventana de Electron automáticamente
3. ✅ Mostrar la pantalla de login

---

## ❗ Solución de Problemas

### Error: "Module not found"

**Solución:**
```bash
npm install
npm run dev
```

### Error: "Port already in use"

**Solución:** Cierra todas las ventanas de Electron y vuelve a ejecutar:
```bash
npm run dev
```

### Error: "Cannot find package"

**Solución:** Borra node_modules y reinstala:
```bash
rmdir /s /q node_modules
npm install
npm run dev
```

### Error: "TypeScript errors"

**Solución:** Verifica que tsconfig.json tenga los paths configurados:
```json
{
  "compilerOptions": {
    "paths": {
      "@pages/*": ["src/pages/*"],
      "@components/*": ["src/components/*"],
      // ...
    }
  }
}
```

---

## 📦 Dependencias Completas (package.json)

Tu `package.json` debería tener estas dependencias:

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.90.20",
    "antd": "^6.2.2",
    "axios": "^1.13.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^5.0.10",
    
    // NUEVAS DEPENDENCIAS
    "react-router-dom": "^6.x.x",
    "framer-motion": "^11.x.x",
    "@ant-design/icons": "^5.x.x",
    "recharts": "^2.x.x",
    "dayjs": "^1.x.x"
  }
}
```

---

## 🔮 Dependencias Futuras (Próximas Fases)

Estas se instalarán más adelante cuando sean necesarias:

### Fase 5: Inventario con Código de Barras
```bash
npm install serialport @serialport/parser-readline
npm install -D @types/serialport
```

### Fase 6: PDFs y Documentos
```bash
npm install jspdf html2canvas
```

### Fase 7: Automatizaciones
```bash
npm install node-cron electron-store
```

### Fase 7: WhatsApp (Opcional)
```bash
npm install whatsapp-web.js qrcode-terminal
```

---

## ✅ Checklist de Instalación

Marca cada item al completarlo:

- [ ] Instalar React Router
- [ ] Instalar Framer Motion
- [ ] Instalar Ant Design Icons
- [ ] Instalar Recharts
- [ ] Instalar Day.js
- [ ] Verificar instalación con `npm list`
- [ ] Ejecutar `npm run dev`
- [ ] Ver pantalla de login sin errores
- [ ] Navegar entre páginas
- [ ] Ver Dashboard con estadísticas

---

## 🎯 Resultado Esperado

Después de instalar todo correctamente, deberías poder:

1. ✅ Iniciar sesión con admin/admin123
2. ✅ Ver el Dashboard con gráficos
3. ✅ Navegar por el menú lateral
4. ✅ Ver todas las páginas placeholder
5. ✅ Colapsar/expandir el sidebar
6. ✅ Cerrar sesión correctamente

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:
1. Lee la sección "Solución de Problemas"
2. Verifica que Node.js esté actualizado (v18+)
3. Asegúrate de estar en la carpeta correcta del proyecto
4. Revisa que el backend esté corriendo

---

**¡Listo! Una vez instalado todo, puedes continuar con el desarrollo** 🚀
