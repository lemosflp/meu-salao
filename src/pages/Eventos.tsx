import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, Clock, MapPin } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { usePacotesContext } from "@/contexts/PacotesContext";
import { useAdicionaisContext } from "@/contexts/AdicionaisContext";
import { useEquipesContext } from "@/contexts/EquipesContext";
import { Evento } from "@/types";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Eventos() {
  const { eventos, clientes, addEvento } = useAppContext();
  const { pacotes } = usePacotesContext();
  const { adicionais } = useAdicionaisContext();
  const { equipes } = useEquipesContext();

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
    valor: null,
    pacoteId: "",
    convidados: null,
    decoracao: "",
    equipeId: "",
    equipeProfissionais: [],
    adicionaisIds: [],
    valorEntrada: null,
    formaPagamento: "",
  });

  const [eventoEquipeProfissionais, setEventoEquipeProfissionais] = useState<
    { id: string; nome: string; quantidade: number }[]
  >([]);

  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredEventos = eventos.filter(evento =>
    evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (field: keyof Evento, value: string | number | string[] | undefined) => {
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

  const handlePacoteSelect = (pacoteId: string) => {
    const pacote = pacotes.find(p => p.id === pacoteId);
    setFormData(prev => ({
      ...prev,
      pacoteId,
      convidados: prev.convidados, // mantém o que o usuário já tinha digitado
    }));
  };

  const handleEquipeSelect = (equipeId: string) => {
    const equipe = equipes.find(e => e.id === equipeId);
    setFormData(prev => ({
      ...prev,
      equipeId,
    }));
    if (equipe) {
      setEventoEquipeProfissionais(
        equipe.profissionais.map(p => ({
          id: p.id,
          nome: p.nome,
          quantidade: p.quantidade,
        }))
      );
    } else {
      setEventoEquipeProfissionais([]);
    }
  };

  const handleAdicionalToggle = (adicionalId: string) => {
    setFormData(prev => {
      const current = prev.adicionaisIds || [];
      const exists = current.includes(adicionalId);
      return {
        ...prev,
        adicionaisIds: exists ? current.filter(id => id !== adicionalId) : [...current, adicionalId],
      };
    });
  };

  const handleEquipeProfissionalChange = (id: string, quantidade: number) => {
    setEventoEquipeProfissionais(prev =>
      prev.map(p => (p.id === id ? { ...p, quantidade } : p))
    );
  };

  const selectedPacote = useMemo(
    () => (formData.pacoteId ? pacotes.find(p => p.id === formData.pacoteId) || undefined : undefined),
    [formData.pacoteId, pacotes]
  );

  const selecionadosAdicionais = useMemo(
    () =>
      (formData.adicionaisIds || []).map(id => adicionais.find(a => a.id === id)).filter(Boolean),
    [formData.adicionaisIds, adicionais]
  ) as typeof adicionais;

  const diffHorasPacote = useMemo(() => {
    if (!selectedPacote || !formData.horaInicio || !formData.horaFim) return { extra: 0, hasExtra: false };

    const [hiH, hiM] = formData.horaInicio.split(":").map(Number);
    const [hfH, hfM] = formData.horaFim.split(":").map(Number);
    const inicioMin = hiH * 60 + hiM;
    const fimMin = hfH * 60 + hfM;
    if (fimMin <= inicioMin) return { extra: 0, hasExtra: false };

    const duracaoMin = fimMin - inicioMin;
    const duracaoHoras = duracaoMin / 60;
    const extra = Math.max(0, duracaoHoras - selectedPacote.duracaoHoras);
    return { extra, hasExtra: extra > 0.01 };
  }, [selectedPacote, formData.horaInicio, formData.horaFim]);

  const valorCalculado = useMemo(() => {
    if (!selectedPacote) return 0;

    const base = selectedPacote.valorBase;
    const convidadosEvento = formData.convidados || selectedPacote.convidadosBase;
    const excedente = Math.max(0, convidadosEvento - selectedPacote.convidadosBase);
    const valorExcedente = excedente * selectedPacote.valorPorPessoa;

    const valorAdicionais = selecionadosAdicionais.reduce((sum, a) => sum + a.valor, 0);

    return base + valorExcedente + valorAdicionais;
  }, [selectedPacote, formData.convidados, selecionadosAdicionais]);

  const handleConvidadosChange = (valorStr: string) => {
    const valor = Number(valorStr) || 0;
    setFormData(prev => ({
      ...prev,
      convidados: valor,
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

    if (selectedPacote && (formData.convidados || 0) < selectedPacote.convidadosBase) {
      toast({
        title: "Número de convidados inválido",
        description: `O pacote selecionado possui mínimo de ${selectedPacote.convidadosBase} convidados.`,
        variant: "destructive",
      });
      return;
    }

    const payload: Omit<Evento, "id"> = {
      titulo: formData.titulo!,
      clienteId: formData.clienteId!,
      clienteNome: formData.clienteNome || "",
      data: formData.data!,
      horaInicio: formData.horaInicio!,
      horaFim: formData.horaFim,
      tipo: formData.tipo || "aniversario",
      status: formData.status || "pendente",
      observacoes: formData.observacoes || "",
      valor: valorCalculado,
      pacoteId: formData.pacoteId,
      convidados: formData.convidados,
      decoracao: formData.decoracao,
      equipeId: formData.equipeId,
      equipeProfissionais: eventoEquipeProfissionais,
      adicionaisIds: formData.adicionaisIds || [],
      valorEntrada: formData.valorEntrada || 0,
      formaPagamento: formData.formaPagamento || "",
    };

    addEvento(payload);

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
      valor: 0,
      pacoteId: "",
      convidados: 0,
      decoracao: "",
      equipeId: "",
      equipeProfissionais: [],
      adicionaisIds: [],
      valorEntrada: 0,
      formaPagamento: "",
    });
    setEventoEquipeProfissionais([]);
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e festas</p>
        </div>

        <div className="flex gap-2">
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-8"
            onClick={() => navigate("/pacotes")}
          >
            <Plus size={16} className="mr-2" />
            Gerenciar pacotes
          </Button>

          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} className="mr-2" />
            {showForm ? "Cancelar" : "Cadastrar Evento"}
          </Button>
        </div>
      </div>

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

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cadastrar evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Pacote:</Label>
                  <Select
                    value={formData.pacoteId}
                    onValueChange={handlePacoteSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o pacote" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacotes.map(p => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome} ({p.duracaoHoras}h / {p.convidadosBase} convidados)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="horaInicio">Início: <span className="text-red-500">*</span></Label>
                    <Input
                      id="horaInicio"
                      type="time"
                      required
                      value={formData.horaInicio}
                      onChange={(e) => handleInputChange("horaInicio", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="horaFim">Fim:</Label>
                    <Input
                      id="horaFim"
                      type="time"
                      value={formData.horaFim}
                      onChange={(e) => handleInputChange("horaFim", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {selectedPacote && diffHorasPacote.hasExtra && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                  O horário selecionado excede o tempo do pacote em{" "}
                  <strong>{diffHorasPacote.extra.toFixed(2)}h</strong> (hora extra).
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="convidados">Convidados:</Label>
                  <Input
                    id="convidados"
                    type="number"
                    value={formData.convidados ?? ""}
                    onChange={(e) => handleConvidadosChange(e.target.value)}
                    placeholder={
                      selectedPacote
                        ? `Mínimo ${selectedPacote.convidadosBase}`
                        : "Quantidade de convidados"
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="decoracao">Decoração:</Label>
                  <Textarea
                    id="decoracao"
                    value={formData.decoracao || ""}
                    onChange={(e) => handleInputChange("decoracao", e.target.value)}
                    placeholder="Descreva a decoração desejada"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Equipe:</Label>
                <Select
                  value={formData.equipeId}
                  onValueChange={handleEquipeSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipes.map(equipe => (
                      <SelectItem key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {eventoEquipeProfissionais.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {eventoEquipeProfissionais.map(p => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center text-sm border rounded px-3 py-2 bg-muted/60"
                      >
                        <span className="font-medium">{p.nome}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Qtd.</span>
                          <Input
                            type="number"
                            min={0}
                            value={p.quantidade}
                            onChange={e =>
                              handleEquipeProfissionalChange(
                                p.id,
                                Number(e.target.value) || 0
                              )
                            }
                            className="w-16 h-8 text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Adicionais:</Label>
                {adicionais.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    Nenhum adicional cadastrado. Cadastre em Pacotes &gt; Adicionais.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {adicionais.map(a => {
                      const checked = (formData.adicionaisIds || []).includes(a.id);
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => handleAdicionalToggle(a.id)}
                          className={`flex justify-between items-center border rounded px-3 py-2 text-xs text-left ${
                            checked ? "bg-primary/5 border-primary" : "bg-muted/30"
                          }`}
                        >
                          <div>
                            <div className="font-medium text-sm">{a.nome}</div>
                            <div className="text-muted-foreground text-xs">
                              {a.modelo === "valor_pessoa"
                                ? "Valor por pessoa"
                                : a.modelo === "valor_unidade"
                                ? "Valor por unidade"
                                : "Valor por festa"}
                            </div>
                          </div>
                          <div className="text-xs font-medium">
                            R$ {a.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="valorEntrada">Entrada (R$):</Label>
                    <Input
                      id="valorEntrada"
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.valorEntrada ?? 0}
                      onChange={e =>
                        handleInputChange("valorEntrada", parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="formaPagamento">Formas de pagamento:</Label>
                    <Textarea
                      id="formaPagamento"
                      value={formData.formaPagamento || ""}
                      onChange={e => handleInputChange("formaPagamento", e.target.value)}
                      placeholder="Forma de pagamento combinada (ex: 50% entrada, 50% após o evento)"
                    />
                  </div>
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