// Financial Module Types

export type FinancialDocumentType = 'quotation' | 'proforma' | 'invoice';

export type FinancialDocumentStatus = 'created' | 'sent' | 'approved' | 'paid' | 'cancelled';

export const financialStatusLabels: Record<FinancialDocumentStatus, string> = {
  created: 'Criado',
  sent: 'Enviado',
  approved: 'Aprovado',
  paid: 'Pago',
  cancelled: 'Cancelado',
};

export const financialStatusColors: Record<FinancialDocumentStatus, string> = {
  created: 'bg-muted text-muted-foreground',
  sent: 'bg-info/10 text-info',
  approved: 'bg-success/10 text-success',
  paid: 'bg-primary/10 text-primary',
  cancelled: 'bg-destructive/10 text-destructive',
};

export type Currency = 'BRL' | 'USD';

export interface FinancialItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface FinancialDocument {
  id: string;
  number: string;
  type: FinancialDocumentType;
  clientId: string;
  clientName?: string; // Free text client name when not linked to a registered client
  flightId?: string;
  flightInfo?: string; // Free text flight info when not linked to a registered flight
  items: FinancialItem[];
  currency: Currency;
  subtotal: number;
  total: number;
  status: FinancialDocumentStatus;
  observations?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  validUntil?: string;
  // Reference to parent documents
  quotationId?: string;
  proformaId?: string;
}

export const documentTypeLabels: Record<FinancialDocumentType, string> = {
  quotation: 'Cotação',
  proforma: 'Proforma Invoice',
  invoice: 'Invoice',
};
