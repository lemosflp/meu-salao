import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, Clock, MapPin } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { Evento } from "@/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function Eventos() {
  const { eventos, clientes, addEvento } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Evento>>({
    titulo: "",
    clienteId: "",
    clienteNome: "",
    data: "",
    horaInicio: "",
    horaFim: "",
    tipo: "aniversario",
    status: "pendente",
    observacoes: "",
    valor: 0
  });
  const { toast } = useToast();

  type Pacote = {
    id: string;
    nome: string;
    duracaoHoras: number;
    descricao?: string;
  };
  
  const [pacotes, setPacotes] = useState<Pacote[]>([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [pacoteForm, setPacoteForm] = useState({
    nome: "",
    duracaoHoras: "",
    descricao: "",
  });
const [editingPacoteId, setEditingPacoteId] = useState<string | null>(null);
  
  const handlePacoteChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setPacoteForm(prev => ({
      ...prev,
      [name]: name === "duracaoHoras" ? Number(value) : value,
    }));
  };
  
  const handleAddPacote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacoteForm.nome.trim()) return;
  
    if (editingPacoteId) {
      // editar existente
      setPacotes(prev =>
        prev.map(p =>
          p.id === editingPacoteId
            ? {
                ...p,
                nome: pacoteForm.nome.trim(),
                duracaoHoras: Number(pacoteForm.duracaoHoras) || 0,
                descricao: pacoteForm.descricao?.trim(),
              }
            : p
        )
      );
      setEditingPacoteId(null);
    } else {
      // criar novo
      const novo: Pacote = {
        id: String(Date.now()),
        nome: pacoteForm.nome.trim(),
        duracaoHoras: Number(pacoteForm.duracaoHoras) || 0,
        descricao: pacoteForm.descricao?.trim(),
      };
      setPacotes(prev => [novo, ...prev]);
    }
  
    setPacoteForm({ nome: "", duracaoHoras: "", descricao: "" });
    setShowPackageForm(false);
  };

const handleEditPacote = (p: Pacote) => {
  setPacoteForm({
    nome: p.nome,
    duracaoHoras: String(p.duracaoHoras),
    descricao: p.descricao ?? "",
  });
  setEditingPacoteId(p.id);
  setShowPackageForm(true);
};

const handleCancelEdit = () => {
  setEditingPacoteId(null);
  setPacoteForm({ nome: "", duracaoHoras: "", descricao: "" });
  setShowPackageForm(false);
};
  
  const handleRemovePacote = (id: string) => setPacotes(prev => prev.filter(p => p.id !== id));

  const filteredEventos = eventos.filter(evento =>
    evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof Evento, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClienteSelect = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    setFormData(prev => ({
      ...prev,
      clienteId,
      clienteNome: cliente ? `${cliente.nome} ${cliente.sobrenome}` : ""
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.clienteId || !formData.data || !formData.horaInicio) {
      toast({
        title: "Erro no cadastro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    addEvento(formData as Omit<Evento, 'id'>);
    toast({
      title: "Evento cadastrado com sucesso!",
      description: `${formData.titulo} foi adicionado ao calendário.`,
    });
    setShowForm(false);
    setFormData({
      titulo: "",
      clienteId: "",
      clienteNome: "",
      data: "",
      horaInicio: "",
      horaFim: "",
      tipo: "aniversario",
      status: "pendente",
      observacoes: "",
      valor: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'aniversario': return 'bg-pink-100 text-pink-800';
      case 'casamento': return 'bg-purple-100 text-purple-800';
      case 'corporativo': return 'bg-blue-100 text-blue-800';
      case 'festa': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e festas</p>
        </div>
   
        <Button
  className="bg-primary hover:bg-primary-hover text-primary-foreground px-8"
  onClick={() => setShowPackageForm(prev => !prev)}
>
  <Plus size={16} className="mr-2" />
  Cadastrar Pacotes
</Button>
<Button 
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-2" />
          {showForm ? 'Cancelar' : 'Cadastrar Evento'}
        </Button>
      </div>

      {/* Search */}
      {!showForm && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Pesquisar evento"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadastrar evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título do Evento: <span className="text-red-500">*</span></Label>
                <Input
                  id="titulo"
                  required
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  placeholder="Ex: Aniversário João - 30 anos"
                />
              </div>

              <div>
                <Label htmlFor="cliente">Cliente: <span className="text-red-500">*</span></Label>
                <Select value={formData.clienteId} onValueChange={handleClienteSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={cliente.id} value={cliente.id}>
                        {cliente.nome} {cliente.sobrenome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="data">Data: <span className="text-red-500">*</span></Label>
                  <Input
                    id="data"
                    type="date"
                    required
                    value={formData.data}
                    onChange={(e) => handleInputChange("data", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="horaInicio">Hora Início: <span className="text-red-500">*</span></Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    required
                    value={formData.horaInicio}
                    onChange={(e) => handleInputChange("horaInicio", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="horaFim">Hora Fim:</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={formData.horaFim}
                    onChange={(e) => handleInputChange("horaFim", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo do Evento:</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aniversario">Aniversário</SelectItem>
                      <SelectItem value="casamento">Casamento</SelectItem>
                      <SelectItem value="corporativo">Corporativo</SelectItem>
                      <SelectItem value="festa">Festa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor">Valor (R$):</Label>
                  <Input
                    id="valor"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => handleInputChange("valor", parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações:</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  placeholder="Informações adicionais sobre o evento"
                />
              </div>

              <div className="flex justify-center pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary-hover text-primary-foreground px-8">
                  Cadastrar Evento
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
{/* Formulário de Pacotes */}
{showPackageForm && (
  <form onSubmit={handleAddPacote} className="mb-6 p-4 border rounded bg-card">
    <h2 className="text-lg font-semibold mb-2">
      {editingPacoteId ? "Editar Pacote" : "Novo Pacote"}
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input
        name="nome"
        value={pacoteForm.nome}
        onChange={handlePacoteChange}
        placeholder="Nome do pacote"
        className="p-2 border rounded col-span-2"
        required
      />

      <input
        name="duracaoHoras"
        type="number"
        min={1}
        value={pacoteForm.duracaoHoras}
        onChange={handlePacoteChange}
        className="p-2 border rounded"
        placeholder="Duração (horas)"
      />

      <textarea
        name="descricao"
        value={pacoteForm.descricao}
        onChange={handlePacoteChange}
        placeholder="Descrição (opcional)"
        className="p-2 border rounded col-span-3"
      />
    </div>

    <div className="mt-3 flex gap-2">
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
        {editingPacoteId ? "Salvar Alterações" : "Salvar Pacote"}
      </button>
      <button
        type="button"
        className="bg-muted px-4 py-2 rounded"
        onClick={editingPacoteId ? handleCancelEdit : () => setShowPackageForm(false)}
      >
        {editingPacoteId ? "Cancelar Edição" : "Cancelar"}
      </button>
    </div>
  </form>
)}

{/* Lista de Pacotes */}
<section className="mb-6">
  <h3 className="text-lg font-medium mb-2">Pacotes Criados</h3>
  {pacotes.length === 0 ? (
    <div className="text-sm text-muted-foreground">Nenhum pacote cadastrado ainda.</div>
  ) : (
    <ul className="space-y-3">
      {pacotes.map(p => (
  <li key={p.id} className="p-3 border rounded flex justify-between items-start">
    <div>
      <div className="font-semibold">{p.nome}</div>
      <div className="text-sm text-muted-foreground">
        {p.duracaoHoras}h
      </div>
      {p.descricao && <div className="mt-1 text-sm">{p.descricao}</div>}
    </div>
    <div className="flex items-center">
      <button onClick={() => handleEditPacote(p)} className="text-blue-600 hover:underline mr-3">
        Editar
      </button>
      <button onClick={() => handleRemovePacote(p.id)} className="text-red-600 hover:underline">
        Remover
      </button>
    </div>
  </li>
))}
    </ul>
  )}
</section>

      {/* Event List */}
      {!showForm && (
        <div className="space-y-4">
          {filteredEventos.map((evento) => (
            <Card key={evento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-semibold text-lg">{evento.titulo}</h3>
                      <Badge className={getTipoColor(evento.tipo)}>
                        {evento.tipo}
                      </Badge>
                      <Badge className={getStatusColor(evento.status)}>
                        {evento.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{format(parseISO(evento.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{evento.horaInicio} {evento.horaFim && `- ${evento.horaFim}`}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{evento.clienteNome}</span>
                      </div>
                      <div>
                        <span className="font-medium">Valor:</span> R$ {evento.valor?.toLocaleString('pt-BR') || '0'}
                      </div>
                    </div>
                    
                    {evento.observacoes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                        <span className="font-medium">Observações:</span> {evento.observacoes}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredEventos.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  {searchTerm ? "Nenhum evento encontrado com os critérios de busca." : "Nenhum evento cadastrado ainda."}
                </div>
                {!searchTerm && (
                  <Button 
                    className="mt-4 bg-primary hover:bg-primary-hover text-primary-foreground"
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Cadastrar primeiro evento
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