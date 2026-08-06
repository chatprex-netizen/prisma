import { useState, useEffect } from 'react';
import { Plus, MapPin, Building2, Calendar, FileText, Filter, Search, Trash2 } from 'lucide-react';
import { NewProjectModal } from '../components/modals/NewProjectModal';
import { getProjects, deleteProject } from '../lib/api';

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
  MIXTO: 'Mixto',
};

export function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await getProjects();
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Proyectos Inmobiliarios</h1>
          <p className="text-xs text-slate-500 mt-0.5">{projects.length} proyectos registrados</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none bg-brand-green hover:bg-brand-greenHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, ciudad o desarrollador..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Cargando proyectos...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">No hay proyectos registrados.</div>
        ) : projects.map(project => (
          <div key={project.id} className="bg-white rounded-xl border border-slate-200/60 overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col">
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
                <p className="text-xs text-slate-500 mt-1 font-medium">{TYPE_LABELS[project.type]}</p>
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
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center relative">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-500">{project.developer?.name?.charAt(0) || 'D'}</span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-600 truncate max-w-[120px]">{project.developer?.name || 'Desarrollador'}</span>
                </div>
                <div className="flex items-center gap-2">
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
                    className="text-slate-400 hover:text-brand-green transition-colors p-1" 
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
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProjects}
      />
    </div>
  );
}
