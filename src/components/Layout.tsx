import { ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  Package,
  FileText,
  Home,
  HelpCircle,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-700 text-slate-900">
      {/* SIDEBAR FIXA */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-blue-700 text-white flex flex-col">
        {/* topo: logo/título */}
        <div className="px-6 py-5 border-b border-blue-500 flex items-center gap-3">
          {/* coloque sua logo aqui se tiver */}
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">Meu Salão</span>
            <span className="text-xs text-blue-200">Painel de gestão</span>
          </div>
        </div>

        {/* navegação principal */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            <Home size={16} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/calendario"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            <Calendar size={16} />
            <span>Calendário</span>
          </NavLink>

          <NavLink
            to="/eventos"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            <FileText size={16} />
            <span>Eventos</span>
          </NavLink>

          <NavLink
            to="/propostas"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            <Package size={16} />
            <span>Propostas</span>
          </NavLink>

          <NavLink
            to="/clientes"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            <Users size={16} />
            <span>Clientes</span>
          </NavLink>

          <NavLink
            to="/relatorios"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            <FileText size={16} />
            <span>Relatórios</span>
          </NavLink>
        </nav>

        {/* rodapé: Conta / Ajuda / Sair */}
        <div className="border-t border-blue-600 px-3 py-3 text-sm space-y-1">
          <NavLink
            to="/conta"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            <User size={16} />
            <span>Conta</span>
          </NavLink>

          <NavLink
            to="/ajuda"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-blue-100 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            <HelpCircle size={16} />
            <span>Ajuda</span>
          </NavLink>

          <NavLink
            to="/logout"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-md px-3 py-2 transition ${
                isActive
                  ? "bg-red-50 text-red-700 shadow-sm"
                  : "text-red-100 hover:bg-red-600 hover:text-white"
              }`
            }
            onClick={async (e) => {
              e.preventDefault();
              await signOut();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut size={16} />
            <span>Sair</span>
          </NavLink>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="min-h-screen bg-slate-50 ml-64 flex flex-col">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8">
          <span className="text-sm md:text-base text-slate-500">
            Meu Salão /{" "}
            <span className="font-semibold text-slate-800">Painel</span>
          </span>
          {user && (
            <span className="text-xs text-slate-500">
              Logado como <span className="font-medium">{user.email}</span>
            </span>
          )}
        </header>

        <div className="flex-1 px-6 md:px-10 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
};