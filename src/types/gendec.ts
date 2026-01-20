// General Declaration (GenDec) Types - ICAO Standard

export type DeclarationType = 'outward' | 'inward';
export type GenDecStatus = 'draft' | 'completed' | 'archived';

export interface CrewMember {
  id: string;
  crewType: string;        // 'PIC', 'SIC', 'Cabin Crew', 'Flight Engineer', etc.
  crewName: string;
  passportOrId: string;
  documentExpiration: string;
  dateOfBirth: string;
  nationality: string;
}

export interface Passenger {
  id: string;
  passengerName: string;
  passportOrId: string;
  documentExpiration: string;
  dateOfBirth: string;
  nationality: string;
}

export interface HealthDeclaration {
  personsIllness: string;      // NIL or description
  otherConditions: string;     // NIL or description
  disinsectingDetails: string; // NIL or description
}

export interface GeneralDeclaration {
  id: string;
  number: string;
  companyId: string;
  flightId?: string;
  declarationType: DeclarationType;
  
  // Aircraft/Operator Information
  operator: string;
  marksOfRegistration: string;
  aircraftType: string;
  
  // Flight Information
  airportDeparture: string;
  dateDeparture: string;
  airportArrival: string;
  dateArrival: string;
  
  // Crew & Passengers (dynamic arrays)
  crewMembers: CrewMember[];
  passengers: Passenger[];
  
  // Declaration of Health
  healthDeclaration: HealthDeclaration;
  
  // Customization
  logoUrl?: string;
  primaryColor?: string;  // Hex color (e.g., #1E3A5F)
  
  observations?: string;
  status: GenDecStatus;
  createdAt: string;
  updatedAt: string;
}

// Crew type options
export const CREW_TYPES = [
  'PIC',
  'SIC',
  'Cabin Crew',
  'Flight Engineer',
  'Flight Attendant',
  'Navigator',
  'Other'
] as const;

// Status labels for display
export const GENDEC_STATUS_LABELS: Record<GenDecStatus, string> = {
  draft: 'Rascunho',
  completed: 'Concluída',
  archived: 'Arquivada'
};
