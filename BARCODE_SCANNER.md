# Sistema de Lectura de Código de Barras

## 📋 Descripción

Este sistema permite la integración automática de lectores de código de barras USB con la aplicación. Los lectores USB funcionan como teclados virtuales que escriben el código y presionan Enter automáticamente.

## 🔧 Cómo Funciona

### 1. Hardware Compatible
- Cualquier lector de código de barras USB que emule teclado
- No requiere drivers especiales
- Conectar por USB y estará listo para usar

### 2. Componentes Implementados

#### Hook: `useBarcodeScanner`
Ubicación: `src/hooks/useBarcodeScanner.ts`

Detecta automáticamente cuando un lector de código de barras ingresa datos:
- Escucha eventos de teclado globales
- Filtra entrada rápida de caracteres seguida de Enter
- Ignora entrada manual en campos de formulario
- Configurable (longitud mínima/máxima, timeout)

**Uso:**
```typescript
const { scanning } = useBarcodeScanner({
  enabled: true,
  onScan: (barcode) => {
    console.log('Código escaneado:', barcode);
  },
  minLength: 3,      // Mínimo de caracteres
  maxLength: 50,     // Máximo de caracteres
  timeout: 100,      // Tiempo entre caracteres (ms)
});
```

#### Componente: `ProductFormModal`
Ubicación: `src/components/inventory/ProductFormModal.tsx`

Modal para agregar o editar productos con soporte para código de barras escaneado:
- Auto-completa el campo de código de barras
- Formulario completo con validaciones
- Categorización de productos
- Gestión de stock y precios

#### Página: `InventoryList`
Ubicación: `src/pages/Inventory/InventoryList.tsx`

Página principal del inventario con:
- Botón para activar/desactivar el escáner
- Indicador visual cuando está escaneando
- Apertura automática del modal al detectar código
- Botón manual para agregar productos

## 🚀 Uso

### Activar el Escáner
1. Ir a la página de Inventario
2. Hacer clic en "Escanear Código"
3. El botón cambiará a rojo indicando que está activo
4. Escanear cualquier producto con el lector USB

### Agregar Producto Manualmente
1. Hacer clic en "Nuevo Producto"
2. Llenar el formulario
3. Guardar

### Agregar Producto con Escáner
1. Activar el escáner (botón "Escanear Código")
2. Escanear el código de barras del producto
3. El modal se abrirá automáticamente con el código
4. Completar los demás datos del producto
5. Guardar

## ⚙️ Configuración

### Parámetros del Escáner
- **minLength**: Longitud mínima del código (por defecto: 3)
- **maxLength**: Longitud máxima del código (por defecto: 50)
- **timeout**: Tiempo máximo entre caracteres en ms (por defecto: 100)
- **enabled**: Activar/desactivar el escáner

### Tipos de Código Soportados
El sistema soporta cualquier tipo de código de barras que el lector pueda interpretar:
- EAN-13 / EAN-8
- UPC-A / UPC-E
- Code 39 / Code 128
- QR Codes
- Códigos personalizados

## 🔍 Características

✅ **Detección Automática**: No requiere configuración adicional
✅ **Multi-formato**: Soporta todos los formatos que el lector pueda leer
✅ **Indicadores Visuales**: Muestra cuando está escaneando
✅ **No Invasivo**: No interfiere con campos de entrada normales
✅ **Configurable**: Ajusta parámetros según tus necesidades

## 📝 Notas Importantes

1. **Lector USB**: Asegúrate de que el lector esté configurado para agregar Enter al final
2. **Velocidad**: El lector debe escribir los caracteres rápidamente (< 100ms entre caracteres)
3. **Enfoque**: El escáner funciona incluso sin enfocar ningún campo
4. **Formularios**: El escáner se desactiva automáticamente cuando escribes en un campo

## 🔄 Próximas Mejoras

- [ ] Búsqueda de productos existentes por código
- [ ] Historial de códigos escaneados
- [ ] Soporte para múltiples lectores
- [ ] Estadísticas de escaneo
- [ ] Integración con base de datos
- [ ] Actualización de stock automática
- [ ] Alertas de stock bajo

## 🐛 Solución de Problemas

### El escáner no detecta códigos
- Verifica que el lector esté conectado y funcione (prueba en un notepad)
- Asegúrate de que el botón "Escanear Código" esté activado (rojo)
- Verifica que el código tenga entre 3 y 50 caracteres
- Confirma que el lector agregue Enter al final

### Detecta teclas normales como códigos
- Aumenta el valor de `minLength`
- Reduce el valor de `timeout`

### No abre el modal
- Revisa la consola del navegador por errores
- Verifica que el código cumpla con la longitud mínima/máxima
