import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Client, ClientPF, ClientPJ, ClientINT } from '@/types/aviation';
import { mockClients } from '@/data/mockData';

interface ClientsContextType {
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Client) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined);

export const ClientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(mockClients);

  const addClient = (client: Client) => {
    setClients(prev => [client, ...prev]);
  };

  const updateClient = (id: string, updatedClient: Client) => {
    setClients(prev => 
      prev.map(client => 
        client.id === id ? updatedClient : client
      )
    );
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const getClientById = (id: string): Client | undefined => {
    return clients.find(client => client.id === id);
  };

  return (
    <ClientsContext.Provider value={{ clients, addClient, updateClient, deleteClient, getClientById }}>
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
