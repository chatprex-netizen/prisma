import { useState, useEffect } from 'react';
import { Plus, Search, Filter, BedDouble, Bath, Maximize, Building2, MoreHorizontal, Eye, Edit2, Trash2 } from 'lucide-react';
import { NewUnitModal } from '../components/modals/NewUnitModal';
import { getProperties } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  DISPONIBLE: 'bg-emerald-100 text-emerald-700',
  SEPARADO: 'bg-blue-100 text-blue-700',
  RESERVADO: 'bg-purple-100 text-purple-700',
  VENDIDO: 'bg-amber-100 text-amber-700',
  ENTREGADO: 'bg-slate-100 text-slate-700',
};

const TYPE_LABELS: Record<string, string> = {
  DEPARTAMENTO: 'Dpto.',
  DUPLEX: 'Dúplex',
  PENTHOUSE: 'Penthouse',
  LOFT: 'Loft',
  OFICINA: 'Oficina',
  LOCAL_COMERCIAL: 'Local',
  LOTE: 'Lote',
  ESTACIONAMIENTO: 'Cochera',
  DEPOSITO: 'Depósito',
};

export function Units() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await getProperties();
      setUnits(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Unidades y Propiedades</h1>
          <p className="text-xs text-slate-500 mt-0.5">Inventario general de unidades</p>
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
            Nueva Unidad
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por código, tipo o proyecto..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          />
        </div>
        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-700 cursor-pointer outline-none">
          <option value="">Todos los Proyectos</option>
          <option value="1">Torre Marina</option>
          <option value="2">Los Cedros</option>
        </select>
        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-700 cursor-pointer outline-none">
          <option value="">Cualquier Estado</option>
          <option value="DISPONIBLE">Disponible</option>
          <option value="SEPARADO">Separado</option>
          <option value="VENDIDO">Vendido</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Código / Proyecto</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Características</th>
                <th className="px-6 py-4">Precio (S/)</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Cargando unidades...</td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No hay unidades registradas.</td>
                </tr>
              ) : units.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors">{unit.unitCode}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3 h-3" /> {unit.project?.name || 'Sin proyecto'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 font-medium">{TYPE_LABELS[unit.type]}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-slate-500">
                      <div className="flex items-center gap-1.5" title="Área Total">
                        <Maximize className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs">{unit.areaTotal} m²</span>
                      </div>
                      {unit.bedrooms > 0 && (
                        <div className="flex items-center gap-1.5" title="Dormitorios">
                          <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{unit.bedrooms}</span>
                        </div>
                      )}
                      {unit.bathrooms > 0 && (
                        <div className="flex items-center gap-1.5" title="Baños">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{unit.bathrooms}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    S/ {Number(unit.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide inline-block ${STATUS_COLORS[unit.status]}`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === unit.id ? null : unit.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {/* Acciones Dropdown */}
                    {activeMenu === unit.id && (
                      <div className="absolute right-6 top-10 w-36 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1 flex flex-col text-left">
                        <button className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          Ver Detalle
                        </button>
                        <button className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          Editar
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>Mostrando 5 de 240 unidades</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded hover:bg-slate-200/50 transition-colors" disabled>Anterior</button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 font-medium text-brand-green shadow-sm">1</button>
            <button className="px-2 py-1 rounded hover:bg-slate-200/50 transition-colors">2</button>
            <button className="px-2 py-1 rounded hover:bg-slate-200/50 transition-colors">3</button>
            <button className="px-2 py-1 rounded hover:bg-slate-200/50 transition-colors">Siguiente</button>
          </div>
        </div>
      </div>

      <NewUnitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUnits}
      />
    </div>
  );
}
