import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit } from "lucide-react";
import { usePacotesContext } from "@/contexts/PacotesContext";
import { useAdicionaisContext } from "@/contexts/AdicionaisContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useEquipesContext } from "@/contexts/EquipesContext";

export default function Pacotes() {
  const { pacotes, addPacote, updatePacote, removePacote } = usePacotesContext();
  const { adicionais, addAdicional, updateAdicional, removeAdicional } = useAdicionaisContext();
  const { equipes, addEquipe, updateEquipe, removeEquipe } = useEquipesContext();

  // ESTADO PACOTES
  const [showForm, setShowForm] = useState(false);
  const [editingPacoteId, setEditingPacoteId] = useState<string | null>(null);
  const [selectedPacoteId, setSelectedPacoteId] = useState<string | null>(null);
  const [pacoteForm, setPacoteForm] = useState({
    nome: "",
    duracaoHoras: "",
    convidadosBase: "",
    valorBase: "",
    valorPorPessoa: "",
    descricao: "",
  });

  // ESTADO ADICIONAIS
  const [showAdicionalForm, setShowAdicionalForm] = useState(false);
  const [editingAdicionalId, setEditingAdicionalId] = useState<string | null>(null);
  const [selectedAdicionalId, setSelectedAdicionalId] = useState<string | null>(null);
  const [adicionalForm, setAdicionalForm] = useState({
    nome: "",
    modelo: "valor_pessoa",
    valor: "",
    duracaoHoras: "",
    descricao: "",
    observacao: false,
  });

  // ESTADO EQUIPES
  const [showEquipeForm, setShowEquipeForm] = useState(false);
  const [editingEquipeId, setEditingEquipeId] = useState<string | null>(null);
  const [selectedEquipeId, setSelectedEquipeId] = useState<string | null>(null);
  const [equipeNome, setEquipeNome] = useState("");
  const [profissionais, setProfissionais] = useState<
    { id: string; nome: string; quantidade: string }[]
  >([]);
  const [profissionalNome, setProfissionalNome] = useState("");
  const [profissionalQuantidade, setProfissionalQuantidade] = useState("");

  // HANDLERS PACOTES
  const handlePacoteChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPacoteForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetPacoteForm = () =>
    setPacoteForm({
      nome: "",
      duracaoHoras: "",
      convidadosBase: "",
      valorBase: "",
      valorPorPessoa: "",
      descricao: "",
    });

  const handleSubmitPacote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacoteForm.nome.trim()) return;

    const payload = {
      nome: pacoteForm.nome.trim(),
      duracaoHoras: Number(pacoteForm.duracaoHoras) || 0,
      convidadosBase: Number(pacoteForm.convidadosBase) || 0,
      valorBase: Number(pacoteForm.valorBase) || 0,
      valorPorPessoa: Number(pacoteForm.valorPorPessoa) || 0,
      descricao: pacoteForm.descricao.trim() || undefined,
    };

    if (editingPacoteId) {
      updatePacote(editingPacoteId, payload);
      setEditingPacoteId(null);
    } else {
      addPacote(payload);
    }

    resetPacoteForm();
    setShowForm(false);
  };

  const handleEditPacote = (id: string) => {
    const p = pacotes.find(p => p.id === id);
    if (!p) return;
    setPacoteForm({
      nome: p.nome,
      duracaoHoras: String(p.duracaoHoras),
      convidadosBase: String(p.convidadosBase),
      valorBase: String(p.valorBase),
      valorPorPessoa: String(p.valorPorPessoa),
      descricao: p.descricao ?? "",
    });
    setEditingPacoteId(id);
    setShowForm(true);
  };

  const handleCancelEditPacote = () => {
    setEditingPacoteId(null);
    resetPacoteForm();
    setShowForm(false);
  };

  const selectedPacote = selectedPacoteId
    ? pacotes.find(p => p.id === selectedPacoteId) ?? null
    : null;

  // HANDLERS ADICIONAIS
  const handleAdicionalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAdicionalForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdicionalModeloChange = (value: string) => {
    setAdicionalForm(prev => ({
      ...prev,
      modelo: value,
    }));
  };

  const handleAdicionalObservacaoChange = (checked: boolean) => {
    setAdicionalForm(prev => ({
      ...prev,
      observacao: checked,
    }));
  };

  const resetAdicionalForm = () =>
    setAdicionalForm({
      nome: "",
      modelo: "valor_pessoa",
      valor: "",
      duracaoHoras: "",
      descricao: "",
      observacao: false,
    });

  const handleSubmitAdicional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adicionalForm.nome.trim()) return;

    const payload = {
      nome: adicionalForm.nome.trim(),
      modelo: adicionalForm.modelo as "valor_pessoa" | "valor_unidade" | "valor_festa",
      valor: Number(adicionalForm.valor) || 0,
      duracaoHoras: Number(adicionalForm.duracaoHoras) || 0,
      descricao: adicionalForm.descricao.trim() || undefined,
      observacao: adicionalForm.observacao || undefined,
    };

    if (editingAdicionalId) {
      updateAdicional(editingAdicionalId, payload);
      setEditingAdicionalId(null);
    } else {
      addAdicional(payload);
    }

    resetAdicionalForm();
    setShowAdicionalForm(false);
  };

  const handleEditAdicional = (id: string) => {
    const a = adicionais.find(a => a.id === id);
    if (!a) return;
    setAdicionalForm({
      nome: a.nome,
      modelo: a.modelo,
      valor: String(a.valor),
      duracaoHoras: String(a.duracaoHoras ?? 0),
      descricao: a.descricao ?? "",
      observacao: !!a.observacao,
    });
    setEditingAdicionalId(id);
    setShowAdicionalForm(true);
  };

  const handleCancelEditAdicional = () => {
    setEditingAdicionalId(null);
    resetAdicionalForm();
    setShowAdicionalForm(false);
  };

  const selectedAdicional = selectedAdicionalId
    ? adicionais.find(a => a.id === selectedAdicionalId) ?? null
    : null;

  // HANDLERS EQUIPES
  const resetEquipeForm = () => {
    setEquipeNome("");
    setProfissionais([]);
    setProfissionalNome("");
    setProfissionalQuantidade("");
  };

  const handleAddProfissional = () => {
    if (!profissionalNome.trim()) return;
    setProfissionais(prev => [
      ...prev,
      {
        id: String(Date.now() + Math.random()),
        nome: profissionalNome.trim(),
        quantidade: profissionalQuantidade || "1",
      },
    ]);
    setProfissionalNome("");
    setProfissionalQuantidade("");
  };

  const handleRemoveProfissional = (id: string) => {
    setProfissionais(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmitEquipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipeNome.trim()) return;

    const payload = {
      nome: equipeNome.trim(),
      profissionais: profissionais.map(p => ({
        id: p.id,
        nome: p.nome,
        quantidade: Number(p.quantidade) || 0,
      })),
    };

    if (editingEquipeId) {
      updateEquipe(editingEquipeId, payload);
      setEditingEquipeId(null);
    } else {
      addEquipe(payload);
    }

    resetEquipeForm();
    setShowEquipeForm(false);
  };

  const handleEditEquipe = (id: string) => {
    const equipe = equipes.find(e => e.id === id);
    if (!equipe) return;
    setEquipeNome(equipe.nome);
    setProfissionais(
      equipe.profissionais.map(p => ({
        id: p.id,
        nome: p.nome,
        quantidade: String(p.quantidade),
      }))
    );
    setEditingEquipeId(id);
    setShowEquipeForm(true);
  };

  const handleCancelEditEquipe = () => {
    setEditingEquipeId(null);
    resetEquipeForm();
    setShowEquipeForm(false);
  };

  const selectedEquipe = selectedEquipeId
    ? equipes.find(e => e.id === selectedEquipeId) ?? null
    : null;

  // helper para somar profissionais de uma equipe
  const getTotalProfissionais = (equipe: { profissionais: { quantidade: number }[] }) =>
    equipe.profissionais.reduce((sum, p) => sum + p.quantidade, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Propostas, Adicionais e Equipes</h1>
          <p className="text-muted-foreground">
            Cadastrar e gerenciar propostas, adicionais e equipes de eventos
          </p>
        </div>

        <div className="flex gap-2">
          {/* Botão Cadastrar Equipe (à esquerda) */}
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-8"
            onClick={() => {
              if (showEquipeForm && !editingEquipeId) {
                resetEquipeForm();
              }
              setShowEquipeForm(prev => !prev);
            }}
          >
            <Plus size={16} className="mr-2" />
            {showEquipeForm ? "Cancelar" : editingEquipeId ? "Cadastrar Equipe" : "Cadastrar Equipe"}
          </Button>

          {/* Botão Cadastrar Adicional (à esquerda) */}
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-8"
            onClick={() => {
              if (showAdicionalForm && !editingAdicionalId) {
                resetAdicionalForm();
              }
              setShowAdicionalForm(prev => !prev);
            }}
          >
            <Plus size={16} className="mr-2" />
            {showAdicionalForm ? "Cancelar" : editingAdicionalId ? "Editar Adicional" : "Cadastrar Adicional"}
          </Button>

          {/* Botão Cadastrar Pacote */}
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground px-8"
            onClick={() => {
              if (showForm && !editingPacoteId) {
                resetPacoteForm();
              }
              setShowForm(prev => !prev);
            }}
          >
            <Plus size={16} className="mr-2" />
            {showForm ? "Cancelar" : editingPacoteId ? "Editar Proposta" : "Cadastrar Proposta"}
          </Button>
        </div>
      </div>

      {/* FORMULÁRIO EQUIPES */}
      {showEquipeForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingEquipeId ? "Editar Equipe" : "Cadastrar Equipe"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitEquipe} className="space-y-4">
              {/* Nome da equipe */}
              <Input
                name="nomeEquipe"
                value={equipeNome}
                onChange={e => setEquipeNome(e.target.value)}
                placeholder="Nome da equipe"
                required
              />

              {/* Adicionar profissional à equipe */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <Input
                    name="profissionalNome"
                    value={profissionalNome}
                    onChange={e => setProfissionalNome(e.target.value)}
                    placeholder="Nome do profissional"
                  />
                  <Input
                    name="profissionalQuantidade"
                    type="number"
                    min={1}
                    value={profissionalQuantidade}
                    onChange={e => setProfissionalQuantidade(e.target.value)}
                    placeholder="Quantidade"
                  />
                  <Button
                    type="button"
                    // antes: variant="outline"
                    className="w-full md:w-auto border border-primary/20 bg-muted text-foreground hover:bg-primary/10 hover:border-primary/40"
                    onClick={handleAddProfissional}
                  >
                    Adicionar profissional
                  </Button>
                </div>

                {/* Lista de profissionais adicionados à equipe */}
                {profissionais.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {profissionais.map(p => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center text-sm border rounded px-3 py-2"
                      >
                        <div>
                          <span className="font-medium">{p.nome}</span>{" "}
                          <span className="text-muted-foreground">
                            ({p.quantidade})
                          </span>
                        </div>
                        <button
                          type="button"
                          className="text-red-600 hover:underline text-xs"
                          onClick={() => handleRemoveProfissional(p.id)}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <Button type="submit" className="bg-primary text-primary-foreground">
                  {editingEquipeId ? "Salvar alterações" : "Salvar equipe"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEditEquipe}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* FORMULÁRIO ADICIONAIS */}
      {showAdicionalForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingAdicionalId ? "Editar Adicional" : "Cadastrar Adicional"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAdicional} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  name="nome"
                  value={adicionalForm.nome}
                  onChange={handleAdicionalChange}
                  placeholder="Nome do adicional"
                  className="md:col-span-2"
                  required
                />

                {/* Modelo */}
                <Select
                  value={adicionalForm.modelo}
                  onValueChange={handleAdicionalModeloChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="valor_pessoa">Valor por pessoa</SelectItem>
                    <SelectItem value="valor_unidade">Valor por unidade</SelectItem>
                    <SelectItem value="valor_festa">Valor por festa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Valor + Duração */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  name="valor"
                  type="number"
                  min={0}
                  step="0.01"
                  value={adicionalForm.valor}
                  onChange={handleAdicionalChange}
                  placeholder="Valor (R$)"
                />
                <Input
                  name="duracaoHoras"
                  type="number"
                  min={0}
                  value={adicionalForm.duracaoHoras}
                  onChange={handleAdicionalChange}
                  placeholder="Duração (horas)"
                />
              </div>

              {/* Descrição */}
              <Textarea
                name="descricao"
                value={adicionalForm.descricao}
                onChange={handleAdicionalChange}
                placeholder="Descrição (opcional)"
              />

              {/* Observação (checkbox) */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="observacao"
                    checked={adicionalForm.observacao}
                    onCheckedChange={checked =>
                      handleAdicionalObservacaoChange(Boolean(checked))
                    }
                  />
                  <label
                    htmlFor="observacao"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Observação
                  </label>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/60 border border-muted rounded px-3 py-2">
                  Este campo habilita uma observação para este adicional.
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <Button type="submit" className="bg-primary text-primary-foreground">
                  {editingAdicionalId ? "Salvar alterações" : "Salvar adicional"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEditAdicional}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* FORMULÁRIO PACOTES */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingPacoteId ? "Editar Proposta" : "Cadastrar Proposta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPacote} className="space-y-4">
              {/* Nome + Duração */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  name="nome"
                  value={pacoteForm.nome}
                  onChange={handlePacoteChange}
                  placeholder="Nome da proposta"
                  className="md:col-span-2"
                  required
                />
                <Input
                  name="duracaoHoras"
                  type="number"
                  min={1}
                  value={pacoteForm.duracaoHoras}
                  onChange={handlePacoteChange}
                  placeholder="Duração (horas)"
                />
              </div>

              {/* Convidados base / Valor base / Valor por pessoa */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input
                  name="convidadosBase"
                  type="number"
                  min={0}
                  value={pacoteForm.convidadosBase}
                  onChange={handlePacoteChange}
                  placeholder="Convidados base (ex: 40)"
                />
                <Input
                  name="valorBase"
                  type="number"
                  min={0}
                  step="0.01"
                  value={pacoteForm.valorBase}
                  onChange={handlePacoteChange}
                  placeholder="Valor base (R$)"
                />
                <Input
                  name="valorPorPessoa"
                  type="number"
                  min={0}
                  step="0.01"
                  value={pacoteForm.valorPorPessoa}
                  onChange={handlePacoteChange}
                  placeholder="Valor por pessoa (R$)"
                />
              </div>

              {/* Descrição */}
              <Textarea
                name="descricao"
                value={pacoteForm.descricao}
                onChange={handlePacoteChange}
                placeholder="Descrição (opcional)"
              />

              <div className="mt-3 flex gap-2">
                <Button type="submit" className="bg-primary text-primary-foreground">
                  {editingPacoteId ? "Salvar alterações" : "Salvar proposta"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEditPacote}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* LISTA DE PACOTES */}
      <section className="mt-6 mb-6">
        <Card className="bg-muted/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Propostas cadastradas</CardTitle>
            <p className="text-xs text-muted-foreground">
              Visualize e gerencie todas as propostas disponíveis.
            </p>
          </CardHeader>
          <CardContent>
            {pacotes.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground border border-dashed rounded-md">
                Nenhuma proposta cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {pacotes.map(p => (
                  <Card
                    key={p.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Título */}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-base">
                              {p.nome}
                            </h4>
                          </div>

                          {/* Infos principais (resumo) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium text-foreground">
                                Duração:
                              </span>{" "}
                              {p.duracaoHoras}h
                            </div>
                            <div>
                              <span className="font-medium text-foreground">
                                Convidados base:
                              </span>{" "}
                              {p.convidadosBase}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">
                                Valor base:
                              </span>{" "}
                              R{"$ "}
                              {p.valorBase.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Ações: igual clientes */}
                        <div className="flex items-start ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPacoteId(p.id)}
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* DETALHE DO PACOTE SELECIONADO */}
      {selectedPacote && (
        <section className="mt-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/80">
              <CardTitle className="text-xl">{selectedPacote.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-slate-50/60 p-3 space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Estrutura da proposta
                  </h3>
                  <div>
                    <span className="font-medium text-foreground">Duração: </span>
                    {selectedPacote.duracaoHoras}h
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Convidados base: </span>
                    {selectedPacote.convidadosBase}
                  </div>
                </div>
                <div className="rounded-lg border bg-slate-50/60 p-3 space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Valores
                  </h3>
                  <div>
                    <span className="font-medium text-foreground">Valor base: </span>
                    R$ {selectedPacote.valorBase.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Valor por pessoa: </span>
                    R$ {selectedPacote.valorPorPessoa.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              {selectedPacote.descricao && (
                <div className="rounded-lg border bg-slate-50/60 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Descrição
                  </h3>
                  <p className="text-sm whitespace-pre-line">
                    {selectedPacote.descricao}
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedPacoteId(null)}
                >
                  Voltar
                </Button>

                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    handleEditPacote(selectedPacote.id);
                  }}
                >
                  Editar
                </Button>

                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    removePacote(selectedPacote.id);
                    setSelectedPacoteId(null);
                  }}
                >
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* LISTA DE ADICIONAIS */}
      <section className="mt-6 mb-6">
        <Card className="bg-muted/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Adicionais cadastrados</CardTitle>
            <p className="text-xs text-muted-foreground">
              Serviços extras que podem ser adicionados aos eventos.
            </p>
          </CardHeader>
          <CardContent>
            {adicionais.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground border border-dashed rounded-md">
                Nenhum adicional cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {adicionais.map(a => (
                  <Card
                    key={a.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Título */}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-base">
                              {a.nome}
                            </h4>
                          </div>

                          {/* Infos principais (resumo) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                            <div>
                              <span className="font-medium text-foreground">
                                Modelo:
                              </span>{" "}
                              {a.modelo === "valor_pessoa"
                                ? "Valor por pessoa"
                                : a.modelo === "valor_unidade"
                                ? "Valor por unidade"
                                : "Valor por festa"}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">
                                Valor:
                              </span>{" "}
                              R{"$ "}
                              {a.valor.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">
                                Duração:
                              </span>{" "}
                              {a.duracaoHoras}h
                            </div>
                          </div>
                        </div>

                        {/* Ações: igual clientes (ícone Edit que abre detalhes) */}
                        <div className="flex items-start ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedAdicionalId(a.id)}
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* DETALHE DO ADICIONAL SELECIONADO */}
      {selectedAdicional && (
        <section className="mt-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/80">
              <CardTitle>{selectedAdicional.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-slate-50/60 p-3 space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Modelo
                  </h3>
                  <div>
                    {selectedAdicional.modelo === "valor_pessoa"
                      ? "Valor por pessoa"
                      : selectedAdicional.modelo === "valor_unidade"
                      ? "Valor por unidade"
                      : "Valor por festa"}
                  </div>
                </div>
                <div className="rounded-lg border bg-slate-50/60 p-3 space-y-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Valor e duração
                  </h3>
                  <div>
                    <span className="font-medium text-foreground">Valor: </span>
                    R$ {selectedAdicional.valor.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Duração: </span>
                    {selectedAdicional.duracaoHoras}h
                  </div>
                </div>
              </div>

              {selectedAdicional.descricao && (
                <div className="rounded-lg border bg-slate-50/60 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Descrição
                  </h3>
                  <p className="text-sm whitespace-pre-line">
                    {selectedAdicional.descricao}
                  </p>
                </div>
              )}
              {selectedAdicional.observacao && (
                <div className="rounded-lg border bg-slate-50/60 p-3 text-xs text-muted-foreground">
                  Observação habilitada para este adicional.
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedAdicionalId(null)}
                >
                  Voltar
                </Button>

                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    handleEditAdicional(selectedAdicional.id);
                  }}
                >
                  Editar
                </Button>

                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    removeAdicional(selectedAdicional.id);
                    setSelectedAdicionalId(null);
                  }}
                >
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* LISTA DE EQUIPES */}
      <section className="mt-6 mb-6">
        <Card className="bg-muted/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Equipes cadastradas</CardTitle>
            <p className="text-xs text-muted-foreground">
              Agrupamentos de profissionais para os eventos.
            </p>
          </CardHeader>
          <CardContent>
            {equipes.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground border border-dashed rounded-md">
                Nenhuma equipe cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {equipes.map(equipe => (
                  <Card
                    key={equipe.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Título */}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-base">
                              {equipe.nome}
                            </h4>
                          </div>

                          {/* Resumo profissionais */}
                          <div className="text-sm text-muted-foreground">
                            {equipe.profissionais.length === 0 ? (
                              <span>Nenhum profissional adicionado.</span>
                            ) : (
                              <span>
                                {getTotalProfissionais(equipe)} profissional(is) na equipe
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ações: ícone Edit que abre detalhes */}
                        <div className="flex items-start ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEquipeId(equipe.id)}
                          >
                            <Edit size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* DETALHE DA EQUIPE SELECIONADA */}
      {selectedEquipe && (
        <section className="mt-6">
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader className="border-b bg-slate-50/80">
              <CardTitle>{selectedEquipe.nome}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pt-4">
              <div className="rounded-lg border bg-slate-50/60 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                  Profissionais
                </h3>
                {selectedEquipe.profissionais.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    Nenhum profissional cadastrado para esta equipe.
                  </div>
                ) : (
                  <ul className="divide-y rounded-md border bg-white/80">
                    {selectedEquipe.profissionais.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between px-3 py-2"
                      >
                        <span className="font-medium">{p.nome}</span>
                        <span className="text-xs text-muted-foreground">
                          Quantidade: {p.quantidade}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedEquipeId(null)}
                >
                  Voltar
                </Button>

                <Button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    handleEditEquipe(selectedEquipe.id);
                  }}
                >
                  Editar
                </Button>

                <Button
                  type="button"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => {
                    removeEquipe(selectedEquipe.id);
                    setSelectedEquipeId(null);
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
