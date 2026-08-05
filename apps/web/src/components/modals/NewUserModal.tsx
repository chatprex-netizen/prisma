import { X } from 'lucide-react';

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewUserModal({ isOpen, onClose }: NewUserModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] md:w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Nuevo Usuario</h2>
            <p className="text-xs text-slate-500 mt-0.5">Agrega un nuevo miembro a tu equipo</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 md:p-5 overflow-y-auto custom-scrollbar flex-1">
          <form className="space-y-6">
            
            {/* Info Básica */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-brand-green/10 text-brand-green flex items-center justify-center text-xs">1</span>
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Nombre *</label>
                  <input type="text" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" placeholder="Ej: Juan" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Apellido *</label>
                  <input type="text" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" placeholder="Ej: Pérez" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Correo Electrónico *</label>
                  <input type="email" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" placeholder="juan.perez@inmobiliaria.com" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Teléfono</label>
                  <input type="tel" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" placeholder="+51 987 654 321" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100"></div>

            {/* Acceso y Permisos */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-brand-green/10 text-brand-green flex items-center justify-center text-xs">2</span>
                Acceso y Permisos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Contraseña Temporal *</label>
                  <input type="password" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" placeholder="••••••••" required />
                  <p className="text-[10px] text-slate-500">Se le pedirá que la cambie en su primer inicio de sesión.</p>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Rol del Usuario *</label>
                  <select className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white">
                    <option value="AGENTE">Agente Comercial</option>
                    <option value="ASISTENTE">Asistente</option>
                    <option value="GERENTE_COMERCIAL">Gerente Comercial</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
                
                <div className="space-y-1 md:col-span-2 mt-2">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-brand-green rounded border-slate-300 focus:ring-brand-green" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Usuario Activo</p>
                      <p className="text-xs text-slate-500">Si se desactiva, el usuario no podrá iniciar sesión en el sistema.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-brand-green hover:bg-brand-greenHover rounded-lg transition-colors shadow-sm shadow-brand-green/20"
          >
            Crear Usuario
          </button>
        </div>
      </div>
    </div>
  );
}
