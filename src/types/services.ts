export interface Service {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  priceBrl: number;
  priceUsd: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const serviceCategories = [
  'Ground Handling',
  'Catering',
  'Combustível',
  'Transporte',
  'Hangaragem',
  'Manutenção',
  'Outros',
];
