import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { format, parseISO, startOfWeek, addDays, isSameDay, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppContext } from "@/contexts/AppContext";
import { usePacotesContext } from "@/contexts/PacotesContext";
import { useAdicionaisContext } from "@/contexts/AdicionaisContext";
import { useEquipesContext } from "@/contexts/EquipesContext";
import type { Evento } from "@/types";

// --- helpers de data ---

const normalizeDate = (d: Date) => {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
};

// aceita ISO (yyyy-MM-dd) que vem do input type="date"
const parseDataEvento = (data: string): Date => {
  if (!data) return normalizeDate(new Date());
  const raw = data.trim();

  try {
    const iso = parseISO(raw);
    if (isValid(iso)) return normalizeDate(iso);
  } catch {}

  return normalizeDate(new Date());
};

// helper para hora: aceita "19:00"
const parseHoraEvento = (raw: string | undefined): { h: number; m: number } => {
  if (!raw) return { h: 0, m: 0 };
  const horaStr = raw.trim();
  const [hStr, mStr] = horaStr.split(":");
  const h = Number(hStr ?? 0);
  const m = Number(mStr ?? 0);
  return { h, m };
};

// helper para capitalizar primeira letra
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// --- tipos internos ---

type EventoCalendario = Evento & {
  dataDate: Date;
  dataHoraInicio: Date;
};

// --- componente ---

export default function Calendario() {
  const navigate = useNavigate();
  const { eventos } = useAppContext(); // <<< AQUI: usa os mesmos eventos do contexto
  const [currentDate, setCurrentDate] = useState(() => normalizeDate(new Date()));
  const [selectedEventoDetail, setSelectedEventoDetail] = useState<Evento | null>(null);

  const { pacotes } = usePacotesContext();
  const { adicionais } = useAdicionaisContext();
  const { equipes } = useEquipesContext();

  // Normaliza eventos do contexto
  const eventosProcessados = useMemo<EventoCalendario[]>(() => {
    const result = eventos.map((evento, idx) => {
      // no Evento, `data` é string ISO do input type="date"
      const dataBase = parseDataEvento(String(evento.data));

      const { h, m } = parseHoraEvento(evento.horaInicio);
      const dataHoraInicio = new Date(dataBase);
      dataHoraInicio.setHours(h || 0, m || 0, 0, 0);

      return {
        ...evento,
        id: evento.id ?? `ev-${idx}`,
        dataDate: dataBase,
        dataHoraInicio,
      };
    });

    console.log("eventosProcessados (Calendario, contexto):", result);
    return result;
  }, [eventos]);

  // Semana atual
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // domingo
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    normalizeDate(addDays(weekStart, i))
  );
  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // eventos por dia da semana
  const eventosPorDia: Record<string, EventoCalendario[]> = useMemo(() => {
    const map: Record<string, EventoCalendario[]> = {};
    weekDays.forEach((day) => {
      const key = day.toISOString();
      map[key] = [];
    });

    eventosProcessados.forEach((ev) => {
      weekDays.forEach((day) => {
        if (isSameDay(ev.dataDate, day)) {
          const key = day.toISOString();
          map[key] = map[key] || [];
          map[key].push(ev);
        }
      });
    });

    Object.keys(map).forEach((k) => {
      map[k].sort(
        (a, b) => a.dataHoraInicio.getTime() - b.dataHoraInicio.getTime()
      );
    });

    return map;
  }, [eventosProcessados, weekDays]);

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = addDays(currentDate, direction === "next" ? 7 : -7);
    setCurrentDate(normalizeDate(newDate));
  };

  const getTipoColor = (tipo?: string) => {
    switch (tipo) {
      case "festa":
        return "bg-event-primary text-white";
      case "casamento":
        return "bg-pink-500 text-white";
      // case "aniversario":
      //   return "bg-event-secondary text-white";
      case "corporativo":
        return "bg-gray-600 text-white";
      default:
        return "bg-primary text-primary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

    return adicional.valor * convidados;
  };

  // Mini calendário: mês atual baseado em currentDate
  const monthStart = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    [currentDate]
  );
  const monthEnd = useMemo(
    () => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0),
    [currentDate]
  );
  const daysInMonth = monthEnd.getDate();

  // dias da semana para o cabeçalho do mini calendário
  const miniWeekLabels = ["D", "S", "T", "Q", "Q", "S", "S"];

  // mapa de dias do mês que têm pelo menos um evento
  const daysWithEventsInMonth = useMemo(() => {
    const map = new Set<number>();
    eventosProcessados.forEach(ev => {
      const d = ev.dataDate;
      if (
        d.getFullYear() === currentDate.getFullYear() &&
        d.getMonth() === currentDate.getMonth()
      ) {
        map.add(d.getDate());
      }
    });
    return map;
  }, [eventosProcessados, currentDate]);

  return (
    <div className="p-3 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground">Calendário</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Visualize os eventos cadastrados na semana
        </p>
      </div>

      <div className="flex justify-end mb-6 md:mb-8">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 flex items-center gap-2 text-sm md:text-base"
          onClick={() => navigate("/eventos", { state: { showForm: true } })}
        >
          <Plus size={16} className="md:w-5 md:h-5" />
          <span className="hidden sm:inline">Cadastrar Evento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Calendário semanal */}
        <div className="lg:col-span-3">
          <Card className="border-l-4 border-l-blue-600 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                  <Calendar size={20} />
                  {capitalize(format(weekStart, "MMMM yyyy", { locale: ptBR }))}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => navigateWeek("prev")}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    onClick={() => navigateWeek("next")}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
                {dayLabels.map((label, index) => (
                  <div
                    key={index}
                    className="text-center font-semibold text-blue-700 p-1 md:p-2 text-xs md:text-sm bg-blue-50 rounded border border-blue-200"
                  >
                    <span className="hidden sm:inline">{label}</span>
                    <span className="sm:hidden">{label.charAt(0)}</span>
                  </div>
                ))}
              </div>

              {/* Grade da semana */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-6">
                {weekDays.map((day, index) => {
                  const key = day.toISOString();
                  const eventosDia = eventosPorDia[key] || [];
                  const hasEventos = eventosDia.length > 0;
                  const isToday = isSameDay(day, normalizeDate(new Date()));

                  return (
                    <div
                      key={index}
                      className={`min-h-24 md:min-h-32 border-2 rounded-lg p-2 md:p-3 flex flex-col transition-all ${
                        isToday
                          ? "border-blue-500 bg-blue-50"
                          : hasEventos
                          ? "border-blue-300 bg-slate-50"
                          : "border-slate-200 bg-white hover:border-blue-300"
                      }`}
                    >
                      {/* Dia */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-bold ${
                            isToday ? "text-blue-600" : "text-slate-700"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        {hasEventos && (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-blue-600 text-white font-semibold">
                            {eventosDia.length}
                          </span>
                        )}
                      </div>

                      <div className="flex-1" />

                      {/* Eventos (horários) na parte de baixo */}
                      <div className="space-y-1 mt-2">
                        {eventosDia.map((evento) => (
                          <div
                            key={evento.id}
                            className={`text-[10px] sm:text-xs px-2 py-1 rounded font-semibold text-center truncate ${getTipoColor(
                              evento.tipo
                            )}`}
                            title={`${evento.titulo ?? ""} - ${
                              evento.horaInicio ?? ""
                            }`}
                          >
                            <span className="mr-1">{evento.horaInicio ?? "--:--"}</span>
                            <span className="hidden sm:inline truncate">
                              {evento.titulo ?? "Evento"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Lista dos eventos da semana */}
              <div className="space-y-4 mt-8 pt-6 border-t-2 border-slate-200">
                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-600" />
                  Eventos desta semana
                </h3>
                <div className="space-y-2">
                  {eventosProcessados
                    .filter((ev) =>
                      weekDays.some((day) => isSameDay(ev.dataDate, day))
                    )
                    .sort(
                      (a, b) =>
                        a.dataHoraInicio.getTime() - b.dataHoraInicio.getTime()
                    )
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className={`flex items-center gap-4 p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
                          (() => {
                            const totalRecebido = (ev.pagamentos || []).reduce((sum, p) => sum + p.valor, 0);
                            const estaPago = Math.abs(totalRecebido - ev.valor) < 0.01;
                            return estaPago
                              ? "border-green-300 hover:border-green-400 bg-white"
                              : "border-blue-200 hover:border-blue-400 bg-white";
                          })()
                        }`}
                        onClick={() => setSelectedEventoDetail(ev)}
                      >
                        <div
                          className={`w-4 h-4 rounded-full flex-shrink-0 ${
                            (() => {
                              const totalRecebido = (ev.pagamentos || []).reduce((sum, p) => sum + p.valor, 0);
                              const estaPago = Math.abs(totalRecebido - ev.valor) < 0.01;
                              return estaPago
                                ? "bg-green-500"
                                : getTipoColor(ev.tipo).split(" ")[0];
                            })()
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-slate-800">
                            {ev.titulo ?? "Evento"}
                          </div>
                          <div className="text-xs text-slate-600">
                            <span className="font-medium">
                              {format(ev.dataDate, "dd/MM/yyyy")}
                            </span>
                            {" • "}
                            <span>{ev.horaInicio ?? "--:--"}</span>
                            {ev.clienteNome && (
                              <>
                                {" • "}
                                <span className="font-medium">{ev.clienteNome}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {ev.tipo && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800"
                            >
                              {ev.tipo}
                            </Badge>
                          )}
                          {ev.status && (
                            <Badge
                              variant={
                                ev.status === "confirmado"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`text-xs ${
                                ev.status === "confirmado"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {ev.status}
                            </Badge>
                          )}
                          {(() => {
                            const totalRecebido = (ev.pagamentos || []).reduce((sum, p) => sum + p.valor, 0);
                            if (Math.abs(totalRecebido - ev.valor) < 0.01) {
                              return (
                                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs">
                                  ✓ Pago
                                </Badge>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    ))}
                  {eventosProcessados.filter((ev) =>
                    weekDays.some((day) => isSameDay(ev.dataDate, day))
                  ).length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Nenhum evento cadastrado nesta semana.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: mini calendário */}
        <div className="space-y-6">
          <Card className="border-l-4 border-l-blue-500 shadow-lg bg-white">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-200">
              <CardTitle className="text-base flex items-center gap-2 text-blue-900">
                <Calendar size={18} />
                {capitalize(format(currentDate, "MMMM yyyy", { locale: ptBR }))}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* cabeçalho D S T Q Q S S */}
                {miniWeekLabels.map((label, idx) => (
                  <div
                    key={idx}
                    className="p-1 font-bold text-blue-700 text-xs"
                  >
                    {label}
                  </div>
                ))}

                {/* preenche dias em branco antes do dia 1, se necessário */}
                {Array.from(
                  { length: monthStart.getDay() },
                  (_, i) => i
                ).map(i => (
                  <div key={`empty-${i}`} className="p-1 text-xs text-transparent">
                    .
                  </div>
                ))}

                {/* dias do mês */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isTodayInMonth =
                    day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear();

                  const hasEvent = daysWithEventsInMonth.has(day);

                  return (
                    <div
                      key={day}
                      className={`relative flex flex-col items-center justify-center p-2 text-xs rounded-lg transition-all cursor-default font-medium ${
                        isTodayInMonth
                          ? "text-white bg-blue-600"
                          : hasEvent
                          ? "text-blue-700 bg-blue-50 border border-blue-300"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span>{day}</span>
                      {hasEvent && !isTodayInMonth && (
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legenda */}
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                  <span className="text-slate-700">Hoje</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700">Com eventos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedEventoDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-h-[90vh] overflow-y-auto border-l-4 border-l-blue-600 shadow-lg max-w-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-200 sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <span>{selectedEventoDetail.titulo}</span>
                    <Badge className={getStatusColor(selectedEventoDetail.status)}>
                      {selectedEventoDetail.status}
                    </Badge>
                    <Badge className={`${getTipoColor(selectedEventoDetail.tipo).split(" ")[0]} text-white`}>
                      {selectedEventoDetail.tipo}
                    </Badge>
                    {(() => {
                      const totalRecebido = (selectedEventoDetail.pagamentos || []).reduce((sum, p) => sum + p.valor, 0);
                      if (Math.abs(totalRecebido - selectedEventoDetail.valor) < 0.01) {
                        return (
                          <Badge className="bg-green-100 text-green-800 border-green-300">
                            ✓ Pago
                          </Badge>
                        );
                      }
                      return null;
                    })()}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span>{format(parseISO(selectedEventoDetail.data), "dd/MM/yyyy", { locale: ptBR })} • </span>
                    <span>{selectedEventoDetail.horaInicio}{selectedEventoDetail.horaFim && ` - ${selectedEventoDetail.horaFim}`}</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEventoDetail(null)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={20} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Informações principais */}
              <div className="rounded-lg border bg-slate-50/60 p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Informações principais
                </h3>
                <div>
                  <span className="font-medium text-foreground">Cliente: </span>
                  {selectedEventoDetail.clienteNome}
                </div>
                {selectedEventoDetail.convidados !== undefined && (
                  <div>
                    <span className="font-medium text-foreground">Convidados: </span>
                    {selectedEventoDetail.convidados}
                  </div>
                )}
                {selectedEventoDetail.decoracao && (
                  <div>
                    <span className="font-medium text-foreground">Decoração: </span>
                    {selectedEventoDetail.decoracao}
                  </div>
                )}
              </div>

              {/* Aniversariantes */}
              {selectedEventoDetail.aniversariantes &&
                selectedEventoDetail.aniversariantes.length > 0 && (
                  <div className="rounded-lg border bg-slate-50/60 p-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                      Aniversariantes / Homenageados
                    </h3>
                    <ul className="space-y-1 text-sm">
                      {selectedEventoDetail.aniversariantes.map((a, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between border rounded px-2 py-1 bg-white/70"
                        >
                          <span className="font-medium">{a.nome}</span>
                          {a.idade !== undefined && (
                            <span className="text-xs text-muted-foreground">
                              {a.idade} anos
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Proposta */}
              {(() => {
                const pacote = getPacoteById(selectedEventoDetail.pacoteId);
                if (!pacote) return null;
                return (
                  <div className="rounded-lg border bg-slate-50/60 p-3 space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Proposta
                    </h3>
                    <div>
                      <span className="font-medium text-foreground">{pacote.nome}</span>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5 ml-1">
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
                  </div>
                );
              })()}

              {/* Equipe */}
              {(() => {
                const equipe = getEquipeById(selectedEventoDetail.equipeId);
                if (!equipe && !selectedEventoDetail.equipeProfissionais?.length) return null;

                return (
                  <div className="rounded-lg border bg-slate-50/60 p-3 space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Equipe
                    </h3>
                    {equipe && (
                      <div>
                        <span className="font-medium text-foreground">Equipe principal: </span>
                        {equipe.nome}
                      </div>
                    )}
                    {selectedEventoDetail.equipeProfissionais &&
                      selectedEventoDetail.equipeProfissionais.length > 0 && (
                        <div className="mt-1">
                          <span className="font-medium text-foreground">
                            Profissionais:
                          </span>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                            {selectedEventoDetail.equipeProfissionais.map((p) => (
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

              {/* Adicionais */}
              {selectedEventoDetail.adicionaisIds &&
                selectedEventoDetail.adicionaisIds.length > 0 && (
                  <div className="rounded-lg border bg-slate-50/60 p-3 space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Adicionais contratados
                    </h3>
                    <ul className="space-y-2 text-xs">
                      {selectedEventoDetail.adicionaisIds.map((adicionalId) => {
                        const adicional = adicionais.find((a) => a.id === adicionalId);
                        if (!adicional) return null;

                        const obsItem = selectedEventoDetail.adicionaisObservacoes?.find(
                          (o) => o.adicionalId === adicionalId
                        );
                        const qtdItem = selectedEventoDetail.adicionaisQuantidade?.find(
                          (q) => q.adicionalId === adicionalId
                        );
                        const totalAdicional = calcularTotalAdicionalEvento(
                          adicional,
                          selectedEventoDetail
                        );

                        const modeloLabel =
                          adicional.modelo === "valor_pessoa"
                            ? "por pessoa"
                            : adicional.modelo === "valor_unidade"
                            ? "por unidade"
                            : "por festa";

                        return (
                          <li
                            key={adicionalId}
                            className="rounded border bg-white/80 px-2 py-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-medium">{adicional.nome}</span>{" "}
                                <span className="text-muted-foreground">
                                  ({modeloLabel})
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                R$ {totalAdicional.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              Valor base: R$ {adicional.valor.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                              {qtdItem && qtdItem.quantidade > 0 && (
                                <> • Qtd.: {qtdItem.quantidade}</>
                              )}
                            </div>
                            {obsItem?.observacao && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                Obs.: {obsItem.observacao}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

              {/* Valores */}
              <div className={`rounded-lg border p-3 space-y-2 ${
                (() => {
                  const totalRecebido = (selectedEventoDetail.pagamentos || []).reduce((sum, p) => sum + p.valor, 0);
                  return Math.abs(totalRecebido - selectedEventoDetail.valor) < 0.01
                    ? "bg-green-50/60 border-green-300"
                    : "bg-slate-50/60";
                })()
              }`}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Valores
                </h3>
                <div>
                  <span className="font-medium text-foreground">Valor total: </span>
                  <span className="font-bold text-blue-900">
                    R$ {selectedEventoDetail.valor?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0"}
                  </span>
                </div>
                {selectedEventoDetail.valorEntrada && selectedEventoDetail.valorEntrada > 0 && (
                  <div>
                    <span className="font-medium text-foreground">Entrada: </span>
                    <span className="font-bold text-blue-900">
                      R$ {selectedEventoDetail.valorEntrada?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                {selectedEventoDetail.pagamentos && selectedEventoDetail.pagamentos.length > 0 && (
                  <>
                    <div>
                      <span className="font-medium text-foreground">Recebido: </span>
                      <span className="font-bold text-green-700">
                        R$ {selectedEventoDetail.pagamentos.reduce((sum, p) => sum + p.valor, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-foreground">Saldo: </span>
                      <span className={`font-bold ${
                        selectedEventoDetail.valor - selectedEventoDetail.pagamentos.reduce((sum, p) => sum + p.valor, 0) > 0
                          ? "text-red-700"
                          : "text-green-700"
                      }`}>
                        R$ {(selectedEventoDetail.valor - selectedEventoDetail.pagamentos.reduce((sum, p) => sum + p.valor, 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Pagamento */}
              {selectedEventoDetail.formaPagamento && (
                <div className="rounded-lg border bg-slate-50/60 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Forma de pagamento
                  </h3>
                  <p className="text-sm">{selectedEventoDetail.formaPagamento}</p>
                </div>
              )}

              {/* Pagamentos registrados */}
              {selectedEventoDetail.pagamentos && selectedEventoDetail.pagamentos.length > 0 && (
                <div className="rounded-lg border bg-slate-50/60 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    Histórico de pagamentos
                  </h3>
                  {(() => {
                    const totalRecebido = selectedEventoDetail.pagamentos.reduce((sum, p) => sum + p.valor, 0);
                    const estaPago = Math.abs(totalRecebido - selectedEventoDetail.valor) < 0.01;
                    
                    return estaPago ? (
                      <div className="p-3 bg-green-50 border border-green-300 rounded-lg mb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-green-600" />
                          <div>
                            <div className="font-bold text-green-900">Evento 100% pago!</div>
                            <div className="text-xs text-green-700">Todos os pagamentos foram recebidos.</div>
                          </div>
                        </div>
                      </div>
                    ) : null;
                  })()}
                  <ul className="space-y-1 text-xs">
                    {selectedEventoDetail.pagamentos.map((pag) => (
                      <li key={pag.id} className="flex justify-between border rounded px-2 py-1 bg-white/70">
                        <div>
                          <span className="font-medium">
                            R$ {pag.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-muted-foreground ml-2">• {pag.metodo}</span>
                          <span className="text-muted-foreground ml-2">• {format(parseISO(pag.data), "dd/MM/yyyy", { locale: ptBR })}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Observações */}
              {selectedEventoDetail.observacoes && (
                <div className="rounded-lg border bg-slate-50/60 p-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                    Observações
                  </h3>
                  <p className="text-sm whitespace-pre-line">
                    {selectedEventoDetail.observacoes}
                  </p>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEventoDetail(null)}
                >
                  Fechar
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    navigate("/eventos", { state: { showForm: true } });
                    setSelectedEventoDetail(null);
                  }}
                >
                  Ir para Eventos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}