import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { Cliente } from "@/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function Clientes() {
  // const { clientes, addCliente, updateCliente } = useAppContext();
  // E no AppContext, os métodos usam getClientesApi/createClienteApi/updateClienteApi,
  // que já dependem de getCurrentUserId() e filtram por user_id.
  const { clientes, addCliente, updateCliente } = useAppContext() as any;
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-2" />
          {showForm ? 'Cancelar' : 'Novo Cliente'}
        </Button>
      </div>

      {/* Search */}
      {!showForm && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Pesquisar cliente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadastrar cliente</CardTitle>
          </CardHeader>
          <CardContent>
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

              <div className="flex justify-center pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary-hover text-primary-foreground px-8">
                  Cadastrar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Client List */}
      {viewMode === 'list' && (
  <div className="space-y-4">
    {filteredClientes.map((cliente) => (
      <Card key={cliente.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h3 className="font-semibold text-lg">
                  {cliente.nome} {cliente.sobrenome}
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {cliente.sexo === 'M' ? 'Masculino' : cliente.sexo === 'F' ? 'Feminino' : 'Outro'}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Email:</span> {cliente.email}
                </div>
                <div>
                  <span className="font-medium">Celular:</span> {cliente.numeroCelular}
                </div>
                <div>
                  <span className="font-medium">Cidade:</span> {cliente.cidade}, {cliente.estado}
                </div>
                <div>
                  <span className="font-medium">Cadastrado:</span>{" "}
                  {format(parseISO(cliente.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={() => handleViewClick(cliente)}>
                <Edit size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}

{/* Visualizar Cliente */}
{viewMode === 'view' && selectedCliente && (
  <Card className="mt-6 border border-slate-200 shadow-sm">
    <CardHeader className="border-b bg-slate-50/80">
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
    <CardContent className="pt-4 space-y-5">
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
      </div>
    </CardContent>
  </Card>
)}
    </div>
  );
}