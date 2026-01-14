// Financial Document PDF Generator
// Uses the standardized PDF core module

import jsPDF from 'jspdf';
import type { FinancialDocument } from '@/types/financial';
import { documentTypeLabels } from '@/types/financial';
import { companyConfig, getFullAddress } from '@/config/companyConfig';
import {
  createPDF,
  drawHeader,
  drawInfoBoxes,
  drawItemsTable,
  drawTotalSection,
  drawObservations,
  drawFooter,
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

// Map financial document type to PDF document type
function mapDocumentType(type: FinancialDocument['type']): PDFDocumentType {
  const mapping: Record<FinancialDocument['type'], PDFDocumentType> = {
    quotation: 'quotation',
    proforma: 'proforma',
    invoice: 'invoice',
  };
  return mapping[type];
}

export function generateFinancialPDF(
  document: FinancialDocument,
  clientInfo: ClientInfo,
  flightInfo?: FlightInfo
): void {
  const { pdf, config } = createPDF();
  
  // Get color scheme based on document type
  const pdfDocType = mapDocumentType(document.type);
  const colorScheme = documentColorSchemes[pdfDocType];
  const primaryColor = colorScheme.primary;
  const accentColor = colorScheme.accent;

  // Get document title
  const documentTitle = documentTypeLabels[document.type];

  // Company info for PDF
  const pdfCompany = {
    name: companyConfig.name,
    cnpj: companyConfig.cnpj,
    address: getFullAddress(),
    phone: companyConfig.phone,
    email: companyConfig.email,
    responsibleName: companyConfig.responsibleName,
    responsibleRole: companyConfig.responsibleRole,
  };

  // Client info for PDF
  const pdfClient = {
    name: clientInfo.name,
    document: clientInfo.document,
    email: clientInfo.email,
    phone: clientInfo.phone,
    address: clientInfo.address,
  };

  // Flight info for PDF (if provided)
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
    subtitle: document.type === 'quotation' ? 'Proposta Comercial' : undefined,
    documentTitle,
    documentNumber: document.number,
    createdAt: document.createdAt,
    validUntil: document.validUntil,
    primaryColor,
    accentColor,
  });

  // Draw client and flight info
  yPosition = drawInfoBoxes(
    pdf,
    config,
    yPosition,
    pdfClient,
    pdfFlight,
    primaryColor
  );

  // Convert items to PDF format
  const pdfItems = document.items.map(item => ({
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));

  // Draw items table
  yPosition = drawItemsTable(
    pdf,
    config,
    yPosition,
    pdfItems,
    document.currency,
    'ITENS / SERVIÇOS',
    primaryColor,
    accentColor
  );

  // Draw total section
  yPosition = drawTotalSection(
    pdf,
    config,
    yPosition,
    document.total,
    document.currency,
    primaryColor,
    document.subtotal !== document.total ? document.subtotal : undefined
  );

  // Draw observations if present
  if (document.observations) {
    yPosition = drawObservations(
      pdf,
      config,
      yPosition,
      document.observations,
      primaryColor,
      accentColor
    );
  }

  // Draw footer
  drawFooter(
    pdf,
    config,
    pdfCompany,
    primaryColor,
    document.type === 'quotation', // Show validity only for quotations
    7
  );

  // Save the PDF
  const fileName = `${document.type}_${document.number.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
}
