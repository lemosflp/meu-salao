import React, { createContext, useContext, useState } from "react";

export type AdicionalModelo = "valor_pessoa" | "valor_unidade" | "valor_festa";

export type Adicional = {
  id: string;
  nome: string;
  modelo: AdicionalModelo;
  valor: number;
  duracaoHoras: number; // novo campo
  descricao?: string;
  observacao?: boolean; // novo campo
};

type AdicionaisContextValue = {
  adicionais: Adicional[];
  addAdicional: (adicional: Omit<Adicional, "id">) => void;
  updateAdicional: (id: string, adicional: Omit<Adicional, "id">) => void;
  removeAdicional: (id: string) => void;
};

const AdicionaisContext = createContext<AdicionaisContextValue | undefined>(undefined);

export const AdicionaisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);

  const addAdicional = (adicional: Omit<Adicional, "id">) => {
    setAdicionais(prev => [{ id: String(Date.now()), ...adicional }, ...prev]);
  };

  const updateAdicional = (id: string, adicional: Omit<Adicional, "id">) => {
    setAdicionais(prev =>
      prev.map(a => (a.id === id ? { id, ...adicional } : a))
    );
  };

  const removeAdicional = (id: string) => {
    setAdicionais(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AdicionaisContext.Provider
      value={{ adicionais, addAdicional, updateAdicional, removeAdicional }}
    >
      {children}
    </AdicionaisContext.Provider>
  );
};

export const useAdicionaisContext = () => {
  const ctx = useContext(AdicionaisContext);
  if (!ctx) {
    throw new Error("useAdicionaisContext deve ser usado dentro de AdicionaisProvider");
  }
  return ctx;
};