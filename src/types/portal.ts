// Portal Settings Types

export interface PortalSettings {
  id: string;
  companyId: string;
  enabled: boolean;
  displayName: string | null;
  logoUrl: string | null;
  visibleColumns: string[];
  dateFiltersEnabled: boolean;
  accessType: 'public' | 'protected';
  accessToken: string | null;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicFlight {
  id: string;
  aircraft_prefix: string;
  aircraft_model: string;
  origin: string;
  destination: string;
  base: string | null;
  arrival_date: string;
  arrival_time: string;
  departure_date: string;
  departure_time: string;
  status: 'scheduled' | 'arrived' | 'departed' | 'cancelled' | 'delayed';
}

export interface PublicPortalData {
  company_id: string;
  display_name: string | null;
  logo_url: string | null;
  visible_columns: string[];
  date_filters_enabled: boolean;
  access_type: 'public' | 'protected';
}

export const COLUMN_OPTIONS = [
  { value: 'aircraft', label: 'Aeronave' },
  { value: 'model', label: 'Modelo' },
  { value: 'route', label: 'Rota' },
  { value: 'base', label: 'Base' },
  { value: 'arrival_date', label: 'Data Chegada' },
  { value: 'arrival_time', label: 'Hora Chegada' },
  { value: 'departure_date', label: 'Data Partida' },
  { value: 'departure_time', label: 'Hora Partida' },
  { value: 'status', label: 'Status' },
] as const;

export const STATUS_LABELS: Record<PublicFlight['status'], string> = {
  scheduled: 'Programado',
  arrived: 'Chegou',
  departed: 'Partiu',
  cancelled: 'Cancelado',
  delayed: 'Atrasado',
};
