import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Quotation, QuotationStatus, QuotationItem, Currency } from '@/types/aviation';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUserFriendlyError } from '@/lib/errorHandler';

interface QuotationsContextType {
  quotations: Quotation[];
  isLoading: boolean;
  addQuotation: (quotation: Omit<Quotation, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => Promise<void>;
  deleteQuotation: (id: string) => Promise<void>;
  updateQuotationStatus: (id: string, status: QuotationStatus) => Promise<void>;
  refreshQuotations: () => Promise<void>;
  generateQuotationNumber: () => string;
}

const QuotationsContext = createContext<QuotationsContextType | undefined>(undefined);

// Helper to map database row to Quotation type
const mapDbToQuotation = (row: any): Quotation => ({
  id: row.id,
  number: row.number,
  clientId: row.client_id,
  flightId: row.flight_id,
  items: row.items as QuotationItem[],
  currency: row.currency as Currency,
  subtotal: parseFloat(row.subtotal),
  total: parseFloat(row.total),
  status: row.status as QuotationStatus,
  observations: row.observations,
  companyId: row.company_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  validUntil: row.valid_until,
});

export const QuotationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const { toast } = useToast();

  const fetchQuotations = useCallback(async () => {
    if (!companyId) {
      setQuotations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('quotations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching quotations:', error);
        toast({
          title: 'Erro ao carregar cotações',
          description: getUserFriendlyError(error),
          variant: 'destructive',
        });
        return;
      }

      setQuotations(data?.map(mapDbToQuotation) || []);
    } catch (err) {
      logger.error('Error in fetchQuotations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast]);

  useEffect(() => {
    if (!companyLoading) {
      fetchQuotations();
    }
  }, [companyLoading, fetchQuotations]);

  const generateQuotationNumber = (): string => {
    const year = new Date().getFullYear();
    const nextNumber = String(quotations.length + 1).padStart(3, '0');
    return `COT-${year}-${nextNumber}`;
  };

  const addQuotation = async (quotation: Omit<Quotation, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não encontrada',
        variant: 'destructive',
      });
      return;
    }

    const { data, error } = await supabase
      .from('quotations')
      .insert({
        company_id: companyId,
        client_id: quotation.clientId,
        flight_id: quotation.flightId || null,
        number: quotation.number,
        items: quotation.items as unknown as any,
        currency: quotation.currency,
        subtotal: quotation.subtotal,
        total: quotation.total,
        status: quotation.status,
        observations: quotation.observations,
        valid_until: quotation.validUntil,
      } as any)
      .select()
      .single();

    if (error) {
      logger.error('Error adding quotation:', error);
      toast({
        title: 'Erro ao adicionar cotação',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setQuotations(prev => [mapDbToQuotation(data), ...prev]);
    toast({
      title: 'Cotação adicionada',
      description: 'A cotação foi adicionada com sucesso.',
    });
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    const dbUpdates: any = {};
    if (updates.number !== undefined) dbUpdates.number = updates.number;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId;
    if (updates.flightId !== undefined) dbUpdates.flight_id = updates.flightId;
    if (updates.items !== undefined) dbUpdates.items = updates.items;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.subtotal !== undefined) dbUpdates.subtotal = updates.subtotal;
    if (updates.total !== undefined) dbUpdates.total = updates.total;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.observations !== undefined) dbUpdates.observations = updates.observations;
    if (updates.validUntil !== undefined) dbUpdates.valid_until = updates.validUntil;

    const { data, error } = await supabase
      .from('quotations')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating quotation:', error);
      toast({
        title: 'Erro ao atualizar cotação',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setQuotations(prev =>
      prev.map(q => (q.id === id ? mapDbToQuotation(data) : q))
    );
    toast({
      title: 'Cotação atualizada',
      description: 'A cotação foi atualizada com sucesso.',
    });
  };

  const deleteQuotation = async (id: string) => {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting quotation:', error);
      toast({
        title: 'Erro ao excluir cotação',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setQuotations(prev => prev.filter(q => q.id !== id));
    toast({
      title: 'Cotação excluída',
      description: 'A cotação foi excluída com sucesso.',
    });
  };

  const updateQuotationStatus = async (id: string, status: QuotationStatus) => {
    await updateQuotation(id, { status });
  };

  return (
    <QuotationsContext.Provider
      value={{
        quotations,
        isLoading,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        updateQuotationStatus,
        refreshQuotations: fetchQuotations,
        generateQuotationNumber,
      }}
    >
      {children}
    </QuotationsContext.Provider>
  );
};

export const useQuotations = (): QuotationsContextType => {
  const context = useContext(QuotationsContext);
  if (!context) {
    throw new Error('useQuotations must be used within a QuotationsProvider');
  }
  return context;
};
