import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, Phone, Edit2, Trash2, Building2, User } from 'lucide-react';
import { NewDeveloperModal } from '../components/modals/NewDeveloperModal';
import { getDevelopers, deleteDeveloper } from '../lib/api';

export function Developers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<any | null>(null);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Compact Toolbar States
  const [showSearch, setShowSearch] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [hasRucFilter, setHasRucFilter] = useState('todos');
  const [hasPhoneFilter, setHasPhoneFilter] = useState('todos');
  const [hasEmailFilter, setHasEmailFilter] = useState('todos');

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const res = await getDevelopers();
      setDevelopers(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleOpenNewModal = () => {
    setEditingDeveloper(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (developer: any) => {
    setEditingDeveloper(developer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta desarrolladora? Se borrarán sus datos permanentemente.')) {
      return;
    }
    try {
      await deleteDeveloper(id);
      fetchDevelopers();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar la desarrolladora');
    }
  };

  // Filtered developers
  const filteredDevelopers = developers.filter((d) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      (d.name || '').toLowerCase().includes(term) ||
      (d.ruc || '').includes(term) ||
      (d.email || '').toLowerCase().includes(term) ||
      (d.contactName || '').toLowerCase().includes(term)
    );

    const matchesRuc = hasRucFilter === 'todos' 
      ? true 
      : hasRucFilter === 'si' 
        ? !!d.ruc 
        : !d.ruc;

    const matchesPhone = hasPhoneFilter === 'todos' 
      ? true 
      : hasPhoneFilter === 'si' 
        ? !!d.phone 
        : !d.phone;

    const matchesEmail = hasEmailFilter === 'todos' 
      ? true 
      : hasEmailFilter === 'si' 
        ? !!d.email 
        : !d.email;

    return matchesSearch && matchesRuc && matchesPhone && matchesEmail;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col bg-slate-50/30 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <h1 className="text-sm sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
            Desarrolladoras
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block mt-0.5 font-medium">Gestión de constructoras y socios comerciales</p>
        </div>

        {/* Compact Single-Row Action Buttons */}
        <div className="flex flex-row items-center gap-1.5 shrink-0 justify-end">
          {showSearch && (
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar..." 
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-green w-36 sm:w-48 transition-all animate-in fade-in slide-in-from-right-1 duration-200"
              autoFocus
            />
          )}
          
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-lg border transition-all ${showSearch ? 'border-brand-green text-brand-green bg-brand-green/5' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-2 rounded-lg border transition-all ${showAdvancedFilters ? 'border-brand-green text-brand-green bg-brand-green/5' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
            title="Filtros"
          >
            <Filter className="w-4 h-4" />
          </button>

          <button 
            onClick={handleOpenNewModal}
            className="p-2 rounded-lg bg-brand-green text-white hover:bg-brand-greenHover transition-all shadow-sm shadow-brand-green/10"
            title="Nueva Desarrolladora"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 shrink-0 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Ruc / registro</label>
            <select value={hasRucFilter} onChange={e => setHasRucFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los RUC</option>
              <option value="si">Con RUC Registrado</option>
              <option value="no">Sin RUC</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Teléfono de contacto</label>
            <select value={hasPhoneFilter} onChange={e => setHasPhoneFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Teléfonos</option>
              <option value="si">Con Teléfono</option>
              <option value="no">Sin Teléfono</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Correo de contacto</label>
            <select value={hasEmailFilter} onChange={e => setHasEmailFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Correos</option>
              <option value="si">Con Correo</option>
              <option value="no">Sin Correo</option>
            </select>
          </div>

        </div>
      )}

      {/* Developers List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-[11px] sm:text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-[10px] sm:text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4">Empresa / RUC</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4">Contacto</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 hidden sm:table-cell">Teléfono</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 hidden md:table-cell">Correo</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 hidden lg:table-cell">Notas</th>
                  <th className="py-2.5 px-2.5 sm:py-3 sm:px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDevelopers.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-2.5 sm:py-4 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {dev.logo ? (
                            <img src={dev.logo} alt="logo" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{dev.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">RUC: {dev.ruc || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 sm:py-4 sm:px-4">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dev.contactName || '—'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 sm:py-4 sm:px-4 hidden sm:table-cell">
                      {dev.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dev.phone}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-2.5 px-2.5 sm:py-4 sm:px-4 hidden md:table-cell">
                      {dev.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{dev.email}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-2.5 px-2.5 sm:py-4 sm:px-4 text-xs text-slate-400 max-w-[200px] truncate hidden lg:table-cell">
                      {dev.notes || '—'}
                    </td>
                    <td className="py-2.5 px-2.5 sm:py-4 sm:px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(dev)}
                          className="p-1 text-slate-400 hover:text-brand-green hover:bg-slate-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(dev.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDevelopers.length === 0 && (
              <div className="text-center py-16">
                <Building2 className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">No se encontraron desarrolladoras</p>
                <p className="text-xs text-slate-400 mt-1">Registra tu primer socio comercial para asociarlo a tus proyectos inmobiliarios</p>
              </div>
            )}
          </div>
        )}
      </div>

      <NewDeveloperModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDevelopers}
        initialData={editingDeveloper}
      />
    </div>
  );
}
