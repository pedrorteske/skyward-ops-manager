// Core PDF Generation Module
// Provides shared utilities and standardized sections for all PDF documents

import jsPDF from 'jspdf';
import type { 
  PDFColors, 
  PDFCompanyInfo, 
  PDFClientInfo, 
  PDFFlightInfo, 
  PDFItem,
  PDFDocumentType,
  documentColorSchemes 
} from './types';

// Default color palette
export const defaultColors: PDFColors = {
  primary: [37, 99, 235],      // Blue
  accent: [59, 130, 246],      // Light Blue
  success: [34, 197, 94],      // Green
  warning: [245, 158, 11],     // Amber
  text: [30, 41, 59],          // Slate 800
  muted: [100, 116, 139],      // Slate 500
  border: [226, 232, 240],     // Slate 200
  lightBg: [248, 250, 252],    // Slate 50
  white: [255, 255, 255],
};

// PDF Configuration
export interface PDFConfig {
  margin: number;
  pageWidth: number;
  pageHeight: number;
  contentWidth: number;
  colors: PDFColors;
}

// Create PDF configuration
export function createPDFConfig(pdf: jsPDF, colors: Partial<PDFColors> = {}): PDFConfig {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  return {
    margin,
    pageWidth,
    pageHeight,
    contentWidth: pageWidth - margin * 2,
    colors: { ...defaultColors, ...colors },
  };
}

// Helper function to add text
export function addText(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic';
    color?: [number, number, number];
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
  }
): number {
  const { 
    fontSize = 10, 
    fontStyle = 'normal', 
    color = defaultColors.text, 
    align = 'left',
    maxWidth 
  } = options || {};
  
  pdf.setFontSize(fontSize);
  pdf.setFont('helvetica', fontStyle);
  pdf.setTextColor(...color);
  
  if (maxWidth) {
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y, { align });
    return lines.length;
  }
  
  pdf.text(text, x, y, { align });
  return 1;
}

// Helper function to draw a line
export function drawLine(
  pdf: jsPDF,
  config: PDFConfig,
  y: number,
  color: [number, number, number] = defaultColors.border,
  width: number = 0.3
): void {
  pdf.setDrawColor(...color);
  pdf.setLineWidth(width);
  pdf.line(config.margin, y, config.pageWidth - config.margin, y);
}

// Helper function to draw rounded rectangle
export function drawRoundedRect(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: [number, number, number]
): void {
  pdf.setFillColor(...fill);
  pdf.roundedRect(x, y, w, h, r, r, 'F');
}

// Format currency helper
export function formatCurrency(value: number, currency: 'BRL' | 'USD' = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

// Check if we need a new page
export function checkPageBreak(
  pdf: jsPDF,
  config: PDFConfig,
  currentY: number,
  requiredSpace: number
): number {
  if (currentY + requiredSpace > config.pageHeight - 40) {
    pdf.addPage();
    return config.margin;
  }
  return currentY;
}

// ===== STANDARDIZED SECTIONS =====

// Draw document header with company info and document title
export function drawHeader(
  pdf: jsPDF,
  config: PDFConfig,
  options: {
    companyName: string;
    subtitle?: string;
    documentTitle: string;
    documentNumber: string;
    createdAt: string;
    validUntil?: string;
    primaryColor: [number, number, number];
    accentColor: [number, number, number];
  }
): number {
  const { 
    companyName, 
    subtitle,
    documentTitle, 
    documentNumber, 
    createdAt, 
    validUntil,
    primaryColor,
    accentColor
  } = options;

  // Header background
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, config.pageWidth, 50, 'F');
  
  // Accent stripe
  pdf.setFillColor(...accentColor);
  pdf.rect(0, 45, config.pageWidth, 5, 'F');

  // Company name
  addText(pdf, companyName.toUpperCase(), config.margin, 20, {
    fontSize: 18,
    fontStyle: 'bold',
    color: config.colors.white,
  });
  
  // Subtitle (optional)
  if (subtitle) {
    addText(pdf, subtitle, config.margin, 28, {
      fontSize: 10,
      color: [200, 220, 255],
    });
  }

  // Document type and number
  addText(pdf, documentTitle.toUpperCase(), config.pageWidth - config.margin, 18, {
    fontSize: 14,
    fontStyle: 'bold',
    color: config.colors.white,
    align: 'right',
  });
  
  addText(pdf, `Nº ${documentNumber}`, config.pageWidth - config.margin, 26, {
    fontSize: 11,
    color: [200, 220, 255],
    align: 'right',
  });

  // Dates
  const formattedDate = new Date(createdAt).toLocaleDateString('pt-BR');
  addText(pdf, `Emissão: ${formattedDate}`, config.pageWidth - config.margin, 38, {
    fontSize: 9,
    color: [200, 220, 255],
    align: 'right',
  });

  if (validUntil) {
    const formattedValidUntil = new Date(validUntil).toLocaleDateString('pt-BR');
    addText(pdf, `Válido até: ${formattedValidUntil}`, config.pageWidth - config.margin, 44, {
      fontSize: 8,
      color: [200, 220, 255],
      align: 'right',
    });
  }

  return 60; // Return Y position after header
}

// Draw client and flight info boxes
export function drawInfoBoxes(
  pdf: jsPDF,
  config: PDFConfig,
  startY: number,
  client: PDFClientInfo,
  flight?: PDFFlightInfo,
  primaryColor: [number, number, number] = defaultColors.primary
): number {
  const colWidth = flight ? (config.contentWidth - 10) / 2 : config.contentWidth;
  const boxHeight = 55;

  // Client box
  drawRoundedRect(pdf, config.margin, startY, colWidth, boxHeight, 3, config.colors.lightBg);
  
  addText(pdf, 'DADOS DO CLIENTE', config.margin + 5, startY + 8, {
    fontSize: 9,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  addText(pdf, client.name || 'Cliente não informado', config.margin + 5, startY + 17, {
    fontSize: 11,
    fontStyle: 'bold',
  });
  
  let clientY = startY + 24;
  
  if (client.document) {
    addText(pdf, `Documento: ${client.document}`, config.margin + 5, clientY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    clientY += 5;
  }
  
  if (client.email) {
    addText(pdf, `Email: ${client.email}`, config.margin + 5, clientY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    clientY += 5;
  }
  
  if (client.phone) {
    addText(pdf, `Tel: ${client.phone}`, config.margin + 5, clientY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    clientY += 5;
  }

  if (client.address) {
    addText(pdf, client.address, config.margin + 5, clientY, {
      fontSize: 9,
      color: config.colors.muted,
      maxWidth: colWidth - 10,
    });
  }

  // Flight box (if provided)
  if (flight) {
    const flightBoxX = config.margin + colWidth + 10;
    drawRoundedRect(pdf, flightBoxX, startY, colWidth, boxHeight, 3, config.colors.lightBg);
    
    addText(pdf, 'DADOS DO VOO', flightBoxX + 5, startY + 8, {
      fontSize: 9,
      fontStyle: 'bold',
      color: primaryColor,
    });
    
    addText(pdf, flight.prefix || 'Prefixo não informado', flightBoxX + 5, startY + 17, {
      fontSize: 11,
      fontStyle: 'bold',
    });
    
    let flightY = startY + 24;
    
    if (flight.aircraftType) {
      addText(pdf, `Aeronave: ${flight.aircraftType}`, flightBoxX + 5, flightY, {
        fontSize: 9,
        color: config.colors.muted,
      });
      flightY += 5;
    }
    
    addText(pdf, `Rota: ${flight.route}`, flightBoxX + 5, flightY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    flightY += 5;
    
    addText(pdf, `Data: ${new Date(flight.date).toLocaleDateString('pt-BR')}`, flightBoxX + 5, flightY, {
      fontSize: 9,
      color: config.colors.muted,
    });
    flightY += 5;
    
    if (flight.eta || flight.etd) {
      addText(pdf, `ETA: ${flight.eta || '-'} | ETD: ${flight.etd || '-'}`, flightBoxX + 5, flightY, {
        fontSize: 9,
        color: config.colors.muted,
      });
      flightY += 5;
    }

    if (flight.flightType) {
      addText(pdf, `Tipo: ${flight.flightType}`, flightBoxX + 5, flightY, {
        fontSize: 9,
        color: config.colors.muted,
      });
    }
  }

  return startY + boxHeight + 10;
}

// Draw items table
export function drawItemsTable(
  pdf: jsPDF,
  config: PDFConfig,
  startY: number,
  items: PDFItem[],
  currency: 'BRL' | 'USD' = 'BRL',
  title: string = 'ITENS',
  primaryColor: [number, number, number] = defaultColors.primary,
  accentColor: [number, number, number] = defaultColors.accent
): number {
  let yPosition = startY;

  // Section title
  addText(pdf, title, config.margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  yPosition += 6;
  drawLine(pdf, config, yPosition, accentColor, 0.5);
  yPosition += 6;

  // Table header
  const colWidths = {
    description: config.contentWidth * 0.45,
    quantity: config.contentWidth * 0.15,
    unitPrice: config.contentWidth * 0.2,
    total: config.contentWidth * 0.2,
  };

  const colX = {
    description: config.margin,
    quantity: config.margin + colWidths.description,
    unitPrice: config.margin + colWidths.description + colWidths.quantity,
    total: config.margin + colWidths.description + colWidths.quantity + colWidths.unitPrice,
  };

  // Table header background
  pdf.setFillColor(...config.colors.lightBg);
  pdf.rect(config.margin, yPosition - 3, config.contentWidth, 8, 'F');

  addText(pdf, 'Descrição', colX.description + 3, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: config.colors.muted });
  addText(pdf, 'Qtd', colX.quantity + colWidths.quantity / 2, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: config.colors.muted, align: 'center' });
  addText(pdf, 'Valor Unit.', colX.unitPrice + colWidths.unitPrice - 3, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: config.colors.muted, align: 'right' });
  addText(pdf, 'Total', colX.total + colWidths.total - 3, yPosition + 2, { fontSize: 8, fontStyle: 'bold', color: config.colors.muted, align: 'right' });

  yPosition += 10;

  // Items rows
  items.forEach((item, index) => {
    yPosition = checkPageBreak(pdf, config, yPosition, 10);

    if (index % 2 === 0) {
      pdf.setFillColor(252, 252, 253);
      pdf.rect(config.margin, yPosition - 3, config.contentWidth, 8, 'F');
    }

    // Truncate description if too long
    const maxDescLength = 40;
    const description = item.description.length > maxDescLength
      ? item.description.substring(0, maxDescLength) + '...'
      : item.description;

    addText(pdf, description, colX.description + 3, yPosition + 2, { fontSize: 9 });
    addText(pdf, item.quantity.toString(), colX.quantity + colWidths.quantity / 2, yPosition + 2, { fontSize: 9, align: 'center' });
    addText(pdf, formatCurrency(item.unitPrice, currency), colX.unitPrice + colWidths.unitPrice - 3, yPosition + 2, { fontSize: 9, align: 'right' });
    addText(pdf, formatCurrency(item.total, currency), colX.total + colWidths.total - 3, yPosition + 2, { fontSize: 9, fontStyle: 'bold', align: 'right' });

    yPosition += 8;

    // Add note if present
    if (item.note) {
      addText(pdf, `* ${item.note}`, colX.description + 6, yPosition, { fontSize: 7, color: config.colors.muted });
      yPosition += 5;
    }
  });

  return yPosition + 5;
}

// Draw total section with highlight
export function drawTotalSection(
  pdf: jsPDF,
  config: PDFConfig,
  startY: number,
  total: number,
  currency: 'BRL' | 'USD' = 'BRL',
  primaryColor: [number, number, number] = defaultColors.primary,
  subtotal?: number,
  additionalItems?: { label: string; value: number }[]
): number {
  let yPosition = startY;

  drawLine(pdf, config, yPosition, config.colors.border);
  yPosition += 8;

  // Summary box
  const boxWidth = 100;
  const boxX = config.pageWidth - config.margin - boxWidth;
  let boxHeight = 20;

  // Calculate box height based on content
  if (subtotal !== undefined || (additionalItems && additionalItems.length > 0)) {
    boxHeight = 35 + (additionalItems?.length || 0) * 8;
    
    drawRoundedRect(pdf, boxX, yPosition - 5, boxWidth, boxHeight, 3, config.colors.lightBg);

    let summaryY = yPosition;

    if (subtotal !== undefined) {
      addText(pdf, 'Subtotal:', boxX + 5, summaryY, { fontSize: 9, color: config.colors.muted });
      addText(pdf, formatCurrency(subtotal, currency), boxX + boxWidth - 5, summaryY, { fontSize: 9, align: 'right' });
      summaryY += 7;
    }

    if (additionalItems) {
      additionalItems.forEach(item => {
        addText(pdf, item.label, boxX + 5, summaryY, { fontSize: 9, color: config.colors.muted });
        addText(pdf, formatCurrency(item.value, currency), boxX + boxWidth - 5, summaryY, { fontSize: 9, align: 'right' });
        summaryY += 7;
      });
    }

    drawLine(pdf, { ...config, margin: boxX + 5, pageWidth: boxX + boxWidth - 5 } as PDFConfig, summaryY, config.colors.border);
    summaryY += 6;

    // Total highlight
    pdf.setFillColor(...primaryColor);
    pdf.rect(boxX, summaryY - 3, boxWidth, 14, 'F');

    addText(pdf, 'TOTAL:', boxX + 8, summaryY + 5, { fontSize: 10, fontStyle: 'bold', color: config.colors.white });
    addText(pdf, formatCurrency(total, currency), boxX + boxWidth - 8, summaryY + 5, { fontSize: 12, fontStyle: 'bold', color: config.colors.white, align: 'right' });

    yPosition = summaryY + 20;
  } else {
    // Simple total box
    pdf.setFillColor(...primaryColor);
    pdf.rect(boxX, yPosition - 5, boxWidth, 18, 'F');

    addText(pdf, `TOTAL (${currency}):`, boxX + 8, yPosition + 4, { fontSize: 10, fontStyle: 'bold', color: config.colors.white });
    addText(pdf, formatCurrency(total, currency), boxX + boxWidth - 8, yPosition + 4, { fontSize: 12, fontStyle: 'bold', color: config.colors.white, align: 'right' });

    yPosition += 20;
  }

  return yPosition;
}

// Draw observations section
export function drawObservations(
  pdf: jsPDF,
  config: PDFConfig,
  startY: number,
  observations: string,
  primaryColor: [number, number, number] = defaultColors.primary,
  accentColor: [number, number, number] = defaultColors.accent
): number {
  let yPosition = startY;

  addText(pdf, 'OBSERVAÇÕES', config.margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });
  
  yPosition += 6;
  drawLine(pdf, config, yPosition, accentColor, 0.5);
  yPosition += 6;

  // Observations box
  const obsLines = pdf.splitTextToSize(observations, config.contentWidth - 10);
  const obsHeight = Math.max(obsLines.length * 5 + 10, 20);

  drawRoundedRect(pdf, config.margin, yPosition - 3, config.contentWidth, obsHeight, 3, config.colors.lightBg);

  pdf.setFontSize(9);
  pdf.setTextColor(...config.colors.text);
  pdf.text(obsLines, config.margin + 5, yPosition + 3);

  return yPosition + obsHeight + 5;
}

// Draw footer
export function drawFooter(
  pdf: jsPDF,
  config: PDFConfig,
  company: PDFCompanyInfo,
  primaryColor: [number, number, number] = defaultColors.primary,
  showValidity: boolean = true,
  validityDays: number = 7
): void {
  const footerY = config.pageHeight - 35;

  drawLine(pdf, config, footerY - 5, config.colors.border);

  // Company contact info
  addText(pdf, company.name, config.margin, footerY, { 
    fontSize: 9, 
    fontStyle: 'bold', 
    color: primaryColor 
  });

  if (company.responsibleName) {
    addText(pdf, company.responsibleName, config.margin, footerY + 5, { 
      fontSize: 8, 
      color: config.colors.muted 
    });
  }

  if (company.responsibleRole) {
    addText(pdf, company.responsibleRole, config.margin, footerY + 10, { 
      fontSize: 8, 
      color: config.colors.muted 
    });
  }

  // Center contact info
  addText(pdf, company.phone, config.pageWidth / 2, footerY + 5, { 
    fontSize: 8, 
    color: config.colors.muted, 
    align: 'center' 
  });
  
  addText(pdf, company.email, config.pageWidth / 2, footerY + 10, { 
    fontSize: 8, 
    color: config.colors.muted, 
    align: 'center' 
  });

  // Generation date
  addText(pdf, `Documento gerado em ${new Date().toLocaleString('pt-BR')}`, config.pageWidth - config.margin, footerY + 5, {
    fontSize: 7,
    color: config.colors.muted,
    align: 'right',
  });

  // Validity notice
  if (showValidity) {
    pdf.setFillColor(255, 251, 235);
    pdf.rect(config.margin, footerY + 15, config.contentWidth, 12, 'F');
    pdf.setDrawColor(245, 158, 11);
    pdf.setLineWidth(0.3);
    pdf.rect(config.margin, footerY + 15, config.contentWidth, 12, 'S');

    addText(
      pdf, 
      `⚠ Esta cotação é válida por ${validityDays} dias a partir da data de emissão. Valores sujeitos a alteração após este período.`, 
      config.pageWidth / 2, 
      footerY + 22, 
      { fontSize: 8, color: [180, 83, 9], align: 'center' }
    );
  }
}

// Create a new PDF document with standard configuration
export function createPDF(): { pdf: jsPDF; config: PDFConfig } {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const config = createPDFConfig(pdf);
  return { pdf, config };
}
