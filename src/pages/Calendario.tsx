import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, parseISO, startOfWeek, addDays, isSameDay, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppContext } from "@/contexts/AppContext";
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
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground">
            Visualize os eventos cadastrados na semana
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary-hover text-primary-foreground"
          onClick={() => navigate("/eventos", { state: { showForm: true } })}
        >
          <Plus size={16} className="mr-2" />
          Cadastrar Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendário semanal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar size={18} />
                  {capitalize(format(weekStart, "MMMM yyyy", { locale: ptBR }))}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek("prev")}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek("next")}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cabeçalho dos dias */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayLabels.map((label, index) => (
                  <div
                    key={index}
                    className="text-center font-medium text-muted-foreground p-2 text-xs"
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Grade da semana */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDays.map((day, index) => {
                  const key = day.toISOString();
                  const eventosDia = eventosPorDia[key] || [];
                  const hasEventos = eventosDia.length > 0;
                  const isToday = isSameDay(day, normalizeDate(new Date()));

                  return (
                    <div
                      key={index}
                      className={`min-h-28 border rounded-lg p-2 flex flex-col ${
                        hasEventos ? "bg-muted/60" : ""
                      }`}
                    >
                      {/* Dia */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-semibold ${
                            isToday ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        {hasEventos && (
                          <span className="text-[10px] px-1 py-0.5 rounded-full bg-primary text-primary-foreground">
                            {eventosDia.length} evt
                          </span>
                        )}
                      </div>

                      <div className="flex-1" />

                      {/* Eventos (horários) na parte de baixo */}
                      <div className="space-y-1 mt-2">
                        {eventosDia.map((evento) => (
                          <div
                            key={evento.id}
                            className={`text-[10px] sm:text-xs px-1 py-0.5 rounded text-center ${getTipoColor(
                              evento.tipo
                            )}`}
                            title={`${evento.titulo ?? ""} - ${
                              evento.horaInicio ?? ""
                            }`}
                          >
                            <span className="font-semibold mr-1">
                              {evento.horaInicio ?? "--:--"}
                            </span>
                            <span className="truncate inline-block max-w-full">
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
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Eventos desta semana</h3>
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
                        className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${getTipoColor(
                            ev.tipo
                          ).replace("text-primary-foreground", "")}`}
                        ></div>
                        <div className="flex-1">
                          <div className="font-medium">
                            {ev.titulo ?? "Evento"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(ev.dataDate, "dd/MM/yyyy")} •{" "}
                            {ev.horaInicio ?? "--:--"}
                            {ev.clienteNome ? ` • ${ev.clienteNome}` : ""}
                          </div>
                        </div>
                        {ev.tipo && (
                          <Badge variant="secondary" className="text-xs">
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
                            className="text-xs"
                          >
                            {ev.status}
                          </Badge>
                        )}
                      </div>
                    ))}
                  {eventosProcessados.filter((ev) =>
                    weekDays.some((day) => isSameDay(ev.dataDate, day))
                  ).length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhum evento cadastrado nesta semana.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: mini calendário */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar size={16} />
                  {capitalize(format(currentDate, "MMMM yyyy", { locale: ptBR }))}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {/* cabeçalho D S T Q Q S S */}
                {miniWeekLabels.map((label, idx) => (
                  <div
                    key={idx}
                    className="p-1 font-medium text-muted-foreground"
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
                      className={`relative flex flex-col items-center justify-center p-1 text-xs rounded cursor-default ${
                        isTodayInMonth ? "font-bold text-primary" : "text-foreground"
                      }`}
                    >
                      <span>{day}</span>
                      {hasEvent && (
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}