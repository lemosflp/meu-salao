
import React, { createContext, useContext, useState } from "react";

export type ProfissionalEquipe = {
  id: string;
  nome: string;
  quantidade: number;
};

export type Equipe = {
  id: string;
  nome: string;
  profissionais: ProfissionalEquipe[];
};

type EquipesContextValue = {
  equipes: Equipe[];
  addEquipe: (equipe: Omit<Equipe, "id">) => void;
  updateEquipe: (id: string, equipe: Omit<Equipe, "id">) => void;
  removeEquipe: (id: string) => void;
};

const EquipesContext = createContext<EquipesContextValue | undefined>(undefined);

export const EquipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);

  const addEquipe = (equipe: Omit<Equipe, "id">) => {
    setEquipes(prev => [{ id: String(Date.now()), ...equipe }, ...prev]);
  };

  const updateEquipe = (id: string, equipe: Omit<Equipe, "id">) => {
    setEquipes(prev => prev.map(e => (e.id === id ? { id, ...equipe } : e)));
  };

  const removeEquipe = (id: string) => {
    setEquipes(prev => prev.filter(e => e.id !== id));
  };

  return (
    <EquipesContext.Provider value={{ equipes, addEquipe, updateEquipe, removeEquipe }}>
      {children}
    </EquipesContext.Provider>
  );
};

export const useEquipesContext = () => {
  const ctx = useContext(EquipesContext);
  if (!ctx) throw new Error("useEquipesContext deve ser usado dentro de EquipesProvider");
  return ctx;
};