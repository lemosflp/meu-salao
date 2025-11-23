import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, PartyPopper, Users, FileText, HelpCircle, Settings, Package, LogOut, X } from "lucide-react";
import { useConfiguracoesContext } from "@/contexts/ConfiguracoesContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface NavLinkProps {
  to: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ to, icon: Icon, children, onClick }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm ${
        isActive
          ? "bg-blue-500 text-white shadow-md"
          : "text-slate-200 hover:bg-white/10 hover:text-white"
      }`}
    >
      <Icon size={18} />
      <span className="font-normal">{children}</span>
    </Link>
  );
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { configuracoes } = useConfiguracoesContext();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 
          text-white p-5 shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Botão de fechar (mobile) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden text-white hover:bg-white/10 rounded-lg p-1"
        >
          <X size={24} />
        </button>

        <div className="mb-6 pb-6 border-b border-white/20">
          <h1 className="text-2xl font-bold mb-1 text-white">MeuSalão</h1>
          <p className="text-xs text-blue-100 font-bold">{configuracoes.nomeSalao}</p>
        </div>

        <nav className="space-y-1 flex-1">
          <NavLink to="/" icon={Home} onClick={handleNavClick}>
            Dashboard
          </NavLink>
          <NavLink to="/calendario" icon={Calendar} onClick={handleNavClick}>
            Calendário
          </NavLink>
          <NavLink to="/eventos" icon={PartyPopper} onClick={handleNavClick}>
            Eventos
          </NavLink>
          <NavLink to="/propostas" icon={Package} onClick={handleNavClick}>
            Propostas
          </NavLink>
          <NavLink to="/clientes" icon={Users} onClick={handleNavClick}>
            Clientes
          </NavLink>
          <NavLink to="/relatorios" icon={FileText} onClick={handleNavClick}>
            Relatórios
          </NavLink>
        </nav>

        <div className="pt-3 border-t border-white/20 mt-3 space-y-1">
          <NavLink to="/ajuda" icon={HelpCircle} onClick={handleNavClick}>
            Ajuda
          </NavLink>
          <NavLink to="/configuracoes" icon={Settings} onClick={handleNavClick}>
            Configurações
          </NavLink>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-200 hover:bg-red-600 hover:text-white transition-all text-sm justify-start font-normal"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </Button>
        </div>
      </aside>
    </>
  );
}