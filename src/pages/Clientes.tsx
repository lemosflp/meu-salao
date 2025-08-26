import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Eye } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { Cliente } from "@/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function Clientes() {
  const { clientes, addCliente } = useAppContext();
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

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof Cliente, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.sobrenome || !formData.cpf || !formData.email) {
      toast({
        title: "Erro no cadastro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    addCliente(formData as Omit<Cliente, 'id' | 'createdAt'>);
    toast({
      title: "Cliente cadastrado com sucesso!",
      description: `${formData.nome} ${formData.sobrenome} foi adicionado ao sistema.`,
    });
    setShowForm(false);
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
      {!showForm && (
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
                    <Button variant="ghost" size="sm">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredClientes.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  {searchTerm ? "Nenhum cliente encontrado com os critérios de busca." : "Nenhum cliente cadastrado ainda."}
                </div>
                {!searchTerm && (
                  <Button 
                    className="mt-4 bg-primary hover:bg-primary-hover text-primary-foreground"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Cadastrar primeiro cliente
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}