import { createContext, useContext, useState, ReactNode } from "react";
import { Cliente, Evento } from "@/types";

interface AppContextType {
  clientes: Cliente[];
  eventos: Evento[];
  addCliente: (cliente: Omit<Cliente, 'id' | 'createdAt'>) => void;
  addEvento: (evento: Omit<Evento, 'id'>) => void;
  updateEvento: (id: string, data: Partial<Omit<Evento, "id">>) => void;
  removeEvento: (id: string) => void;
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
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

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

  const updateEvento = (id: string, data: Partial<Omit<Evento, "id">>) => {
    setEventos(prev =>
      prev.map(ev => (ev.id === id ? { ...ev, ...data } : ev))
    );
  };

  const removeEvento = (id: string) => {
    setEventos(prev => prev.filter(ev => ev.id !== id));
  };

  return (
    <AppContext.Provider value={{
      clientes,
      eventos,
      addCliente,
      addEvento,
      updateEvento,
      removeEvento,
    }}>
      {children}
    </AppContext.Provider>
  );
};