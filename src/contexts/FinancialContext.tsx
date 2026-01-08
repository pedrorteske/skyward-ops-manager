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

// Mock initial data
const initialDocuments: FinancialDocument[] = [
  {
    id: '1',
    number: 'COT-2024-001',
    type: 'quotation',
    clientId: '1',
    flightId: '1',
    items: [
      { id: '1', description: 'Taxa de pouso', quantity: 1, unitPrice: 500, total: 500 },
      { id: '2', description: 'Hangaragem', quantity: 2, unitPrice: 300, total: 600 },
    ],
    currency: 'BRL',
    subtotal: 1100,
    total: 1100,
    status: 'approved',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    number: 'PRO-2024-001',
    type: 'proforma',
    clientId: '2',
    items: [
      { id: '1', description: 'Abastecimento JET-A1', quantity: 500, unitPrice: 8.50, total: 4250 },
    ],
    currency: 'BRL',
    subtotal: 4250,
    total: 4250,
    status: 'sent',
    quotationId: '1',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    number: 'INV-2024-001',
    type: 'invoice',
    clientId: '1',
    items: [
      { id: '1', description: 'Serviço de rampa', quantity: 1, unitPrice: 800, total: 800 },
      { id: '2', description: 'GPU', quantity: 2, unitPrice: 150, total: 300 },
    ],
    currency: 'USD',
    subtotal: 1100,
    total: 1100,
    status: 'paid',
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

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
