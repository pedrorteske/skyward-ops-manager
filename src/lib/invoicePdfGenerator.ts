// Proforma Invoice and Invoice PDF Generator
// Generates standardized PDFs with specific sections for payment information

import type { FinancialDocument } from '@/types/financial';
import { documentTypeLabels } from '@/types/financial';
import { companyConfig, getFullAddress } from '@/config/companyConfig';
import {
  createPDF,
  addText,
  drawLine,
  drawRoundedRect,
  drawHeader,
  drawInfoBoxes,
  drawItemsTable,
  drawTotalSection,
  drawObservations,
  formatCurrency,
  checkPageBreak,
  defaultColors,
} from './pdf/pdfCore';
import { documentColorSchemes, type PDFDocumentType } from './pdf/types';

interface ClientInfo {
  name: string;
  email?: string;
  document?: string;
  address?: string;
  phone?: string;
}

interface FlightInfo {
  prefix: string;
  aircraftType?: string;
  route: string;
  date: string;
  eta?: string;
  etd?: string;
}

interface BankInfo {
  bankName: string;
  agency: string;
  account: string;
  pixKey?: string;
  swift?: string;
  iban?: string;
}

// Default bank information - will be configurable in the future
const defaultBankInfo: BankInfo = {
  bankName: 'Banco Exemplo',
  agency: '0001',
  account: '12345-6',
  pixKey: 'contato@aviationsaas.com',
  swift: 'BEXABR01',
  iban: 'BR00 0000 0000 0000 0000 0000 000',
};

// Draw payment information section (for Proforma and Invoice)
function drawPaymentSection(
  pdf: ReturnType<typeof createPDF>['pdf'],
  config: ReturnType<typeof createPDF>['config'],
  startY: number,
  bankInfo: BankInfo,
  currency: 'BRL' | 'USD',
  primaryColor: [number, number, number],
  accentColor: [number, number, number]
): number {
  let yPosition = startY;

  addText(pdf, 'DADOS PARA PAGAMENTO', config.margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });

  yPosition += 6;
  drawLine(pdf, config, yPosition, accentColor, 0.5);
  yPosition += 6;

  // Payment box
  const boxHeight = currency === 'USD' ? 50 : 40;
  drawRoundedRect(pdf, config.margin, yPosition - 3, config.contentWidth, boxHeight, 3, config.colors.lightBg);

  const col1X = config.margin + 5;
  const col2X = config.margin + config.contentWidth / 2;

  // Bank details
  addText(pdf, 'Banco:', col1X, yPosition + 4, { fontSize: 9, color: config.colors.muted });
  addText(pdf, bankInfo.bankName, col1X + 25, yPosition + 4, { fontSize: 9, fontStyle: 'bold' });

  addText(pdf, 'Agência:', col1X, yPosition + 11, { fontSize: 9, color: config.colors.muted });
  addText(pdf, bankInfo.agency, col1X + 25, yPosition + 11, { fontSize: 9, fontStyle: 'bold' });

  addText(pdf, 'Conta:', col1X, yPosition + 18, { fontSize: 9, color: config.colors.muted });
  addText(pdf, bankInfo.account, col1X + 25, yPosition + 18, { fontSize: 9, fontStyle: 'bold' });

  // PIX (for BRL) or SWIFT/IBAN (for USD)
  if (currency === 'BRL' && bankInfo.pixKey) {
    addText(pdf, 'PIX:', col2X, yPosition + 4, { fontSize: 9, color: config.colors.muted });
    addText(pdf, bankInfo.pixKey, col2X + 20, yPosition + 4, { fontSize: 9, fontStyle: 'bold' });
  }

  if (currency === 'USD') {
    if (bankInfo.swift) {
      addText(pdf, 'SWIFT:', col2X, yPosition + 4, { fontSize: 9, color: config.colors.muted });
      addText(pdf, bankInfo.swift, col2X + 25, yPosition + 4, { fontSize: 9, fontStyle: 'bold' });
    }
    if (bankInfo.iban) {
      addText(pdf, 'IBAN:', col2X, yPosition + 11, { fontSize: 9, color: config.colors.muted });
      addText(pdf, bankInfo.iban, col2X + 25, yPosition + 11, { fontSize: 9, fontStyle: 'bold' });
    }
  }

  return yPosition + boxHeight + 5;
}

// Draw invoice status section
function drawInvoiceStatus(
  pdf: ReturnType<typeof createPDF>['pdf'],
  config: ReturnType<typeof createPDF>['config'],
  startY: number,
  status: string,
  dueDate?: string
): number {
  let yPosition = startY;

  const statusColors: Record<string, [number, number, number]> = {
    created: [100, 116, 139],
    sent: [59, 130, 246],
    approved: [34, 197, 94],
    paid: [34, 197, 94],
    cancelled: [239, 68, 68],
  };

  const statusLabels: Record<string, string> = {
    created: 'AGUARDANDO ENVIO',
    sent: 'ENVIADO - AGUARDANDO PAGAMENTO',
    approved: 'APROVADO - AGUARDANDO PAGAMENTO',
    paid: 'PAGO',
    cancelled: 'CANCELADO',
  };

  const statusColor = statusColors[status] || statusColors.created;
  const statusLabel = statusLabels[status] || 'PENDENTE';

  // Status box
  drawRoundedRect(pdf, config.margin, yPosition, config.contentWidth, 20, 3, statusColor);

  addText(pdf, 'STATUS:', config.margin + 10, yPosition + 8, {
    fontSize: 9,
    color: defaultColors.white,
  });

  addText(pdf, statusLabel, config.margin + 10, yPosition + 15, {
    fontSize: 11,
    fontStyle: 'bold',
    color: defaultColors.white,
  });

  if (dueDate) {
    addText(pdf, `Vencimento: ${new Date(dueDate).toLocaleDateString('pt-BR')}`, config.pageWidth - config.margin - 10, yPosition + 12, {
      fontSize: 10,
      fontStyle: 'bold',
      color: defaultColors.white,
      align: 'right',
    });
  }

  return yPosition + 28;
}

// Draw proforma terms section
function drawProformaTerms(
  pdf: ReturnType<typeof createPDF>['pdf'],
  config: ReturnType<typeof createPDF>['config'],
  startY: number,
  primaryColor: [number, number, number]
): number {
  let yPosition = startY;

  addText(pdf, 'TERMOS E CONDIÇÕES', config.margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });

  yPosition += 8;

  const terms = [
    '• Este documento é uma Proforma Invoice e não tem valor fiscal.',
    '• O pagamento deve ser realizado antes da prestação dos serviços.',
    '• Após confirmação do pagamento, será emitida a Invoice/Fatura correspondente.',
    '• Valores sujeitos a alteração sem aviso prévio.',
  ];

  terms.forEach(term => {
    addText(pdf, term, config.margin + 3, yPosition, {
      fontSize: 8,
      color: config.colors.muted,
    });
    yPosition += 5;
  });

  return yPosition + 5;
}

// Draw invoice legal section
function drawInvoiceLegal(
  pdf: ReturnType<typeof createPDF>['pdf'],
  config: ReturnType<typeof createPDF>['config'],
  startY: number,
  invoiceNumber: string,
  primaryColor: [number, number, number]
): number {
  let yPosition = startY;

  addText(pdf, 'INFORMAÇÕES FISCAIS', config.margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold',
    color: primaryColor,
  });

  yPosition += 8;

  const legalInfo = [
    `• Invoice Nº: ${invoiceNumber}`,
    `• Empresa: ${companyConfig.name}`,
    `• CNPJ: ${companyConfig.cnpj}`,
    '• Este documento serve como comprovante de serviços prestados.',
  ];

  legalInfo.forEach(info => {
    addText(pdf, info, config.margin + 3, yPosition, {
      fontSize: 8,
      color: config.colors.muted,
    });
    yPosition += 5;
  });

  return yPosition + 5;
}

// Draw footer without validity (for invoices)
function drawInvoiceFooter(
  pdf: ReturnType<typeof createPDF>['pdf'],
  config: ReturnType<typeof createPDF>['config'],
  company: { name: string; phone: string; email: string; responsibleName?: string; responsibleRole?: string },
  primaryColor: [number, number, number]
): void {
  const footerY = config.pageHeight - 25;

  drawLine(pdf, config, footerY - 5, config.colors.border);

  // Company contact info
  addText(pdf, company.name, config.margin, footerY, {
    fontSize: 9,
    fontStyle: 'bold',
    color: primaryColor,
  });

  addText(pdf, `${company.phone} | ${company.email}`, config.margin, footerY + 6, {
    fontSize: 8,
    color: config.colors.muted,
  });

  // Generation date
  addText(pdf, `Documento gerado em ${new Date().toLocaleString('pt-BR')}`, config.pageWidth - config.margin, footerY + 3, {
    fontSize: 7,
    color: config.colors.muted,
    align: 'right',
  });
}

// Generate Proforma Invoice PDF
export function generateProformaPDF(
  document: FinancialDocument,
  clientInfo: ClientInfo,
  flightInfo?: FlightInfo,
  bankInfo: BankInfo = defaultBankInfo
): void {
  const { pdf, config } = createPDF();

  const colorScheme = documentColorSchemes.proforma;
  const primaryColor = colorScheme.primary;
  const accentColor = colorScheme.accent;

  const pdfCompany = {
    name: companyConfig.name,
    cnpj: companyConfig.cnpj,
    address: getFullAddress(),
    phone: companyConfig.phone,
    email: companyConfig.email,
    responsibleName: companyConfig.responsibleName,
    responsibleRole: companyConfig.responsibleRole,
  };

  const pdfClient = {
    name: clientInfo.name,
    document: clientInfo.document,
    email: clientInfo.email,
    phone: clientInfo.phone,
    address: clientInfo.address,
  };

  const pdfFlight = flightInfo ? {
    prefix: flightInfo.prefix,
    aircraftType: flightInfo.aircraftType,
    route: flightInfo.route,
    date: flightInfo.date,
    eta: flightInfo.eta,
    etd: flightInfo.etd,
  } : undefined;

  // Draw header
  let yPosition = drawHeader(pdf, config, {
    companyName: pdfCompany.name,
    subtitle: 'Documento para Pagamento Antecipado',
    documentTitle: 'Proforma Invoice',
    documentNumber: document.number,
    createdAt: document.createdAt,
    validUntil: document.validUntil,
    primaryColor,
    accentColor,
  });

  // Draw client and flight info
  yPosition = drawInfoBoxes(pdf, config, yPosition, pdfClient, pdfFlight, primaryColor);

  // Convert items
  const pdfItems = document.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));

  // Draw items table
  yPosition = drawItemsTable(pdf, config, yPosition, pdfItems, document.currency, 'SERVIÇOS', primaryColor, accentColor);

  // Draw total
  yPosition = drawTotalSection(pdf, config, yPosition, document.total, document.currency, primaryColor);

  // Check page break
  yPosition = checkPageBreak(pdf, config, yPosition, 80);

  // Draw payment section
  yPosition = drawPaymentSection(pdf, config, yPosition, bankInfo, document.currency, primaryColor, accentColor);

  // Draw proforma terms
  yPosition = drawProformaTerms(pdf, config, yPosition, primaryColor);

  // Draw observations
  if (document.observations) {
    yPosition = drawObservations(pdf, config, yPosition, document.observations, primaryColor, accentColor);
  }

  // Draw footer
  drawInvoiceFooter(pdf, config, pdfCompany, primaryColor);

  // Save
  const fileName = `proforma_${document.number.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
}

// Generate Invoice PDF
export function generateInvoicePDF(
  document: FinancialDocument,
  clientInfo: ClientInfo,
  flightInfo?: FlightInfo,
  bankInfo: BankInfo = defaultBankInfo,
  dueDate?: string
): void {
  const { pdf, config } = createPDF();

  const colorScheme = documentColorSchemes.invoice;
  const primaryColor = colorScheme.primary;
  const accentColor = colorScheme.accent;

  const pdfCompany = {
    name: companyConfig.name,
    cnpj: companyConfig.cnpj,
    address: getFullAddress(),
    phone: companyConfig.phone,
    email: companyConfig.email,
    responsibleName: companyConfig.responsibleName,
    responsibleRole: companyConfig.responsibleRole,
  };

  const pdfClient = {
    name: clientInfo.name,
    document: clientInfo.document,
    email: clientInfo.email,
    phone: clientInfo.phone,
    address: clientInfo.address,
  };

  const pdfFlight = flightInfo ? {
    prefix: flightInfo.prefix,
    aircraftType: flightInfo.aircraftType,
    route: flightInfo.route,
    date: flightInfo.date,
    eta: flightInfo.eta,
    etd: flightInfo.etd,
  } : undefined;

  // Draw header
  let yPosition = drawHeader(pdf, config, {
    companyName: pdfCompany.name,
    subtitle: 'Fatura de Serviços',
    documentTitle: 'Invoice',
    documentNumber: document.number,
    createdAt: document.createdAt,
    primaryColor,
    accentColor,
  });

  // Draw status section
  yPosition = drawInvoiceStatus(pdf, config, yPosition, document.status, dueDate);

  // Draw client and flight info
  yPosition = drawInfoBoxes(pdf, config, yPosition, pdfClient, pdfFlight, primaryColor);

  // Convert items
  const pdfItems = document.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));

  // Draw items table
  yPosition = drawItemsTable(pdf, config, yPosition, pdfItems, document.currency, 'SERVIÇOS PRESTADOS', primaryColor, accentColor);

  // Draw total
  yPosition = drawTotalSection(pdf, config, yPosition, document.total, document.currency, primaryColor);

  // Check page break
  yPosition = checkPageBreak(pdf, config, yPosition, 80);

  // Draw payment section (only if not paid)
  if (document.status !== 'paid') {
    yPosition = drawPaymentSection(pdf, config, yPosition, bankInfo, document.currency, primaryColor, accentColor);
  }

  // Draw legal info
  yPosition = drawInvoiceLegal(pdf, config, yPosition, document.number, primaryColor);

  // Draw observations
  if (document.observations) {
    yPosition = drawObservations(pdf, config, yPosition, document.observations, primaryColor, accentColor);
  }

  // Draw footer
  drawInvoiceFooter(pdf, config, pdfCompany, primaryColor);

  // Save
  const fileName = `invoice_${document.number.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
}
