import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { Calendar, Users, PartyPopper, CheckCircle2, Clock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { usePacotesContext } from "@/contexts/PacotesContext";
import { useAdicionaisContext } from "@/contexts/AdicionaisContext";
import { Package, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { clientes, eventos } = useAppContext();
  const { pacotes } = usePacotesContext();
  const { adicionais } = useAdicionaisContext();
  const [showFinancialValues, setShowFinancialValues] = useState(false);

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

  // Calcular valores do mês atual
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const eventosDoMes = useMemo(() => {
    return eventos.filter(e => {
      const date = parseISO(e.data);
      return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
    });
  }, [eventos]);

  const faturamentoMes = useMemo(
    () => eventosDoMes.reduce((sum, e) => sum + (e.valor || 0), 0),
    [eventosDoMes]
  );

  const entradasMes = useMemo(
    () => eventosDoMes.reduce((sum, e) => sum + (e.valorEntrada || 0), 0),
    [eventosDoMes]
  );

  const saldoMes = faturamentoMes - entradasMes;

  const stats = [
    { label: "Total de Clientes", value: clientes.length, icon: Users, color: "bg-blue-600" },
    { label: "Eventos Cadastrados", value: eventos.length, icon: Calendar, color: "bg-blue-500" },
    { label: "Propostas Ativas", value: pacotes.length, icon: Package, color: "bg-blue-700" },
    { label: "Adicionais", value: adicionais.length, icon: TrendingUp, color: "bg-blue-600" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="border-l-4 border-l-blue-600 shadow-lg hover:shadow-xl transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Grid de conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Próximos Eventos */}
        <Card className="border-l-4 border-l-blue-600 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Calendar size={20} />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {proximosEventos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum evento próximo</p>
                <Button
                  size="sm"
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => navigate("/eventos")}
                >
                  + Cadastrar Evento
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {proximosEventos.map(evento => (
                  <div
                    key={evento.id}
                    className={`p-3 border rounded-lg hover:shadow-md transition ${
                      (() => {
                        const totalRecebido = (evento.pagamentos || []).reduce((sum, p) => sum + p.valor, 0);
                        const estaPago = Math.abs(totalRecebido - evento.valor) < 0.01;
                        return estaPago
                          ? "border-green-200 bg-gradient-to-r from-green-50 to-white"
                          : "border-blue-200 bg-gradient-to-r from-blue-50 to-white";
                      })()
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className={`font-semibold ${
                          (() => {
                            const totalRecebido = (evento.pagamentos || []).reduce((sum, p) => sum + p.valor, 0);
                            const estaPago = Math.abs(totalRecebido - evento.valor) < 0.01;
                            return estaPago ? "text-green-900" : "text-blue-900";
                          })()
                        }`}>
                          {evento.titulo}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          📅 {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.horaInicio}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          evento.status === 'confirmado' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {evento.status}
                        </span>
                        {(() => {
                          const totalRecebido = (evento.pagamentos || []).reduce((sum, p) => sum + p.valor, 0);
                          if (Math.abs(totalRecebido - evento.valor) < 0.01) {
                            return (
                              <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-700">
                                ✓ Pago
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumo de Vendas - Mês Atual */}
        <Card className="border-l-4 border-l-blue-500 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <TrendingUp size={20} />
                Resumo Financeiro - {format(new Date(), "MMMM/yyyy", { locale: ptBR })}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFinancialValues(!showFinancialValues)}
                className="text-slate-600 hover:text-blue-700"
              >
                {showFinancialValues ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg">
                <p className="text-xs text-slate-600">Valor Total em Eventos</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {showFinancialValues 
                    ? `R$ ${faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : "••••••"
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg">
                <p className="text-xs text-slate-600">Entradas Recebidas</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {showFinancialValues 
                    ? `R$ ${entradasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : "••••••"
                  }
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg">
                <p className="text-xs text-slate-600">Saldo a Receber</p>
                <p className="text-2xl font-bold text-orange-700 mt-1">
                  {showFinancialValues 
                    ? `R$ ${saldoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    : "••••••"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-200">
          <CardTitle className="text-blue-900">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/eventos")}
            >
              + Novo Evento
            </Button>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/clientes")}
            >
              + Novo Cliente
            </Button>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/propostas")}
            >
              Gerenciar Propostas
            </Button>
            <Button
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/calendario")}
            >
              Ver Calendário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}