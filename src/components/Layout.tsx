import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  FileText, 
  HandHeart, 
  LogOut, 
  User, 
  HelpCircle,
  PartyPopper
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: Calendar, label: "Calendário", path: "/calendario" },
  { icon: PartyPopper, label: "Eventos", path: "/eventos" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: FileText, label: "Relatórios", path: "/relatorios" },
  { icon: HandHeart, label: "Contratos", path: "/contratos" },
];

const bottomMenuItems = [
  { icon: LogOut, label: "Sair", path: "/logout" },
  { icon: User, label: "Conta", path: "/conta" },
  { icon: HelpCircle, label: "Ajuda", path: "/ajuda" },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-primary-foreground flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-primary-foreground/20">
          <Link to="/" className="block">
            <h1 className="text-2xl font-bold text-primary-foreground">MeuSalão</h1>
            <p className="text-sm text-primary-foreground/80 mt-1">Para Festa Casa de Festas</p>
          </Link>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Menu */}
        <div className="p-4 border-t border-primary-foreground/20">
          <ul className="space-y-2">
            {bottomMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-200"
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};