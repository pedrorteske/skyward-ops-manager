import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Client, ClientPF, ClientPJ, ClientINT, ClientType } from '@/types/aviation';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUserFriendlyError } from '@/lib/errorHandler';

interface ClientsContextType {
  clients: Client[];
  isLoading: boolean;
  addClient: (client: Omit<Client, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, client: Omit<Client, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  refreshClients: () => Promise<void>;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

// Helper to map database row to Client type
const mapDbToClient = (row: any): Client => {
  const base = {
    id: row.id,
    companyId: row.company_id,
    status: row.status as 'active' | 'inactive',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.type === 'PF') {
    return {
      ...base,
      type: 'PF',
      fullName: row.full_name || '',
      cpf: row.cpf || '',
      email: row.email || '',
      phone: row.phone || '',
      observations: row.observations,
    } as ClientPF;
  } else if (row.type === 'PJ') {
    return {
      ...base,
      type: 'PJ',
      operator: row.operator || '',
      cnpj: row.cnpj || '',
      commercialEmail: row.commercial_email || '',
      phone: row.phone || '',
      contactPerson: row.contact_person || '',
      observations: row.observations,
    } as ClientPJ;
  } else {
    return {
      ...base,
      type: 'INT',
      operator: row.operator || '',
      country: row.country || '',
      email: row.email || '',
      phone: row.phone || '',
      observations: row.observations,
    } as ClientINT;
  }
};

export const ClientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const { toast } = useToast();

  const fetchClients = useCallback(async () => {
    if (!companyId) {
      setClients([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching clients:', error);
        toast({
          title: 'Erro ao carregar clientes',
          description: getUserFriendlyError(error),
          variant: 'destructive',
        });
        return;
      }

      setClients(data?.map(mapDbToClient) || []);
    } catch (err) {
      logger.error('Error in fetchClients:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast]);

  useEffect(() => {
    if (!companyLoading) {
      fetchClients();
    }
  }, [companyLoading, fetchClients]);

  const addClient = async (client: Omit<Client, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não encontrada',
        variant: 'destructive',
      });
      return;
    }

    const dbClient: any = {
      company_id: companyId,
      type: client.type,
      status: client.status,
      observations: client.observations,
    };

    if (client.type === 'PF') {
      const pf = client as Omit<ClientPF, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;
      dbClient.full_name = pf.fullName;
      dbClient.cpf = pf.cpf;
      dbClient.email = pf.email;
      dbClient.phone = pf.phone;
    } else if (client.type === 'PJ') {
      const pj = client as Omit<ClientPJ, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;
      dbClient.operator = pj.operator;
      dbClient.cnpj = pj.cnpj;
      dbClient.commercial_email = pj.commercialEmail;
      dbClient.phone = pj.phone;
      dbClient.contact_person = pj.contactPerson;
    } else {
      const int = client as Omit<ClientINT, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;
      dbClient.operator = int.operator;
      dbClient.country = int.country;
      dbClient.email = int.email;
      dbClient.phone = int.phone;
    }

    const { data, error } = await supabase
      .from('clients')
      .insert(dbClient)
      .select()
      .single();

    if (error) {
      logger.error('Error adding client:', error);
      toast({
        title: 'Erro ao adicionar cliente',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setClients(prev => [mapDbToClient(data), ...prev]);
    toast({
      title: 'Cliente adicionado',
      description: 'O cliente foi adicionado com sucesso.',
    });
  };

  const updateClient = async (id: string, client: Omit<Client, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    const dbClient: any = {
      type: client.type,
      status: client.status,
      observations: client.observations,
      // Clear all type-specific fields first
      full_name: null,
      cpf: null,
      operator: null,
      cnpj: null,
      commercial_email: null,
      contact_person: null,
      country: null,
      email: null,
      phone: null,
    };

    if (client.type === 'PF') {
      const pf = client as Omit<ClientPF, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;
      dbClient.full_name = pf.fullName;
      dbClient.cpf = pf.cpf;
      dbClient.email = pf.email;
      dbClient.phone = pf.phone;
    } else if (client.type === 'PJ') {
      const pj = client as Omit<ClientPJ, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;
      dbClient.operator = pj.operator;
      dbClient.cnpj = pj.cnpj;
      dbClient.commercial_email = pj.commercialEmail;
      dbClient.phone = pj.phone;
      dbClient.contact_person = pj.contactPerson;
    } else {
      const int = client as Omit<ClientINT, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>;
      dbClient.operator = int.operator;
      dbClient.country = int.country;
      dbClient.email = int.email;
      dbClient.phone = int.phone;
    }

    const { data, error } = await supabase
      .from('clients')
      .update(dbClient)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating client:', error);
      toast({
        title: 'Erro ao atualizar cliente',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setClients(prev =>
      prev.map(c => (c.id === id ? mapDbToClient(data) : c))
    );
    toast({
      title: 'Cliente atualizado',
      description: 'O cliente foi atualizado com sucesso.',
    });
  };

  const deleteClient = async (id: string) => {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting client:', error);
      toast({
        title: 'Erro ao excluir cliente',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setClients(prev => prev.filter(c => c.id !== id));
    toast({
      title: 'Cliente excluído',
      description: 'O cliente foi excluído com sucesso.',
    });
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  return (
    <ClientsContext.Provider
      value={{
        clients,
        isLoading,
        addClient,
        updateClient,
        deleteClient,
        getClientById,
        refreshClients: fetchClients,
      }}
    >
      {children}
    </ClientsContext.Provider>
  );
};

export const useClients = (): ClientsContextType => {
  const context = useContext(ClientsContext);
  if (!context) {
    throw new Error('useClients must be used within a ClientsProvider');
  }
  return context;
};
