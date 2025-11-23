import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Configuracoes } from "@/types";

interface ConfiguracoesContextType {
  configuracoes: Configuracoes;
  updateNomeSalao: (nome: string) => Promise<void>;
  updateSenha: (senhaAtual: string, novaSenha: string) => Promise<boolean>;
  verificarSenha: (senha: string) => Promise<boolean>;
  loading: boolean;
}

const ConfiguracoesContext = createContext<ConfiguracoesContextType | undefined>(undefined);

export function ConfiguracoesProvider({ children }: { children: ReactNode }) {
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    id: "default",
    nomeSalao: "Meu Salão",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfiguracoes();
  }, []);

  const loadConfiguracoes = async () => {
    try {
      // Aqui você faria a chamada à API/banco de dados
      // Por enquanto, vamos usar localStorage como exemplo
      const saved = localStorage.getItem("configuracoes");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("Configurações carregadas:", parsed);
        setConfiguracoes(parsed);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateNomeSalao = async (nome: string) => {
    try {
      const updated = { ...configuracoes, nomeSalao: nome };
      setConfiguracoes(updated);
      localStorage.setItem("configuracoes", JSON.stringify(updated));
      console.log("Nome do salão atualizado para:", nome);
    } catch (error) {
      console.error("Erro ao atualizar nome do salão:", error);
      throw error;
    }
  };

  const hashSenha = async (senha: string): Promise<string> => {
    // Implementação simples de hash (em produção, use bcrypt no backend)
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  };

  const updateSenha = async (senhaAtual: string, novaSenha: string): Promise<boolean> => {
    try {
      // Verifica senha atual
      if (configuracoes.senhaHash) {
        const hashAtual = await hashSenha(senhaAtual);
        if (hashAtual !== configuracoes.senhaHash) {
          return false;
        }
      }

      // Atualiza para nova senha
      const novoHash = await hashSenha(novaSenha);
      const updated = { ...configuracoes, senhaHash: novoHash };
      setConfiguracoes(updated);
      localStorage.setItem("configuracoes", JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error("Erro ao atualizar senha:", error);
      throw error;
    }
  };

  const verificarSenha = async (senha: string): Promise<boolean> => {
    try {
      if (!configuracoes.senhaHash) {
        return true; // Sem senha configurada
      }
      const hash = await hashSenha(senha);
      return hash === configuracoes.senhaHash;
    } catch (error) {
      console.error("Erro ao verificar senha:", error);
      return false;
    }
  };

  return (
    <ConfiguracoesContext.Provider
      value={{
        configuracoes,
        updateNomeSalao,
        updateSenha,
        verificarSenha,
        loading,
      }}
    >
      {children}
    </ConfiguracoesContext.Provider>
  );
}

export function useConfiguracoesContext() {
  const context = useContext(ConfiguracoesContext);
  if (!context) {
    throw new Error("useConfiguracoesContext deve ser usado dentro de ConfiguracoesProvider");
  }
  return context;
}