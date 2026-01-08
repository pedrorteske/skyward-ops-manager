import { Flight, Client, ClientPF, ClientPJ, Quotation, DashboardStats } from '@/types/aviation';

// Mock Flights - Empty for production
export const mockFlights: Flight[] = [];

// Mock Clients - Empty for production
export const mockClients: Client[] = [];

// Mock Quotations - Empty for production
export const mockQuotations: Quotation[] = [];

// Dashboard Stats - Zeroed for production
export const mockDashboardStats: DashboardStats = {
  flightsToday: 0,
  upcomingArrivals: 0,
  openQuotations: 0,
  activeClients: 0,
};

// Helper function to get client by ID
export const getClientById = (id: string): Client | undefined => {
  return mockClients.find(client => client.id === id);
};

// Helper function to get flight by ID
export const getFlightById = (id: string): Flight | undefined => {
  return mockFlights.find(flight => flight.id === id);
};
