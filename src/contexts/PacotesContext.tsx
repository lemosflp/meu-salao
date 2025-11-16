import React, { createContext, useContext, useState } from "react";

export type Pacote = {
  id: string;
  // removido campo de título/tipo de evento
  // nome: string;
  duracaoHoras: number;
  convidadosBase: number;
  valorBase: number;
  valorPorPessoa: number;
  descricao?: string;
};

type PacotesContextValue = {
  pacotes: Pacote[];
  addPacote: (pacote: Omit<Pacote, "id">) => void;
  updatePacote: (id: string, pacote: Omit<Pacote, "id">) => void;
  removePacote: (id: string) => void;
};

const PacotesContext = createContext<PacotesContextValue | undefined>(undefined);

export const PacotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pacotes, setPacotes] = useState<Pacote[]>([]);

  const addPacote = (pacote: Omit<Pacote, "id">) => {
    setPacotes(prev => [{ id: String(Date.now()), ...pacote }, ...prev]);
  };

  const updatePacote = (id: string, pacote: Omit<Pacote, "id">) => {
    setPacotes(prev =>
      prev.map(p => (p.id === id ? { id, ...pacote } : p))
    );
  };

  const removePacote = (id: string) => {
    setPacotes(prev => prev.filter(p => p.id !== id));
  };

  return (
    <PacotesContext.Provider value={{ pacotes, addPacote, updatePacote, removePacote }}>
      {children}
    </PacotesContext.Provider>
  );
};

export const usePacotesContext = () => {
  const ctx = useContext(PacotesContext);
  if (!ctx) throw new Error("usePacotesContext deve ser usado dentro de PacotesProvider");
  return ctx;
};
