import { createContext, useContext, useState, ReactNode } from "react";
import { Cliente, Evento, Contrato } from "@/types";
import { mockClientes, mockEventos, mockContratos } from "@/data/mockData";

interface AppContextType {
  clientes: Cliente[];
  eventos: Evento[];
  contratos: Contrato[];
  addCliente: (cliente: Omit<Cliente, 'id' | 'createdAt'>) => void;
  addEvento: (evento: Omit<Evento, 'id'>) => void;
  addContrato: (contrato: Omit<Contrato, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [clientes, setClientes] = useState<Cliente[]>(mockClientes);
  const [eventos, setEventos] = useState<Evento[]>(mockEventos);
  const [contratos, setContratos] = useState<Contrato[]>(mockContratos);

  const addCliente = (novoCliente: Omit<Cliente, 'id' | 'createdAt'>) => {
    const cliente: Cliente = {
      ...novoCliente,
      id: (clientes.length + 1).toString(),
      createdAt: new Date().toISOString(),
    };
    setClientes(prev => [...prev, cliente]);
  };

  const addEvento = (novoEvento: Omit<Evento, 'id'>) => {
    const evento: Evento = {
      ...novoEvento,
      id: (eventos.length + 1).toString(),
    };
    setEventos(prev => [...prev, evento]);
  };

  const addContrato = (novoContrato: Omit<Contrato, 'id'>) => {
    const contrato: Contrato = {
      ...novoContrato,
      id: (contratos.length + 1).toString(),
    };
    setContratos(prev => [...prev, contrato]);
  };

  return (
    <AppContext.Provider value={{
      clientes,
      eventos,
      contratos,
      addCliente,
      addEvento,
      addContrato,
    }}>
      {children}
    </AppContext.Provider>
  );
};