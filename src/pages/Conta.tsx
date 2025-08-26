import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Edit } from "lucide-react";

export default function Conta() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minha Conta</h1>
          <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>
        <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <Edit size={16} className="mr-2" />
          Editar Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-primary-foreground" />
            </div>
            <CardTitle>Administrador</CardTitle>
            <p className="text-muted-foreground">admin@meusalao.com</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-muted-foreground" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted-foreground" />
                <span>São Paulo, SP</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground" />
                <span>admin@meusalao.com</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" value="Administrador" disabled />
                </div>
                <div>
                  <Label htmlFor="sobrenome">Sobrenome</Label>
                  <Input id="sobrenome" value="Sistema" disabled />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" value="admin@meusalao.com" disabled />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input id="telefone" value="(11) 99999-9999" disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="empresa">Nome da Empresa</Label>
                  <Input id="empresa" value="MeuSalão Casa de Festas" disabled />
                </div>
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input id="cnpj" value="12.345.678/0001-90" disabled />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input id="endereco" value="Rua das Festas, 123 - São Paulo, SP" disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações sobre novos eventos</p>
                  </div>
                  <Button variant="outline" size="sm">Ativado</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Relatórios Automáticos</Label>
                    <p className="text-sm text-muted-foreground">Gerar relatórios mensais automaticamente</p>
                  </div>
                  <Button variant="outline" size="sm">Ativado</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}