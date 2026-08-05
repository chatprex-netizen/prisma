import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GitBranch, 
  Building2, 
  Home, 
  Users, 
  Calendar, 
  FileText,
  LogOut,
  X,
  Settings as SettingsIcon,
  Megaphone,
  UserCog,
  Wallet,
  MessageCircle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Bot
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

type MenuItem = {
  icon: any;
  label: string;
  path?: string;
  id?: string;
  subItems?: { icon: any; label: string; path: string }[];
};

const menuGroups: { title: string; items: MenuItem[] }[] = [
  {
    title: 'PRINCIPAL',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
      { icon: MessageCircle, label: 'Mensajes', path: '/conversations' },
      { icon: GitBranch, label: 'Pipeline', path: '/pipeline' },
      { icon: Users, label: 'Contactos', path: '/contacts' },
      { icon: Calendar, label: 'Agenda', path: '/calendar' },
      { icon: FileText, label: 'Contratos', path: '/contracts' },
      { icon: Wallet, label: 'Finanzas', path: '/finances' },
    ]
  },
  {
    title: 'INVENTARIO',
    items: [
      { icon: Building2, label: 'Proyectos', path: '/projects' },
      { icon: Home, label: 'Unidades', path: '/units' },
    ]
  },
  {
    title: 'SISTEMA',
    items: [
      { 
        icon: Sparkles, 
        label: 'Automatizaciones', 
        id: 'automatizaciones',
        subItems: [
          { icon: Bot, label: 'Asistentes IA', path: '/ai-assistants' },
          { icon: Megaphone, label: 'Campañas', path: '/campaigns' },
        ]
      },
      { 
        icon: SettingsIcon, 
        label: 'Configuración', 
        id: 'configuracion',
        subItems: [
          { icon: UserCog, label: 'Usuarios', path: '/users' },
          { icon: SettingsIcon, label: 'Ajustes', path: '/settings' },
        ]
      }
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    automatizaciones: false,
    configuracion: false
  });

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={twMerge(
        "fixed md:static inset-y-0 left-0 w-[230px] h-full bg-brand-dark flex flex-col text-slate-300 shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Brand Header */}
        <div className="p-4 px-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center text-white shadow-md shadow-brand-green/20">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm tracking-tight leading-tight">ChatPrex</span>
              <span className="text-brand-greenLight text-[9px] tracking-wider uppercase font-medium">CRM & WhatsApp AI</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button 
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-4 custom-scrollbar">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-0.5">
              <h3 className="px-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {group.title}
              </h3>
              {group.items.map((item) => {
                const isActive = item.path ? location.pathname === item.path : false;
                const hasSubItems = !!item.subItems;
                const isExpanded = item.id ? expandedMenus[item.id] : false;
                const isSubItemActive = hasSubItems && item.subItems?.some(sub => location.pathname === sub.path);

                return (
                  <div key={item.path || item.id}>
                    {hasSubItems ? (
                      <button
                        onClick={() => item.id && toggleMenu(item.id)}
                        className={twMerge(
                          clsx(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group",
                            isSubItemActive || isExpanded
                              ? "bg-white/5 text-white" 
                              : "hover:bg-white/5 hover:text-white text-slate-300"
                          )
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={clsx("w-4 h-4", (isSubItemActive || isExpanded) ? "text-brand-greenLight" : "text-slate-400 group-hover:text-white transition-colors")} />
                          <span>{item.label}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                        )}
                      </button>
                    ) : (
                      <Link
                        to={item.path!}
                        onClick={() => {
                          if (window.innerWidth < 768 && onClose) {
                            onClose();
                          }
                        }}
                        className={twMerge(
                          clsx(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group",
                            isActive 
                              ? "bg-brand-green text-white shadow-md shadow-brand-green/20" 
                              : "hover:bg-white/5 hover:text-white text-slate-300"
                          )
                        )}
                      >
                        <item.icon className={clsx("w-4 h-4", isActive ? "text-white" : "text-slate-400 group-hover:text-white transition-colors")} strokeWidth={isActive ? 2.5 : 2} />
                        {item.label}
                      </Link>
                    )}

                    {/* Sub Items Rendering */}
                    {hasSubItems && isExpanded && (
                      <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                        {item.subItems!.map((subItem) => {
                          const isSubActive = location.pathname === subItem.path;
                          return (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              onClick={() => {
                                if (window.innerWidth < 768 && onClose) {
                                  onClose();
                                }
                              }}
                              className={twMerge(
                                clsx(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                  isSubActive 
                                    ? "bg-brand-green/20 text-brand-greenLight" 
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                                )
                              )}
                            >
                              {subItem.icon && <subItem.icon className="w-3.5 h-3.5" />}
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Profile */}
        <div className="p-4 border-t border-white/10 bg-white/5 mt-auto shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-greenLight font-bold overflow-hidden shrink-0">
              <img src="https://ui-avatars.com/api/?name=Juan+Perez&background=02B875&color=fff" alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white font-medium text-sm truncate">Juan Pérez</span>
              <span className="text-slate-400 text-xs truncate">Administrador</span>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 text-sm font-medium transition-colors group">
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
