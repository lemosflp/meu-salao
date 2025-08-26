import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, DollarSign, TrendingUp, Users } from "lucide-react";
import { mockEventos, mockContratos, mockClientes } from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Relatorios() {
  const totalReceita = mockEventos.reduce((total, evento) => total + (evento.valor || 0), 0);
  const eventosConfirmados = mockEventos.filter(e => e.status === 'confirmado').length;
  const eventosPendentes = mockEventos.filter(e => e.status === 'pendente').length;
  
  const receitaPorTipo = mockEventos.reduce((acc, evento) => {
    const tipo = evento.tipo;
    acc[tipo] = (acc[tipo] || 0) + (evento.valor || 0);
    return acc;
  }, {} as Record<string, number>);

  const reports = [
    {
      title: "Relatório Mensal de Eventos",
      description: "Análise completa dos eventos do mês atual",
      date: new Date().toISOString(),
      type: "Financeiro",
      status: "Pronto"
    },
    {
      title: "Relatório de Clientes",
      description: "Lista de todos os clientes cadastrados",
      date: new Date().toISOString(),
      type: "Cadastral",
      status: "Pronto"
    },
    {
      title: "Análise de Performance",
      description: "Métricas de performance e ocupação",
      date: new Date().toISOString(),
      type: "Operacional",
      status: "Pronto"
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Análises e métricas do seu negócio</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Download size={16} className="mr-2" />
          Exportar Todos
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <DollarSign size={16} className="text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceita.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +15% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eventos Confirmados
              </CardTitle>
              <Calendar size={16} className="text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{eventosConfirmados}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {eventosPendentes} pendentes de confirmação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Ocupação
              </CardTitle>
              <TrendingUp size={16} className="text-event-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-event-secondary">85%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Média mensal de ocupação
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Clientes Ativos
              </CardTitle>
              <Users size={16} className="text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{mockClientes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{Math.floor(mockClientes.length * 0.2)} novos este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Type Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Receita por Tipo de Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(receitaPorTipo).map(([tipo, valor]) => {
              const percentage = (valor / totalReceita) * 100;
              const tipoLabels = {
                festa: 'Festas',
                casamento: 'Casamentos',
                aniversario: 'Aniversários',
                corporativo: 'Corporativo',
                outro: 'Outros'
              };
              
              return (
                <div key={tipo} className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium w-20">
                      {tipoLabels[tipo as keyof typeof tipoLabels]}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold">R$ {valor.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Relatórios Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Gerado em: {format(parseISO(report.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                    <Badge variant="secondary" className="text-xs">
                      {report.type}
                    </Badge>
                    <Badge variant={report.status === 'Pronto' ? 'default' : 'secondary'} className="text-xs">
                      {report.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="sm">
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download size={14} className="mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <FileText size={24} />
          <span>Gerar Relatório Personalizado</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <Calendar size={24} />
          <span>Relatório de Período</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <TrendingUp size={24} />
          <span>Análise de Crescimento</span>
        </Button>
      </div>
    </div>
  );
}