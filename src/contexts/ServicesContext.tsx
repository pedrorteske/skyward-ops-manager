import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { Service } from '@/types/services';
import { toast } from '@/hooks/use-toast';
import { getUserFriendlyError } from '@/lib/errorHandler';
interface ServicesContextType {
  services: Service[];
  isLoading: boolean;
  addService: (service: Omit<Service, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  refreshServices: () => Promise<void>;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export function ServicesProvider({ children }: { children: React.ReactNode }) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { companyId } = useCompanyId();

  const fetchServices = useCallback(async () => {
    if (!companyId) {
      setServices([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true });

      if (error) throw error;

      const mappedServices: Service[] = (data || []).map((s) => ({
        id: s.id,
        companyId: s.company_id,
        name: s.name,
        description: s.description,
        priceBrl: Number(s.price_brl),
        priceUsd: Number(s.price_usd),
        category: s.category,
        isActive: s.is_active,
        createdAt: s.created_at,
        updatedAt: s.updated_at,
      }));

      setServices(mappedServices);
    } catch (error) {
      toast({
        title: 'Erro',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addService = async (service: Omit<Service, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não identificada.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('services').insert({
        company_id: companyId,
        name: service.name,
        description: service.description,
        price_brl: service.priceBrl,
        price_usd: service.priceUsd,
        category: service.category,
        is_active: service.isActive,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Serviço adicionado com sucesso.',
      });

      await fetchServices();
    } catch (error) {
      toast({
        title: 'Erro',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
    }
  };

  const updateService = async (id: string, service: Partial<Service>) => {
    try {
      const updateData: Record<string, unknown> = {};
      if (service.name !== undefined) updateData.name = service.name;
      if (service.description !== undefined) updateData.description = service.description;
      if (service.priceBrl !== undefined) updateData.price_brl = service.priceBrl;
      if (service.priceUsd !== undefined) updateData.price_usd = service.priceUsd;
      if (service.category !== undefined) updateData.category = service.category;
      if (service.isActive !== undefined) updateData.is_active = service.isActive;

      const { error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Serviço atualizado com sucesso.',
      });

      await fetchServices();
    } catch (error) {
      toast({
        title: 'Erro',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Serviço excluído com sucesso.',
      });

      await fetchServices();
    } catch (error) {
      toast({
        title: 'Erro',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <ServicesContext.Provider
      value={{
        services,
        isLoading,
        addService,
        updateService,
        deleteService,
        refreshServices: fetchServices,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}
