// Financial PDF Preview Generator
// Generates PDF blob URLs for preview without downloading

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
  drawFooter,
  checkPageBreak,
  defaultColors,
} from './pdf/pdfCore';
import { documentColorSchemes } from './pdf/types';

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

const defaultBankInfo: BankInfo = {
  bankName: 'Banco Exemplo',
  agency: '0001',
  account: '12345-6',
  pixKey: 'contato@aviationsaas.com',
  swift: 'BEXABR01',
  iban: 'BR00 0000 0000 0000 0000 0000 000',
};

// Draw payment section
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

  const boxHeight = currency === 'USD' ? 50 : 40;
  drawRoundedRect(pdf, config.margin, yPosition - 3, config.contentWidth, boxHeight, 3, config.colors.lightBg);

  const col1X = config.margin + 5;
  const col2X = config.margin + config.contentWidth / 2;

  addText(pdf, 'Banco:', col1X, yPosition + 4, { fontSize: 9, color: config.colors.muted });
  addText(pdf, bankInfo.bankName, col1X + 25, yPosition + 4, { fontSize: 9, fontStyle: 'bold' });

  addText(pdf, 'Agência:', col1X, yPosition + 11, { fontSize: 9, color: config.colors.muted });
  addText(pdf, bankInfo.agency, col1X + 25, yPosition + 11, { fontSize: 9, fontStyle: 'bold' });

  addText(pdf, 'Conta:', col1X, yPosition + 18, { fontSize: 9, color: config.colors.muted });
  addText(pdf, bankInfo.account, col1X + 25, yPosition + 18, { fontSize: 9, fontStyle: 'bold' });

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

// Draw invoice status
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

// Draw proforma terms
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

// Draw invoice legal
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

// Draw invoice footer
function drawInvoiceFooter(
  pdf: ReturnType<typeof createPDF>['pdf'],
  config: ReturnType<typeof createPDF>['config'],
  company: { name: string; phone: string; email: string },
  primaryColor: [number, number, number]
): void {
  const footerY = config.pageHeight - 25;

  drawLine(pdf, config, footerY - 5, config.colors.border);

  addText(pdf, company.name, config.margin, footerY, {
    fontSize: 9,
    fontStyle: 'bold',
    color: primaryColor,
  });

  addText(pdf, `${company.phone} | ${company.email}`, config.margin, footerY + 6, {
    fontSize: 8,
    color: config.colors.muted,
  });

  addText(pdf, `Documento gerado em ${new Date().toLocaleString('pt-BR')}`, config.pageWidth - config.margin, footerY + 3, {
    fontSize: 7,
    color: config.colors.muted,
    align: 'right',
  });
}

// Generate Quotation PDF URL
export async function generateFinancialPdfUrl(
  document: FinancialDocument,
  clientInfo: ClientInfo,
  flightInfo?: FlightInfo
): Promise<string> {
  const { pdf, config } = createPDF();
  
  const colorScheme = documentColorSchemes.quotation;
  const primaryColor = colorScheme.primary;
  const accentColor = colorScheme.accent;

  const documentTitle = documentTypeLabels[document.type];

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

  let yPosition = drawHeader(pdf, config, {
    companyName: pdfCompany.name,
    subtitle: document.type === 'quotation' ? 'Proposta Comercial' : undefined,
    documentTitle,
    documentNumber: document.number,
    createdAt: document.createdAt,
    validUntil: document.validUntil,
    primaryColor,
    accentColor,
  });

  yPosition = drawInfoBoxes(pdf, config, yPosition, pdfClient, pdfFlight, primaryColor);

  const pdfItems = document.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));

  yPosition = drawItemsTable(pdf, config, yPosition, pdfItems, document.currency, 'ITENS / SERVIÇOS', primaryColor, accentColor);

  yPosition = drawTotalSection(
    pdf,
    config,
    yPosition,
    document.total,
    document.currency,
    primaryColor,
    document.subtotal !== document.total ? document.subtotal : undefined
  );

  if (document.observations) {
    yPosition = drawObservations(pdf, config, yPosition, document.observations, primaryColor, accentColor);
  }

  drawFooter(pdf, config, pdfCompany, primaryColor, document.type === 'quotation', 7);

  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}

// Generate Proforma PDF URL
export async function generateProformaPdfUrl(
  document: FinancialDocument,
  clientInfo: ClientInfo,
  flightInfo?: FlightInfo,
  bankInfo: BankInfo = defaultBankInfo
): Promise<string> {
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

  yPosition = drawInfoBoxes(pdf, config, yPosition, pdfClient, pdfFlight, primaryColor);

  const pdfItems = document.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));

  yPosition = drawItemsTable(pdf, config, yPosition, pdfItems, document.currency, 'SERVIÇOS', primaryColor, accentColor);
  yPosition = drawTotalSection(pdf, config, yPosition, document.total, document.currency, primaryColor);
  yPosition = checkPageBreak(pdf, config, yPosition, 80);
  yPosition = drawPaymentSection(pdf, config, yPosition, bankInfo, document.currency, primaryColor, accentColor);
  yPosition = drawProformaTerms(pdf, config, yPosition, primaryColor);

  if (document.observations) {
    yPosition = drawObservations(pdf, config, yPosition, document.observations, primaryColor, accentColor);
  }

  drawInvoiceFooter(pdf, config, pdfCompany, primaryColor);

  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}

// Generate Invoice PDF URL
export async function generateInvoicePdfUrl(
  document: FinancialDocument,
  clientInfo: ClientInfo,
  flightInfo?: FlightInfo,
  bankInfo: BankInfo = defaultBankInfo,
  dueDate?: string
): Promise<string> {
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

  let yPosition = drawHeader(pdf, config, {
    companyName: pdfCompany.name,
    subtitle: 'Fatura de Serviços',
    documentTitle: 'Invoice',
    documentNumber: document.number,
    createdAt: document.createdAt,
    primaryColor,
    accentColor,
  });

  yPosition = drawInvoiceStatus(pdf, config, yPosition, document.status, dueDate);
  yPosition = drawInfoBoxes(pdf, config, yPosition, pdfClient, pdfFlight, primaryColor);

  const pdfItems = document.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));

  yPosition = drawItemsTable(pdf, config, yPosition, pdfItems, document.currency, 'SERVIÇOS PRESTADOS', primaryColor, accentColor);
  yPosition = drawTotalSection(pdf, config, yPosition, document.total, document.currency, primaryColor);
  yPosition = checkPageBreak(pdf, config, yPosition, 80);

  if (document.status !== 'paid') {
    yPosition = drawPaymentSection(pdf, config, yPosition, bankInfo, document.currency, primaryColor, accentColor);
  }

  yPosition = drawInvoiceLegal(pdf, config, yPosition, document.number, primaryColor);

  if (document.observations) {
    yPosition = drawObservations(pdf, config, yPosition, document.observations, primaryColor, accentColor);
  }

  drawInvoiceFooter(pdf, config, pdfCompany, primaryColor);

  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}
