import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Flight } from '@/types/aviation';
import { mockFlights } from '@/data/mockData';

interface FlightsContextType {
  flights: Flight[];
  addFlight: (flight: Flight) => void;
  updateFlight: (id: string, flight: Partial<Flight>) => void;
  deleteFlight: (id: string) => void;
}

const FlightsContext = createContext<FlightsContextType | undefined>(undefined);

export const FlightsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flights, setFlights] = useState<Flight[]>(mockFlights);

  const addFlight = (flight: Flight) => {
    setFlights(prev => [...prev, flight]);
  };

  const updateFlight = (id: string, updates: Partial<Flight>) => {
    setFlights(prev => 
      prev.map(flight => 
        flight.id === id ? { ...flight, ...updates } : flight
      )
    );
  };

  const deleteFlight = (id: string) => {
    setFlights(prev => prev.filter(flight => flight.id !== id));
  };

  return (
    <FlightsContext.Provider value={{ flights, addFlight, updateFlight, deleteFlight }}>
      {children}
    </FlightsContext.Provider>
  );
};

export const useFlights = (): FlightsContextType => {
  const context = useContext(FlightsContext);
  if (!context) {
    throw new Error('useFlights must be used within a FlightsProvider');
  }
  return context;
};
