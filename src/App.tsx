import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AppProvider } from "@/contexts/AppContext";
import { PacotesProvider } from "@/contexts/PacotesContext";
import { AdicionaisProvider } from "@/contexts/AdicionaisContext";
import { EquipesProvider } from "@/contexts/EquipesContext";
import Dashboard from "./pages/Dashboard";
import Calendario from "./pages/Calendario";
import Eventos from "./pages/Eventos";
import Pacotes from "./pages/Pacotes";
import Clientes from "./pages/Clientes";
import Relatorios from "./pages/Relatorios";
import Conta from "./pages/Conta";
import Ajuda from "./pages/Ajuda";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <PacotesProvider>
          <AdicionaisProvider>
            <EquipesProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendario" element={<Calendario />} />
                    <Route path="/eventos" element={<Eventos />} />
                    <Route path="/propostas" element={<Pacotes />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/conta" element={<Conta />} />
                    <Route path="/ajuda" element={<Ajuda />} />
                    <Route path="/logout" element={<Dashboard />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </EquipesProvider>
          </AdicionaisProvider>
        </PacotesProvider>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
