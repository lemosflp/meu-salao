import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export type ProfissionalEquipe = {
  id: string;
  nome: string;
  quantidade: number;
  // mapeia a tabela equipe_profissionais
  // equipe_id está implícito pela Equipe que contém esse array
};

export type Equipe = {
  id: string;
  nome: string;
  profissionais: ProfissionalEquipe[];
  // novos campos do schema
  descricao?: string | null;
  created_at?: string;
  user_id?: string;
};

type EquipesContextValue = {
  equipes: Equipe[];
  addEquipe: (equipe: Omit<Equipe, "id" | "created_at" | "user_id">) => Promise<void>;
  updateEquipe: (id: string, equipe: Omit<Equipe, "id" | "created_at" | "user_id">) => Promise<void>;
  removeEquipe: (id: string) => Promise<void>;
};

const EquipesContext = createContext<EquipesContextValue | undefined>(undefined);

export const EquipesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [equipes, setEquipes] = useState<Equipe[]>([]);

  // carregar dados do Supabase ao montar
  useEffect(() => {
    if (!user) {
      setEquipes([]);
      return;
    }

    const fetchEquipes = async () => {
      const { data: equipesData, error: equipesError } = await supabase
        .from("equipes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (equipesError || !equipesData) return;

      const { data: profissionaisData, error: profissionaisError } = await supabase
        .from("equipe_profissionais")
        .select("*")
        .eq("user_id", user.id);

      if (profissionaisError || !profissionaisData) return;

      const equipesComProfissionais: Equipe[] = equipesData.map((eq) => ({
        id: eq.id,
        nome: eq.nome,
        descricao: eq.descricao,
        created_at: eq.created_at,
        user_id: eq.user_id,
        profissionais: profissionaisData
          .filter((p) => p.equipe_id === eq.id)
          .map((p) => ({
            id: p.id,
            nome: p.nome,
            quantidade: p.quantidade,
          })),
      }));

      setEquipes(equipesComProfissionais);
    };

    fetchEquipes();
  }, [user]);

  const addEquipe = async (equipe: Omit<Equipe, "id" | "created_at" | "user_id">) => {
    if (!user) {
      return;
    }

    // insere na tabela equipes
    const { data: insertedEquipe, error: equipeError } = await supabase
      .from("equipes")
      .insert({
        user_id: user.id,
        nome: equipe.nome,
        descricao: equipe.descricao ?? null,
      })
      .select("*")
      .single();

    if (equipeError || !insertedEquipe) throw equipeError ?? new Error("Erro ao inserir equipe");

    let profissionaisInseridos: ProfissionalEquipe[] = [];
    if (equipe.profissionais && equipe.profissionais.length > 0) {
      const { data: insertedProfissionais, error: profError } = await supabase
        .from("equipe_profissionais")
        .insert(
          equipe.profissionais.map((p) => ({
            user_id: user.id,
            equipe_id: insertedEquipe.id,
            nome: p.nome,
            quantidade: p.quantidade,
          }))
        )
        .select("*");

      if (profError) throw profError;

      profissionaisInseridos =
        insertedProfissionais?.map((p) => ({
          id: p.id,
          nome: p.nome,
          quantidade: p.quantidade,
        })) ?? [];
    }

    const novaEquipe: Equipe = {
      id: insertedEquipe.id,
      nome: insertedEquipe.nome,
      descricao: insertedEquipe.descricao,
      created_at: insertedEquipe.created_at,
      user_id: insertedEquipe.user_id,
      profissionais: profissionaisInseridos,
    };

    setEquipes((prev) => [novaEquipe, ...prev]);
  };

  const updateEquipe = async (id: string, equipe: Omit<Equipe, "id" | "created_at" | "user_id">) => {
    if (!user) return;

    // atualiza tabela equipes
    const { data: updatedEquipe, error: equipeError } = await supabase
      .from("equipes")
      .update({
        nome: equipe.nome,
        descricao: equipe.descricao ?? null,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();

    if (equipeError || !updatedEquipe) throw equipeError ?? new Error("Erro ao atualizar equipe");

    // estratégia simples: apagar todos profissionais e inserir de novo
    const { error: deleteError } = await supabase
      .from("equipe_profissionais")
      .delete()
      .eq("equipe_id", id)
      .eq("user_id", user.id);
    if (deleteError) throw deleteError;

    let profissionaisAtualizados: ProfissionalEquipe[] = [];
    if (equipe.profissionais && equipe.profissionais.length > 0) {
      const { data: insertedProfissionais, error: profError } = await supabase
        .from("equipe_profissionais")
        .insert(
          equipe.profissionais.map((p) => ({
            user_id: user.id,
            equipe_id: id,
            nome: p.nome,
            quantidade: p.quantidade,
          }))
        )
        .select("*");

      if (profError) throw profError;

      profissionaisAtualizados =
        insertedProfissionais?.map((p) => ({
          id: p.id,
          nome: p.nome,
          quantidade: p.quantidade,
        })) ?? [];
    }

    setEquipes((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              id: updatedEquipe.id,
              nome: updatedEquipe.nome,
              descricao: updatedEquipe.descricao,
              created_at: updatedEquipe.created_at,
              user_id: updatedEquipe.user_id,
              profissionais: profissionaisAtualizados,
            }
          : e
      )
    );
  };

  const removeEquipe = async (id: string) => {
    if (!user) {
      console.warn("[EquipesContext] removeEquipe chamado sem user");
      return;
    }

    const { error, count } = await supabase
      .from("equipes")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id);
    
    if (error) throw error;

    if (count === 0) {
      console.warn("[EquipesContext] Nenhuma equipe removida (id não encontrado ou não pertence ao usuário)", {
        id,
        userId: user.id,
      });
      return;
    }

    setEquipes((prev) => prev.filter((e) => e.id !== id));
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