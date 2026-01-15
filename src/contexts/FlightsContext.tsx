import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Flight, FlightType, FlightStatus } from '@/types/aviation';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUserFriendlyError } from '@/lib/errorHandler';

interface FlightsContextType {
  flights: Flight[];
  isLoading: boolean;
  addFlight: (flight: Omit<Flight, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateFlight: (id: string, flight: Partial<Flight>) => Promise<void>;
  deleteFlight: (id: string) => Promise<void>;
  refreshFlights: () => Promise<void>;
}

const FlightsContext = createContext<FlightsContextType | undefined>(undefined);

// Helper to map database row to Flight type
const mapDbToFlight = (row: any): Flight => ({
  id: row.id,
  aircraftPrefix: row.aircraft_prefix,
  aircraftModel: row.aircraft_model,
  flightType: row.flight_type as FlightType,
  origin: row.origin,
  destination: row.destination,
  base: row.base,
  arrivalDate: row.arrival_date,
  arrivalTime: row.arrival_time,
  departureDate: row.departure_date,
  departureTime: row.departure_time,
  status: row.status as FlightStatus,
  observations: row.observations,
  companyId: row.company_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const FlightsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const { toast } = useToast();

  const fetchFlights = useCallback(async () => {
    if (!companyId) {
      setFlights([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('flights')
        .select('*')
        .eq('company_id', companyId)
        .order('arrival_date', { ascending: false });

      if (error) {
        logger.error('Error fetching flights:', error);
        toast({
          title: 'Erro ao carregar voos',
          description: getUserFriendlyError(error),
          variant: 'destructive',
        });
        return;
      }

      setFlights(data?.map(mapDbToFlight) || []);
    } catch (err) {
      logger.error('Error in fetchFlights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast]);

  useEffect(() => {
    if (!companyLoading) {
      fetchFlights();
    }
  }, [companyLoading, fetchFlights]);

  const addFlight = async (flight: Omit<Flight, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não encontrada',
        variant: 'destructive',
      });
      return;
    }

    const { data, error } = await supabase
      .from('flights')
      .insert({
        company_id: companyId,
        aircraft_prefix: flight.aircraftPrefix,
        aircraft_model: flight.aircraftModel,
        flight_type: flight.flightType,
        origin: flight.origin,
        destination: flight.destination,
        base: flight.base,
        arrival_date: flight.arrivalDate,
        arrival_time: flight.arrivalTime,
        departure_date: flight.departureDate,
        departure_time: flight.departureTime,
        status: flight.status,
        observations: flight.observations,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error adding flight:', error);
      toast({
        title: 'Erro ao adicionar voo',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setFlights(prev => [mapDbToFlight(data), ...prev]);
    toast({
      title: 'Voo adicionado',
      description: 'O voo foi adicionado com sucesso.',
    });
  };

  const updateFlight = async (id: string, updates: Partial<Flight>) => {
    const dbUpdates: any = {};
    if (updates.aircraftPrefix !== undefined) dbUpdates.aircraft_prefix = updates.aircraftPrefix;
    if (updates.aircraftModel !== undefined) dbUpdates.aircraft_model = updates.aircraftModel;
    if (updates.flightType !== undefined) dbUpdates.flight_type = updates.flightType;
    if (updates.origin !== undefined) dbUpdates.origin = updates.origin;
    if (updates.destination !== undefined) dbUpdates.destination = updates.destination;
    if (updates.base !== undefined) dbUpdates.base = updates.base;
    if (updates.arrivalDate !== undefined) dbUpdates.arrival_date = updates.arrivalDate;
    if (updates.arrivalTime !== undefined) dbUpdates.arrival_time = updates.arrivalTime;
    if (updates.departureDate !== undefined) dbUpdates.departure_date = updates.departureDate;
    if (updates.departureTime !== undefined) dbUpdates.departure_time = updates.departureTime;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.observations !== undefined) dbUpdates.observations = updates.observations;

    const { data, error } = await supabase
      .from('flights')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating flight:', error);
      toast({
        title: 'Erro ao atualizar voo',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setFlights(prev =>
      prev.map(flight => (flight.id === id ? mapDbToFlight(data) : flight))
    );
    toast({
      title: 'Voo atualizado',
      description: 'O voo foi atualizado com sucesso.',
    });
  };

  const deleteFlight = async (id: string) => {
    const { error } = await supabase
      .from('flights')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting flight:', error);
      toast({
        title: 'Erro ao excluir voo',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setFlights(prev => prev.filter(flight => flight.id !== id));
    toast({
      title: 'Voo excluído',
      description: 'O voo foi excluído com sucesso.',
    });
  };

  return (
    <FlightsContext.Provider
      value={{
        flights,
        isLoading,
        addFlight,
        updateFlight,
        deleteFlight,
        refreshFlights: fetchFlights,
      }}
    >
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
