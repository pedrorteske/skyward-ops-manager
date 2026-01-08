import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Quotation, QuotationStatus } from '@/types/aviation';
import { mockQuotations } from '@/data/mockData';

interface QuotationsContextType {
  quotations: Quotation[];
  addQuotation: (quotation: Quotation) => void;
  updateQuotation: (id: string, quotation: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  updateQuotationStatus: (id: string, status: QuotationStatus) => void;
}

const QuotationsContext = createContext<QuotationsContextType | undefined>(undefined);

export const QuotationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quotations, setQuotations] = useState<Quotation[]>(mockQuotations);

  const addQuotation = (quotation: Quotation) => {
    setQuotations(prev => [quotation, ...prev]);
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations(prev => 
      prev.map(quotation => 
        quotation.id === id ? { ...quotation, ...updates } : quotation
      )
    );
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(quotation => quotation.id !== id));
  };

  const updateQuotationStatus = (id: string, status: QuotationStatus) => {
    setQuotations(prev =>
      prev.map(quotation =>
        quotation.id === id ? { ...quotation, status, updatedAt: new Date().toISOString() } : quotation
      )
    );
  };

  return (
    <QuotationsContext.Provider value={{ quotations, addQuotation, updateQuotation, deleteQuotation, updateQuotationStatus }}>
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
