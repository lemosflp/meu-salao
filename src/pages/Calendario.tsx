import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { mockEventos } from "@/data/mockData";
import { format, parseISO, startOfWeek, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Calendario() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const navigate = useNavigate();
  
  // Get current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const dayLabels = ["D", "S", "T", "Q", "Q", "S", "S"];
  
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'festa': return 'bg-event-primary text-white';
      case 'casamento': return 'bg-pink-500 text-white';
      case 'aniversario': return 'bg-event-secondary text-white';
      case 'corporativo': return 'bg-gray-600 text-white';
      default: return 'bg-event-primary text-white';
    }
  };

  const getEventosForDay = (date: Date) => {
    return mockEventos.filter(evento => 
      isSameDay(parseISO(evento.data), date)
    );
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(currentDate, direction === 'next' ? 7 : -7);
    setCurrentDate(newDate);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendário</h1>
          <p className="text-muted-foreground">Gerencie seus eventos e compromissos</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground"
      onClick={() => navigate("/eventos", { state: { showForm: true } })}
    >
      <Plus size={16} className="mr-2" />
      Cadastrar Evento
    </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {format(weekStart, "MMMM yyyy", { locale: ptBR })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek('prev')}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateWeek('next')}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Week Header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayLabels.map((label, index) => (
                  <div key={index} className="text-center font-medium text-muted-foreground p-2">
                    {label}
                  </div>
                ))}
              </div>

              {/* Week Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weekDays.map((day, index) => {
                  const eventos = getEventosForDay(day);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div key={index} className="min-h-32 border rounded-lg p-2">
                      <div className={`text-center font-semibold mb-2 ${
                        isToday ? 'text-primary' : 'text-foreground'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {eventos.map((evento) => (
                          <div
                            key={evento.id}
                            className={`text-xs p-1 rounded text-center cursor-pointer transition-all hover:scale-105 ${getTipoColor(evento.tipo)}`}
                            title={`${evento.titulo} - ${evento.horaInicio}`}
                          >
                            <div className="truncate font-medium">{evento.titulo}</div>
                            <div className="text-white/80">{evento.horaInicio}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Monthly Overview */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Eventos da Semana</h3>
                <div className="space-y-2">
                  {mockEventos
                    .filter(evento => {
                      const eventoDate = parseISO(evento.data);
                      return weekDays.some(day => isSameDay(eventoDate, day));
                    })
                    .map((evento) => (
                      <div key={evento.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className={`w-3 h-3 rounded-full ${getTipoColor(evento.tipo).replace('text-white', '')}`}></div>
                        <div className="flex-1">
                          <div className="font-medium">{evento.titulo}</div>
                          <div className="text-sm text-muted-foreground">
                            {evento.clienteNome} • {format(parseISO(evento.data), "dd/MM/yyyy")} • {evento.horaInicio}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {evento.tipo}
                        </Badge>
                        <Badge variant={evento.status === 'confirmado' ? 'default' : 'secondary'} className="text-xs">
                          {evento.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mini Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar size={16} />
                Maio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                  <div key={i} className="p-1 font-medium text-muted-foreground">{day}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const hasEvent = mockEventos.some(evento => {
                    const eventoDate = parseISO(evento.data);
                    return eventoDate.getDate() === day && eventoDate.getMonth() === 4; // May
                  });
                  
                  return (
                    <div
                      key={day}
                      className={`p-1 cursor-pointer hover:bg-muted rounded ${
                        hasEvent ? 'bg-primary text-primary-foreground font-medium' : ''
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Legenda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-event-primary"></div>
                  <span className="text-sm">Festa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                  <span className="text-sm">Casamento</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-event-secondary"></div>
                  <span className="text-sm">Aniversário</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-600"></div>
                  <span className="text-sm">Corporativo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}