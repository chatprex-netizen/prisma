import { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, AlertTriangle, FileText, Info, CheckCircle2, Clock } from 'lucide-react';

// Mock Data
const MOCK_NOTIFICATIONS = [
  { id: '1', title: 'Cita próxima', message: 'Visita programada con Carlos Ruiz en Torre Marina 201 en 1 hora.', type: 'CITA_PROXIMA', read: false, createdAt: new Date().toISOString() },
  { id: '2', title: 'Oportunidad inactiva', message: 'El deal de Ana Gómez lleva 5 días sin seguimiento.', type: 'OPORTUNIDAD_INACTIVA', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', title: 'Contrato por vencer', message: 'La separación del Lote 15 vence en 24 horas.', type: 'SEPARACION_VENCER', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '4', title: 'Actualización del sistema', message: 'Se agregaron nuevas plantillas para campañas.', type: 'MENSAJE_SISTEMA', read: true, createdAt: new Date(Date.now() - 345600000).toISOString() },
];

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'CITA_PROXIMA': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'OPORTUNIDAD_INACTIVA': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'CONTRATO_VENCIMIENTO':
      case 'SEPARACION_VENCER': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'MENSAJE_SISTEMA': return <Info className="w-4 h-4 text-brand-green" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case 'CITA_PROXIMA': return 'bg-blue-100';
      case 'OPORTUNIDAD_INACTIVA': return 'bg-orange-100';
      case 'CONTRATO_VENCIMIENTO':
      case 'SEPARACION_VENCER': return 'bg-red-100';
      case 'MENSAJE_SISTEMA': return 'bg-brand-green/10';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
              <p className="text-xs text-slate-500">{unreadCount} sin leer</p>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs font-medium text-brand-green hover:text-brand-greenHover transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Marcar leídas
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                No tienes notificaciones
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <li 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${!notif.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getBgColor(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm ${!notif.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-medium">
                        Hace 1 hora
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-brand-green rounded-full mt-2 shrink-0"></div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
            <button className="text-xs font-medium text-slate-600 hover:text-brand-green transition-colors">
              Ver todo el historial
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
