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
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;

  // ============================================
  // HEADER - Logo y datos del taller
  // ============================================
  
  // Logo (si existe)
  if (TALLER_CONFIG.logo) {
    try {
      // Intentar cargar el logo desde la carpeta public
      const logoPath = TALLER_CONFIG.logo.path;
      
      // En Electron, las imágenes en public/ están disponibles
      // Nota: En producción, asegúrate de que la ruta sea accesible
      doc.addImage(
        logoPath, 
        'PNG', 
        marginLeft, 
        yPosition, 
        TALLER_CONFIG.logo.width, 
        TALLER_CONFIG.logo.height
      );
      
      // Información del taller al lado del logo
      const textX = marginLeft + TALLER_CONFIG.logo.width + 10;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text(TALLER_CONFIG.nombre.toUpperCase(), textX, yPosition + 5);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(TALLER_CONFIG.direccion, textX, yPosition + 10);
      doc.text(`${TALLER_CONFIG.ciudad} | Tel: ${TALLER_CONFIG.telefono}`, textX, yPosition + 14);
      doc.text(`${TALLER_CONFIG.email}`, textX, yPosition + 18);
      if (TALLER_CONFIG.web) {
        doc.text(TALLER_CONFIG.web, textX, yPosition + 22);
      }
      
      yPosition += TALLER_CONFIG.logo.height + 8;
      
    } catch (error) {
      console.error('Error loading logo:', error);
      // Si falla el logo, usar solo texto
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text(TALLER_CONFIG.nombre.toUpperCase(), marginLeft, yPosition);
      yPosition += 8;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(TALLER_CONFIG.direccion, marginLeft, yPosition);
      yPosition += 4;
      doc.text(`${TALLER_CONFIG.ciudad} | Tel: ${TALLER_CONFIG.telefono}`, marginLeft, yPosition);
      yPosition += 4;
      doc.text(`${TALLER_CONFIG.email}${TALLER_CONFIG.web ? ' | ' + TALLER_CONFIG.web : ''}`, marginLeft, yPosition);
      yPosition += 4;
    }
  } else {
    // Sin logo, usar nombre grande centrado
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text(TALLER_CONFIG.nombre.toUpperCase(), marginLeft, yPosition);
    yPosition += 8;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(TALLER_CONFIG.direccion, marginLeft, yPosition);
    yPosition += 4;
    doc.text(`${TALLER_CONFIG.ciudad} | Tel: ${TALLER_CONFIG.telefono}`, marginLeft, yPosition);
    yPosition += 4;
    doc.text(`${TALLER_CONFIG.email}${TALLER_CONFIG.web ? ' | ' + TALLER_CONFIG.web : ''}`, marginLeft, yPosition);
    yPosition += 4;
  }

  // Línea separadora
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 10;

  // ============================================
  // TÍTULO DEL DOCUMENTO
  // ============================================
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('PRESUPUESTO', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`N° ${quote.quoteNumber}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // ============================================
  // INFORMACIÓN EN CAJAS
  // ============================================
  
  // Caja 1: Cliente (izquierda)
  const box1X = marginLeft;
  const box1Y = yPosition;
  const boxWidth = (contentWidth - 5) / 2;
  const boxHeight = 35;
  
  doc.setFillColor(245, 248, 255);
  doc.rect(box1X, box1Y, boxWidth, boxHeight, 'F');
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.3);
  doc.rect(box1X, box1Y, boxWidth, boxHeight);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('CLIENTE', box1X + 3, box1Y + 6);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  const clientName = `${client.firstName} ${client.lastName1} ${client.lastName2 || ''}`;
  doc.text(clientName, box1X + 3, box1Y + 12);
  doc.text(`Tel: ${client.phone}`, box1X + 3, box1Y + 17);
  doc.text(`Email: ${client.email || 'No registrado'}`, box1X + 3, box1Y + 22);
  
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`Fecha: ${dayjs(quote.createdAt).format('DD/MM/YYYY')}`, box1X + 3, box1Y + 28);
  doc.text(`Válido hasta: ${dayjs(quote.validUntil).format('DD/MM/YYYY')}`, box1X + 3, box1Y + 32);
  
  // Caja 2: Vehículo (derecha)
  const box2X = box1X + boxWidth + 5;
  const box2Y = yPosition;
  
  doc.setFillColor(245, 248, 255);
  doc.rect(box2X, box2Y, boxWidth, boxHeight, 'F');
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.3);
  doc.rect(box2X, box2Y, boxWidth, boxHeight);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('VEHÍCULO', box2X + 3, box2Y + 6);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  doc.text(`${quote.vehicle.brand} ${quote.vehicle.model}`, box2X + 3, box2Y + 12);
  doc.text(`Año: ${quote.vehicle.year}`, box2X + 3, box2Y + 17);
  doc.text(`Patente: ${quote.vehicle.licensePlate}`, box2X + 3, box2Y + 22);
  doc.text(`Kilometraje: ${quote.vehicle.mileage.toLocaleString('es-CL')} km`, box2X + 3, box2Y + 27);
  
  yPosition += boxHeight + 10;

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
  yPosition += (description.length * 5) + 8;

  // ============================================
  // TRABAJO PROPUESTO
  // ============================================
  
  // ✅ Determinar si proposedWork es JSON o texto plano
  let isProposedWorkJSON = false;
  try {
    JSON.parse(quote.proposedWork);
    isProposedWorkJSON = true;
  } catch {
    isProposedWorkJSON = false;
  }

  if (isProposedWorkJSON && (services.length > 0 || parts.length > 0)) {
    // ============================================
    // FORMATO JSON: TABLA DE SERVICIOS
    // ============================================
    
    if (services.length > 0) {
      // Verificar espacio disponible
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('SERVICIOS', marginLeft, yPosition);
      yPosition += 6;

      const servicesData = services.map((service) => [
        service.name,
        service.description || '-',
        `$${service.price.toLocaleString('es-CL')}`,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Servicio', 'Descripción', 'Precio']],
        body: servicesData,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 90 },
          2: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: marginLeft, right: marginRight },
      });

      yPosition = doc.lastAutoTable.finalY + 8;
    }

    // ============================================
    // FORMATO JSON: TABLA DE REPUESTOS
    // ============================================
    
    if (parts.length > 0) {
      // Verificar espacio disponible
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text('REPUESTOS Y MATERIALES', marginLeft, yPosition);
      yPosition += 6;

      const partsData = parts.map((part) => [
        part.name,
        part.description || '-',
        part.quantity.toString(),
        `$${part.price.toLocaleString('es-CL')}`,
        `$${(part.price * part.quantity).toLocaleString('es-CL')}`,
      ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Repuesto', 'Descripción', 'Cant.', 'P. Unit.', 'Subtotal']],
        body: partsData,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        styles: {
          fontSize: 9,
          cellPadding: 4,
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 65 },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
        },
        margin: { left: marginLeft, right: marginRight },
      });

      yPosition = doc.lastAutoTable.finalY + 8;
    }
  } else {
    // ============================================
    // FORMATO TEXTO PLANO: MOSTRAR COMO TEXTO
    // ============================================
    
    // Verificar espacio disponible
    if (yPosition > pageHeight - 100) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('TRABAJO PROPUESTO', marginLeft, yPosition);
    yPosition += 6;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    
    // Dividir el texto en líneas respetando los saltos de línea
    const proposedWorkLines = quote.proposedWork.split('\n');
    
    proposedWorkLines.forEach((line) => {
      // Verificar si necesitamos nueva página
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Dividir líneas largas
      const wrappedLines = doc.splitTextToSize(line || ' ', contentWidth);
      doc.text(wrappedLines, marginLeft, yPosition);
      yPosition += wrappedLines.length * 5;
    });
    
    yPosition += 8;
  }

  // ============================================
  // TOTALES
  // ============================================
  
  // Verificar si necesitamos nueva página
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 20;
  }

  // ✅ Calcular totales según el formato
  let subtotal, iva, total;
  
  if (isProposedWorkJSON && (services.length > 0 || parts.length > 0)) {
    // Calcular desde servicios y repuestos
    const subtotalServices = services.reduce((sum, s) => sum + s.price, 0);
    const subtotalParts = parts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    subtotal = subtotalServices + subtotalParts;
    iva = Math.round(subtotal * (TALLER_CONFIG.iva / 100));
    total = subtotal + iva;
  } else {
    // Usar estimatedCost del quote
    total = quote.estimatedCost;
    subtotal = Math.round(total / (1 + TALLER_CONFIG.iva / 100));
    iva = total - subtotal;
  }

  const totalsX = pageWidth - marginRight - 70;
  const totalsWidth = 70;
  
  // Caja de totales
  doc.setFillColor(245, 248, 255);
  doc.rect(totalsX, yPosition, totalsWidth, 28, 'F');
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.3);
  doc.rect(totalsX, yPosition, totalsWidth, 28);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Subtotal
  doc.text('Subtotal:', totalsX + 3, yPosition + 6);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${subtotal.toLocaleString('es-CL')}`, totalsX + totalsWidth - 3, yPosition + 6, { align: 'right' });
  
  // IVA
  doc.setFont('helvetica', 'normal');
  doc.text(`IVA (${TALLER_CONFIG.iva}%):`, totalsX + 3, yPosition + 12);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${iva.toLocaleString('es-CL')}`, totalsX + totalsWidth - 3, yPosition + 12, { align: 'right' });
  
  // Línea separadora
  doc.setDrawColor(41, 128, 185);
  doc.setLineWidth(0.5);
  doc.line(totalsX + 3, yPosition + 16, totalsX + totalsWidth - 3, yPosition + 16);
  
  // Total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 128, 185);
  doc.text('TOTAL:', totalsX + 3, yPosition + 23);
  doc.setFontSize(14);
  doc.text(`$${total.toLocaleString('es-CL')}`, totalsX + totalsWidth - 3, yPosition + 23, { align: 'right' });
  
  yPosition += 35;

  // ============================================
  // TÉRMINOS Y CONDICIONES
  // ============================================
  
  // Verificar si necesitamos nueva página
  if (yPosition > pageHeight - 80) {
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
  doc.setTextColor(60, 60, 60);
  
  TALLER_CONFIG.terminos.forEach((termino, index) => {
    const lines = doc.splitTextToSize(`${index + 1}. ${termino}`, contentWidth);
    doc.text(lines, marginLeft, yPosition);
    yPosition += lines.length * 4 + 1;
  });

  // ============================================
  // FIRMAS
  // ============================================
  
  yPosition += 10;
  
  // Verificar si necesitamos nueva página
  if (yPosition > pageHeight - 40) {
    doc.addPage();
    yPosition = 20;
  }

  const signatureWidth = 65;
  const gap = 20;
  
  // Firma del cliente (izquierda)
  const clientSignX = marginLeft + 10;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(clientSignX, yPosition, clientSignX + signatureWidth, yPosition);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Firma del Cliente', clientSignX + signatureWidth / 2, yPosition + 5, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Acepto los términos y condiciones', clientSignX + signatureWidth / 2, yPosition + 9, { align: 'center' });

  // Firma del jefe/gerente (derecha)
  const managerSignX = pageWidth - marginRight - signatureWidth - 10;
  
  doc.line(managerSignX, yPosition, managerSignX + signatureWidth, yPosition);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(TALLER_CONFIG.jefe.nombre, managerSignX + signatureWidth / 2, yPosition + 5, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(TALLER_CONFIG.jefe.cargo, managerSignX + signatureWidth / 2, yPosition + 9, { align: 'center' });

  // ============================================
  // FOOTER EN TODAS LAS PÁGINAS
  // ============================================
  
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Línea superior del footer
    const footerY = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(marginLeft, footerY, pageWidth - marginRight, footerY);
    
    // Texto del footer
    doc.text(
      `Documento generado el ${dayjs().format('DD/MM/YYYY HH:mm')} | Página ${i} de ${pageCount}`,
      pageWidth / 2,
      footerY + 5,
      { align: 'center' }
    );
    
    doc.text(
      `${TALLER_CONFIG.nombre} | ${TALLER_CONFIG.telefono} | ${TALLER_CONFIG.email}`,
      pageWidth / 2,
      footerY + 9,
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