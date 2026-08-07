import { useState } from 'react';
import { Plus, Search, Filter, Shield, MoreHorizontal, Eye, Edit2, Trash2, ShieldCheck, Mail, Phone } from 'lucide-react';
import { NewUserModal } from '../components/modals/NewUserModal';

// Initial Mock Data
const INITIAL_USERS = [
  { id: '1', firstName: 'Admin', lastName: 'Principal', email: 'admin@propify.com', phone: '+51 999 888 777', role: 'ADMIN', isActive: true, createdAt: '2026-08-01' },
  { id: '2', firstName: 'Carlos', lastName: 'Mendoza', email: 'cmendoza@propify.com', phone: '+51 987 654 321', role: 'GERENTE_COMERCIAL', isActive: true, createdAt: '2026-08-02' },
  { id: '3', firstName: 'Ana', lastName: 'Gómez', email: 'agomez@propify.com', phone: '+51 912 345 678', role: 'AGENTE', isActive: true, createdAt: '2026-08-03' },
  { id: '4', firstName: 'Luis', lastName: 'Torres', email: 'ltorres@propify.com', phone: '+51 934 567 890', role: 'AGENTE', isActive: false, createdAt: '2026-08-04' },
];

export function Users() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleToggleStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
    setActiveMenu(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      setUsers(users.filter(user => user.id !== userId));
    }
    setActiveMenu(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700';
      case 'GERENTE_COMERCIAL': return 'bg-blue-100 text-blue-700';
      case 'AGENTE': return 'bg-brand-green/10 text-brand-green';
      case 'ASISTENTE': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleName = (role: string) => {
    switch(role) {
      case 'ADMIN': return 'Administrador';
      case 'GERENTE_COMERCIAL': return 'Gerente Comercial';
      case 'AGENTE': return 'Agente Comercial';
      case 'ASISTENTE': return 'Asistente';
      default: return role;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-xs text-slate-500 mt-0.5">Administra los accesos y roles de tu equipo</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none bg-brand-green hover:bg-brand-greenHover text-white p-2 md:px-4 md:py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o correo electrónico..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-semibold text-sm">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 text-sm">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Agregado: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      <Shield className="w-3 h-3" />
                      {getRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-brand-green' : 'bg-slate-300'}`}></span>
                      <span className="text-sm text-slate-700">{user.isActive ? 'Activo' : 'Inactivo'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative inline-block text-left">
                      <button 
                        onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)}
                        className="p-1.5 text-slate-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === user.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10">
                          <button 
                            onClick={() => setActiveMenu(null)}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4 text-slate-400" />
                            Ver perfil
                          </button>
                          <button 
                            onClick={() => setActiveMenu(null)}
                            className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4 text-slate-400" />
                            Editar permisos
                          </button>
                          {user.isActive ? (
                            <button 
                              onClick={() => handleToggleStatus(user.id)}
                              className="w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4 text-orange-500" />
                              Desactivar usuario
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleStatus(user.id)}
                              className="w-full px-4 py-2 text-left text-sm text-brand-green hover:bg-brand-green/10 flex items-center gap-2"
                            >
                              <ShieldCheck className="w-4 h-4 text-brand-green" />
                              Activar usuario
                            </button>
                          )}
                          <div className="h-px bg-slate-100 my-1"></div>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <NewUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
