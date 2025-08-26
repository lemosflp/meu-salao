import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Book, 
  Search,
  ChevronRight 
} from "lucide-react";

export default function Ajuda() {
  const faqs = [
    {
      question: "Como cadastrar um novo cliente?",
      answer: "Acesse a seção 'Clientes' no menu lateral e clique em 'Novo Cliente'. Preencha todos os campos obrigatórios e clique em 'Cadastrar'.",
      category: "Clientes"
    },
    {
      question: "Como criar um evento no calendário?",
      answer: "Na tela de Calendário, clique em 'Cadastrar festa' e preencha as informações do evento, incluindo data, horário e cliente.",
      category: "Eventos"
    },
    {
      question: "Como gerar relatórios?",
      answer: "Vá para a seção 'Relatórios' onde você encontrará diferentes tipos de relatórios disponíveis para visualização e download.",
      category: "Relatórios"
    },
    {
      question: "Como gerenciar contratos?",
      answer: "Na seção 'Contratos' você pode criar, visualizar, editar e acompanhar todos os contratos dos seus clientes.",
      category: "Contratos"
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Central de Ajuda</h1>
          <p className="text-muted-foreground">Encontre respostas e suporte para o sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Help Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="Buscar por ajuda..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle size={20} />
                Perguntas Frequentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{faq.question}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {faq.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                Entre em Contato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input placeholder="Seu nome" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-mail</label>
                    <Input type="email" placeholder="seu@email.com" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Assunto</label>
                  <Input placeholder="Assunto da sua mensagem" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mensagem</label>
                  <Textarea 
                    placeholder="Descreva sua dúvida ou problema..."
                    rows={4}
                  />
                </div>
                <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
                  Enviar Mensagem
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Book size={16} />
                  Manual do Usuário
                </span>
                <ChevronRight size={16} />
              </Button>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <HelpCircle size={16} />
                  Tutoriais
                </span>
                <ChevronRight size={16} />
              </Button>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  Chat Online
                </span>
                <ChevronRight size={16} />
              </Button>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary" />
                <div>
                  <div className="font-medium">Telefone</div>
                  <div className="text-sm text-muted-foreground">(11) 99999-9999</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary" />
                <div>
                  <div className="font-medium">E-mail</div>
                  <div className="text-sm text-muted-foreground">suporte@meusalao.com</div>
                </div>
              </div>
              <div className="pt-2">
                <div className="text-sm font-medium mb-2">Horário de Atendimento</div>
                <div className="text-sm text-muted-foreground">
                  Segunda à Sexta: 9h às 18h<br />
                  Sábado: 9h às 14h
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Versão:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span>Última Atualização:</span>
                  <span>26/08/2024</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant="default" className="text-xs">Online</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}