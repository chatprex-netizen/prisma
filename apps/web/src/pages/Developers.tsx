import { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, Edit2, Trash2, Building2, User } from 'lucide-react';
import { NewDeveloperModal } from '../components/modals/NewDeveloperModal';
import { getDevelopers, deleteDeveloper } from '../lib/api';

export function Developers() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<any | null>(null);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    const nameMatch = (d.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const rucMatch = (d.ruc || '').includes(searchQuery);
    const emailMatch = (d.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const contactMatch = (d.contactName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return nameMatch || rucMatch || emailMatch || contactMatch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-6 h-6 text-brand-green" />
            Empresas Desarrolladoras
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestión de socios comerciales y constructoras para los proyectos</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button 
            onClick={handleOpenNewModal}
            className="flex-1 md:flex-none bg-brand-green hover:bg-brand-greenHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Nueva Desarrolladora
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por razón social, RUC, email o contacto..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          />
        </div>
      </div>

      {/* Developers List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">Empresa / RUC</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Notas</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDevelopers.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {dev.logo ? (
                            <img src={dev.logo} alt="logo" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{dev.name}</div>
                          <div className="text-xs text-slate-400 font-mono">RUC: {dev.ruc || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-700">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{dev.contactName || '—'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {dev.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dev.phone}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-4 px-4">
                      {dev.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{dev.email}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 max-w-[200px] truncate">
                      {dev.notes || '—'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(dev)}
                          className="p-1.5 text-slate-400 hover:text-brand-green hover:bg-slate-100 rounded-lg transition-colors"
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
