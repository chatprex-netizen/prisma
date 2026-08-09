import { useState, useEffect } from 'react';
import { Plus, MapPin, Building2, Calendar, FileText, Filter, Search, Trash2, Edit3 } from 'lucide-react';
import { NewProjectModal } from '../components/modals/NewProjectModal';
import { getProjects, deleteProject, getDevelopers } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  PREVENTA: 'bg-blue-100 text-blue-700',
  EN_CONSTRUCCION: 'bg-amber-100 text-amber-700',
  ENTREGADO: 'bg-emerald-100 text-emerald-700',
  AGOTADO: 'bg-slate-100 text-slate-700',
};

const TYPE_LABELS: Record<string, string> = {
  EDIFICIO_MULTIFAMILIAR: 'Edificio Multifamiliar',
  CONDOMINIO: 'Condominio',
  LOTIZACION: 'Lotización',
  TERRENO_COMERCIAL: 'Terreno Comercial',
  CENTRO_COMERCIAL: 'Centro Comercial',
  OFICINAS_CORPORATIVAS: 'Oficinas',
  HABILITACION_URBANA: 'Habilitación Urbana',
  MIXTO: 'Mixto',
};

export function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Compact Toolbar States
  const [showSearch, setShowSearch] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [devFilter, setDevFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      setProjects(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    getDevelopers().then(res => setDevelopers(res?.data || [])).catch(console.error);
  }, []);

  const handleOpenEdit = (project: any) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleOpenNew = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  // Dynamic filter logic
  const filteredProjects = projects.filter((project) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      project.name.toLowerCase().includes(term) ||
      (project.city && project.city.toLowerCase().includes(term)) ||
      (project.developer?.name && project.developer.name.toLowerCase().includes(term))
    );

    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesType = !typeFilter || project.type === typeFilter;
    const matchesDev = !devFilter || project.developerId === devFilter;
    const matchesCity = !cityFilter || project.city === cityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesDev && matchesCity;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 min-h-full flex flex-col bg-slate-50/30 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
            Proyectos
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-505 hidden sm:block mt-0.5">{projects.length} proyectos inmobiliarios registrados</p>
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
            onClick={handleOpenNew}
            className="p-2 rounded-lg bg-brand-green text-white hover:bg-brand-greenHover transition-all shadow-sm shadow-brand-green/10"
            title="Nuevo Proyecto"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 shrink-0 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Estado obra</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Estado</option>
              <option value="PREVENTA">Preventa</option>
              <option value="EN_CONSTRUCCION">En Construcción</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="AGOTADO">Agotado</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Tipo</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Tipo</option>
              {Object.entries(TYPE_LABELS).map(([key, val]) => (
                <option key={key} value={key}>{val}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Desarrolladora</label>
            <select value={devFilter} onChange={e => setDevFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Desarrolladora</option>
              {developers.map(dev => (
                <option key={dev.id} value={dev.id}>{dev.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Ciudad</label>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Ciudad</option>
              {Array.from(new Set(projects.map(p => p.city).filter(Boolean))).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 font-medium">No hay proyectos registrados.</div>
        ) : filteredProjects.map(project => (
          <div key={project.id} className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col h-fit">
            {/* Top Image Placeholder */}
            <div className="h-14 bg-slate-100 relative overflow-hidden flex items-center justify-center">
              <Building2 className="w-5 h-5 text-slate-300" />
              <div className="absolute top-2.5 right-3">
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${STATUS_COLORS[project.status]}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-brand-green transition-colors">{project.name}</h3>
                <p className="text-xs text-slate-505 mt-1 font-semibold">{TYPE_LABELS[project.type]}</p>
              </div>

              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{project.city}, {project.state}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-xs">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{project.totalUnits} Unidades en total</span>
                </div>
                {project.deliveryDate && (
                  <div className="flex items-center gap-2 text-slate-600 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Entrega: {new Date(project.deliveryDate).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center relative shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-500">{project.developer?.name?.charAt(0) || 'D'}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 truncate max-w-[120px]">{project.developer?.name || 'Desarrollador'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEdit(project)}
                    className="text-slate-400 hover:text-brand-green transition-colors p-1" 
                    title="Editar proyecto"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto de forma permanente?')) {
                        try {
                          await deleteProject(project.id);
                          fetchProjects();
                        } catch (error) {
                          alert('Error al eliminar proyecto');
                        }
                      }
                    }}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1" 
                    title="Eliminar proyecto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-1" 
                    title="Ver brochure"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <NewProjectModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingProject(null); }} 
        onSuccess={fetchProjects}
        initialData={editingProject}
      />
    </div>
  );
}
