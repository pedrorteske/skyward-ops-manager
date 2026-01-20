// Quotation PDF Preview Generator
// Generates PDF blob URLs for preview without downloading

import type { Quotation, Client, Flight } from '@/types/aviation';
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
import { documentColorSchemes } from './pdf/types';

interface QuotationPDFParams {
  quotation: Quotation;
  client?: Client;
  flight?: Flight;
}

function getClientName(client?: Client): string {
  if (!client) return 'Cliente não informado';
  return client.type === 'PF' ? client.fullName : client.operator;
}

function getClientDocument(client?: Client): string | undefined {
  if (!client) return undefined;
  if (client.type === 'PF') return client.cpf;
  if (client.type === 'PJ') return client.cnpj;
  return undefined;
}

function getClientEmail(client?: Client): string | undefined {
  if (!client) return undefined;
  if (client.type === 'PF') return client.email;
  if (client.type === 'PJ') return client.commercialEmail;
  if (client.type === 'INT') return client.email;
  return undefined;
}

function getClientPhone(client?: Client): string | undefined {
  if (!client) return undefined;
  return client.phone;
}

// Build PDF document
function buildQuotationPdf({ quotation, client, flight }: QuotationPDFParams) {
  const { pdf, config } = createPDF();
  
  // Get color scheme for quotations
  const colorScheme = documentColorSchemes.quotation;
  const primaryColor = colorScheme.primary;
  const accentColor = colorScheme.accent;

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
    name: getClientName(client),
    document: getClientDocument(client),
    email: getClientEmail(client),
    phone: getClientPhone(client),
  };

  // Flight info for PDF (if provided)
  const pdfFlight = flight ? {
    prefix: flight.aircraftPrefix,
    aircraftType: flight.aircraftModel,
    route: `${flight.origin} → ${flight.destination}`,
    date: flight.arrivalDate,
    eta: flight.arrivalTime,
    etd: flight.departureTime,
    flightType: flight.flightType,
  } : undefined;

  // Draw header
  let yPosition = drawHeader(pdf, config, {
    companyName: pdfCompany.name,
    subtitle: 'Proposta Comercial',
    documentTitle: 'Cotação',
    documentNumber: quotation.number,
    createdAt: quotation.createdAt,
    validUntil: quotation.validUntil,
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
  const pdfItems = quotation.items.map(item => ({
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
    quotation.currency,
    'ITENS / SERVIÇOS',
    primaryColor,
    accentColor
  );

  // Draw total section
  yPosition = drawTotalSection(
    pdf,
    config,
    yPosition,
    quotation.total,
    quotation.currency,
    primaryColor,
    quotation.subtotal !== quotation.total ? quotation.subtotal : undefined
  );

  // Draw observations if present
  if (quotation.observations) {
    yPosition = drawObservations(
      pdf,
      config,
      yPosition,
      quotation.observations,
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
    true,
    7
  );

  return pdf;
}

// Generate PDF URL for preview
export async function generateQuotationPdfUrl(params: QuotationPDFParams): Promise<string> {
  const pdf = buildQuotationPdf(params);
  const blob = pdf.output('blob');
  return URL.createObjectURL(blob);
}

// Download PDF directly
export function downloadQuotationPdf(params: QuotationPDFParams): void {
  const pdf = buildQuotationPdf(params);
  const fileName = `cotacao_${params.quotation.number.replace(/\//g, '-')}.pdf`;
  pdf.save(fileName);
}
