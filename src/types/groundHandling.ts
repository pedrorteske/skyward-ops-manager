// Ground Handling Quotation Types

export type ClientType = 'PF' | 'PJ' | 'INT';

export type PaymentMethod = 'antecipado' | 'link' | 'transferencia';

export type ChargeUnit = 'utilizacao' | 'hora' | 'movimento';

export interface GroundHandlingClient {
  name: string;
  type: ClientType;
  operator: string;
  cnpj?: string;
  email: string;
  observations?: string;
}

export interface OperationInfo {
  airport: string;
  operationDate: string;
  aircraftType: string;
  aircraftPrefix: string;
  flightType: string;
  eta?: string;
  etd?: string;
  observations?: string;
}

export interface IncludedService {
  id: string;
  name: string;
  checked: boolean;
}

export interface AdditionalService {
  id: string;
  name: string;
  unitPrice: number;
  chargeUnit: ChargeUnit;
  quantity: number;
  total: number;
  unavailableNote?: string;
}

export interface PaymentInfo {
  method: PaymentMethod;
  pixData: string;
  observations?: string;
}

export interface FinancialSummary {
  serviceValue: number;
  additionalServicesTotal: number;
  adminFee: number;
  grandTotal: number;
}

export interface GroundHandlingQuotation {
  id: string;
  number: string;
  client: GroundHandlingClient;
  operation: OperationInfo;
  serviceValue: number;
  currency: 'BRL' | 'USD';
  includedServices: IncludedService[];
  additionalServices: AdditionalService[];
  applyAdminFee: boolean;
  adminFeePercentage: number;
  adminFeeText: string;
  taxObservation: string;
  payment: PaymentInfo;
  summary: FinancialSummary;
  companyId: string;
  companyName: string;
  responsibleName: string;
  responsibleRole: string;
  responsiblePhone: string;
  responsibleEmail: string;
  createdAt: string;
  updatedAt: string;
}

// Default included services for ground handling
export const defaultIncludedServices: Omit<IncludedService, 'id'>[] = [
  { name: 'Recepção de tripulantes e passageiros', checked: true },
  { name: 'Descarregamento / carregamento de bagagens', checked: true },
  { name: 'Acompanhamento em alfândega e imigração', checked: true },
  { name: 'Transporte de passageiros e tripulantes (rampa / aeroporto / rampa)', checked: true },
  { name: 'Coordenação de catering', checked: true },
  { name: 'Coordenação de abastecimento', checked: true },
  { name: 'Calços e cones', checked: true },
];

// Default additional services suggestions
export const defaultAdditionalServices: Omit<AdditionalService, 'id' | 'total'>[] = [
  { name: 'QTA', unitPrice: 0, chargeUnit: 'utilizacao', quantity: 1 },
  { name: 'QTU', unitPrice: 0, chargeUnit: 'utilizacao', quantity: 1 },
  { name: 'GPU', unitPrice: 0, chargeUnit: 'hora', quantity: 1 },
  { name: 'Push-back', unitPrice: 0, chargeUnit: 'movimento', quantity: 1 },
  { name: 'Reboque', unitPrice: 0, chargeUnit: 'movimento', quantity: 1 },
];

export const chargeUnitLabels: Record<ChargeUnit, string> = {
  utilizacao: 'por utilização',
  hora: 'por hora ou fração',
  movimento: 'por movimento',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  antecipado: 'Antecipado',
  link: 'Link de Pagamento',
  transferencia: 'Transferência Bancária',
};

export const flightTypeOptions = [
  'Aviação Executiva',
  'Táxi Aéreo',
  'Comercial Regular',
  'Comercial Não Regular',
  'Carga',
  'Aeromédico',
  'Doméstico',
  'Internacional',
  'Instrução',
];
