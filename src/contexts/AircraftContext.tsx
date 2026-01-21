import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Aircraft, AircraftCategory } from '@/types/aircraft';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUserFriendlyError } from '@/lib/errorHandler';

interface AircraftContextType {
  aircraft: Aircraft[];
  isLoading: boolean;
  addAircraft: (aircraft: Omit<Aircraft, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAircraft: (id: string, aircraft: Partial<Aircraft>) => Promise<void>;
  deleteAircraft: (id: string) => Promise<void>;
  getAircraftByPrefix: (prefix: string) => Aircraft | undefined;
  refreshAircraft: () => Promise<void>;
}

const AircraftContext = createContext<AircraftContextType | undefined>(undefined);

const mapDbToAircraft = (row: any): Aircraft => ({
  id: row.id,
  companyId: row.company_id,
  ownerOperator: row.owner_operator,
  registrationCountry: row.registration_country,
  registrationPrefix: row.registration_prefix,
  model: row.model,
  category: row.category as AircraftCategory,
  hasAvanac: row.has_avanac,
  hasAvoem: row.has_avoem,
  hasTecat: row.has_tecat,
  hasGendecTemplate: row.has_gendec_template,
  hasFuelRelease: row.has_fuel_release,
  observations: row.observations,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const AircraftProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const { toast } = useToast();

  const fetchAircraft = useCallback(async () => {
    if (!companyId) {
      setAircraft([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('aircraft')
        .select('*')
        .eq('company_id', companyId)
        .order('registration_prefix', { ascending: true });

      if (error) {
        logger.error('Error fetching aircraft:', error);
        toast({
          title: 'Erro ao carregar aeronaves',
          description: getUserFriendlyError(error),
          variant: 'destructive',
        });
        return;
      }

      setAircraft(data?.map(mapDbToAircraft) || []);
    } catch (err) {
      logger.error('Error in fetchAircraft:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast]);

  useEffect(() => {
    if (!companyLoading) {
      fetchAircraft();
    }
  }, [companyLoading, fetchAircraft]);

  const addAircraft = async (newAircraft: Omit<Aircraft, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não encontrada',
        variant: 'destructive',
      });
      return;
    }

    const { data, error } = await supabase
      .from('aircraft')
      .insert({
        company_id: companyId,
        owner_operator: newAircraft.ownerOperator,
        registration_country: newAircraft.registrationCountry,
        registration_prefix: newAircraft.registrationPrefix,
        model: newAircraft.model,
        category: newAircraft.category,
        has_avanac: newAircraft.hasAvanac,
        has_avoem: newAircraft.hasAvoem,
        has_tecat: newAircraft.hasTecat,
        has_gendec_template: newAircraft.hasGendecTemplate,
        has_fuel_release: newAircraft.hasFuelRelease,
        observations: newAircraft.observations,
        status: newAircraft.status,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error adding aircraft:', error);
      toast({
        title: 'Erro ao adicionar aeronave',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setAircraft(prev => [...prev, mapDbToAircraft(data)].sort((a, b) => 
      a.registrationPrefix.localeCompare(b.registrationPrefix)
    ));
    toast({
      title: 'Aeronave adicionada',
      description: 'A aeronave foi adicionada com sucesso.',
    });
  };

  const updateAircraft = async (id: string, updates: Partial<Aircraft>) => {
    const dbUpdates: any = {};
    if (updates.ownerOperator !== undefined) dbUpdates.owner_operator = updates.ownerOperator;
    if (updates.registrationCountry !== undefined) dbUpdates.registration_country = updates.registrationCountry;
    if (updates.registrationPrefix !== undefined) dbUpdates.registration_prefix = updates.registrationPrefix;
    if (updates.model !== undefined) dbUpdates.model = updates.model;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.hasAvanac !== undefined) dbUpdates.has_avanac = updates.hasAvanac;
    if (updates.hasAvoem !== undefined) dbUpdates.has_avoem = updates.hasAvoem;
    if (updates.hasTecat !== undefined) dbUpdates.has_tecat = updates.hasTecat;
    if (updates.hasGendecTemplate !== undefined) dbUpdates.has_gendec_template = updates.hasGendecTemplate;
    if (updates.hasFuelRelease !== undefined) dbUpdates.has_fuel_release = updates.hasFuelRelease;
    if (updates.observations !== undefined) dbUpdates.observations = updates.observations;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('aircraft')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating aircraft:', error);
      toast({
        title: 'Erro ao atualizar aeronave',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setAircraft(prev =>
      prev.map(a => (a.id === id ? mapDbToAircraft(data) : a))
        .sort((a, b) => a.registrationPrefix.localeCompare(b.registrationPrefix))
    );
    toast({
      title: 'Aeronave atualizada',
      description: 'A aeronave foi atualizada com sucesso.',
    });
  };

  const deleteAircraft = async (id: string) => {
    const { error } = await supabase
      .from('aircraft')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting aircraft:', error);
      toast({
        title: 'Erro ao excluir aeronave',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setAircraft(prev => prev.filter(a => a.id !== id));
    toast({
      title: 'Aeronave excluída',
      description: 'A aeronave foi excluída com sucesso.',
    });
  };

  const getAircraftByPrefix = (prefix: string): Aircraft | undefined => {
    return aircraft.find(a => 
      a.registrationPrefix.toLowerCase() === prefix.toLowerCase() && a.status === 'active'
    );
  };

  return (
    <AircraftContext.Provider
      value={{
        aircraft,
        isLoading,
        addAircraft,
        updateAircraft,
        deleteAircraft,
        getAircraftByPrefix,
        refreshAircraft: fetchAircraft,
      }}
    >
      {children}
    </AircraftContext.Provider>
  );
};

export const useAircraft = (): AircraftContextType => {
  const context = useContext(AircraftContext);
  if (!context) {
    throw new Error('useAircraft must be used within an AircraftProvider');
  }
  return context;
};
