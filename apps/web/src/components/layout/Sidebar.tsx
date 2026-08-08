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
  ChevronLeft,
  Bot,
  UserCheck,
  Receipt,
  BookOpen,
  Menu,
  TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../contexts/AuthContext';

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
      { icon: LayoutDashboard, label: 'Panel', path: '/' },
      { icon: MessageCircle, label: 'Mensajes', path: '/conversations' },
      { icon: GitBranch, label: 'Embudo', path: '/pipeline' },
      { icon: Users, label: 'Contactos', path: '/contacts' },
      { icon: Calendar, label: 'Agenda', path: '/calendar' },
    ]
  },
  {
    title: 'ADMINISTRACIÓN',
    items: [
      {
        icon: UserCheck,
        label: 'Administración',
        id: 'administracion',
        subItems: [
          { icon: UserCheck, label: 'Clientes', path: '/clients' },
          { icon: FileText, label: 'Contratos', path: '/contracts' },
          { icon: Wallet, label: 'Finanzas', path: '/finances' },
          { icon: Receipt, label: 'Ingresos', path: '/finances/incomes' },
          { icon: Receipt, label: 'Egresos', path: '/finances/expenses' },
          { icon: BookOpen, label: 'Plan Contable', path: '/finances/accounts' },
        ]
      },
    ]
  },
  {
    title: 'INVENTARIO',
    items: [
      {
        icon: Building2,
        label: 'Inventario',
        id: 'inventario',
        subItems: [
          { icon: Building2, label: 'Proyectos', path: '/projects' },
          { icon: Home, label: 'Unidades', path: '/units' },
          { icon: Building2, label: 'Desarrolladoras', path: '/developers' },
        ]
      },
    ]
  },
  {
    title: 'AUTOMATIZACIONES',
    items: [
      { icon: Bot, label: 'Asistentes de IA', path: '/ai-assistants' },
      { icon: Megaphone, label: 'Campañas', path: '/campaigns' },
    ]
  },
  {
    title: 'CONFIGURACIÓN',
    items: [
      { icon: UserCog, label: 'Usuarios', path: '/users' },
      { icon: SettingsIcon, label: 'Ajustes', path: '/settings' },
    ]
  }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    administracion: false,
    inventario: false
  });

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredMenuGroups = menuGroups.map(group => {
    const items = group.items.map(item => {
      if (item.subItems) {
        const filteredSubItems = item.subItems.filter(sub => {
          if (user?.role === 'AGENTE' || user?.role === 'ASISTENTE') {
            if (
              sub.path === '/finances' || 
              sub.path === '/finances/incomes' || 
              sub.path === '/finances/expenses' || 
              sub.path === '/finances/accounts'
            ) {
              return false;
            }
          }
          return true;
        });
        return { ...item, subItems: filteredSubItems };
      }
      return item;
    }).filter(item => {
      if (user?.role === 'AGENTE' || user?.role === 'ASISTENTE') {
        if (
          item.path === '/users' || 
          item.path === '/ai-assistants' || 
          item.path === '/settings'
        ) {
          return false;
        }
      }
      return true;
    });
    return { ...group, items };
  }).filter(group => group.items.length > 0);

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
        "fixed md:static inset-y-0 left-0 h-full bg-brand-dark flex flex-col text-slate-300 shadow-xl z-50 transform transition-all duration-300 ease-in-out shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        isCollapsed ? "w-[64px]" : "w-[230px]"
      )}>
        {/* Brand Header */}
        <div className={clsx(
          "flex items-center justify-between gap-3 shrink-0 p-4",
          isCollapsed ? "px-2 justify-center" : "px-5"
        )}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-green flex items-center justify-center text-white shadow-md shadow-brand-green/20 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col animate-fade-in whitespace-nowrap">
                <span className="text-white font-bold text-sm tracking-tight leading-tight">ChatPrex</span>
                <span className="text-brand-greenLight text-[9px] tracking-wider uppercase font-medium">CRM & WhatsApp AI</span>
              </div>
            )}
          </div>
          
          {/* Collapse toggle button for desktop */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Close button for mobile */}
          <button 
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={clsx(
          "flex-1 px-3 overflow-y-auto custom-scrollbar",
          isCollapsed ? "space-y-2 py-1 px-1.5" : "space-y-3.5 py-2 px-3" // Reduced spacing by 10%+
        )}>
          {filteredMenuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-0.5">
              {!isCollapsed ? (
                <h3 className="px-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 mt-2">
                  {group.title}
                </h3>
              ) : (
                <div className="mx-2 my-2 border-t border-white/5" />
              )}
              
              {group.items.map((item) => {
                const isActive = item.path ? location.pathname === item.path : false;
                const hasSubItems = !!item.subItems;
                const isExpanded = item.id ? expandedMenus[item.id] : false;
                const isSubItemActive = hasSubItems && item.subItems?.some(sub => location.pathname === sub.path);

                return (
                  <div key={item.path || item.id}>
                    {hasSubItems ? (
                      <div>
                        <button
                          onClick={() => item.id && toggleMenu(item.id)}
                          className={twMerge(
                            clsx(
                              "w-full flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group",
                              isCollapsed ? "p-2 justify-center" : "px-3 py-2 justify-between", // Reduced padding
                              isSubItemActive || isExpanded
                                ? "bg-white/5 text-white" 
                                : "hover:bg-white/5 hover:text-white text-slate-300"
                            )
                          )}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className={clsx("w-4 h-4 shrink-0", (isSubItemActive || isExpanded) ? "text-brand-greenLight" : "text-slate-400 group-hover:text-white transition-colors")} />
                            {!isCollapsed && <span>{item.label}</span>}
                          </div>
                          {!isCollapsed && (
                            isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                            )
                          )}
                        </button>
                        
                        {/* Sub Items (Only when expanded and not collapsed) */}
                        {isExpanded && !isCollapsed && (
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
                                      "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                                      isSubActive 
                                        ? "bg-brand-green/20 text-brand-greenLight" 
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )
                                  )}
                                >
                                  {subItem.icon && <subItem.icon className="w-3.5 h-3.5" />}
                                  <span>{subItem.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
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
                            "flex items-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group",
                            isCollapsed ? "p-2 justify-center" : "px-3 py-2 gap-3", // Reduced padding
                            isActive 
                              ? "bg-brand-green text-white shadow-md shadow-brand-green/20" 
                              : "hover:bg-white/5 hover:text-white text-slate-300"
                          )
                        )}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-white transition-colors")} strokeWidth={isActive ? 2.5 : 2} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer Profile */}
        <div className={clsx(
          "border-t border-white/10 bg-white/5 mt-auto shrink-0 flex flex-col items-center",
          isCollapsed ? "p-2 gap-2" : "p-4"
        )}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-3 mb-3.5 w-full">
                <div className="w-9 h-9 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-greenLight font-bold overflow-hidden shrink-0">
                  <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}+${encodeURIComponent(user?.lastName || '')}&background=02B875&color=fff`} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-medium text-xs truncate">{user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Usuario'}</span>
                  <span className="text-slate-400 text-[10px] truncate">
                    {user?.role === 'ADMIN' ? 'Control Total' : user?.role === 'GERENTE_COMERCIAL' ? 'Supervisor' : user?.role === 'AGENTE' ? 'Agente' : 'Asistente'}
                  </span>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 text-xs font-medium transition-colors group"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                <span>Cerrar sesión</span>
              </button>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-greenLight font-bold overflow-hidden shrink-0" title={user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Usuario'}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'User')}+${encodeURIComponent(user?.lastName || '')}&background=02B875&color=fff`} alt="User" className="w-full h-full object-cover" />
              </div>
              <button 
                onClick={logout}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-slate-300 hover:text-red-400 transition-colors group"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
