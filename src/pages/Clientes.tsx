import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Users, Trash2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { Cliente } from "@/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function Clientes() {
  const context = useAppContext() as any;
  const { clientes, addCliente, updateCliente } = context;
  const deleteCliente = context.deleteCliente || context.removeCliente || context.excluirCliente;
  const [editingClienteId, setEditingClienteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: "",
    sobrenome: "",
    cpf: "",
    sexo: "F",
    dataNascimento: "",
    numeroCelular: "",
    numeroTelefone: "",
    email: "",
    estado: "",
    cidade: "",
    endereco: "",
    complemento: ""
  });
  const { toast } = useToast();
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'view' | 'edit'>('list');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);

  const formRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [showForm]);

  useEffect(() => {
    if (selectedCliente && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedCliente]);

  const handleViewClick = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setViewMode('view');
  };

  const handleBackFromView = () => {
    setSelectedCliente(null);
    setViewMode('list');
  };

  const handleEditFromView = () => {
    if (!selectedCliente) return;
    setFormData({
      nome: selectedCliente.nome,
      sobrenome: selectedCliente.sobrenome,
      cpf: selectedCliente.cpf,
      sexo: selectedCliente.sexo,
      dataNascimento: selectedCliente.dataNascimento,
      numeroCelular: selectedCliente.numeroCelular,
      numeroTelefone: selectedCliente.numeroTelefone,
      email: selectedCliente.email,
      estado: selectedCliente.estado,
      cidade: selectedCliente.cidade,
      endereco: selectedCliente.endereco,
      complemento: selectedCliente.complemento,
    });
    setEditingClienteId(selectedCliente.id as string);
    setShowForm(true);
    setViewMode('edit');
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      sobrenome: "",
      cpf: "",
      sexo: "F",
      dataNascimento: "",
      numeroCelular: "",
      numeroTelefone: "",
      email: "",
      estado: "",
      cidade: "",
      endereco: "",
      complemento: ""
    });
  };

  // --- helpers de validação ---
  const limparNaoNumericos = (valor: string) => valor.replace(/\D/g, "");

  const validarCPF = (cpfRaw: string) => {
    const cpf = limparNaoNumericos(cpfRaw);
    // aqui só valida tamanho; regra de dígitos verificadores pode ser adicionada depois
    return cpf.length === 11;
  };

  // telefones aceitos:
  // - 55 51 98888-8888  -> 13 dígitos numéricos (55 + DDD + 9 + número)
  // - 51 98888-8888     -> 11 dígitos numéricos (DDD + 9 + número)
  const validarTelefone = (telefoneRaw: string) => {
    const tel = limparNaoNumericos(telefoneRaw);
    return tel.length === 11 || tel.length === 13;
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof Cliente, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!formData.nome || !formData.sobrenome || !formData.cpf || !formData.email) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: "Nome, sobrenome, CPF e email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // validação CPF
    if (!validarCPF(formData.cpf)) {
      toast({
        title: "CPF inválido",
        description: "Informe um CPF com 11 dígitos (ex.: 000.000.000-00).",
        variant: "destructive",
      });
      return;
    }

    // validação telefone celular (obrigatório)
    if (!formData.numeroCelular || !validarTelefone(formData.numeroCelular)) {
      toast({
        title: "Celular inválido",
        description:
          "Informe um celular nos formatos 55 51 98888-8888 ou 51 98888-8888 (com ou sem espaços/hífens).",
        variant: "destructive",
      });
      return;
    }

    // validação telefone fixo (se preenchido)
    if (formData.numeroTelefone && !validarTelefone(formData.numeroTelefone)) {
      toast({
        title: "Telefone inválido",
        description:
          "Informe um telefone nos formatos 55 51 3333-4444 ou 51 3333-4444 (com ou sem espaços/hífens).",
        variant: "destructive",
      });
      return;
    }
  
    if (editingClienteId) {
      await updateCliente(editingClienteId, { ...formData } as any);
      toast({ title: "Cadastro atualizado com sucesso" });
    } else {
      await addCliente(formData as any);
      toast({ title: "Cliente cadastrado com sucesso" });
    }
  
    // reset e navegação de tela
    setFormData({
      nome: "",
      sobrenome: "",
      cpf: "",
      sexo: "F",
      dataNascimento: "",
      numeroCelular: "",
      numeroTelefone: "",
      email: "",
      estado: "",
      cidade: "",
      endereco: "",
      complemento: ""
    });
    setShowForm(false);
    setEditingClienteId(null);
    setViewMode("list");
    setSelectedCliente(null);
  };

  const handleEditClick = (cliente: Cliente) => {
    setFormData({
      nome: cliente.nome,
      sobrenome: cliente.sobrenome,
      cpf: cliente.cpf,
      sexo: cliente.sexo,
      dataNascimento: cliente.dataNascimento,
      numeroCelular: cliente.numeroCelular,
      numeroTelefone: cliente.numeroTelefone,
      email: cliente.email,
      estado: cliente.estado,
      cidade: cliente.cidade,
      endereco: cliente.endereco,
      complemento: cliente.complemento,
    });
    setEditingClienteId(cliente.id as string);
    setShowForm(true);
  };

  const handleDeleteClick = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;
    
    if (!deleteCliente) {
      toast({
        title: "Erro",
        description: "Função de deletar não está disponível no contexto.",
        variant: "destructive",
      });
      console.error("deleteCliente não é uma função:", deleteCliente);
      return;
    }

    try {
      await deleteCliente(clienteToDelete.id as string);
      toast({
        title: "Cliente deletado com sucesso",
        description: `${clienteToDelete.nome} ${clienteToDelete.sobrenome} foi removido.`,
      });
      setShowDeleteConfirm(false);
      setClienteToDelete(null);
      setSelectedCliente(null);
      setViewMode('list');
    } catch (error: any) {
      console.error("Erro ao deletar cliente:", error);
      toast({
        title: "Erro ao deletar cliente",
        description: error?.message || "Não foi possível remover o cliente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Clientes</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie todos os seus clientes
        </p>
      </div>

      {/* Botão de ação */}
      <div className="flex gap-3 mb-8">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 flex items-center gap-2"
          onClick={() => {
            if (showForm && !editingClienteId) {
              resetForm();
            }
            setShowForm(prev => !prev);
          }}
        >
          <Plus size={18} />
          {showForm ? "Cancelar" : editingClienteId ? "Editar Cliente" : "Cadastrar Cliente"}
        </Button>
      </div>

      {/* Pesquisa */}
      {!showForm && (
        <Card className="mb-6 bg-white border-blue-200">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Pesquisar cliente por nome ou email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* FORMULÁRIO */}
      {showForm && (
        <div ref={formRef}>
          <Card className="mb-8 border-l-4 border-l-blue-600 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Users size={20} />
                {editingClienteId ? "Editar Cliente" : "Cadastrar Novo Cliente"}
              </CardTitle>
              <p className="text-xs text-blue-700 mt-1">Preencha os dados do cliente</p>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome: <span className="text-red-500">*</span></Label>
                    <Input
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sobrenome">Sobrenome: <span className="text-red-500">*</span></Label>
                    <Input
                      id="sobrenome"
                      required
                      value={formData.sobrenome}
                      onChange={(e) => handleInputChange("sobrenome", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cpf">CPF: <span className="text-red-500">*</span></Label>
                    <Input
                      id="cpf"
                      required
                      value={formData.cpf}
                      onChange={(e) => handleInputChange("cpf", e.target.value)}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sexo">Sexo: <span className="text-red-500">*</span></Label>
                    <Select value={formData.sexo} onValueChange={(value: 'M' | 'F' | 'Outro') => handleInputChange("sexo", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dataNascimento">Data de Nascimento: <span className="text-red-500">*</span></Label>
                    <Input
                      id="dataNascimento"
                      type="date"
                      required
                      value={formData.dataNascimento}
                      onChange={(e) => handleInputChange("dataNascimento", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="numeroCelular">Número Celular: <span className="text-red-500">*</span></Label>
                    <Input
                      id="numeroCelular"
                      required
                      value={formData.numeroCelular}
                      onChange={(e) => handleInputChange("numeroCelular", e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numeroTelefone">Número Telefone:</Label>
                    <Input
                      id="numeroTelefone"
                      value={formData.numeroTelefone}
                      onChange={(e) => handleInputChange("numeroTelefone", e.target.value)}
                      placeholder="(11) 3333-4444"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">E-mail: <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estado">Estado: <span className="text-red-500">*</span></Label>
                    <Input
                      id="estado"
                      required
                      value={formData.estado}
                      onChange={(e) => handleInputChange("estado", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade: <span className="text-red-500">*</span></Label>
                    <Input
                      id="cidade"
                      required
                      value={formData.cidade}
                      onChange={(e) => handleInputChange("cidade", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="endereco">Endereço: <span className="text-red-500">*</span></Label>
                    <Input
                      id="endereco"
                      required
                      value={formData.endereco}
                      onChange={(e) => handleInputChange("endereco", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complemento">Complemento:</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => handleInputChange("complemento", e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                    {editingClienteId ? "Salvar Alterações" : "Salvar Cliente"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setEditingClienteId(null);
                      resetForm();
                      setShowForm(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Client List */}
      {viewMode === 'list' && (
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Users size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Clientes Cadastrados</h2>
            <span className="ml-auto text-sm text-muted-foreground">{filteredClientes.length} cliente(s)</span>
          </div>
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardContent className="pt-6">
              {filteredClientes.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-blue-200 mb-3" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredClientes.map((cliente) => (
                    <Card
                      key={cliente.id}
                      className="bg-white border-blue-200 hover:shadow-lg transition cursor-pointer hover:border-blue-400"
                      onClick={() => handleViewClick(cliente)}
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-bold text-base text-blue-800 flex-1">
                            {cliente.nome} {cliente.sobrenome}
                          </h4>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600">
                          <div className="flex justify-between">
                            <span>📧 Email:</span>
                            <span className="font-medium text-xs">{cliente.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>📱 Celular:</span>
                            <span className="font-medium">{cliente.numeroCelular}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>📍 Cidade:</span>
                            <span className="font-medium">{cliente.cidade}</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-3 text-blue-700 hover:bg-blue-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewClick(cliente);
                          }}
                        >
                          <Edit size={16} className="mr-2" /> Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Visualizar Cliente */}
      {viewMode === 'view' && selectedCliente && (
        <div ref={detailRef}>
          <Card className="border-l-4 border-l-blue-600 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <span>{selectedCliente.nome} {selectedCliente.sobrenome}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedCliente.sexo === 'M' ? 'Masculino' : selectedCliente.sexo === 'F' ? 'Feminino' : 'Outro'}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cliente desde{" "}
                    {format(parseISO(selectedCliente.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div className="font-medium">Contato principal</div>
                  <div>{selectedCliente.email}</div>
                  <div>{selectedCliente.numeroCelular}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4 text-sm">
              {/* Linha de chips principais */}
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span className="font-medium">CPF</span>
                  <span>{selectedCliente.cpf}</span>
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <span className="font-medium">Nascimento</span>
                  <span>{selectedCliente.dataNascimento}</span>
                </Badge>
                {selectedCliente.numeroTelefone && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span className="font-medium">Telefone</span>
                    <span>{selectedCliente.numeroTelefone}</span>
                  </Badge>
                )}
              </div>

              {/* Seções em duas colunas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dados pessoais
                  </h3>
                  <div className="rounded-lg border bg-slate-50/60 p-3 space-y-1">
                    <div>
                      <span className="font-medium text-foreground">Nome completo: </span>
                      <span>{selectedCliente.nome} {selectedCliente.sobrenome}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Sexo: </span>
                      <span>{selectedCliente.sexo}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Data de nascimento: </span>
                      <span>{selectedCliente.dataNascimento}</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contato
                  </h3>
                  <div className="rounded-lg border bg-slate-50/60 p-3 space-y-1">
                    <div>
                      <span className="font-medium text-foreground">Email: </span>
                      <span>{selectedCliente.email}</span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Celular: </span>
                      <span>{selectedCliente.numeroCelular}</span>
                    </div>
                    {selectedCliente.numeroTelefone && (
                      <div>
                        <span className="font-medium text-foreground">Telefone: </span>
                        <span>{selectedCliente.numeroTelefone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Endereço
                  </h3>
                  <div className="rounded-lg border bg-slate-50/60 p-3 space-y-1">
                    <div>
                      <span className="font-medium text-foreground">Endereço: </span>
                      <span>{selectedCliente.endereco}</span>
                      {selectedCliente.complemento && (
                        <span className="text-muted-foreground"> {selectedCliente.complemento}</span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Cidade/Estado: </span>
                      <span>{selectedCliente.cidade}, {selectedCliente.estado}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="mt-4 flex gap-2 justify-end">
                <Button onClick={handleBackFromView} variant="outline" className="px-4">
                  Voltar
                </Button>
                <Button
                  onClick={handleEditFromView}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground px-4"
                >
                  Editar cadastro
                </Button>
                <Button
                  onClick={() => handleDeleteClick(selectedCliente)}
                  variant="destructive"
                  className="px-4"
                >
                  <Trash2 size={16} className="mr-2" /> Deletar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {showDeleteConfirm && clienteToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 border-red-200">
            <CardHeader className="bg-red-50 border-b border-red-200">
              <CardTitle className="text-red-700">Confirmar exclusão</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-foreground">
                Tem certeza que deseja deletar <span className="font-bold">{clienteToDelete.nome} {clienteToDelete.sobrenome}</span>?
              </p>
              <p className="text-xs text-muted-foreground">
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setClienteToDelete(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                >
                  Deletar cliente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}