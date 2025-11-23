import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Save, Eye, EyeOff } from "lucide-react";
import { useConfiguracoesContext } from "@/contexts/ConfiguracoesContext";
import { useToast } from "@/hooks/use-toast";

export default function Configuracoes() {
  console.log("=== PÁGINA CONFIGURAÇÕES RENDERIZADA ===");
  const { configuracoes, updateNomeSalao, updateSenha } = useConfiguracoesContext();
  const { toast } = useToast();

  const [nomeSalao, setNomeSalao] = useState(configuracoes.nomeSalao);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const handleSaveNome = async () => {
    if (!nomeSalao.trim()) {
      toast({
        title: "Erro",
        description: "O nome do salão não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateNomeSalao(nomeSalao.trim());
      toast({
        title: "Sucesso!",
        description: "Nome do salão atualizado",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome do salão",
        variant: "destructive",
      });
    }
  };

  const handleSaveSenha = async () => {
    if (!novaSenha || !confirmarSenha) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de senha",
        variant: "destructive",
      });
      return;
    }

    if (novaSenha !== confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }

    if (novaSenha.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter no mínimo 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      const sucesso = await updateSenha(senhaAtual, novaSenha);
      if (sucesso) {
        toast({
          title: "Sucesso!",
          description: "Senha atualizada com sucesso",
        });
        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
      } else {
        toast({
          title: "Erro",
          description: "Senha atual incorreta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a senha",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground flex items-center gap-3">
          <Settings size={28} className="md:w-9 md:h-9" />
          Configurações
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Personalize as configurações do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Configurações do Salão */}
        <Card className="border-l-4 border-l-blue-600 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Settings size={20} />
              Informações do Salão
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <Label htmlFor="nomeSalao">Nome do Salão</Label>
              <Input
                id="nomeSalao"
                value={nomeSalao}
                onChange={(e) => setNomeSalao(e.target.value)}
                placeholder="Digite o nome do salão"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Este nome aparecerá no cabeçalho do sistema
              </p>
            </div>

            <Button
              onClick={handleSaveNome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save size={16} className="mr-2" />
              Salvar Nome
            </Button>
          </CardContent>
        </Card>

        {/* Alterar Senha */}
        <Card className="border-l-4 border-l-purple-600 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
            <CardTitle className="text-purple-900 flex items-center gap-2">
              <Settings size={20} />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {configuracoes.senhaHash && (
              <div>
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={showSenhaAtual ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                  >
                    {showSenhaAtual ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="novaSenha">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="novaSenha"
                  type={showNovaSenha ? "text" : "password"}
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowNovaSenha(!showNovaSenha)}
                >
                  {showNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme a nova senha"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                >
                  {showConfirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              A senha deve ter no mínimo 6 caracteres
            </p>

            <Button
              onClick={handleSaveSenha}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save size={16} className="mr-2" />
              {configuracoes.senhaHash ? "Alterar Senha" : "Criar Senha"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}