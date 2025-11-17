import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, Clock, MapPin, Edit } from "lucide-react";
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
  const { eventos, clientes, addEvento, updateEvento, removeEvento } = useAppContext();
  const { pacotes } = usePacotesContext();
  const { adicionais } = useAdicionaisContext();
  const { equipes } = useEquipesContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [editingEventoId, setEditingEventoId] = useState<string | null>(null);
  const [selectedEventoId, setSelectedEventoId] = useState<string | null>(null);

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
    valor: 0,
    pacoteId: "",
    convidados: undefined,
    decoracao: "",
    equipeId: "",
    equipeProfissionais: [],
    adicionaisIds: [],
    valorEntrada: undefined,
    formaPagamento: "",
    aniversariantes: [], // [{ nome, idade? }]
  });

  const [adicionaisObservacoesMap, setAdicionaisObservacoesMap] = useState<Record<string, string>>({});
  const [adicionaisQuantidadeMap, setAdicionaisQuantidadeMap] = useState<Record<string, number>>({});

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

  const selectedEvento = selectedEventoId
    ? eventos.find(e => e.id === selectedEventoId) ?? null
    : null;

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
      const nextIds = exists
        ? current.filter(id => id !== adicionalId)
        : [...current, adicionalId];

      if (exists) {
        setAdicionaisObservacoesMap(prevMap => {
          const copy = { ...prevMap };
          delete copy[adicionalId];
          return copy;
        });
        setAdicionaisQuantidadeMap(prevMap => {
          const copy = { ...prevMap };
          delete copy[adicionalId];
          return copy;
        });
      }

      return {
        ...prev,
        adicionaisIds: nextIds,
      };
    });
  };

  const handleAdicionalObservacaoChange = (adicionalId: string, value: string) => {
    setAdicionaisObservacoesMap(prev => ({
      ...prev,
      [adicionalId]: value,
    }));
  };

  const handleAdicionalQuantidadeChange = (adicionalId: string, valueStr: string) => {
    const value = valueStr === "" ? 0 : Number(valueStr) || 0;
    setAdicionaisQuantidadeMap(prev => ({
      ...prev,
      [adicionalId]: value,
    }));
  };

  const handleEquipeProfissionalChange = (id: string, quantidade: number) => {
    setEventoEquipeProfissionais(prev =>
      prev.map(p => (p.id === id ? { ...p, quantidade } : p))
    );
  };

  const handleAniversarianteChange = (
    index: number,
    field: "nome" | "idade",
    value: string
  ) => {
    setFormData(prev => {
      const list = prev.aniversariantes ? [...prev.aniversariantes] : [];
      const item = list[index] ?? { nome: "" };
      if (field === "nome") {
        item.nome = value;
      } else {
        item.idade = value === "" ? undefined : Number(value) || 0;
      }
      list[index] = item;
      return { ...prev, aniversariantes: list };
    });
  };

  const handleAddAniversariante = () => {
    setFormData(prev => ({
      ...prev,
      aniversariantes: [...(prev.aniversariantes || []), { nome: "", idade: undefined }],
    }));
  };

  const handleRemoveAniversariante = (index: number) => {
    setFormData(prev => {
      const list = prev.aniversariantes ? [...prev.aniversariantes] : [];
      list.splice(index, 1);
      return { ...prev, aniversariantes: list };
    });
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
    if (!selectedPacote || !formData.horaInicio || !formData.horaFim) {
      return {
        extra: 0,
        extraInt: 0,
        deficit: 0,
        deficitInt: 0,
        hasExtra: false,
        hasDeficit: false,
        duracaoHoras: 0,
      };
    }

    const [hiH, hiM] = formData.horaInicio.split(":").map(Number);
    const [hfH, hfM] = formData.horaFim.split(":").map(Number);
    const inicioMin = hiH * 60 + hiM;
    const fimMin = hfH * 60 + hfM;
    if (fimMin <= inicioMin) {
      return {
        extra: 0,
        extraInt: 0,
        deficit: 0,
        deficitInt: 0,
        hasExtra: false,
        hasDeficit: false,
        duracaoHoras: 0,
      };
    }

    const duracaoMin = fimMin - inicioMin;
    const duracaoHoras = duracaoMin / 60;

    const extra = Math.max(0, duracaoHoras - selectedPacote.duracaoHoras);
    const deficit = Math.max(0, selectedPacote.duracaoHoras - duracaoHoras);

    const extraInt = Math.ceil(extra);
    const deficitInt = Math.ceil(deficit);

    return {
      extra,
      extraInt,
      deficit,
      deficitInt,
      hasExtra: extraInt > 0,
      hasDeficit: deficitInt > 0,
      duracaoHoras,
    };
  }, [selectedPacote, formData.horaInicio, formData.horaFim]);

  const [valorEditadoManualmente, setValorEditadoManualmente] = useState(false);

  const valorCalculado = useMemo(() => {
    if (!selectedPacote) return 0;

    const base = selectedPacote.valorBase;
    const convidadosEvento = formData.convidados || selectedPacote.convidadosBase;
    const excedente = Math.max(0, convidadosEvento - selectedPacote.convidadosBase);
    const valorExcedente = excedente * selectedPacote.valorPorPessoa;

    const valorAdicionais = selecionadosAdicionais.reduce((sum, a) => {
      if (a.modelo === "valor_festa") {
        return sum + a.valor;
      }

      if (a.modelo === "valor_unidade") {
        const qtd = adicionaisQuantidadeMap[a.id] ?? 0;
        return sum + a.valor * qtd;
      }

      const convidados = convidadosEvento || 0;
      return sum + a.valor * convidados;
    }, 0);

    return base + valorExcedente + valorAdicionais;
  }, [
    selectedPacote,
    formData.convidados,
    selecionadosAdicionais,
    adicionaisQuantidadeMap,
  ]);

  useEffect(() => {
    if (!selectedPacote) return;
    if (valorEditadoManualmente) return;

    setFormData(prev => ({
      ...prev,
      valor: valorCalculado,
    }));
  }, [valorCalculado, selectedPacote, valorEditadoManualmente]);

  const valorDigitado = formData.valor ?? 0;
  const diffValor = valorDigitado - valorCalculado;
  const hasDiffValor = Math.abs(diffValor) >= 0.01;

  const handleConvidadosChange = (valorStr: string) => {
    const valor = valorStr === "" ? undefined : Number(valorStr) || 0;
    setFormData(prev => ({
      ...prev,
      convidados: valor,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const aniversariantesValidos = (formData.aniversariantes || []).filter(
      a => a.nome && a.nome.trim()
    );

    if (
      !formData.clienteId ||
      !formData.pacoteId ||
      !formData.data ||
      !formData.horaInicio ||
      !formData.formaPagamento ||
      formData.convidados == null || formData.convidados === undefined || formData.convidados <= 0 ||
      aniversariantesValidos.length === 0
    ) {
      toast({
        title: "Erro no cadastro",
        description:
          "Preencha todos os campos obrigatórios (cliente, proposta, data, início, convidados, ao menos um aniversariante/homenageado e forma de pagamento).",
        variant: "destructive",
      });
      return;
    }

    if (selectedPacote && (formData.convidados || 0) < selectedPacote.convidadosBase) {
      toast({
        title: "Número de convidados inválido",
        description: `A proposta selecionada possui mínimo de ${selectedPacote.convidadosBase} convidados.`,
        variant: "destructive",
      });
      return;
    }

    const payloadBase: Omit<Evento, "id"> = {
      titulo:
        (formData.titulo && formData.titulo.trim()) ||
        (formData.clienteNome
          ? `Evento - ${formData.clienteNome}`
          : "Evento"),
      clienteId: formData.clienteId!,
      clienteNome: formData.clienteNome || "",
      data: formData.data!,
      horaInicio: formData.horaInicio!,
      horaFim: formData.horaFim,
      tipo: formData.tipo || "aniversario",
      status: formData.status || "pendente",
      observacoes: formData.observacoes || "",
      valor: valorDigitado,
      pacoteId: formData.pacoteId,
      convidados: formData.convidados,
      decoracao: formData.decoracao,
      equipeId: formData.equipeId,
      equipeProfissionais: eventoEquipeProfissionais,
      adicionaisIds: formData.adicionaisIds || [],
      valorEntrada: formData.valorEntrada || 0,
      formaPagamento: formData.formaPagamento || "",
      aniversariantes: aniversariantesValidos.map(a => ({
        nome: a.nome.trim(),
        idade:
          a.idade !== undefined && a.idade !== null && a.idade !== 0
            ? a.idade
            : undefined,
      })),
      adicionaisObservacoes: (formData.adicionaisIds || [])
        .map(adicionalId => {
          const obs = adicionaisObservacoesMap[adicionalId];
          if (!obs?.trim()) return null;
          return { adicionalId, observacao: obs.trim() };
        })
        .filter(Boolean) as { adicionalId: string; observacao: string }[],
      adicionaisQuantidade: (formData.adicionaisIds || [])
        .map(adicionalId => ({
          adicionalId,
          quantidade: adicionaisQuantidadeMap[adicionalId] ?? 0,
        }))
        .filter(item => item.quantidade > 0),
    };

    if (editingEventoId) {
      updateEvento(editingEventoId, payloadBase);
      toast({
        title: "Evento atualizado com sucesso!",
        description: `${payloadBase.titulo} foi atualizado.`,
      });
    } else {
      addEvento(payloadBase);
      toast({
        title: "Evento cadastrado com sucesso!",
        description: `${payloadBase.titulo} foi adicionado ao calendário.`,
      });
    }

    setShowForm(false);
    setEditingEventoId(null);
    setSelectedEventoId(null);
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
      convidados: undefined,
      decoracao: "",
      equipeId: "",
      equipeProfissionais: [],
      adicionaisIds: [],
      valorEntrada: undefined,
      formaPagamento: "",
      aniversariantes: [],
    });
    setEventoEquipeProfissionais([]);
    setAdicionaisObservacoesMap({});
    setAdicionaisQuantidadeMap({});
    setValorEditadoManualmente(false);
  };

  const handleEditEvento = (id: string) => {
    const ev = eventos.find(e => e.id === id);
    if (!ev) return;

    setFormData({
      titulo: ev.titulo,
      clienteId: ev.clienteId,
      clienteNome: ev.clienteNome,
      data: ev.data,
      horaInicio: ev.horaInicio,
      horaFim: ev.horaFim,
      tipo: ev.tipo,
      status: ev.status,
      observacoes: ev.observacoes ?? "",
      valor: ev.valor,
      pacoteId: ev.pacoteId ?? "",
      convidados: ev.convidados ?? 0,
      decoracao: ev.decoracao ?? "",
      equipeId: ev.equipeId ?? "",
      equipeProfissionais: ev.equipeProfissionais ?? [],
      adicionaisIds: ev.adicionaisIds ?? [],
      valorEntrada: ev.valorEntrada ?? 0,
      formaPagamento: ev.formaPagamento ?? "",
      aniversariantes: ev.aniversariantes ?? [],
    });

    setEventoEquipeProfissionais(ev.equipeProfissionais ?? []);

    const mapFromEventoObs: Record<string, string> = {};
    ev.adicionaisObservacoes?.forEach(item => {
      mapFromEventoObs[item.adicionalId] = item.observacao;
    });
    setAdicionaisObservacoesMap(mapFromEventoObs);

    const mapFromEventoQtd: Record<string, number> = {};
    ev.adicionaisQuantidade?.forEach(item => {
      mapFromEventoQtd[item.adicionalId] = item.quantidade;
    });
    setAdicionaisQuantidadeMap(mapFromEventoQtd);

    setEditingEventoId(id);
    setShowForm(true);
    setValorEditadoManualmente(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEventoId(null);
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
      convidados: undefined,
      decoracao: "",
      equipeId: "",
      equipeProfissionais: [],
      adicionaisIds: [],
      valorEntrada: undefined,
      formaPagamento: "",
      aniversariantes: [],
    });
    setEventoEquipeProfissionais([]);
    setAdicionaisObservacoesMap({});
    setAdicionaisQuantidadeMap({});
    setValorEditadoManualmente(false);
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

  const [showAdicionaisPicker, setShowAdicionaisPicker] = useState(false);

  // NOVO: helpers para detalhes
  const getPacoteById = (id?: string) =>
    id ? pacotes.find(p => p.id === id) : undefined;

  const getEquipeById = (id?: string) =>
    id ? equipes.find(e => e.id === id) : undefined;

  const calcularTotalAdicionalEvento = (
    adicional: (typeof adicionais)[number],
    evento: Evento
  ) => {
    const convidados = evento.convidados ?? 0;

    if (adicional.modelo === "valor_festa") {
      return adicional.valor;
    }

    if (adicional.modelo === "valor_unidade") {
      const qtdItem = evento.adicionaisQuantidade?.find(
        q => q.adicionalId === adicional.id
      );
      const qtd = qtdItem?.quantidade ?? 0;
      return adicional.valor * qtd;
    }

    // valor_pessoa
    return adicional.valor * convidados;
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
            Gerenciar propostas
          </Button>

          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={() => {
              if (showForm && !editingEventoId) {
                handleCancelForm();
              } else {
                setShowForm(prev => !prev);
              }
            }}
          >
            <Plus size={16} className="mr-2" />
            {showForm ? "Cancelar" : editingEventoId ? "Editar Evento" : "Cadastrar Evento"}
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
            <CardTitle>
              {editingEventoId ? "Editar evento" : "Cadastrar evento"}
            </CardTitle>
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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>
                    Aniversariantes / Homenageados:{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddAniversariante}
                  >
                    Adicionar pessoa
                  </Button>
                </div>

                {(formData.aniversariantes || []).length === 0 && (
                  <div className="text-xs text-muted-foreground">
                    Adicione pelo menos uma pessoa (ex.: aniversariante ou casal de noivos).
                  </div>
                )}

                <div className="space-y-2">
                  {(formData.aniversariantes || []).map((a, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-[2fr_1fr_auto] gap-2 items-center"
                    >
                      <div>
                        <Label className="text-xs" htmlFor={`aniv-nome-${index}`}>
                          Nome
                        </Label>
                        <Input
                          id={`aniv-nome-${index}`}
                          value={a.nome || ""}
                          onChange={e =>
                            handleAniversarianteChange(index, "nome", e.target.value)
                          }
                          placeholder="Ex.: Ana Beatriz"
                        />
                      </div>
                      <div>
                        <Label className="text-xs" htmlFor={`aniv-idade-${index}`}>
                          Idade (opcional)
                        </Label>
                        <Input
                          id={`aniv-idade-${index}`}
                          type="number"
                          min={0}
                          value={a.idade ?? ""}
                          onChange={e =>
                            handleAniversarianteChange(index, "idade", e.target.value)
                          }
                          placeholder="Ex.: 7"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAniversariante(index)}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Proposta: <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.pacoteId}
                    onValueChange={handlePacoteSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a proposta" />
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

              {selectedPacote && (diffHorasPacote.hasExtra || diffHorasPacote.hasDeficit) && (
                <div className="text-xs bg-amber-50 border border-amber-200 rounded px-3 py-2 text-amber-800 space-y-1">
                  <div>
                    Duração selecionada:{" "}
                    <strong>{diffHorasPacote.duracaoHoras.toFixed(2)}h</strong>{" "}
                    (proposta: <strong>{selectedPacote.duracaoHoras}h</strong>)
                  </div>

                  {diffHorasPacote.hasExtra && (
                    <div>
                      {diffHorasPacote.extraInt}{" "}
                      {diffHorasPacote.extraInt === 1 ? "hora extra" : "horas extras"}.
                    </div>
                  )}

                  {diffHorasPacote.hasDeficit && (
                    <div>
                      {diffHorasPacote.deficitInt}{" "}
                      {diffHorasPacote.deficitInt === 1
                        ? "hora a menos que o pacote."
                        : "horas a menos que o pacote."}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="convidados">
                    Convidados: <span className="text-red-500">*</span>
                  </Label>
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
                  <Input
                    id="decoracao"
                    value={formData.decoracao || ""}
                    onChange={(e) => handleInputChange("decoracao", e.target.value)}
                    placeholder="Decoração (ex: balões, cores, tema)"
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
                    Nenhum adicional cadastrado. Cadastre em Propostas &gt; Adicionais.
                  </div>
                ) : (
                  <>
                    {selecionadosAdicionais.length === 0 ? (
                      <div className="text-xs text-muted-foreground">
                        Nenhum adicional selecionado.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2 text-xs">
                        {selecionadosAdicionais.map(a => (
                          <span
                            key={a.id}
                            className="px-2 py-1 rounded-full bg-primary/5 border border-primary/40 text-primary"
                          >
                            {a.nome}
                          </span>
                        ))}
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2 text-xs md:text-sm"
                      onClick={() => setShowAdicionaisPicker(true)}
                    >
                      Selecionar adicionais
                    </Button>

                    {showAdicionaisPicker && (
                      <div className="mt-3 border rounded-md bg-muted/40">
                        <div className="px-3 py-2 border-b text-xs text-muted-foreground">
                          Marque os adicionais desejados, preencha as observações/quantidades e clique em &quot;Aplicar seleção&quot;.
                        </div>

                        <div className="max-h-64 overflow-y-auto divide-y">
                          {adicionais.map(a => {
                            const checked = (formData.adicionaisIds || []).includes(a.id);
                            const obsValue = adicionaisObservacoesMap[a.id] || "";
                            const qtdValue = adicionaisQuantidadeMap[a.id] ?? 0;
                            return (
                              <div key={a.id} className="px-3 py-2 text-xs md:text-sm">
                                <label className="flex items-center justify-between cursor-pointer hover:bg-muted/40 rounded px-1 py-1">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => handleAdicionalToggle(a.id)}
                                      className="h-4 w-4"
                                    />
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
                                  </div>
                                  <div className="text-xs font-medium whitespace-nowrap ml-2">
                                    R$ {a.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                  </div>
                                </label>

                                {checked && a.modelo === "valor_unidade" && (
                                  <div className="mt-2 pl-6 flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Quantidade:</span>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={qtdValue === 0 ? "" : qtdValue}
                                      onChange={e =>
                                        handleAdicionalQuantidadeChange(a.id, e.target.value)
                                      }
                                      className="w-24 h-8 text-xs"
                                      placeholder="Qtd."
                                    />
                                  </div>
                                )}

                                {checked && a.observacao && (
                                  <div className="mt-2 pl-6">
                                    <Textarea
                                      rows={2}
                                      placeholder="Observação para este adicional"
                                      value={obsValue}
                                      onChange={e =>
                                        handleAdicionalObservacaoChange(a.id, e.target.value)
                                      }
                                      className="text-xs md:text-sm"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex justify-end gap-2 px-3 py-2 border-t">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAdicionaisPicker(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-primary hover:bg-primary-hover text-primary-foreground"
                            onClick={() => setShowAdicionaisPicker(false)}
                          >
                            Aplicar seleção
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valorEvento">Valor do evento (R$):</Label>
                  <Input
                    id="valorEvento"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.valor ?? 0}
                    onChange={e => {
                      setValorEditadoManualmente(true);
                      handleInputChange(
                        "valor",
                        e.target.value === "" ? 0 : parseFloat(e.target.value) || 0
                      );
                    }}
                    placeholder={
                      valorCalculado
                        ? `Sugestão: R$ ${valorCalculado.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}`
                        : "Informe o valor do evento"
                    }
                  />

                  {selectedPacote && hasDiffValor && (
                    <div className="text-[11px] mt-1 px-3 py-2 rounded border bg-amber-50 border-amber-200 text-amber-800">
                      O valor sugerido para este evento é{" "}
                      <strong>
                        R$ {valorCalculado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </strong>
                      , mas você definiu{" "}
                      <strong>
                        R$ {valorDigitado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </strong>
                      . Diferença de{" "}
                      <strong>
                        R$ {Math.abs(diffValor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </strong>
                      .{" "}
                      {diffValor < 0
                        ? "Verifique se todos os custos (ex.: convidados extras e adicionais) estão contemplados."
                        : "Lembre-se de alinhar este valor com o cliente e registrar as condições em forma de pagamento/contrato."}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valorEntrada">Entrada (R$):</Label>
                  <Input
                    id="valorEntrada"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.valorEntrada ?? ""}
                    onChange={e =>
                      handleInputChange(
                        "valorEntrada",
                        e.target.value === "" ? undefined : parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="Valor da entrada"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formaPagamento">
                    Formas de pagamento: <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="formaPagamento"
                    value={formData.formaPagamento || ""}
                    onChange={e => handleInputChange("formaPagamento", e.target.value)}
                    placeholder="Ex.: 50% entrada, 50% após o evento"
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

              <div className="flex justify-center pt-4 gap-2">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-primary-foreground px-8"
                >
                  {editingEventoId ? "Salvar alterações" : "Cadastrar Evento"}
                </Button>
                {editingEventoId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelForm}
                  >
                    Cancelar
                  </Button>
                )}
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

                  <div className="flex items-start ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEventoId(evento.id)}
                    >
                      <Edit size={16} />
                    </Button>
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

      {selectedEvento && (
        <section className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do evento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {/* BLOCO PRINCIPAL */}
              <div>
                <span className="font-medium text-foreground">Título: </span>
                {selectedEvento.titulo}
              </div>
              <div>
                <span className="font-medium text-foreground">Cliente: </span>
                {selectedEvento.clienteNome}
              </div>
              <div>
                <span className="font-medium text-foreground">Data: </span>
                {format(parseISO(selectedEvento.data), "dd/MM/yyyy", { locale: ptBR })}
              </div>
              <div>
                <span className="font-medium text-foreground">Horário: </span>
                {selectedEvento.horaInicio}
                {selectedEvento.horaFim && ` - ${selectedEvento.horaFim}`}
              </div>
              <div>
                <span className="font-medium text-foreground">Tipo: </span>
                {selectedEvento.tipo}
              </div>
              <div>
                <span className="font-medium text-foreground">Status: </span>
                {selectedEvento.status}
              </div>

              {/* PROPOSTA */}
              {(() => {
                const pacote = getPacoteById(selectedEvento.pacoteId);
                if (!pacote) return null;
                return (
                  <div className="mt-2 space-y-1">
                    <div>
                      <span className="font-medium text-foreground">Proposta: </span>
                      {pacote.nome}
                    </div>
                    <div className="text-xs text-muted-foreground ml-4 space-y-0.5">
                      <div>• Duração: {pacote.duracaoHoras}h</div>
                      <div>• Convidados base: {pacote.convidadosBase}</div>
                      <div>
                        • Valor base: R$ {pacote.valorBase.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                      <div>
                        • Valor por pessoa: R$ {pacote.valorPorPessoa.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Valor total */}
              <div>
                <span className="font-medium text-foreground">Valor: </span>
                R$ {selectedEvento.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>

              {/* Entrada e saldo */}
              {selectedEvento.valorEntrada !== undefined && (
                <div className="space-y-0.5">
                  <div>
                    <span className="font-medium text-foreground">Entrada: </span>
                    R$ {(selectedEvento.valorEntrada || 0).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Saldo a receber:{" "}
                    <span className="font-medium text-foreground">
                      R$ {(
                        selectedEvento.valor - (selectedEvento.valorEntrada || 0)
                      ).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              )}

              {selectedEvento.convidados !== undefined && (
                <div>
                  <span className="font-medium text-foreground">Convidados: </span>
                  {selectedEvento.convidados}
                </div>
              )}

              {/* Decoração */}
              {selectedEvento.decoracao && (
                <div>
                  <span className="font-medium text-foreground">Decoração: </span>
                  {selectedEvento.decoracao}
                </div>
              )}

              {/* Equipe e profissionais */}
              {(() => {
                const equipe = getEquipeById(selectedEvento.equipeId);
                if (!equipe && !selectedEvento.equipeProfissionais?.length) return null;

                return (
                  <div className="space-y-1">
                    {equipe && (
                      <div>
                        <span className="font-medium text-foreground">Equipe: </span>
                        {equipe.nome}
                      </div>
                    )}
                    {selectedEvento.equipeProfissionais &&
                      selectedEvento.equipeProfissionais.length > 0 && (
                        <div>
                          <span className="font-medium text-foreground">
                            Profissionais na equipe:
                          </span>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                            {selectedEvento.equipeProfissionais.map(p => (
                              <li key={p.id}>
                                {p.nome}{" "}
                                <span className="text-muted-foreground">
                                  (Qtd.: {p.quantidade})
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                );
              })()}

              {/* Aniversariantes / Homenageados */}
              {selectedEvento.aniversariantes && selectedEvento.aniversariantes.length > 0 && (
                <div>
                  <span className="font-medium text-foreground">
                    Aniversariantes / Homenageados:
                  </span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {selectedEvento.aniversariantes.map((a, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{a.nome}</span>
                        {a.idade !== undefined && (
                          <span className="text-muted-foreground"> ({a.idade} anos)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Adicionais */}
              {selectedEvento.adicionaisIds && selectedEvento.adicionaisIds.length > 0 && (
                <div>
                  <span className="font-medium text-foreground">Adicionais: </span>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {selectedEvento.adicionaisIds.map(adicionalId => {
                      const adicional = adicionais.find(a => a.id === adicionalId);
                      if (!adicional) return null;

                      const obsItem = selectedEvento.adicionaisObservacoes?.find(
                        o => o.adicionalId === adicionalId
                      );
                      const qtdItem = selectedEvento.adicionaisQuantidade?.find(
                        q => q.adicionalId === adicionalId
                      );

                      const totalAdicional = calcularTotalAdicionalEvento(
                        adicional,
                        selectedEvento
                      );

                      const modeloLabel =
                        adicional.modelo === "valor_pessoa"
                          ? "por pessoa"
                          : adicional.modelo === "valor_unidade"
                          ? "por unidade"
                          : "por festa";

                      return (
                        <li key={adicionalId}>
                          <span className="font-medium">{adicional.nome}</span>{" "}
                          <span className="text-muted-foreground">({modeloLabel})</span>
                          {typeof adicional.valor === "number" && (
                            <>
                              {" - "}
                              <span className="text-muted-foreground">
                                Valor base: R$ {adicional.valor.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </>
                          )}
                          {qtdItem && qtdItem.quantidade > 0 && (
                            <span className="text-muted-foreground">
                              {" "}
                              (Qtd.: {qtdItem.quantidade})
                            </span>
                          )}
                          <div className="text-xs text-foreground mt-0.5">
                            Total deste adicional:{" "}
                            <span className="font-medium">
                              R$ {totalAdicional.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          {obsItem?.observacao && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Obs.: {obsItem.observacao}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Pagamento */}
              {selectedEvento.formaPagamento && (
                <div>
                  <span className="font-medium text-foreground">Pagamento: </span>
                  {selectedEvento.formaPagamento}
                </div>
              )}

              {/* Observações gerais */}
              {selectedEvento.observacoes && (
                <div>
                  <span className="font-medium text-foreground">Observações: </span>
                  {selectedEvento.observacoes}
                </div>
              )}

              {/* Botões */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setSelectedEventoId(null)}
                >
                  Voltar
                </Button>

                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    handleEditEvento(selectedEvento.id);
                  }}
                >
                  Editar
                </Button>

                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    removeEvento(selectedEvento.id);
                    setSelectedEventoId(null);
                  }}
                >
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}