import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Quote } from '@types/api.types';
import { TALLER_CONFIG } from './tallerConfig';
import dayjs from 'dayjs';

// Extender el tipo de jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
  }
}

interface QuotePDFData {
  quote: Quote;
  client: {
    firstName: string;
    lastName1: string;
    lastName2?: string;
    phone: string;
    email: string;
    rut: string;
  };
  services: Array<{
    name: string;
    description: string;
    price: number;
  }>;
  parts: Array<{
    name: string;
    description: string;
    quantity: number;
    price: number;
    category: string;
  }>;
}

export const generateQuotePDF = (data: QuotePDFData): jsPDF => {
  const { quote, client, services, parts } = data;
  const doc = new jsPDF();
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // ============================================
  // HEADER - Logo y datos del taller
  // ============================================
  
  // Logo (si existe)
  if (TALLER_CONFIG.logo) {
    try {
      doc.addImage(TALLER_CONFIG.logo, 'PNG', marginLeft, yPosition, 40, 20);
      yPosition += 25;
    } catch (error) {
      console.error('Error loading logo:', error);
    }
  } else {
    // Sin logo, usar nombre grande
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185); // Azul
    doc.text(TALLER_CONFIG.nombre.toUpperCase(), marginLeft, yPosition);
    yPosition += 8;
  }

  // Información del taller
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`RUT: ${TALLER_CONFIG.rut}`, marginLeft, yPosition);
  yPosition += 4;
  doc.text(TALLER_CONFIG.direccion, marginLeft, yPosition);
  yPosition += 4;
  doc.text(`${TALLER_CONFIG.ciudad} | Tel: ${TALLER_CONFIG.telefono}`, marginLeft, yPosition);
  yPosition += 4;
  doc.text(`Email: ${TALLER_CONFIG.email}${TALLER_CONFIG.web ? ' | ' + TALLER_CONFIG.web : ''}`, marginLeft, yPosition);
  yPosition += 4;

  // Línea separadora
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  // ============================================
  // TÍTULO DEL DOCUMENTO
  // ============================================
  
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('PRESUPUESTO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 3;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${quote.quoteNumber}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // ============================================
  // INFORMACIÓN DEL PRESUPUESTO Y CLIENTE
  // ============================================
  
  const infoStartY = yPosition;
  
  // Columna izquierda - Datos del cliente
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('DATOS DEL CLIENTE', marginLeft, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  const clientName = `${client.firstName} ${client.lastName1} ${client.lastName2 || ''}`;
  doc.text(`Nombre: ${clientName}`, marginLeft, yPosition);
  yPosition += 5;
  doc.text(`RUT: ${client.rut}`, marginLeft, yPosition);
  yPosition += 5;
  doc.text(`Teléfono: ${client.phone}`, marginLeft, yPosition);
  yPosition += 5;
  doc.text(`Email: ${client.email || 'No registrado'}`, marginLeft, yPosition);
  yPosition += 5;

  // Columna derecha - Datos del vehículo y fechas
  const rightColumnX = pageWidth / 2 + 10;
  let rightY = infoStartY;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('DATOS DEL VEHÍCULO', rightColumnX, rightY);
  rightY += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  doc.text(`Marca: ${quote.vehicle.brand}`, rightColumnX, rightY);
  rightY += 5;
  doc.text(`Modelo: ${quote.vehicle.model}`, rightColumnX, rightY);
  rightY += 5;
  doc.text(`Año: ${quote.vehicle.year}`, rightColumnX, rightY);
  rightY += 5;
  doc.text(`Patente: ${quote.vehicle.licensePlate}`, rightColumnX, rightY);
  rightY += 5;
  doc.text(`Kilometraje: ${quote.vehicle.mileage.toLocaleString('es-CL')} km`, rightColumnX, rightY);
  rightY += 5;

  // Fechas
  yPosition = Math.max(yPosition, rightY) + 5;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(`Fecha de emisión: `, marginLeft, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(dayjs(quote.createdAt).format('DD/MM/YYYY'), marginLeft + 35, yPosition);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Válido hasta: `, rightColumnX, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.text(dayjs(quote.validUntil).format('DD/MM/YYYY'), rightColumnX + 25, yPosition);
  yPosition += 10;

  // ============================================
  // DESCRIPCIÓN DEL PROBLEMA
  // ============================================
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('DESCRIPCIÓN DEL PROBLEMA', marginLeft, yPosition);
  yPosition += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  
  const description = doc.splitTextToSize(quote.description, contentWidth);
  doc.text(description, marginLeft, yPosition);
  yPosition += (description.length * 5) + 10;

  // ============================================
  // TABLA DE SERVICIOS
  // ============================================
  
  if (services.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('SERVICIOS', marginLeft, yPosition);
    yPosition += 8;

    const servicesData = services.map((service) => [
      service.name,
      service.description || '-',
      `$${service.price.toLocaleString('es-CL')}`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Servicio', 'Descripción', 'Precio']],
      body: servicesData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40, halign: 'right' },
      },
      margin: { left: marginLeft, right: marginRight },
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // ============================================
  // TABLA DE REPUESTOS
  // ============================================
  
  if (parts.length > 0) {
    // Verificar si necesitamos nueva página
    if (yPosition > 240) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('REPUESTOS Y MATERIALES', marginLeft, yPosition);
    yPosition += 8;

    const partsData = parts.map((part) => [
      part.name,
      part.description || '-',
      part.quantity.toString(),
      `$${part.price.toLocaleString('es-CL')}`,
      `$${(part.price * part.quantity).toLocaleString('es-CL')}`,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Repuesto', 'Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
      body: partsData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 60 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' },
      },
      margin: { left: marginLeft, right: marginRight },
    });

    yPosition = doc.lastAutoTable.finalY + 10;
  }

  // ============================================
  // TOTALES
  // ============================================
  
  // Verificar si necesitamos nueva página
  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  const subtotalServices = services.reduce((sum, s) => sum + s.price, 0);
  const subtotalParts = parts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const subtotal = subtotalServices + subtotalParts;
  const iva = Math.round(subtotal * (TALLER_CONFIG.iva / 100));
  const total = subtotal + iva;

  const totalsStartX = pageWidth - marginRight - 60;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Subtotal
  doc.text('Subtotal:', totalsStartX, yPosition, { align: 'right' });
  doc.text(`$${subtotal.toLocaleString('es-CL')}`, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 6;
  
  // IVA
  doc.text(`IVA (${TALLER_CONFIG.iva}%):`, totalsStartX, yPosition, { align: 'right' });
  doc.text(`$${iva.toLocaleString('es-CL')}`, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 8;
  
  // Total
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  
  // Fondo para el total
  doc.setFillColor(240, 248, 255);
  doc.rect(totalsStartX - 5, yPosition - 6, 65, 10, 'F');
  
  doc.text('TOTAL:', totalsStartX, yPosition, { align: 'right' });
  doc.text(`$${total.toLocaleString('es-CL')}`, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 15;

  // ============================================
  // TÉRMINOS Y CONDICIONES
  // ============================================
  
  // Verificar si necesitamos nueva página
  if (yPosition > 230) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('TÉRMINOS Y CONDICIONES', marginLeft, yPosition);
  yPosition += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  
  TALLER_CONFIG.terminos.forEach((termino, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${termino}`, contentWidth);
    doc.text(lines, marginLeft, yPosition);
    yPosition += lines.length * 4 + 2;
  });

  // ============================================
  // FIRMA
  // ============================================
  
  yPosition += 15;
  
  // Verificar si necesitamos nueva página
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 20;
  }

  // Línea de firma del cliente
  const signatureX = marginLeft + 20;
  const signatureWidth = 70;
  
  doc.setDrawColor(0, 0, 0);
  doc.line(signatureX, yPosition, signatureX + signatureWidth, yPosition);
  yPosition += 5;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text('Firma del Cliente', signatureX + signatureWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('Acepto los términos y condiciones', signatureX + signatureWidth / 2, yPosition, { align: 'center' });

  // Información del jefe/gerente
  const managerX = pageWidth - marginRight - signatureWidth - 20;
  yPosition -= 9;
  
  doc.line(managerX, yPosition, managerX + signatureWidth, yPosition);
  yPosition += 5;
  
  doc.text(TALLER_CONFIG.jefe.nombre, managerX + signatureWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text(TALLER_CONFIG.jefe.cargo, managerX + signatureWidth / 2, yPosition, { align: 'center' });

  // ============================================
  // FOOTER
  // ============================================
  
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Presupuesto generado el ${dayjs().format('DD/MM/YYYY HH:mm')} - Página ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  return doc;
};

// Función para descargar el PDF
export const downloadQuotePDF = (data: QuotePDFData, filename?: string) => {
  const doc = generateQuotePDF(data);
  const pdfFilename = filename || `Presupuesto_${data.quote.quoteNumber}_${dayjs().format('YYYYMMDD')}.pdf`;
  doc.save(pdfFilename);
};

// Función para abrir el PDF en una nueva ventana (imprimir)
export const printQuotePDF = (data: QuotePDFData) => {
  const doc = generateQuotePDF(data);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url);
  
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};