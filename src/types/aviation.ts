// Types for the Aviation SaaS System

// Flight Types
export type FlightType = 'S' | 'N' | 'G' | 'M';

export const flightTypeLabels: Record<FlightType, string> = {
  S: 'Transporte Aéreo Regular',
  N: 'Transporte Aéreo Não Regular',
  G: 'Aviação Geral',
  M: 'Aeronave Militar',
};

export type FlightStatus = 'scheduled' | 'arrived' | 'departed' | 'cancelled' | 'delayed';

export const flightStatusLabels: Record<FlightStatus, string> = {
  scheduled: 'Programado',
  arrived: 'Chegou',
  departed: 'Partiu',
  cancelled: 'Cancelado',
  delayed: 'Atrasado',
};

export interface Flight {
  id: string;
  aircraftPrefix: string;
  aircraftModel: string;
  flightType: FlightType;
  origin: string;
  destination: string;
  base?: string;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  departureTime: string;
  status: FlightStatus;
  observations?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

// Client Types
export type ClientType = 'PF' | 'PJ' | 'INT';

export interface ClientPF {
  id: string;
  type: 'PF';
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  observations?: string;
  status: 'active' | 'inactive';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPJ {
  id: string;
  type: 'PJ';
  operator: string;
  cnpj: string;
  commercialEmail: string;
  phone: string;
  contactPerson: string;
  observations?: string;
  status: 'active' | 'inactive';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientINT {
  id: string;
  type: 'INT';
  operator: string;
  country: string;
  email: string;
  phone: string;
  observations?: string;
  status: 'active' | 'inactive';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export type Client = ClientPF | ClientPJ | ClientINT;

// Quotation Types
export type QuotationStatus = 'created' | 'sent' | 'approved' | 'rejected';

export const quotationStatusLabels: Record<QuotationStatus, string> = {
  created: 'Criada',
  sent: 'Enviada',
  approved: 'Aprovada',
  rejected: 'Recusada',
};

export type Currency = 'BRL' | 'USD';

export interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quotation {
  id: string;
  number: string;
  clientId: string;
  flightId?: string;
  items: QuotationItem[];
  currency: Currency;
  subtotal: number;
  total: number;
  status: QuotationStatus;
  observations?: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  validUntil: string;
}

// User Types
export type UserRole = 'admin' | 'operational' | 'commercial';

export const userRoleLabels: Record<UserRole, string> = {
  admin: 'Administrador',
  operational: 'Operacional',
  commercial: 'Comercial',
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Company Types
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address?: string;
  logo?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  flightsToday: number;
  upcomingArrivals: number;
  openQuotations: number;
  activeClients: number;
}
