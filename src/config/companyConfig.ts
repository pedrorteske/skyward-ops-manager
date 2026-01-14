// Company Configuration
// This file centralizes all company information used across the application
// In the future, this will be replaced by data from the database when authentication is implemented

export interface CompanyConfig {
  name: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  responsibleName: string;
  responsibleRole: string;
}

export const companyConfig: CompanyConfig = {
  name: 'Aviation SaaS Company',
  cnpj: '00.000.000/0001-00',
  address: 'Av. Exemplo, 1000',
  city: 'São Paulo',
  state: 'SP',
  country: 'Brasil',
  phone: '+55 11 99999-9999',
  email: 'contato@aviationsaas.com',
  website: 'www.aviationsaas.com',
  logoUrl: undefined, // Will be used when logo upload is implemented
  responsibleName: 'Responsável Comercial',
  responsibleRole: 'Coordenador de Operações',
};

// Helper to get full address
export const getFullAddress = (): string => {
  return `${companyConfig.address} - ${companyConfig.city}, ${companyConfig.state}`;
};
