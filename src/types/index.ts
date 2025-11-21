export interface Cliente {
  id: string;              // uuid (public.clientes.id)
  nome: string;
  sobrenome: string;
  cpf: string;             // varchar(14)
  sexo: 'M' | 'F' | 'Outro';
  dataNascimento: string;  // date -> string ISO yyyy-MM-dd
  numeroCelular: string;
  numeroTelefone?: string;
  email: string;
  estado: string;
  cidade: string;
  endereco: string;
  complemento?: string;
  userId: string;          // uuid (public.clientes.user_id -> auth.users.id)
  createdAt: string;       // timestamptz (public.clientes.created_at)
}

// Evento principal (public.eventos) + campos agregados das tabelas
// evento_aniversariantes, evento_adicionais, evento_adicionais_observacoes,
// evento_adicionais_quantidade, evento_equipe_profissionais.
export interface Evento {
  id: string;              // uuid (public.eventos.id)
  titulo: string;
  clienteId: string;       // uuid (public.eventos.cliente_id)
  clienteNome: string;
  data: string;            // date -> string yyyy-MM-dd
  horaInicio: string;      // time -> string HH:mm
  horaFim?: string;        // time -> string HH:mm
  tipo: 'festa' | 'casamento' | 'corporativo' | 'outro';
  status: 'confirmado' | 'pendente' | 'cancelado';
  observacoes?: string;
  valor: number;           // numeric(12,2)
  pacoteId?: string;       // uuid (public.eventos.pacote_id)
  convidados?: number;     // integer
  decoracao?: string;
  equipeId?: string;       // uuid (public.eventos.equipe_id)
  valorEntrada?: number;   // numeric(12,2)
  formaPagamento?: string;
  userId: string;          // uuid (public.eventos.user_id -> auth.users.id)

  // Derivados de tabelas auxiliares ------------------------

  // public.evento_aniversariantes
  aniversariantes: {
    id?: string;           // uuid (evento_aniversariantes.id) opcional no front
    nome: string;
    idade?: number;
  }[];

  // public.evento_adicionais (pivot evento x adicional)
  adicionaisIds?: string[]; // lista de adicionais vinculados ao evento

  // public.evento_adicionais_observacoes
  adicionaisObservacoes?: {
    id?: string;           // uuid (evento_adicionais_observacoes.id) opcional
    adicionalId: string;
    observacao: string;
  }[];

  // public.evento_adicionais_quantidade
  adicionaisQuantidade?: {
    id?: string;           // uuid (evento_adicionais_quantidade.id) opcional
    adicionalId: string;
    quantidade: number;
  }[];

  // public.evento_equipe_profissionais
  equipeProfissionais?: {
    id: string;            // uuid (evento_equipe_profissionais.id)
    profissionalId?: string | null; // uuid opcional (profissional_id)
    nome: string;
    quantidade: number;
  }[];

  pagamentos?: Pagamento[];
}

export interface Pagamento {
  id: string;              // uuid (evento_pagamentos.id)
  eventoId: string;        // uuid (evento_pagamentos.evento_id)
  userId: string;          // uuid (evento_pagamentos.user_id)
  valor: number;           // numeric(12,2)
  data: string;            // date -> string yyyy-MM-dd
  metodo: string;          // varchar (ex: Pix, Dinheiro, Cartão, etc)
  observacoes?: string;    // text
  createdAt: string;       // timestamptz
}

// Removido tipo Contrato
// export interface Contrato {
//   id: string;
//   eventoId: string;
//   clienteId: string;
//   valor: number;
//   desconto?: number;
//   valorFinal: number;
//   formaPagamento: string;
//   status: 'ativo' | 'finalizado' | 'cancelado';
//   dataAssinatura: string;
//   observacoes?: string;
// }