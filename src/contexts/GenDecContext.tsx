import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { GeneralDeclaration, CrewMember, Passenger, HealthDeclaration, GenDecStatus, DeclarationType } from '@/types/gendec';
import { toast } from 'sonner';
import { handleError } from '@/lib/errorHandler';
import { logger } from '@/lib/logger';

interface GenDecContextType {
  gendecs: GeneralDeclaration[];
  isLoading: boolean;
  addGenDec: (gendec: Omit<GeneralDeclaration, 'id' | 'number' | 'createdAt' | 'updatedAt'>) => Promise<GeneralDeclaration | null>;
  updateGenDec: (id: string, gendec: Partial<GeneralDeclaration>) => Promise<boolean>;
  deleteGenDec: (id: string) => Promise<boolean>;
  refreshGenDecs: () => Promise<void>;
  getNextNumber: () => string;
}

const GenDecContext = createContext<GenDecContextType | undefined>(undefined);

// Map database row to TypeScript interface
const mapDbToGenDec = (row: any): GeneralDeclaration => ({
  id: row.id,
  number: row.number,
  companyId: row.company_id,
  flightId: row.flight_id,
  declarationType: row.declaration_type as DeclarationType,
  operator: row.operator,
  marksOfRegistration: row.marks_of_registration,
  aircraftType: row.aircraft_type,
  airportDeparture: row.airport_departure,
  dateDeparture: row.date_departure,
  airportArrival: row.airport_arrival,
  dateArrival: row.date_arrival,
  flightNumber: row.flight_number,
  crewMembers: (row.crew_members || []) as CrewMember[],
  passengers: (row.passengers || []) as Passenger[],
  healthDeclaration: {
    personsIllness: row.health_persons_illness || 'NIL',
    otherConditions: row.health_other_conditions || 'NIL',
    disinsectingDetails: row.health_disinsecting || 'NIL',
  },
  logoUrl: row.logo_url,
  primaryColor: row.primary_color,
  observations: row.observations,
  status: row.status as GenDecStatus,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Map TypeScript interface to database row
const mapGenDecToDb = (gendec: Partial<GeneralDeclaration>) => {
  const result: Record<string, any> = {};
  
  if (gendec.companyId !== undefined) result.company_id = gendec.companyId;
  if (gendec.flightId !== undefined) result.flight_id = gendec.flightId;
  if (gendec.declarationType !== undefined) result.declaration_type = gendec.declarationType;
  if (gendec.operator !== undefined) result.operator = gendec.operator;
  if (gendec.marksOfRegistration !== undefined) result.marks_of_registration = gendec.marksOfRegistration;
  if (gendec.aircraftType !== undefined) result.aircraft_type = gendec.aircraftType;
  if (gendec.airportDeparture !== undefined) result.airport_departure = gendec.airportDeparture;
  if (gendec.dateDeparture !== undefined) result.date_departure = gendec.dateDeparture;
  if (gendec.airportArrival !== undefined) result.airport_arrival = gendec.airportArrival;
  if (gendec.dateArrival !== undefined) result.date_arrival = gendec.dateArrival;
  if (gendec.flightNumber !== undefined) result.flight_number = gendec.flightNumber;
  if (gendec.crewMembers !== undefined) result.crew_members = gendec.crewMembers;
  if (gendec.passengers !== undefined) result.passengers = gendec.passengers;
  if (gendec.healthDeclaration !== undefined) {
    result.health_persons_illness = gendec.healthDeclaration.personsIllness;
    result.health_other_conditions = gendec.healthDeclaration.otherConditions;
    result.health_disinsecting = gendec.healthDeclaration.disinsectingDetails;
  }
  if (gendec.logoUrl !== undefined) result.logo_url = gendec.logoUrl;
  if (gendec.primaryColor !== undefined) result.primary_color = gendec.primaryColor;
  if (gendec.observations !== undefined) result.observations = gendec.observations;
  if (gendec.status !== undefined) result.status = gendec.status;
  if (gendec.number !== undefined) result.number = gendec.number;
  
  return result;
};

export const GenDecProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gendecs, setGenDecs] = useState<GeneralDeclaration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { companyId } = useCompanyId();

  const fetchGenDecs = useCallback(async () => {
    if (!companyId) {
      setGenDecs([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('general_declarations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGenDecs((data || []).map(mapDbToGenDec));
    } catch (error) {
      const message = handleError(error, logger, 'GenDecContext.fetchGenDecs');
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchGenDecs();
  }, [fetchGenDecs]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('general_declarations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'general_declarations',
          filter: `company_id=eq.${companyId}`,
        },
        () => {
          fetchGenDecs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId, fetchGenDecs]);

  const getNextNumber = useCallback(() => {
    const year = new Date().getFullYear();
    const existingNumbers = gendecs
      .filter(g => g.number.startsWith(`GENDEC-${year}-`))
      .map(g => {
        const parts = g.number.split('-');
        return parseInt(parts[2] || '0', 10);
      });
    
    const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
    return `GENDEC-${year}-${String(maxNumber + 1).padStart(4, '0')}`;
  }, [gendecs]);

  const addGenDec = useCallback(async (gendec: Omit<GeneralDeclaration, 'id' | 'number' | 'createdAt' | 'updatedAt'>): Promise<GeneralDeclaration | null> => {
    if (!companyId) {
      toast.error('Empresa não encontrada');
      return null;
    }

    try {
      const number = getNextNumber();
      const dbData = {
        ...mapGenDecToDb(gendec),
        company_id: companyId,
        number,
      };

      const { data, error } = await supabase
        .from('general_declarations')
        .insert(dbData as any)
        .select()
        .single();

      if (error) throw error;
      
      const newGenDec = mapDbToGenDec(data);
      toast.success('General Declaration criada com sucesso');
      return newGenDec;
    } catch (error) {
      const message = handleError(error, logger, 'GenDecContext.addGenDec');
      toast.error(message);
      return null;
    }
  }, [companyId, getNextNumber]);

  const updateGenDec = useCallback(async (id: string, gendec: Partial<GeneralDeclaration>): Promise<boolean> => {
    try {
      const dbData = mapGenDecToDb(gendec);
      
      const { error } = await supabase
        .from('general_declarations')
        .update(dbData)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('General Declaration atualizada com sucesso');
      return true;
    } catch (error) {
      const message = handleError(error, logger, 'GenDecContext.updateGenDec');
      toast.error(message);
      return false;
    }
  }, []);

  const deleteGenDec = useCallback(async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('general_declarations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('General Declaration excluída com sucesso');
      return true;
    } catch (error) {
      const message = handleError(error, logger, 'GenDecContext.deleteGenDec');
      toast.error(message);
      return false;
    }
  }, []);

  return (
    <GenDecContext.Provider value={{
      gendecs,
      isLoading,
      addGenDec,
      updateGenDec,
      deleteGenDec,
      refreshGenDecs: fetchGenDecs,
      getNextNumber,
    }}>
      {children}
    </GenDecContext.Provider>
  );
};

export const useGenDec = () => {
  const context = useContext(GenDecContext);
  if (context === undefined) {
    throw new Error('useGenDec must be used within a GenDecProvider');
  }
  return context;
};
