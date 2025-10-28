import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockEventos } from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const proximosEventos = mockEventos
    .filter(evento => new Date(evento.data) >= new Date())
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .slice(0, 6);

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
      case 'festa': return 'bg-event-primary text-white';
      case 'casamento': return 'bg-pink-500 text-white';
      case 'aniversario': return 'bg-event-secondary text-white';
      case 'corporativo': return 'bg-gray-600 text-white';
      default: return 'bg-event-primary text-white';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <Users size={20} className="text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Olá, user</h2>
            <p className="text-sm text-muted-foreground">Tenha um bom dia!</p>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Próximos Eventos */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Próximos eventos</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/calendario")}
            className="text-primary hover:text-primary-hover"
          >
            Detalhes
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {proximosEventos.map((evento) => {
              const data = parseISO(evento.data);
              const dia = format(data, 'd');
              const mes = format(data, 'MMM', { locale: ptBR }).toUpperCase();
              
              return (
                <div key={evento.id} className="text-center">
                  <div className={`${getTipoColor(evento.tipo)} rounded-lg p-4 mb-2`}>
                    <div className="text-2xl font-bold text-white">{dia}</div>
                    <div className="text-sm text-white/90">{mes}</div>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {evento.titulo}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs mt-1 ${getStatusColor(evento.status)}`}
                  >
                    {evento.status}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
          <CardContent className="p-6">
            <Button 
              className="w-full h-auto p-6 bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-between text-lg font-semibold rounded-xl"
              onClick={() => navigate("/clientes")}
            >
              <span>Cadastrar cliente</span>
              <ArrowRight size={24} />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
          <CardContent className="p-6">
            <Button 
              className="w-full h-auto p-6 bg-primary hover:bg-primary-hover text-primary-foreground flex items-center justify-between text-lg font-semibold rounded-xl"
              onClick={() => navigate("/calendario")}
            >
              <span>Cadastrar festas</span>
              <ArrowRight size={24} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Eventos Este Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold text-primary">{mockEventos.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +12% em relação ao mês anterior
            </p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold text-green-600">
              R$ {mockEventos.reduce((total, evento) => total + (evento.valor || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              +8% em relação ao mês anterior
            </p> */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold text-event-secondary">15</div>
            <p className="text-xs text-muted-foreground mt-1">
              +3 novos clientes este mês
            </p> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}