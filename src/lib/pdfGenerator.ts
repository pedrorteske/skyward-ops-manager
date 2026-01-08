import jsPDF from 'jspdf';
import type { FinancialDocument } from '@/types/financial';
import { documentTypeLabels } from '@/types/financial';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  cnpj: string;
}

interface ClientInfo {
  name: string;
  email: string;
  document?: string;
  address?: string;
}

interface FlightInfo {
  prefix: string;
  route: string;
  date: string;
}

const defaultCompany: CompanyInfo = {
  name: 'Aviation SaaS Company',
  address: 'Av. Exemplo, 1000 - São Paulo, SP',
  phone: '+55 11 99999-9999',
  email: 'contato@aviationsaas.com',
  cnpj: '00.000.000/0001-00',
};

export function generateFinancialPDF(
  document: FinancialDocument,
  clientInfo: ClientInfo,
  flightInfo?: FlightInfo
): void {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPosition = margin;

  // Colors
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue
  const textColor: [number, number, number] = [30, 41, 59];
  const mutedColor: [number, number, number] = [100, 116, 139];
  const borderColor: [number, number, number] = [226, 232, 240];

  // Helper function to add text
  const addText = (
    text: string,
    x: number,
    y: number,
    options?: {
      fontSize?: number;
      fontStyle?: 'normal' | 'bold' | 'italic';
      color?: [number, number, number];
      align?: 'left' | 'center' | 'right';
    }
  ) => {
    const { fontSize = 10, fontStyle = 'normal', color = textColor, align = 'left' } = options || {};
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', fontStyle);
    pdf.setTextColor(...color);
    pdf.text(text, x, y, { align });
  };

  // Helper function to draw a line
  const drawLine = (y: number, color: [number, number, number] = borderColor) => {
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.3);
    pdf.line(margin, y, pageWidth - margin, y);
  };

  // Header with document type
  const documentTitle = documentTypeLabels[document.type].toUpperCase();
  pdf.setFillColor(...primaryColor);
  pdf.rect(0, 0, pageWidth, 45, 'F');
  
  addText(documentTitle, pageWidth / 2, 20, {
    fontSize: 24,
    fontStyle: 'bold',
    color: [255, 255, 255],
    align: 'center',
  });
  
  addText(`Nº ${document.number}`, pageWidth / 2, 32, {
    fontSize: 12,
    color: [255, 255, 255],
    align: 'center',
  });

  yPosition = 60;

  // Company Info (Left)
  addText(defaultCompany.name, margin, yPosition, { fontSize: 12, fontStyle: 'bold' });
  yPosition += 5;
  addText(defaultCompany.address, margin, yPosition, { fontSize: 9, color: mutedColor });
  yPosition += 4;
  addText(`Tel: ${defaultCompany.phone}`, margin, yPosition, { fontSize: 9, color: mutedColor });
  yPosition += 4;
  addText(`Email: ${defaultCompany.email}`, margin, yPosition, { fontSize: 9, color: mutedColor });
  yPosition += 4;
  addText(`CNPJ: ${defaultCompany.cnpj}`, margin, yPosition, { fontSize: 9, color: mutedColor });

  // Document Date (Right)
  const dateY = 60;
  addText('Data de Emissão:', pageWidth - margin, dateY, {
    fontSize: 9,
    color: mutedColor,
    align: 'right',
  });
  addText(
    new Date(document.createdAt).toLocaleDateString('pt-BR'),
    pageWidth - margin,
    dateY + 5,
    { fontSize: 10, fontStyle: 'bold', align: 'right' }
  );

  if (document.validUntil) {
    addText('Válido até:', pageWidth - margin, dateY + 14, {
      fontSize: 9,
      color: mutedColor,
      align: 'right',
    });
    addText(
      new Date(document.validUntil).toLocaleDateString('pt-BR'),
      pageWidth - margin,
      dateY + 19,
      { fontSize: 10, fontStyle: 'bold', align: 'right' }
    );
  }

  yPosition = 95;
  drawLine(yPosition);
  yPosition += 10;

  // Client Info
  addText('CLIENTE', margin, yPosition, { fontSize: 10, fontStyle: 'bold', color: primaryColor });
  yPosition += 6;
  addText(clientInfo.name, margin, yPosition, { fontSize: 11, fontStyle: 'bold' });
  yPosition += 5;
  if (clientInfo.email) {
    addText(clientInfo.email, margin, yPosition, { fontSize: 9, color: mutedColor });
    yPosition += 4;
  }
  if (clientInfo.document) {
    addText(`Documento: ${clientInfo.document}`, margin, yPosition, { fontSize: 9, color: mutedColor });
    yPosition += 4;
  }
  if (clientInfo.address) {
    addText(clientInfo.address, margin, yPosition, { fontSize: 9, color: mutedColor });
    yPosition += 4;
  }

  // Flight Info (if available)
  if (flightInfo) {
    const flightX = pageWidth / 2 + 10;
    const flightY = yPosition - (clientInfo.address ? 19 : clientInfo.document ? 15 : clientInfo.email ? 11 : 7);
    addText('VOO VINCULADO', flightX, flightY, { fontSize: 10, fontStyle: 'bold', color: primaryColor });
    addText(`Prefixo: ${flightInfo.prefix}`, flightX, flightY + 6, { fontSize: 9 });
    addText(`Rota: ${flightInfo.route}`, flightX, flightY + 11, { fontSize: 9 });
    addText(`Data: ${flightInfo.date}`, flightX, flightY + 16, { fontSize: 9 });
  }

  yPosition += 8;
  drawLine(yPosition);
  yPosition += 10;

  // Items Table Header
  const colWidths = {
    description: contentWidth * 0.45,
    quantity: contentWidth * 0.15,
    unitPrice: contentWidth * 0.2,
    total: contentWidth * 0.2,
  };

  const colX = {
    description: margin,
    quantity: margin + colWidths.description,
    unitPrice: margin + colWidths.description + colWidths.quantity,
    total: margin + colWidths.description + colWidths.quantity + colWidths.unitPrice,
  };

  // Table header background
  pdf.setFillColor(241, 245, 249);
  pdf.rect(margin, yPosition - 4, contentWidth, 10, 'F');

  addText('Descrição', colX.description + 2, yPosition + 2, { fontSize: 9, fontStyle: 'bold' });
  addText('Qtd', colX.quantity + colWidths.quantity / 2, yPosition + 2, {
    fontSize: 9,
    fontStyle: 'bold',
    align: 'center',
  });
  addText('Valor Unit.', colX.unitPrice + colWidths.unitPrice - 2, yPosition + 2, {
    fontSize: 9,
    fontStyle: 'bold',
    align: 'right',
  });
  addText('Total', colX.total + colWidths.total - 2, yPosition + 2, {
    fontSize: 9,
    fontStyle: 'bold',
    align: 'right',
  });

  yPosition += 10;
  drawLine(yPosition - 2);

  // Format currency helper
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: document.currency,
    }).format(value);
  };

  // Items rows
  document.items.forEach((item, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, yPosition - 3, contentWidth, 8, 'F');
    }

    // Truncate description if too long
    const maxDescLength = 45;
    const description =
      item.description.length > maxDescLength
        ? item.description.substring(0, maxDescLength) + '...'
        : item.description;

    addText(description, colX.description + 2, yPosition + 2, { fontSize: 9 });
    addText(item.quantity.toString(), colX.quantity + colWidths.quantity / 2, yPosition + 2, {
      fontSize: 9,
      align: 'center',
    });
    addText(formatCurrency(item.unitPrice), colX.unitPrice + colWidths.unitPrice - 2, yPosition + 2, {
      fontSize: 9,
      align: 'right',
    });
    addText(formatCurrency(item.total), colX.total + colWidths.total - 2, yPosition + 2, {
      fontSize: 9,
      fontStyle: 'bold',
      align: 'right',
    });

    yPosition += 8;
  });

  // Total section
  yPosition += 5;
  drawLine(yPosition);
  yPosition += 8;

  pdf.setFillColor(...primaryColor);
  pdf.rect(pageWidth - margin - 80, yPosition - 5, 80, 14, 'F');

  addText(`TOTAL (${document.currency})`, pageWidth - margin - 75, yPosition + 3, {
    fontSize: 10,
    color: [255, 255, 255],
  });
  addText(formatCurrency(document.total), pageWidth - margin - 5, yPosition + 3, {
    fontSize: 12,
    fontStyle: 'bold',
    color: [255, 255, 255],
    align: 'right',
  });

  // Observations
  if (document.observations) {
    yPosition += 25;
    addText('OBSERVAÇÕES', margin, yPosition, { fontSize: 10, fontStyle: 'bold', color: primaryColor });
    yPosition += 6;

    pdf.setFillColor(250, 250, 250);
    const obsLines = pdf.splitTextToSize(document.observations, contentWidth - 10);
    const obsHeight = obsLines.length * 5 + 8;
    pdf.rect(margin, yPosition - 3, contentWidth, obsHeight, 'F');

    pdf.setFontSize(9);
    pdf.setTextColor(...textColor);
    pdf.text(obsLines, margin + 5, yPosition + 3);
    yPosition += obsHeight;
  }

  // Footer
  const footerY = pdf.internal.pageSize.getHeight() - 20;
  drawLine(footerY - 5);
  addText('Documento gerado automaticamente pelo sistema Aviation SaaS', pageWidth / 2, footerY, {
    fontSize: 8,
    color: mutedColor,
    align: 'center',
  });
  addText(
    `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
    pageWidth / 2,
    footerY + 5,
    { fontSize: 8, color: mutedColor, align: 'center' }
  );

  // Save the PDF
  const fileName = `${document.type}_${document.number.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
}
