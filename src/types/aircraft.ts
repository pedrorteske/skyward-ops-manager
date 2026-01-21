// Types for Aircraft Module

export type AircraftCategory = 
  | 'fixed_wing'
  | 'helicopter'
  | 'glider'
  | 'motorglider'
  | 'balloon'
  | 'airship'
  | 'amphibious'
  | 'seaplane'
  | 'rpa_drone'
  | 'ultralight'
  | 'gyrocopter';

export const aircraftCategoryLabels: Record<AircraftCategory, string> = {
  fixed_wing: 'Aeronave de Asa Fixa',
  helicopter: 'Helicóptero',
  glider: 'Planador',
  motorglider: 'Motoplanador',
  balloon: 'Balão Livre Tripulado',
  airship: 'Dirigível',
  amphibious: 'Aeronave Anfíbia',
  seaplane: 'Hidroavião',
  rpa_drone: 'Aeronave Remotamente Pilotada (RPA / Drone)',
  ultralight: 'Ultraleve',
  gyrocopter: 'Girocóptero',
};

export interface Aircraft {
  id: string;
  companyId: string;
  ownerOperator: string;
  registrationCountry: string;
  registrationPrefix: string;
  model: string;
  category: AircraftCategory;
  hasAvanac: boolean;
  hasAvoem: boolean;
  hasTecat: boolean;
  hasGendecTemplate: boolean;
  hasFuelRelease: boolean;
  observations?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface FlightDocuments {
  docAvanac: boolean;
  docAvoem: boolean;
  docTecat: boolean;
  docGendec: boolean;
  docFuelRelease: boolean;
}
