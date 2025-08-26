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
  horaFim: string;
  tipo: 'festa' | 'casamento' | 'aniversario' | 'corporativo' | 'outro';
  status: 'confirmado' | 'pendente' | 'cancelado';
  observacoes?: string;
  valor?: number;
}

export interface Contrato {
  id: string;
  eventoId: string;
  clienteId: string;
  valor: number;
  desconto?: number;
  valorFinal: number;
  formaPagamento: string;
  status: 'ativo' | 'finalizado' | 'cancelado';
  dataAssinatura: string;
  observacoes?: string;
}