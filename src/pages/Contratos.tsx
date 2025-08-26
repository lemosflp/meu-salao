import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HandHeart, Eye, Edit, FileText, DollarSign, Clock } from "lucide-react";
import { mockContratos, mockEventos, mockClientes } from "@/data/mockData";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Contratos() {
  const getContractWithDetails = (contrato: any) => {
    const evento = mockEventos.find(e => e.id === contrato.eventoId);
    const cliente = mockClientes.find(c => c.id === contrato.clienteId);
    return { ...contrato, evento, cliente };
  };

  const contractsWithDetails = mockContratos.map(getContractWithDetails);
  
  const totalContratos = contractsWithDetails.length;
  const contratosAtivos = contractsWithDetails.filter(c => c.status === 'ativo').length;
  const valorTotalContratos = contractsWithDetails.reduce((total, c) => total + c.valorFinal, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'finalizado': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo': return <Clock size={12} />;
      case 'finalizado': return <FileText size={12} />;
      case 'cancelado': return <HandHeart size={12} />;
      default: return <FileText size={12} />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contratos</h1>
          <p className="text-muted-foreground">Gerencie seus contratos e acordos</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <HandHeart size={16} className="mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Contratos
              </CardTitle>
              <FileText size={16} className="text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalContratos}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contratosAtivos} ativos no momento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total
              </CardTitle>
              <DollarSign size={16} className="text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {valorTotalContratos.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Valor total dos contratos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Sucesso
              </CardTitle>
              <HandHeart size={16} className="text-event-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-event-secondary">92%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Contratos finalizados com sucesso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contractsWithDetails.map((contrato) => (
              <div key={contrato.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">
                        {contrato.evento?.titulo || 'Evento não encontrado'}
                      </h3>
                      <Badge variant="secondary" className={`text-xs ${getStatusColor(contrato.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(contrato.status)}
                          {contrato.status.toUpperCase()}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Cliente:</span>
                        <div>{contrato.cliente ? `${contrato.cliente.nome} ${contrato.cliente.sobrenome}` : 'Cliente não encontrado'}</div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Data do Evento:</span>
                        <div>{contrato.evento ? format(parseISO(contrato.evento.data), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}</div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Valor:</span>
                        <div className="font-semibold">R$ {contrato.valorFinal.toLocaleString()}</div>
                        {contrato.desconto && (
                          <div className="text-xs text-green-600">
                            Desconto: R$ {contrato.desconto.toLocaleString()}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Forma de Pagamento:</span>
                        <div>{contrato.formaPagamento}</div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Assinatura:</span>
                        <div>{format(parseISO(contrato.dataAssinatura), "dd/MM/yyyy", { locale: ptBR })}</div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Tipo:</span>
                        <div className="capitalize">{contrato.evento?.tipo || 'N/A'}</div>
                      </div>
                    </div>
                    
                    {contrato.observacoes && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-md">
                        <span className="font-medium text-muted-foreground">Observações:</span>
                        <p className="text-sm mt-1">{contrato.observacoes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" title="Visualizar">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" title="Editar">
                      <Edit size={16} />
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText size={16} className="mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {contractsWithDetails.length === 0 && (
              <div className="text-center py-12">
                <HandHeart size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum contrato encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Comece criando seu primeiro contrato com um cliente.
                </p>
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  <HandHeart size={16} className="mr-2" />
                  Criar Primeiro Contrato
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <HandHeart size={24} />
          <span>Novo Contrato</span>
        </Button>
        
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <FileText size={24} />
          <span>Modelos de Contrato</span>
        </Button>
        
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <DollarSign size={24} />
          <span>Relatório Financeiro</span>
        </Button>
        
        <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
          <Clock size={24} />
          <span>Contratos Pendentes</span>
        </Button>
      </div>
    </div>
  );
}