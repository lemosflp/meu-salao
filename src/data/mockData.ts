import { Cliente, Evento, Contrato } from "../types";

export const mockClientes: Cliente[] = [
  {
    id: "1",
    nome: "Maria",
    sobrenome: "Silva Santos",
    cpf: "123.456.789-00",
    sexo: "F",
    dataNascimento: "1990-05-15",
    numeroCelular: "(11) 99999-9999",
    numeroTelefone: "(11) 3333-4444",
    email: "maria.santos@email.com",
    estado: "São Paulo",
    cidade: "São Paulo",
    endereco: "Rua das Flores, 123",
    complemento: "Apto 45",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    nome: "João",
    sobrenome: "Oliveira",
    cpf: "987.654.321-00",
    sexo: "M",
    dataNascimento: "1985-12-03",
    numeroCelular: "(11) 88888-8888",
    email: "joao.oliveira@email.com",
    estado: "São Paulo",
    cidade: "Campinas",
    endereco: "Av. Principal, 456",
    createdAt: "2024-02-20T14:15:00Z"
  },
  {
    id: "3",
    nome: "Ana",
    sobrenome: "Costa Lima",
    cpf: "456.789.123-00",
    sexo: "F",
    dataNascimento: "1992-08-22",
    numeroCelular: "(11) 77777-7777",
    email: "ana.lima@email.com",
    estado: "São Paulo",
    cidade: "Santos",
    endereco: "Rua da Praia, 789",
    createdAt: "2024-03-10T16:45:00Z"
  }
];

export const mockEventos: Evento[] = [
  {
    id: "1",
    titulo: "Aniversário Maria - 15 anos",
    clienteId: "1",
    clienteNome: "Maria Silva Santos",
    data: "2024-05-27",
    horaInicio: "18:00",
    horaFim: "23:00",
    tipo: "aniversario",
    status: "confirmado",
    observacoes: "Decoração tema princesa, DJ até 22h",
    valor: 2500
  },
  {
    id: "2",
    titulo: "Casamento João & Ana",
    clienteId: "2",
    clienteNome: "João Oliveira",
    data: "2024-05-29",
    horaInicio: "16:00",
    horaFim: "01:00",
    tipo: "casamento",
    status: "confirmado",
    observacoes: "Cerimônia + recepção, buffet completo",
    valor: 8500
  },
  {
    id: "3",
    titulo: "Festa Corporativa - Empresa XYZ",
    clienteId: "3",
    clienteNome: "Ana Costa Lima",
    data: "2024-05-27",
    horaInicio: "19:00",
    horaFim: "00:00",
    tipo: "corporativo",
    status: "pendente",
    observacoes: "Confraternização anual, 80 pessoas",
    valor: 4200
  },
  {
    id: "4",
    titulo: "Aniversário Pedro - 8 anos",
    clienteId: "1",
    clienteNome: "Maria Silva Santos",
    data: "2024-05-29",
    horaInicio: "15:00",
    horaFim: "19:00",
    tipo: "aniversario",
    status: "confirmado",
    observacoes: "Tema super-heróis, recreação infantil",
    valor: 1800
  },
  {
    id: "5",
    titulo: "Festa de Formatura",
    clienteId: "2",
    clienteNome: "João Oliveira",
    data: "2024-05-27",
    horaInicio: "20:00",
    horaFim: "02:00",
    tipo: "festa",
    status: "confirmado",
    observacoes: "Turma medicina 2024, DJ + banda",
    valor: 5500
  },
  {
    id: "6",
    titulo: "Chá de Bebê",
    clienteId: "3",
    clienteNome: "Ana Costa Lima",
    data: "2024-05-29",
    horaInicio: "14:00",
    horaFim: "18:00",
    tipo: "festa",
    status: "confirmado",
    observacoes: "Decoração azul e rosa, 50 convidados",
    valor: 1200
  }
];

export const mockContratos: Contrato[] = [
  {
    id: "1",
    eventoId: "1",
    clienteId: "1",
    valor: 2500,
    desconto: 100,
    valorFinal: 2400,
    formaPagamento: "PIX + Cartão",
    status: "ativo",
    dataAssinatura: "2024-04-15T09:00:00Z",
    observacoes: "Desconto por fidelidade"
  },
  {
    id: "2",
    eventoId: "2",
    clienteId: "2",
    valor: 8500,
    valorFinal: 8500,
    formaPagamento: "Transferência bancária",
    status: "ativo",
    dataAssinatura: "2024-04-20T14:30:00Z"
  },
  {
    id: "3",
    eventoId: "5",
    clienteId: "2",
    valor: 5500,
    desconto: 200,
    valorFinal: 5300,
    formaPagamento: "Cartão de crédito",
    status: "ativo",
    dataAssinatura: "2024-04-25T11:15:00Z",
    observacoes: "Desconto negociado"
  }
];