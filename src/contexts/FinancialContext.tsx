import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { FinancialDocument, FinancialDocumentStatus, FinancialDocumentType, FinancialItem, Currency } from '@/types/financial';
import { supabase } from '@/integrations/supabase/client';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';
import { getUserFriendlyError } from '@/lib/errorHandler';

interface FinancialContextType {
  documents: FinancialDocument[];
  isLoading: boolean;
  addDocument: (document: Omit<FinancialDocument, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDocument: (id: string, document: Omit<FinancialDocument, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  updateDocumentStatus: (id: string, status: FinancialDocumentStatus) => Promise<void>;
  getDocumentById: (id: string) => FinancialDocument | undefined;
  getDocumentsByType: (type: FinancialDocumentType) => FinancialDocument[];
  generateDocumentNumber: (type: FinancialDocumentType) => string;
  refreshDocuments: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Map database status to frontend status
const mapDbStatusToFrontend = (status: string): FinancialDocumentStatus => {
  const statusMap: Record<string, FinancialDocumentStatus> = {
    draft: 'created',
    sent: 'sent',
    approved: 'approved',
    rejected: 'cancelled',
    paid: 'paid',
    cancelled: 'cancelled',
  };
  return statusMap[status] || 'created';
};

// Map frontend status to database status
const mapFrontendStatusToDb = (status: FinancialDocumentStatus): string => {
  const statusMap: Record<FinancialDocumentStatus, string> = {
    created: 'draft',
    sent: 'sent',
    approved: 'approved',
    paid: 'paid',
    cancelled: 'cancelled',
  };
  return statusMap[status] || 'draft';
};

// Helper to map database row to FinancialDocument type
const mapDbToDocument = (row: any): FinancialDocument => ({
  id: row.id,
  number: row.number,
  type: row.type as FinancialDocumentType,
  clientId: row.client_id,
  flightId: row.flight_id,
  items: row.items as FinancialItem[],
  currency: row.currency as Currency,
  subtotal: parseFloat(row.subtotal),
  total: parseFloat(row.total),
  status: mapDbStatusToFrontend(row.status),
  observations: row.observations,
  companyId: row.company_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  validUntil: row.due_date,
});

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<FinancialDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { companyId, isLoading: companyLoading } = useCompanyId();
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    if (!companyId) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('financial_documents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching financial documents:', error);
        toast({
          title: 'Erro ao carregar documentos',
          description: getUserFriendlyError(error),
          variant: 'destructive',
        });
        return;
      }

      setDocuments(data?.map(mapDbToDocument) || []);
    } catch (err) {
      logger.error('Error in fetchDocuments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, toast]);

  useEffect(() => {
    if (!companyLoading) {
      fetchDocuments();
    }
  }, [companyLoading, fetchDocuments]);

  const generateDocumentNumber = (type: FinancialDocumentType): string => {
    const prefixes = { quotation: 'COT', proforma: 'PRO', invoice: 'INV' };
    const year = new Date().getFullYear();
    const typeDocuments = documents.filter(doc => doc.type === type);
    const nextNumber = String(typeDocuments.length + 1).padStart(3, '0');
    return `${prefixes[type]}-${year}-${nextNumber}`;
  };

  const addDocument = async (document: Omit<FinancialDocument, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Empresa não encontrada',
        variant: 'destructive',
      });
      return;
    }

    const { data, error } = await supabase
      .from('financial_documents')
      .insert({
        company_id: companyId,
        client_id: document.clientId,
        flight_id: document.flightId || null,
        type: document.type,
        number: document.number,
        items: document.items as unknown as any,
        currency: document.currency,
        subtotal: document.subtotal,
        taxes: 0,
        total: document.total,
        status: mapFrontendStatusToDb(document.status) as any,
        observations: document.observations,
        due_date: document.validUntil,
      } as any)
      .select()
      .single();

    if (error) {
      logger.error('Error adding financial document:', error);
      toast({
        title: 'Erro ao adicionar documento',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setDocuments(prev => [mapDbToDocument(data), ...prev]);
    toast({
      title: 'Documento adicionado',
      description: 'O documento foi adicionado com sucesso.',
    });
  };

  const updateDocument = async (id: string, document: Omit<FinancialDocument, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    const { data, error } = await supabase
      .from('financial_documents')
      .update({
        client_id: document.clientId,
        flight_id: document.flightId || null,
        type: document.type,
        number: document.number,
        items: document.items as unknown as any,
        currency: document.currency,
        subtotal: document.subtotal,
        total: document.total,
        status: mapFrontendStatusToDb(document.status) as any,
        observations: document.observations,
        due_date: document.validUntil,
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating financial document:', error);
      toast({
        title: 'Erro ao atualizar documento',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? mapDbToDocument(data) : doc))
    );
    toast({
      title: 'Documento atualizado',
      description: 'O documento foi atualizado com sucesso.',
    });
  };

  const deleteDocument = async (id: string) => {
    const { error } = await supabase
      .from('financial_documents')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting financial document:', error);
      toast({
        title: 'Erro ao excluir documento',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: 'Documento excluído',
      description: 'O documento foi excluído com sucesso.',
    });
  };

  const updateDocumentStatus = async (id: string, status: FinancialDocumentStatus) => {
    const { data, error } = await supabase
      .from('financial_documents')
      .update({ status: mapFrontendStatusToDb(status) as any })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating document status:', error);
      toast({
        title: 'Erro ao atualizar status',
        description: getUserFriendlyError(error),
        variant: 'destructive',
      });
      return;
    }

    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? mapDbToDocument(data) : doc))
    );
  };

  const getDocumentById = (id: string): FinancialDocument | undefined => {
    return documents.find(doc => doc.id === id);
  };

  const getDocumentsByType = (type: FinancialDocumentType): FinancialDocument[] => {
    return documents.filter(doc => doc.type === type);
  };

  return (
    <FinancialContext.Provider
      value={{
        documents,
        isLoading,
        addDocument,
        updateDocument,
        deleteDocument,
        updateDocumentStatus,
        getDocumentById,
        getDocumentsByType,
        generateDocumentNumber,
        refreshDocuments: fetchDocuments,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = (): FinancialContextType => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
