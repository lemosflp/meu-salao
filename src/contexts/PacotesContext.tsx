import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export type Pacote = {
  id: string;
  nome: string;
  duracaoHoras: number;
  convidadosBase: number;
  valorBase: number;
  valorPorPessoa: number;
  descricao?: string | null;
  ativo?: boolean;
  // Os campos abaixo são espelho do banco; OK, mas se preferir, pode expor como `createdAt`/`userId`
  created_at?: string;
  user_id?: string;
};

type PacotesContextValue = {
  pacotes: Pacote[];
  addPacote: (pacote: Omit<Pacote, "id" | "created_at" | "user_id">) => Promise<void>;
  updatePacote: (id: string, pacote: Omit<Pacote, "id" | "created_at" | "user_id">) => Promise<void>;
  removePacote: (id: string) => Promise<void>;
};

const PacotesContext = createContext<PacotesContextValue | undefined>(undefined);

export const PacotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // <- usar hook useAuth
  const [pacotes, setPacotes] = useState<Pacote[]>([]);

  useEffect(() => {
    if (!user) {
      // <- LIMPA estado ao deslogar / trocar usuário
      setPacotes([]);
      return;
    }

    const fetchPacotes = async () => {
      const { data, error } = await supabase
        .from("pacotes")
        .select("*")
        .eq("user_id", user.id) // <- já estava OK
        .order("created_at", { ascending: false });

      if (error || !data) {
        console.error("[PacotesContext] erro ao carregar pacotes:", error);
        setPacotes([]);
        return;
      }

      const mapped: Pacote[] = data.map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        duracaoHoras: Number(p.duracao_horas),
        convidadosBase: p.convidados_base,
        valorBase: Number(p.valor_base),
        valorPorPessoa: Number(p.valor_por_pessoa),
        ativo: p.ativo,
        created_at: p.created_at,
        user_id: p.user_id,
      }));

      setPacotes(mapped);
    };

    fetchPacotes();
  }, [user]); // <- recarrega quando o usuário muda

  const addPacote = async (pacote: Omit<Pacote, "id" | "created_at" | "user_id">) => {
    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("pacotes")
      .insert({
        user_id: user.id, // OK: user_id sempre preenchido
        nome: pacote.nome,
        descricao: pacote.descricao ?? null,
        duracao_horas: pacote.duracaoHoras,
        convidados_base: pacote.convidadosBase,
        valor_base: pacote.valorBase,
        valor_por_pessoa: pacote.valorPorPessoa,
        ativo: pacote.ativo ?? true,
      })
      .select("*")
      .single();

    if (error || !data) throw error ?? new Error("Erro ao inserir pacote");

    const novoPacote: Pacote = {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      duracaoHoras: Number(data.duracao_horas),
      convidadosBase: data.convidados_base,
      valorBase: Number(data.valor_base),
      valorPorPessoa: Number(data.valor_por_pessoa),
      ativo: data.ativo,
      created_at: data.created_at,
      user_id: data.user_id,
    };

    setPacotes((prev) => [novoPacote, ...prev]);
  };

  const updatePacote = async (id: string, pacote: Omit<Pacote, "id" | "created_at" | "user_id">) => {
    if (!user) return;

    const { data, error } = await supabase
      .from("pacotes")
      .update({
        nome: pacote.nome,
        descricao: pacote.descricao ?? null,
        duracao_horas: pacote.duracaoHoras,
        convidados_base: pacote.convidadosBase,
        valor_base: pacote.valorBase,
        valor_por_pessoa: pacote.valorPorPessoa,
        ativo: pacote.ativo ?? true,
      })
      .eq("id", id)
      .eq("user_id", user.id) // OK: garante que só atualiza do usuário
      .select("*")
      .single();

    if (error || !data) throw error ?? new Error("Erro ao atualizar pacote");

    const pacoteAtualizado: Pacote = {
      id: data.id,
      nome: data.nome,
      descricao: data.descricao,
      duracaoHoras: Number(data.duracao_horas),
      convidadosBase: data.convidados_base,
      valorBase: Number(data.valor_base),
      valorPorPessoa: Number(data.valor_por_pessoa),
      ativo: data.ativo,
      created_at: data.created_at,
      user_id: data.user_id,
    };

    setPacotes((prev) => prev.map((p) => (p.id === id ? pacoteAtualizado : p)));
  };

  const removePacote = async (id: string) => {
    if (!user) {
      console.warn("[PacotesContext] removePacote chamado sem user autenticado");
      return;
    }

    const { error, count } = await supabase
      .from("pacotes")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id); // OK: só apaga do usuário

    if (error) {
      console.error("[PacotesContext] Erro ao remover pacote:", error);
      throw error;
    }

    if (count === 0) {
      console.warn("[PacotesContext] Nenhum pacote removido (id não encontrado ou não pertence ao usuário)", {
        id,
        userId: user.id,
      });
      return;
    }

    setPacotes((prev) => prev.filter((p) => p.id !== id));
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
