import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { Calendar, Users, PartyPopper, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const navigate = useNavigate();
  const { clientes, eventos } = useAppContext();

  // métricas simples
  const totalClientes = clientes.length;
  const totalEventos = eventos.length;
  const totalConfirmados = eventos.filter(e => e.status === "confirmado").length;
  const totalPendentes = eventos.filter(e => e.status === "pendente").length;

  const faturamentoEstimado = useMemo(
    () => eventos.reduce((sum, e) => sum + (e.valor || 0), 0),
    [eventos]
  );

  const proximosEventos = useMemo(() => {
    const now = new Date();
    return [...eventos]
      .filter(e => isAfter(parseISO(e.data), now))
      .sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime())
      .slice(0, 4);
  }, [eventos]);

  return (
    <div className="space-y-6">
      {/* Topo: saudação + CTA principal */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Olá, bem-vindo(a) 👋</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe rapidamente seus eventos e clientes do salão.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-primary hover:bg-primary-hover text-primary-foreground"
            onClick={() => navigate("/eventos")}
          >
            <PartyPopper size={18} className="mr-2" />
            Cadastrar novo evento
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/calendario")}
          >
            <Calendar size={16} className="mr-2" />
            Ver calendário
          </Button>
        </div>
      </section>

      {/* Cards-resumo principais */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes cadastrados
            </CardTitle>
            <Users size={18} className="text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pessoas na sua base de contatos.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos confirmados
            </CardTitle>
            <CheckCircle2 size={18} className="text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalConfirmados}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Festas já garantidas na agenda.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos pendentes
            </CardTitle>
            <Clock size={18} className="text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalPendentes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Orçamentos aguardando confirmação.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento estimado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              R$ {faturamentoEstimado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma do valor de todos os eventos cadastrados.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Linha inferior: próximos eventos + atalhos rápidos */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos eventos */}
        <Card className="lg:col-span-2 border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Próximos eventos</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Os próximos compromissos na sua agenda.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/calendario")}
            >
              Ver calendário completo
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {proximosEventos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum evento futuro cadastrado no momento.
              </p>
            )}

            {proximosEventos.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-slate-50 transition-colors text-sm"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {ev.titulo || "Evento"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {ev.clienteNome} • {format(parseISO(ev.data), "dd/MM/yyyy", { locale: ptBR })} •{" "}
                    {ev.horaInicio}
                    {ev.horaFim && ` - ${ev.horaFim}`}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {ev.tipo}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full ${
                      ev.status === "confirmado"
                        ? "bg-emerald-100 text-emerald-700"
                        : ev.status === "pendente"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ev.status}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Atalhos rápidos */}
        <Card className="border border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Atalhos rápidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <button
              className="w-full flex items-center justify-between rounded-md border px-3 py-2 hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/eventos")}
            >
              <span className="flex items-center gap-2">
                <PartyPopper size={16} />
                Novo evento
              </span>
              <ArrowRight size={14} className="text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between rounded-md border px-3 py-2 hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/clientes")}
            >
              <span className="flex items-center gap-2">
                <Users size={16} />
                Novo cliente
              </span>
              <ArrowRight size={14} className="text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between rounded-md border px-3 py-2 hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/propostas")}
            >
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                Criar/editar proposta
              </span>
              <ArrowRight size={14} className="text-muted-foreground" />
            </button>

            <button
              className="w-full flex items-center justify-between rounded-md border px-3 py-2 hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/relatorios")}
            >
              <span className="flex items-center gap-2">
                <Clock size={16} />
                Ver relatórios
              </span>
              <ArrowRight size={14} className="text-muted-foreground" />
            </button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}