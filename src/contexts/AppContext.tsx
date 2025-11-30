import React, { createContext, useContext, useEffect, useState } from "react";
import type { Cliente, Evento, Pagamento } from "@/types";
import {
  getClientesApi,
  createClienteApi,
  updateClienteApi,
  deleteClienteApi,
  getEventosApi,
  createEventoApi,
  updateEventoApi,
  deleteEventoApi,
  createPagamentoApi,
  deletePagamentoApi,
} from "@/services/supabaseApi";
import { useAuth } from "@/contexts/AuthContext";

type AppContextValue = {
  clientes: Cliente[];
  eventos: Evento[];
  addCliente: (data: Omit<Cliente, "id" | "userId" | "createdAt">) => Promise<void>;
  updateCliente: (id: string, patch: Partial<Cliente>) => Promise<void>;
  deleteCliente: (id: string) => Promise<void>;
  addEvento: (data: Omit<Evento, "id" | "userId">) => Promise<void>;
  updateEvento: (id: string, patch: Partial<Evento>) => Promise<void>;
  removeEvento: (id: string) => Promise<void>;
  addPagamento: (data: Omit<Pagamento, "id" | "userId" | "createdAt">) => Promise<void>;
  removePagamento: (eventoId: string, pagamentoId: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);

  useEffect(() => {
    if (!user) {
      setClientes([]);
      setEventos([]);
      return;
    }

    const load = async () => {
      try {
        console.log("[AppContext] Iniciando carregamento de dados");
        setLoadingEventos(true);

        const startTime = performance.now();
        const [clientesDb, eventosDb] = await Promise.all([
          getClientesApi(),
          getEventosApi(),
        ]);
        const endTime = performance.now();

        console.log(`[AppContext] Carregamento concluído em ${(endTime - startTime).toFixed(2)}ms`);
        console.log("[AppContext] Clientes carregados:", clientesDb.length);
        console.log("[AppContext] Eventos carregados:", eventosDb.length);

        setClientes(clientesDb);
        setEventos(eventosDb);
      } catch (err) {
        console.error("[AppContext] Erro ao carregar dados:", err);
      } finally {
        setLoadingEventos(false);
      }
    };

    load();
  }, [user]);

  const addCliente = async (data: Omit<Cliente, "id" | "userId" | "createdAt">) => {
    const novo = await createClienteApi(data);
    if (!novo) return;
    setClientes((prev) => [...prev, novo]);
  };

  const updateCliente = async (id: string, patch: Partial<Cliente>) => {
    const atualizado = await updateClienteApi(id, patch);
    if (!atualizado) return;
    setClientes((prev) => prev.map((c) => (c.id === id ? atualizado : c)));
  };

  const deleteCliente = async (id: string) => {
    await deleteClienteApi(id);
    setClientes((prev) => prev.filter((c) => c.id !== id));
  };

  const addEvento = async (data: Omit<Evento, "id" | "userId">) => {
    console.log("[AppContext.addEvento] 1. Chamado com data:", data);
    
    const novo = await createEventoApi(data);
    
    console.log("[AppContext.addEvento] 2. Retorno de createEventoApi:", novo);
    
    if (!novo) {
      console.error("[AppContext.addEvento] 3. ERRO: createEventoApi retornou null");
      return;
    }
    
    console.log("[AppContext.addEvento] 4. Adicionando evento ao estado local");
    setEventos((prev) => [...prev, novo]);
    console.log("[AppContext.addEvento] 5. Evento adicionado com sucesso");
  };

  const updateEvento = async (id: string, patch: Partial<Evento>) => {
    const atualizado = await updateEventoApi(id, patch);
    if (!atualizado) return;
    setEventos((prev) => prev.map((e) => (e.id === id ? atualizado : e)));
  };

  const removeEvento = async (id: string) => {
    await deleteEventoApi(id);
    setEventos((prev) => prev.filter((e) => e.id !== id));
  };

  const addPagamento = async (data: Omit<Pagamento, "id" | "userId" | "createdAt">) => {
    const novoPagamento = await createPagamentoApi(data);
    if (!novoPagamento) return;

    setEventos((prev) =>
      prev.map((e) =>
        e.id === data.eventoId
          ? {
              ...e,
              pagamentos: [...(e.pagamentos || []), novoPagamento],
            }
          : e
      )
    );
  };

  const removePagamento = async (eventoId: string, pagamentoId: string) => {
    await deletePagamentoApi(pagamentoId);
    setEventos((prev) =>
      prev.map((e) =>
        e.id === eventoId
          ? {
              ...e,
              pagamentos: (e.pagamentos || []).filter((p) => p.id !== pagamentoId),
            }
          : e
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        clientes,
        eventos,
        addCliente,
        updateCliente,
        deleteCliente,
        addEvento,
        updateEvento,
        removeEvento,
        addPagamento,
        removePagamento,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext deve ser usado dentro de AppProvider");
  return ctx;
};