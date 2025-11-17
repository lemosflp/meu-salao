export interface Cliente {
  id: string;
  nome: string;
  sobrenome: string;
  cpf: string;
  sexo: 'M' | 'F' | 'Outro';
  dataNascimento: string;
  numeroCelular: string;
  numeroTelefone?: string;
  email: string;
  estado: string;
  cidade: string;
  endereco: string;
  complemento?: string;
  createdAt: string;
}

export interface Evento {
  id: string;
  titulo: string;
  clienteId: string;
  clienteNome: string;
  data: string;
  horaInicio: string;
  horaFim?: string;
  tipo: 'festa' | 'casamento' | 'aniversario' | 'corporativo' | 'outro';
  status: 'confirmado' | 'pendente' | 'cancelado';
  observacoes?: string;
  valor: number;

  // campos usados na tela atual
  pacoteId?: string;
  convidados?: number;
  decoracao?: string;
  equipeId?: string;
  equipeProfissionais?: { id: string; nome: string; quantidade: number }[];
  adicionaisIds?: string[];
  valorEntrada?: number;
  formaPagamento?: string;

  // novo: lista de aniversariantes / homenageados
  aniversariantes: {
    nome: string;
    idade?: number;
  }[];

  // novo: observações específicas de adicionais
  adicionaisObservacoes?: {
    adicionalId: string;
    observacao: string;
  }[];

  // NOVO: quantidades de adicionais por evento (para valor_unidade)
  adicionaisQuantidade?: {
    adicionalId: string;
    quantidade: number;
  }[];
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