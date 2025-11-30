import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

// tipos DB
type DbAdicional = {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  modelo: "valor_pessoa" | "valor_unidade" | "valor_festa";
  valor: number;
  duracao_horas?: number;
  observacao: string | null;
  ativo: boolean;
  created_at: string;
};

// tipo UI
export interface Adicional {
  id: string;
  userId: string;
  nome: string;
  descricao?: string;
  modelo: "valor_pessoa" | "valor_unidade" | "valor_festa";
  valor: number;
  duracaoHoras?: number;
  observacao?: string;
  ativo: boolean;
  createdAt: string;
}

type AdicionaisContextType = {
  adicionais: Adicional[];
  addAdicional: (data: Omit<Adicional, "id" | "userId" | "createdAt">) => Promise<void>;
  updateAdicional: (id: string, data: Partial<Adicional>) => Promise<void>;
  removeAdicional: (id: string) => Promise<void>;
};

const AdicionaisContext = createContext<AdicionaisContextType | undefined>(undefined);

export const useAdicionaisContext = () => {
  const ctx = useContext(AdicionaisContext);
  if (!ctx) throw new Error("useAdicionaisContext deve ser usado dentro de AdicionaisProvider");
  return ctx;
};

export const AdicionaisProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth(); // <- padrão correto: depende do AuthContext
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);

  useEffect(() => {
    if (!user) {
      // <- LIMPA estado ao deslogar / trocar usuário
      setAdicionais([]);
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from("adicionais")
        .select(
          "id, user_id, nome, descricao, modelo, valor, duracao_horas, observacao, ativo, created_at"
        )
        .eq("user_id", user.id) // OK
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar adicionais:", error);
        return;
      }

      const mapped: Adicional[] =
        (data as DbAdicional[]).map((a) => ({
          id: a.id,
          userId: a.user_id,
          nome: a.nome,
          descricao: a.descricao ?? undefined,
          modelo: a.modelo,
          valor: Number(a.valor),
          duracaoHoras: a.duracao_horas ? Number(a.duracao_horas) : 0,
          observacao: a.observacao ?? undefined,
          ativo: a.ativo,
          createdAt: a.created_at,
        })) ?? [];

      setAdicionais(mapped);
    };

    load();
  }, [user]); // <- recarrega quando o usuário muda

  const addAdicional: AdicionaisContextType["addAdicional"] = async (data) => {
    if (!user) {
      return;
    }

    const payload = {
      user_id: user.id, // OK
      nome: data.nome,
      descricao: data.descricao ?? null,
      modelo: data.modelo,
      valor: data.valor,
      duracao_horas: data.duracaoHoras ?? 0,
      observacao: data.observacao ?? null,
      ativo: data.ativo,
    };

    console.log("[AdicionaisContext] addAdicional payload:", payload);

    const { data: inserted, error } = await supabase
      .from("adicionais")
      .insert(payload)
      .select("id, user_id, nome, descricao, modelo, valor, duracao_horas, observacao, ativo, created_at")
      .single();

    if (error) {
      console.error("[AdicionaisContext] Erro ao criar adicional:", error);
      throw error;
    }

    console.log("[AdicionaisContext] Resposta do banco:", inserted);

    const a = inserted as DbAdicional;

    setAdicionais((prev) => [
      {
        id: a.id,
        userId: a.user_id,
        nome: a.nome,
        descricao: a.descricao ?? undefined,
        modelo: a.modelo,
        valor: Number(a.valor),
        duracaoHoras: a.duracao_horas ? Number(a.duracao_horas) : 0,
        observacao: a.observacao ?? undefined,
        ativo: a.ativo,
        createdAt: a.created_at,
      },
      ...prev,
    ]);
  };

  const updateAdicional: AdicionaisContextType["updateAdicional"] = async (id, data) => {
    if (!user) return;

    const payload: Partial<DbAdicional> = {};

    if (data.nome !== undefined) payload.nome = data.nome;
    if (data.descricao !== undefined) payload.descricao = data.descricao ?? null;
    if (data.modelo !== undefined) payload.modelo = data.modelo;
    if (data.valor !== undefined) payload.valor = data.valor;
    if (data.duracaoHoras !== undefined) payload.duracao_horas = data.duracaoHoras ?? 0;
    if (data.observacao !== undefined) payload.observacao = data.observacao ?? null;
    if (data.ativo !== undefined) payload.ativo = data.ativo;

    console.log("[AdicionaisContext] updateAdicional payload:", payload);

    const { data: updated, error } = await supabase
      .from("adicionais")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id) // OK
      .select("id, user_id, nome, descricao, modelo, valor, duracao_horas, observacao, ativo, created_at")
      .single();

    if (error) {
      console.error("Erro ao atualizar adicional:", error);
      throw error;
    }

    console.log("[AdicionaisContext] Resposta do banco:", updated);

    const a = updated as DbAdicional;

    setAdicionais((prev) =>
      prev.map((old) =>
        old.id === id
          ? {
              id: a.id,
              userId: a.user_id,
              nome: a.nome,
              descricao: a.descricao ?? undefined,
              modelo: a.modelo,
              valor: Number(a.valor),
              duracaoHoras: a.duracao_horas ? Number(a.duracao_horas) : 0,
              observacao: a.observacao ?? undefined,
              ativo: a.ativo,
              createdAt: a.created_at,
            }
          : old
      )
    );
  };

  const removeAdicional: AdicionaisContextType["removeAdicional"] = async (id) => {
    if (!user) {
      console.warn("[AdicionaisContext] removeAdicional chamado sem user");
      return;
    }

    // tenta deletar o registro na Supabase filtrando por id e user_id
    const { error, count } = await supabase
      .from("adicionais")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id); // OK

    if (error) {
      console.error("[AdicionaisContext] Erro ao excluir adicional:", error, { id, userId: user.id });
      throw error;
    }

    if (count === 0) {
      console.warn("[AdicionaisContext] Nenhum adicional removido (id não encontrado ou não pertence ao usuário)", {
        id,
        userId: user.id,
      });
      return;
    }

    // se removeu na Supabase, remove também do estado local
    setAdicionais((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AdicionaisContext.Provider
      value={{ adicionais, addAdicional, updateAdicional, removeAdicional }}
    >
      {children}
    </AdicionaisContext.Provider>
  );
};

// load -> .eq("user_id", user.id)
// addAdicional -> payload.user_id = user.id
// updateAdicional -> .eq("id", id).eq("user_id", user.id)
// removeAdicional -> .eq("id", id).eq("user_id", user.id)

// Nada faltando.