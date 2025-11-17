import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
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

type LayoutProps = {
  children: ReactNode;
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* SIDEBAR AZUL */}
      <aside className="w-64 bg-blue-700 text-white flex flex-col h-screen">
        {/* Logo / título */}
        <div className="px-6 py-5 border-b border-blue-500 flex items-center gap-3">
          {/* ajuste o src da logo se houver imagem local */}
          {/* <img src="/logo.png" alt="Meu Salão" className="h-8 w-auto" /> */}
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">Meu Salão</span>
            <span className="text-xs text-blue-200">Painel de gestão</span>
          </div>
        </div>

        {/* Navegação principal */}
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

        {/* Rodapé da sidebar: conta / ajuda / sair */}
        <div className="border-t border-blue-600 px-3 py-3 text-sm space-y-1 mt-auto">
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
          >
            <LogOut size={16} />
            <span>Sair</span>
          </NavLink>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 min-h-screen bg-slate-50">
        {/* Topbar simples opcional; remova se já tiver outra */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-6">
          <span className="text-sm text-slate-500">
            Meu Salão / <span className="font-semibold text-slate-800">Painel</span>
          </span>
        </header>

        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
};