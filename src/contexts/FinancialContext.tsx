import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FinancialDocument, FinancialDocumentStatus, FinancialDocumentType } from '@/types/financial';

interface FinancialContextType {
  documents: FinancialDocument[];
  addDocument: (document: FinancialDocument) => void;
  updateDocument: (id: string, document: FinancialDocument) => void;
  deleteDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: FinancialDocumentStatus) => void;
  getDocumentById: (id: string) => FinancialDocument | undefined;
  getDocumentsByType: (type: FinancialDocumentType) => FinancialDocument[];
  generateDocumentNumber: (type: FinancialDocumentType) => string;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

// Empty initial data for production
const initialDocuments: FinancialDocument[] = [];

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<FinancialDocument[]>(initialDocuments);

  const addDocument = (document: FinancialDocument) => {
    setDocuments(prev => [document, ...prev]);
  };

  const updateDocument = (id: string, updatedDocument: FinancialDocument) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? updatedDocument : doc))
    );
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const updateDocumentStatus = (id: string, status: FinancialDocumentStatus) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, status, updatedAt: new Date().toISOString() } : doc
      )
    );
  };

  const getDocumentById = (id: string): FinancialDocument | undefined => {
    return documents.find(doc => doc.id === id);
  };

  const getDocumentsByType = (type: FinancialDocumentType): FinancialDocument[] => {
    return documents.filter(doc => doc.type === type);
  };

  const generateDocumentNumber = (type: FinancialDocumentType): string => {
    const prefixes = { quotation: 'COT', proforma: 'PRO', invoice: 'INV' };
    const year = new Date().getFullYear();
    const typeDocuments = documents.filter(doc => doc.type === type);
    const nextNumber = String(typeDocuments.length + 1).padStart(3, '0');
    return `${prefixes[type]}-${year}-${nextNumber}`;
  };

  return (
    <FinancialContext.Provider
      value={{
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        updateDocumentStatus,
        getDocumentById,
        getDocumentsByType,
        generateDocumentNumber,
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
