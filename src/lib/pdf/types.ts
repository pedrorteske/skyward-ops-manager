// PDF Generation Types

export type PDFDocumentType = 
  | 'quotation' 
  | 'proforma' 
  | 'invoice' 
  | 'ground_handling' 
  | 'service_order';

export interface PDFColors {
  primary: [number, number, number];
  accent: [number, number, number];
  success: [number, number, number];
  warning: [number, number, number];
  text: [number, number, number];
  muted: [number, number, number];
  border: [number, number, number];
  lightBg: [number, number, number];
  white: [number, number, number];
}

export interface PDFCompanyInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  responsibleName?: string;
  responsibleRole?: string;
}

export interface PDFClientInfo {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: 'PF' | 'PJ' | 'INT';
}

export interface PDFFlightInfo {
  prefix: string;
  aircraftType?: string;
  route: string;
  date: string;
  eta?: string;
  etd?: string;
  flightType?: string;
}

export interface PDFItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  unit?: string;
  note?: string;
}

export interface PDFDocumentData {
  type: PDFDocumentType;
  number: string;
  currency: 'BRL' | 'USD';
  createdAt: string;
  validUntil?: string;
  items: PDFItem[];
  subtotal: number;
  total: number;
  observations?: string;
  company: PDFCompanyInfo;
  client: PDFClientInfo;
  flight?: PDFFlightInfo;
}

// Color schemes for each document type
export const documentColorSchemes: Record<PDFDocumentType, { primary: [number, number, number]; accent: [number, number, number] }> = {
  quotation: {
    primary: [37, 99, 235],    // Blue - #2563EB
    accent: [59, 130, 246],    // Light Blue - #3B82F6
  },
  proforma: {
    primary: [5, 150, 105],    // Green - #059669
    accent: [16, 185, 129],    // Light Green - #10B981
  },
  invoice: {
    primary: [15, 23, 42],     // Dark Slate - #0F172A
    accent: [51, 65, 85],      // Slate - #334155
  },
  ground_handling: {
    primary: [30, 58, 95],     // Aviation Navy - #1E3A5F
    accent: [59, 130, 246],    // Sky Blue - #3B82F6
  },
  service_order: {
    primary: [124, 58, 237],   // Purple - #7C3AED
    accent: [167, 139, 250],   // Light Purple - #A78BFA
  },
};

// Document type labels
export const documentTypeLabels: Record<PDFDocumentType, string> = {
  quotation: 'Cotação',
  proforma: 'Proforma Invoice',
  invoice: 'Invoice',
  ground_handling: 'Cotação Ground Handling',
  service_order: 'Ordem de Serviço',
};
