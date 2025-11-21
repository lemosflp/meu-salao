import { supabase } from "@/lib/supabaseClient";
import type { Cliente, Evento } from "@/types";

// helpers de auth seguros
async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw error ?? new Error("Usuário não autenticado");
  }
  return user.id;
}

// Tipo Adicional (ajuste se tiver definido em outro arquivo)
export type Adicional = {
  id: string;
  userId: string;
  nome: string;
  descricao?: string | null;
  modelo: "valor_pessoa" | "valor_unidade" | "valor_festa";
  valor: number;
  observacao?: string | null;
  ativo: boolean;
  createdAt: string;
};

/**
 * CLIENTES – sempre filtrar por user_id
 */
export async function getClientesApi(): Promise<Cliente[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    }

    // mapeia snake_case -> camelCase
    return (
      data?.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        nome: c.nome,
        sobrenome: c.sobrenome,
        cpf: c.cpf,
        sexo: c.sexo,
        dataNascimento: c.data_nascimento,
        numeroCelular: c.numero_celular,
        numeroTelefone: c.numero_telefone ?? undefined,
        email: c.email,
        estado: c.estado,
        cidade: c.cidade,
        endereco: c.endereco,
        complemento: c.complemento ?? undefined,
        createdAt: c.created_at,
      })) || []
    );
  } catch (err) {
    console.error("getClientesApi - erro de autenticação:", err);
    return [];
  }
}

export async function createClienteApi(
  cliente: Omit<Cliente, "id" | "userId" | "createdAt">
): Promise<Cliente | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] createClienteApi chamado sem user autenticado");
      return null;
    }

    // mapeia para nomes exatos do schema
    const payload = {
      user_id: userId,
      nome: cliente.nome,
      sobrenome: cliente.sobrenome,
      cpf: cliente.cpf,
      sexo: cliente.sexo,
      data_nascimento: cliente.dataNascimento,
      numero_celular: cliente.numeroCelular,
      numero_telefone: cliente.numeroTelefone ?? null,
      email: cliente.email,
      estado: cliente.estado,
      cidade: cliente.cidade,
      endereco: cliente.endereco,
      complemento: cliente.complemento ?? null,
    };

    const { data, error } = await supabase
      .from("clientes")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao criar cliente:", error);
      return null;
    }

    // converte de volta para o tipo Cliente da app
    const c = data as any;
    return {
      id: c.id,
      userId: c.user_id,
      nome: c.nome,
      sobrenome: c.sobrenome,
      cpf: c.cpf,
      sexo: c.sexo,
      dataNascimento: c.data_nascimento,
      numeroCelular: c.numero_celular,
      numeroTelefone: c.numero_telefone ?? undefined,
      email: c.email,
      estado: c.estado,
      cidade: c.cidade,
      endereco: c.endereco,
      complemento: c.complemento ?? undefined,
      createdAt: c.created_at,
    } as Cliente;
  } catch (err) {
    console.error("createClienteApi - erro de autenticação:", err);
    return null;
  }
}

export async function updateClienteApi(
  id: string,
  patch: Partial<Cliente>
): Promise<Cliente | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] updateClienteApi chamado sem user autenticado");
      return null;
    }

    // monta patch só com campos presentes, já com nomes do schema
    const dbPatch: any = {};
    if (patch.nome !== undefined) dbPatch.nome = patch.nome;
    if (patch.sobrenome !== undefined) dbPatch.sobrenome = patch.sobrenome;
    if (patch.cpf !== undefined) dbPatch.cpf = patch.cpf;
    if (patch.sexo !== undefined) dbPatch.sexo = patch.sexo;
    if (patch.dataNascimento !== undefined) dbPatch.data_nascimento = patch.dataNascimento;
    if (patch.numeroCelular !== undefined) dbPatch.numero_celular = patch.numeroCelular;
    if (patch.numeroTelefone !== undefined) dbPatch.numero_telefone = patch.numeroTelefone ?? null;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.estado !== undefined) dbPatch.estado = patch.estado;
    if (patch.cidade !== undefined) dbPatch.cidade = patch.cidade;
    if (patch.endereco !== undefined) dbPatch.endereco = patch.endereco;
    if (patch.complemento !== undefined) dbPatch.complemento = patch.complemento ?? null;

    const { data, error } = await supabase
      .from("clientes")
      .update(dbPatch)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao atualizar cliente:", error);
      return null;
    }

    const c = data as any;
    return {
      id: c.id,
      userId: c.user_id,
      nome: c.nome,
      sobrenome: c.sobrenome,
      cpf: c.cpf,
      sexo: c.sexo,
      dataNascimento: c.data_nascimento,
      numeroCelular: c.numero_celular,
      numeroTelefone: c.numero_telefone ?? undefined,
      email: c.email,
      estado: c.estado,
      cidade: c.cidade,
      endereco: c.endereco,
      complemento: c.complemento ?? undefined,
      createdAt: c.created_at,
    } as Cliente;
  } catch (err) {
    console.error("updateClienteApi - erro de autenticação:", err);
    return null;
  }
}

// --- EVENTOS ---

export async function getEventosApi(): Promise<Evento[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    console.log("[getEventosApi] Iniciando busca para user:", userId);
    const startTime = performance.now();

    const { data, error } = await supabase
      .from("eventos")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: false });

    const endTime = performance.now();
    console.log(`[getEventosApi] Busca concluída em ${(endTime - startTime).toFixed(2)}ms. Eventos encontrados: ${data?.length || 0}`);

    if (error) {
      console.error("[getEventosApi] Erro ao buscar eventos:", error);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("[getEventosApi] Nenhum evento encontrado");
      return [];
    }

    const eventoIds = data.map(e => e.id);

    // Buscar aniversariantes
    const { data: aniversariantesData, error: anivError } = await supabase
      .from("evento_aniversariantes")
      .select("*")
      .in("evento_id", eventoIds)
      .eq("user_id", userId);

    if (anivError) {
      console.error("[getEventosApi] Erro ao buscar aniversariantes:", anivError);
    }

    // NOVO: Buscar IDs dos adicionais
    const { data: adicionaisIdsData, error: idsError } = await supabase
      .from("evento_adicionais")
      .select("*")
      .in("evento_id", eventoIds)
      .eq("user_id", userId);

    if (idsError) {
      console.error("[getEventosApi] Erro ao buscar adicionais IDs:", idsError);
    }

    // Buscar observações de adicionais
    const { data: adicionaisObsData } = await supabase
      .from("evento_adicionais_observacoes")
      .select("*")
      .in("evento_id", eventoIds)
      .eq("user_id", userId);

    // Buscar quantidades de adicionais
    const { data: adicionaisQtdData } = await supabase
      .from("evento_adicionais_quantidade")
      .select("*")
      .in("evento_id", eventoIds)
      .eq("user_id", userId);

    // NOVO: Buscar profissionais da equipe
    const { data: equipeProfissionaisData } = await supabase
      .from("evento_equipe_profissionais")
      .select("*")
      .in("evento_id", eventoIds)
      .eq("user_id", userId);

    // NOVO: Buscar pagamentos
    const { data: pagamentosData } = await supabase
      .from("evento_pagamentos")
      .select("*")
      .in("evento_id", eventoIds)
      .eq("user_id", userId);

    // Mapear aniversariantes por evento_id
    const aniversariantesPorEvento: Record<string, any[]> = {};
    aniversariantesData?.forEach(aniv => {
      if (!aniversariantesPorEvento[aniv.evento_id]) {
        aniversariantesPorEvento[aniv.evento_id] = [];
      }
      aniversariantesPorEvento[aniv.evento_id].push({
        id: aniv.id,
        nome: aniv.nome,
        idade: aniv.idade,
      });
    });

    // NOVO: Mapear IDs de adicionais por evento_id
    const adicionaisIdsPorEvento: Record<string, string[]> = {};
    adicionaisIdsData?.forEach(item => {
      if (!adicionaisIdsPorEvento[item.evento_id]) {
        adicionaisIdsPorEvento[item.evento_id] = [];
      }
      adicionaisIdsPorEvento[item.evento_id].push(item.adicional_id);
    });

    // Mapear observações por evento_id
    const adicionaisObsPorEvento: Record<string, any[]> = {};
    adicionaisObsData?.forEach(obs => {
      if (!adicionaisObsPorEvento[obs.evento_id]) {
        adicionaisObsPorEvento[obs.evento_id] = [];
      }
      adicionaisObsPorEvento[obs.evento_id].push({
        adicionalId: obs.adicional_id,
        observacao: obs.observacao,
      });
    });

    // Mapear quantidades por evento_id
    const adicionaisQtdPorEvento: Record<string, any[]> = {};
    adicionaisQtdData?.forEach(qtd => {
      if (!adicionaisQtdPorEvento[qtd.evento_id]) {
        adicionaisQtdPorEvento[qtd.evento_id] = [];
      }
      adicionaisQtdPorEvento[qtd.evento_id].push({
        adicionalId: qtd.adicional_id,
        quantidade: qtd.quantidade,
      });
    });

    // NOVO: Mapear profissionais por evento_id
    const equipeProfissionaisPorEvento: Record<string, any[]> = {};
    equipeProfissionaisData?.forEach(prof => {
      if (!equipeProfissionaisPorEvento[prof.evento_id]) {
        equipeProfissionaisPorEvento[prof.evento_id] = [];
      }
      equipeProfissionaisPorEvento[prof.evento_id].push({
        id: prof.profissional_id || prof.id,
        nome: prof.nome,
        quantidade: prof.quantidade,
      });
    });

    // Mapear pagamentos por evento_id
    const pagamentosPorEvento: Record<string, any[]> = {};
    pagamentosData?.forEach(pag => {
      if (!pagamentosPorEvento[pag.evento_id]) {
        pagamentosPorEvento[pag.evento_id] = [];
      }
      pagamentosPorEvento[pag.evento_id].push({
        id: pag.id,
        eventoId: pag.evento_id,
        userId: pag.user_id,
        valor: Number(pag.valor),
        data: pag.data,
        metodo: pag.metodo,
        observacoes: pag.observacoes,
        createdAt: pag.created_at,
      });
    });

    // Mapeamento rápido com todos os dados relacionados
    const mapped = data.map((ev: any) => ({
      id: ev.id,
      userId: ev.user_id,
      titulo: ev.titulo || "",
      clienteId: ev.cliente_id || "",
      clienteNome: ev.cliente_nome || "",
      data: ev.data || "",
      horaInicio: ev.hora_inicio || "",
      horaFim: ev.hora_fim,
      tipo: ev.tipo || "festa",
      status: ev.status || "pendente",
      observacoes: ev.observacoes,
      valor: Number(ev.valor) || 0,
      pacoteId: ev.pacote_id || "",
      convidados: ev.convidados,
      decoracao: ev.decoracao,
      equipeId: ev.equipe_id,
      valorEntrada: ev.valor_entrada,
      formaPagamento: ev.forma_pagamento,
      aniversariantes: aniversariantesPorEvento[ev.id] || [],
      adicionaisIds: adicionaisIdsPorEvento[ev.id] || [],
      adicionaisObservacoes: adicionaisObsPorEvento[ev.id] || [],
      adicionaisQuantidade: adicionaisQtdPorEvento[ev.id] || [],
      equipeProfissionais: equipeProfissionaisPorEvento[ev.id] || [],
      pagamentos: pagamentosPorEvento[ev.id] || [],
    } as Evento));

    console.log("[getEventosApi] Mapeamento concluído:", mapped.length, "eventos");
    return mapped;
  } catch (err) {
    console.error("[getEventosApi] Exception:", err);
    return [];
  }
}

export async function createEventoApi(
  evento: Omit<Evento, "id" | "userId">
): Promise<Evento | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;

    // 1. Inserir evento principal (SEM os campos JSONB)
    const { data: eventoData, error: eventoError } = await supabase
      .from("eventos")
      .insert({
        user_id: userId,
        titulo: evento.titulo,
        cliente_id: evento.clienteId,
        cliente_nome: evento.clienteNome,
        data: evento.data,
        hora_inicio: evento.horaInicio,
        hora_fim: evento.horaFim,
        tipo: evento.tipo,
        status: evento.status,
        observacoes: evento.observacoes,
        valor: evento.valor,
        pacote_id: evento.pacoteId,
        convidados: evento.convidados,
        decoracao: evento.decoracao,
        equipe_id: evento.equipeId,
        valor_entrada: evento.valorEntrada,
        forma_pagamento: evento.formaPagamento,
      })
      .select()
      .single();

    if (eventoError || !eventoData) {
      console.error("[createEventoApi] Erro ao criar evento:", eventoError);
      return null;
    }

    const eventoId = eventoData.id;

    // 2. Inserir aniversariantes
    if (evento.aniversariantes && evento.aniversariantes.length > 0) {
      const { error: anivError } = await supabase
        .from("evento_aniversariantes")
        .insert(
          evento.aniversariantes.map((a) => ({
            user_id: userId,
            evento_id: eventoId,
            nome: a.nome,
            idade: a.idade,
          }))
        );
      if (anivError) console.error("Erro ao inserir aniversariantes:", anivError);
    }

    // 3. Inserir adicionais
    if (evento.adicionaisIds && evento.adicionaisIds.length > 0) {
      const { error: addError } = await supabase
        .from("evento_adicionais")
        .insert(
          evento.adicionaisIds.map((adicionalId) => ({
            user_id: userId,
            evento_id: eventoId,
            adicional_id: adicionalId,
          }))
        );
      if (addError) console.error("Erro ao inserir adicionais:", addError);
    }

    // 4. Inserir observações de adicionais
    if (evento.adicionaisObservacoes && evento.adicionaisObservacoes.length > 0) {
      const { error: obsError } = await supabase
        .from("evento_adicionais_observacoes")
        .insert(
          evento.adicionaisObservacoes.map((obs) => ({
            user_id: userId,
            evento_id: eventoId,
            adicional_id: obs.adicionalId,
            observacao: obs.observacao,
          }))
        );
      if (obsError) console.error("Erro ao inserir observações:", obsError);
    }

    // 5. Inserir quantidades de adicionais
    if (evento.adicionaisQuantidade && evento.adicionaisQuantidade.length > 0) {
      const { error: qtdError } = await supabase
        .from("evento_adicionais_quantidade")
        .insert(
          evento.adicionaisQuantidade.map((qtd) => ({
            user_id: userId,
            evento_id: eventoId,
            adicional_id: qtd.adicionalId,
            quantidade: qtd.quantidade,
          }))
        );
      if (qtdError) console.error("Erro ao inserir quantidades:", qtdError);
    }

    // 6. Inserir profissionais da equipe
    if (evento.equipeProfissionais && evento.equipeProfissionais.length > 0) {
      const { error: profError } = await supabase
        .from("evento_equipe_profissionais")
        .insert(
          evento.equipeProfissionais.map((p) => ({
            user_id: userId,
            evento_id: eventoId,
            profissional_id: p.id,
            nome: p.nome,
            quantidade: p.quantidade,
          }))
        );
      if (profError) console.error("Erro ao inserir profissionais:", profError);
    }

    // NOVO: Retornar o evento completo com todos os dados relacionados carregados
    return {
      id: eventoData.id,
      userId: eventoData.user_id,
      titulo: eventoData.titulo,
      clienteId: eventoData.cliente_id,
      clienteNome: eventoData.cliente_nome,
      data: eventoData.data,
      horaInicio: eventoData.hora_inicio,
      horaFim: eventoData.hora_fim,
      tipo: eventoData.tipo,
      status: eventoData.status,
      observacoes: eventoData.observacoes,
      valor: Number(eventoData.valor),
      pacoteId: eventoData.pacote_id,
      convidados: eventoData.convidados,
      decoracao: eventoData.decoracao,
      equipeId: eventoData.equipe_id,
      valorEntrada: eventoData.valor_entrada,
      formaPagamento: eventoData.forma_pagamento,
      aniversariantes: evento.aniversariantes || [],
      adicionaisIds: evento.adicionaisIds || [],
      adicionaisObservacoes: evento.adicionaisObservacoes || [],
      adicionaisQuantidade: evento.adicionaisQuantidade || [],
      equipeProfissionais: evento.equipeProfissionais || [],
      pagamentos: [],
    } as Evento;
  } catch (err) {
    console.error("[createEventoApi] EXCEPTION:", err);
    return null;
  }
}

export async function updateEventoApi(
  id: string,
  patch: Partial<Evento>
): Promise<Evento | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] updateEventoApi chamado sem user autenticado");
      return null;
    }

    // Preparar patch apenas com campos da tabela eventos (sem arrays relacionados)
    const dbPatch: any = {};
    if (patch.titulo !== undefined) dbPatch.titulo = patch.titulo;
    if (patch.clienteId !== undefined) dbPatch.cliente_id = patch.clienteId;
    if (patch.clienteNome !== undefined) dbPatch.cliente_nome = patch.clienteNome;
    if (patch.data !== undefined) dbPatch.data = patch.data;
    if (patch.horaInicio !== undefined) dbPatch.hora_inicio = patch.horaInicio;
    if (patch.horaFim !== undefined) dbPatch.hora_fim = patch.horaFim;
    if (patch.tipo !== undefined) dbPatch.tipo = patch.tipo;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.observacoes !== undefined) dbPatch.observacoes = patch.observacoes;
    if (patch.valor !== undefined) dbPatch.valor = patch.valor;
    if (patch.pacoteId !== undefined) dbPatch.pacote_id = patch.pacoteId;
    if (patch.convidados !== undefined) dbPatch.convidados = patch.convidados;
    if (patch.decoracao !== undefined) dbPatch.decoracao = patch.decoracao;
    if (patch.equipeId !== undefined) dbPatch.equipe_id = patch.equipeId;
    if (patch.valorEntrada !== undefined) dbPatch.valor_entrada = patch.valorEntrada;
    if (patch.formaPagamento !== undefined) dbPatch.forma_pagamento = patch.formaPagamento;

    const { data, error } = await supabase
      .from("eventos")
      .update(dbPatch)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar evento:", error);
      return null;
    }

    // Se houver aniversariantes no patch, atualizar tabela evento_aniversariantes
    if (patch.aniversariantes) {
      // Deletar aniversariantes antigos
      await supabase
        .from("evento_aniversariantes")
        .delete()
        .eq("evento_id", id)
        .eq("user_id", userId);

      // Inserir novos aniversariantes
      if (patch.aniversariantes.length > 0) {
        const { error: anivError } = await supabase
          .from("evento_aniversariantes")
          .insert(
            patch.aniversariantes.map((a) => ({
              user_id: userId,
              evento_id: id,
              nome: a.nome,
              idade: a.idade,
            }))
          );
        if (anivError) {
          console.error("Erro ao atualizar aniversariantes:", anivError);
        }
      }
    }

    // NOVO: Retornar o evento com todos os dados relacionados
    // Buscar dados relacionados atualizados
    const { data: aniversariantesData } = await supabase
      .from("evento_aniversariantes")
      .select("*")
      .eq("evento_id", id)
      .eq("user_id", userId);

    const { data: adicionaisIdsData } = await supabase
      .from("evento_adicionais")
      .select("*")
      .eq("evento_id", id)
      .eq("user_id", userId);

    const { data: adicionaisObsData } = await supabase
      .from("evento_adicionais_observacoes")
      .select("*")
      .eq("evento_id", id)
      .eq("user_id", userId);

    const { data: adicionaisQtdData } = await supabase
      .from("evento_adicionais_quantidade")
      .select("*")
      .eq("evento_id", id)
      .eq("user_id", userId);

    const { data: equipeProfissionaisData } = await supabase
      .from("evento_equipe_profissionais")
      .select("*")
      .eq("evento_id", id)
      .eq("user_id", userId);

    const { data: pagamentosData } = await supabase
      .from("evento_pagamentos")
      .select("*")
      .eq("evento_id", id)
      .eq("user_id", userId);

    return {
      id: data.id,
      userId: data.user_id,
      titulo: data.titulo,
      clienteId: data.cliente_id,
      clienteNome: data.cliente_nome,
      data: data.data,
      horaInicio: data.hora_inicio,
      horaFim: data.hora_fim,
      tipo: data.tipo,
      status: data.status,
      observacoes: data.observacoes,
      valor: Number(data.valor),
      pacoteId: data.pacote_id,
      convidados: data.convidados,
      decoracao: data.decoracao,
      equipeId: data.equipe_id,
      valorEntrada: data.valor_entrada,
      formaPagamento: data.forma_pagamento,
      aniversariantes: aniversariantesData?.map(a => ({
        id: a.id,
        nome: a.nome,
        idade: a.idade,
      })) || [],
      adicionaisIds: adicionaisIdsData?.map(a => a.adicional_id) || [],
      adicionaisObservacoes: adicionaisObsData?.map(o => ({
        adicionalId: o.adicional_id,
        observacao: o.observacao,
      })) || [],
      adicionaisQuantidade: adicionaisQtdData?.map(q => ({
        adicionalId: q.adicional_id,
        quantidade: q.quantidade,
      })) || [],
      equipeProfissionais: equipeProfissionaisData?.map(p => ({
        id: p.profissional_id || p.id,
        nome: p.nome,
        quantidade: p.quantidade,
      })) || [],
      pagamentos: pagamentosData?.map(p => ({
        id: p.id,
        eventoId: p.evento_id,
        userId: p.user_id,
        valor: Number(p.valor),
        data: p.data,
        metodo: p.metodo,
        observacoes: p.observacoes,
        createdAt: p.created_at,
      })) || [],
    } as Evento;
  } catch (err) {
    console.error("updateEventoApi - erro de autenticação:", err);
    return null;
  }
}

export async function deleteEventoApi(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] deleteEventoApi chamado sem user autenticado");
      return;
    }

    const { error } = await supabase
      .from("eventos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao remover evento:", error);
    }
  } catch (err) {
    console.error("deleteEventoApi - erro de autenticação:", err);
  }
}

// --- ADICIONAIS ---

export async function getAdicionaisApi(): Promise<Adicional[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from("adicionais")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar adicionais:", error);
      return [];
    }
    return (
      data?.map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        nome: a.nome,
        descricao: a.descricao,
        modelo: a.modelo,
        valor: a.valor,
        observacao: a.observacao,
        ativo: a.ativo,
        createdAt: a.created_at,
      })) || []
    );
  } catch (err) {
    console.error("getAdicionaisApi - erro de autenticação:", err);
    return [];
  }
}

export async function createAdicionalApi(
  adicional: Omit<Adicional, "id" | "userId" | "createdAt">
): Promise<Adicional | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] createAdicionalApi chamado sem user autenticado");
      return null;
    }

    const payload = {
      user_id: userId,
      nome: adicional.nome,
      descricao: adicional.descricao ?? null,
      modelo: adicional.modelo,
      valor: adicional.valor,
      observacao: adicional.observacao ?? null,
      ativo: adicional.ativo,
    };

    const { data, error } = await supabase
      .from("adicionais")
      .insert(payload)
      .select("*")
      .single();

    if (error || !data) {
      console.error("Erro ao criar adicional:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      nome: data.nome,
      descricao: data.descricao ?? null,
      modelo: data.modelo,
      valor: Number(data.valor),
      observacao: data.observacao ?? null,
      ativo: data.ativo,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("createAdicionalApi - erro de autenticação:", err);
    return null;
  }
}

export async function updateAdicionalApi(
  id: string,
  patch: Partial<Adicional>
): Promise<Adicional | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] updateAdicionalApi chamado sem user autenticado");
      return null;
    }

    const dbPatch: any = {};
    if (patch.nome !== undefined) dbPatch.nome = patch.nome;
    if (patch.descricao !== undefined) dbPatch.descricao = patch.descricao ?? null;
    if (patch.modelo !== undefined) dbPatch.modelo = patch.modelo;
    if (patch.valor !== undefined) dbPatch.valor = patch.valor;
    if (patch.observacao !== undefined) dbPatch.observacao = patch.observacao ?? null;
    if (patch.ativo !== undefined) dbPatch.ativo = patch.ativo;

    const { data, error } = await supabase
      .from("adicionais")
      .update(dbPatch)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error || !data) {
      console.error("Erro ao atualizar adicional:", error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      nome: data.nome,
      descricao: data.descricao ?? null,
      modelo: data.modelo,
      valor: Number(data.valor),
      observacao: data.observacao ?? null,
      ativo: data.ativo,
      createdAt: data.created_at,
    };
  } catch (err) {

    console.error("updateAdicionalApi - erro de autenticação:", err);
    return null;
  }
}

export async function deleteAdicionalApi(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] deleteAdicionalApi chamado sem user autenticado");
      return;
    }

    const { error } = await supabase
      .from("adicionais")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao remover adicional:", error);
    }
  } catch (err) {
    console.error("deleteAdicionalApi - erro de autenticação:", err);
  }
}
// --- PAGAMENTOS ---

export async function getPagamentosEventoApi(eventoId: string): Promise<Pagamento[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from("evento_pagamentos")
      .select("*")
      .eq("evento_id", eventoId)
      .eq("user_id", userId)
      .order("data", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pagamentos:", error);
      return [];
    }

    return (
      data?.map((p: any) => ({
        id: p.id,
        eventoId: p.evento_id,
        userId: p.user_id,
        valor: Number(p.valor),
        data: p.data,
        metodo: p.metodo,
        observacoes: p.observacoes,
        createdAt: p.created_at,
      })) || []
    );
  } catch (err) {
    console.error("getPagamentosEventoApi - erro:", err);
    return [];
  }
}

export async function createPagamentoApi(
  pagamento: Omit<Pagamento, "id" | "userId" | "createdAt">
): Promise<Pagamento | null> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] createPagamentoApi chamado sem user autenticado");
      return null;
    }

    const { data, error } = await supabase
      .from("evento_pagamentos")
      .insert({
        user_id: userId,
        evento_id: pagamento.eventoId,
        valor: pagamento.valor,
        data: pagamento.data,
        metodo: pagamento.metodo,
        observacoes: pagamento.observacoes || null,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao criar pagamento:", error);
      return null;
    }

    return {
      id: data.id,
      eventoId: data.evento_id,
      userId: data.user_id,
      valor: Number(data.valor),
      data: data.data,
      metodo: data.metodo,
      observacoes: data.observacoes,
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("createPagamentoApi - erro:", err);
    return null;
  }
}

export async function deletePagamentoApi(id: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      console.warn("[supabaseApi] deletePagamentoApi chamado sem user autenticado");
      return;
    }

    const { error } = await supabase
      .from("evento_pagamentos")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Erro ao remover pagamento:", error);
    }
  } catch (err) {
    console.error("deletePagamentoApi - erro:", err);
  }
}