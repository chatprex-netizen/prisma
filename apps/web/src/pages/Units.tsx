import { useState, useEffect } from 'react';
import { Plus, Search, Filter, BedDouble, Bath, Maximize, Building2, X, Save, Edit3, Trash2, Home, Landmark } from 'lucide-react';
import { NewUnitModal } from '../components/modals/NewUnitModal';
import { getProperties, getProjects, updateProperty, deleteProperty } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  DISPONIBLE: 'bg-emerald-100 text-emerald-700 border border-emerald-200/50',
  SEPARADO: 'bg-blue-100 text-blue-700 border border-blue-200/50',
  RESERVADO: 'bg-purple-100 text-purple-700 border border-purple-200/50',
  VENDIDO: 'bg-amber-100 text-amber-700 border border-amber-200/50',
  ENTREGADO: 'bg-slate-100 text-slate-700 border border-slate-200/50',
};

const TYPE_LABELS: Record<string, string> = {
  DEPARTAMENTO: 'Departamento',
  DUPLEX: 'Dúplex',
  PENTHOUSE: 'Penthouse',
  LOFT: 'Loft',
  OFICINA: 'Oficina',
  LOCAL_COMERCIAL: 'Local Comercial',
  LOTE: 'Lote',
  ESTACIONAMIENTO: 'Estacionamiento',
  DEPOSITO: 'Depósito',
};

export function Units() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [units, setUnits] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Split screen and Edit modes
  const [selectedUnit, setSelectedUnit] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'features' | 'description'>('features');
  const [saving, setSaving] = useState(false);

  // Compact Toolbar States
  const [showSearch, setShowSearch] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await getProperties();
      setUnits(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    getProjects().then(res => setProjects(res?.data || [])).catch(console.error);
  }, []);

  const openDetail = (unit: any) => {
    setSelectedUnit(unit);
    setEditData({
      ...unit,
      projectId: unit.projectId || '',
      price: String(unit.price || ''),
      areaTotal: String(unit.areaTotal || ''),
      bedrooms: String(unit.bedrooms || ''),
      bathrooms: String(unit.bathrooms || ''),
      floor: String(unit.floor || ''),
      parkingSpots: String(unit.parkingSpots || '')
    });
    setEditMode(false);
    setActiveTab('features');
  };

  const handleSave = async () => {
    if (!selectedUnit) return;
    setSaving(true);
    try {
      const payload = {
        unitCode: editData.unitCode,
        projectId: editData.projectId || null,
        type: editData.type,
        status: editData.status,
        price: Number(editData.price),
        areaTotal: editData.areaTotal ? Number(editData.areaTotal) : null,
        bedrooms: editData.bedrooms ? Number(editData.bedrooms) : null,
        bathrooms: editData.bathrooms ? Number(editData.bathrooms) : null,
        floor: editData.floor ? Number(editData.floor) : null,
        parkingSpots: editData.parkingSpots ? Number(editData.parkingSpots) : null,
        description: editData.description || '',
        currency: editData.currency || 'USD'
      };

      await updateProperty(selectedUnit.id, payload);
      await fetchUnits();
      
      setSelectedUnit({
        ...selectedUnit,
        ...payload,
        project: projects.find(p => p.id === payload.projectId)
      });
      setEditMode(false);
    } catch (err) {
      console.error('Error saving unit:', err);
      alert('Error al guardar los cambios de la unidad');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (selectedUnit?.status === 'VENDIDO') {
      const pwd = prompt('🔒 Esta unidad figura como VENDIDA. Ingresa la contraseña de autorización para eliminarla (admin123):');
      if (pwd !== 'admin123') {
        alert('Contraseña incorrecta. No tienes permisos para borrar esta unidad.');
        return;
      }
    }
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta unidad del inventario?')) return;
    try {
      await deleteProperty(id);
      setSelectedUnit(null);
      fetchUnits();
    } catch (err) {
      console.error('Error deleting unit:', err);
      alert('Error al eliminar la unidad');
    }
  };

  // Dynamic filtering
  const filteredUnits = units.filter(unit => {
    const term = searchQuery.toLowerCase();
    const projectMatch = !projectFilter || unit.projectId === projectFilter;
    const statusMatch = !statusFilter || unit.status === statusFilter;
    const typeMatch = !typeFilter || unit.type === typeFilter;

    const price = Number(unit.price || 0);
    const minPriceMatch = !minPrice || price >= Number(minPrice);
    const maxPriceMatch = !maxPrice || price <= Number(maxPrice);
    
    const searchMatch = !searchQuery || (
      unit.unitCode.toLowerCase().includes(term) ||
      (unit.project?.name && unit.project.name.toLowerCase().includes(term)) ||
      (unit.type && unit.type.toLowerCase().includes(term))
    );
    
    return projectMatch && statusMatch && typeMatch && minPriceMatch && maxPriceMatch && searchMatch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 min-h-full flex flex-col bg-slate-50/30 animate-fade-in">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <h1 className="text-sm sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
            Unidades
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block mt-0.5">Inventario general de unidades inmobiliarias</p>
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
            onClick={() => setIsModalOpen(true)}
            className="p-2 rounded-lg bg-brand-green text-white hover:bg-brand-greenHover transition-all shadow-sm shadow-brand-green/10"
            title="Nueva Unidad"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards (Hidden on mobile) */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm text-left">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Total Unidades</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">{units.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm text-left">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Disponibles</p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-600 mt-1">{units.filter(u => u.status === 'DISPONIBLE').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm text-left">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Separados / Reservados</p>
          <p className="text-lg sm:text-2xl font-bold text-purple-600 mt-1">{units.filter(u => u.status === 'SEPARADO' || u.status === 'RESERVADO').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm text-left">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Vendidos</p>
          <p className="text-lg sm:text-2xl font-bold text-amber-600 mt-1">{units.filter(u => u.status === 'VENDIDO').length}</p>
        </div>
      </div>

      {/* Collapsible Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 shrink-0 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Proyecto</label>
            <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Todos los Proyectos</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Estado</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Estado</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="SEPARADO">Separado</option>
              <option value="RESERVADO">Reservado</option>
              <option value="VENDIDO">Vendido</option>
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
            <label className="block text-[10px] font-medium text-slate-500 ">Precio mín ($)</label>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
              placeholder="Ej: 80000"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Precio máx ($)</label>
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              placeholder="Ej: 250000"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none"
            />
          </div>

        </div>
      )}

      {/* Split Screen Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Units Table */}
        <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col w-full ${selectedUnit ? 'hidden md:flex md:w-1/2' : 'w-full'} transition-all duration-300`}>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-[11px] sm:text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-2 py-2.5 sm:px-3 sm:py-3 w-1/3">Descripción / Proyecto</th>
                  <th className="px-2 py-2.5 sm:px-3 sm:py-3">Estado</th>
                  <th className="px-2 py-2.5 sm:px-3 sm:py-3">Moneda y Precio</th>
                  <th className="px-2 py-2.5 sm:px-3 sm:py-3 hidden md:table-cell">Ubicación y Características</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 sm:px-6 sm:py-8 text-center">
                      <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 sm:px-6 sm:py-8 text-center text-slate-400">
                      No se encontraron unidades en el inventario.
                    </td>
                  </tr>
                ) : filteredUnits.map((unit) => (
                  <tr 
                    key={unit.id} 
                    onDoubleClick={() => openDetail(unit)}
                    className={`cursor-pointer transition-colors group ${selectedUnit?.id === unit.id ? 'bg-brand-green/5' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-2 py-2.5 sm:px-3 sm:py-3 max-w-[140px] sm:max-w-[200px]">
                      <div className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors truncate" title={`${TYPE_LABELS[unit.type] || unit.type} ${unit.unitCode}`}>
                        {TYPE_LABELS[unit.type] || unit.type} {unit.unitCode}
                      </div>
                      <div className="text-[10px] text-slate-505 flex items-center gap-1 mt-0.5 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" /> 
                        <span className="truncate">{unit.project?.name || 'Sin proyecto'}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 sm:px-3 sm:py-3">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide inline-block ${STATUS_COLORS[unit.status]}`}>
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 sm:px-3 sm:py-3 font-semibold text-slate-900">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 text-[10px] hidden sm:inline">{unit.currency}</span>
                        <span>{unit.currency === 'USD' ? '$' : unit.currency === 'EUR' ? '€' : 'S/'} {Number(unit.price).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2.5 sm:px-3 sm:py-3 hidden md:table-cell">
                      <div className="flex items-center gap-3 text-slate-505">
                        <div className="flex items-center gap-1" title="Área Total">
                          <Maximize className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs">{unit.areaTotal} m²</span>
                        </div>
                        {Number(unit.bedrooms) > 0 && (
                          <div className="flex items-center gap-1" title="Dormitorios">
                            <BedDouble className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs">{unit.bedrooms}</span>
                          </div>
                        )}
                        {Number(unit.bathrooms) > 0 && (
                          <div className="flex items-center gap-1" title="Baños">
                            <Bath className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs">{unit.bathrooms}</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 shrink-0">
            <span>Mostrando {filteredUnits.length} de {units.length} propiedades</span>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedUnit && (
          <div className="w-full md:w-1/2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-fade-in">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 truncate">Propiedad: {selectedUnit.unitCode}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {selectedUnit.project?.name || 'Sin proyecto'}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {editMode ? (
                  <button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green text-white text-xs font-semibold hover:bg-brand-greenHover transition-colors disabled:opacity-50 shadow-sm shadow-brand-green/20"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        if (selectedUnit.status === 'VENDIDO') {
                          const pwd = prompt('🔒 Esta unidad figura como VENDIDA. Ingresa la contraseña de autorización para editarla (admin123):');
                          if (pwd !== 'admin123') {
                            alert('Contraseña incorrecta. No tienes permisos para editar esta unidad.');
                            return;
                          }
                        }
                        setEditMode(true);
                      }} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedUnit.id)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedUnit(null)} 
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 shrink-0">
              {(['features', 'description'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === tab ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab === 'features' ? 'Características' : 'Descripción y Notas'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-left">
              {activeTab === 'features' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Código de Unidad" value={editData.unitCode} field="unitCode" editMode={editMode} onChange={(v) => setEditData({...editData, unitCode: v})} />
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Proyecto asoc.</label>
                      {editMode ? (
                        <select value={editData.projectId || ''} onChange={e => setEditData({...editData, projectId: e.target.value})}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 cursor-pointer"
                        >
                          <option value="">Selecciona proyecto...</option>
                          {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-slate-900 font-semibold flex items-center gap-1 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {selectedUnit.project?.name || 'Sin proyecto'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de propiedad</label>
                      {editMode ? (
                        <select value={editData.type || 'DEPARTAMENTO'} onChange={e => setEditData({...editData, type: e.target.value})}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 cursor-pointer"
                        >
                          <option value="DEPARTAMENTO">Departamento</option>
                          <option value="DUPLEX">Dúplex</option>
                          <option value="PENTHOUSE">Penthouse</option>
                          <option value="OFICINA">Oficina</option>
                          <option value="LOCAL_COMERCIAL">Local Comercial</option>
                          <option value="LOTE">Lote</option>
                          <option value="ESTACIONAMIENTO">Estacionamiento</option>
                          <option value="DEPOSITO">Depósito</option>
                        </select>
                      ) : (
                        <span className="text-sm text-slate-900 font-semibold inline-block bg-slate-50 px-2 py-0.5 rounded border border-slate-100 mt-1">
                          {TYPE_LABELS[editData.type] || editData.type}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Estado de unidad</label>
                      {editMode ? (
                        <select value={editData.status || 'DISPONIBLE'} onChange={e => setEditData({...editData, status: e.target.value})}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 cursor-pointer"
                        >
                          <option value="DISPONIBLE">Disponible</option>
                          <option value="SEPARADO">Separado</option>
                          <option value="RESERVADO">Reservado</option>
                          <option value="VENDIDO">Vendido</option>
                        </select>
                      ) : (
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide inline-block mt-1 ${STATUS_COLORS[editData.status]}`}>
                          {editData.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <FieldGroup label="Precio" value={editData.price} field="price" editMode={editMode} onChange={(v) => setEditData({...editData, price: v})} icon={<Landmark className="w-3.5 h-3.5 text-slate-400" />} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Moneda</label>
                      {editMode ? (
                        <select value={editData.currency || 'USD'} onChange={e => setEditData({...editData, currency: e.target.value})}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white cursor-pointer"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="PEN">PEN (S/)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      ) : (
                        <span className="text-sm text-slate-900 font-bold block mt-2">{editData.currency || 'USD'}</span>
                      )}
                    </div>
                  </div>

                  <hr className="border-slate-100 my-1" />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FieldGroup label="Área Total (m²)" value={editData.areaTotal} field="areaTotal" editMode={editMode} onChange={(v) => setEditData({...editData, areaTotal: v})} icon={<Maximize className="w-3.5 h-3.5 text-slate-400" />} />
                    <FieldGroup label="Dormitorios" value={editData.bedrooms} field="bedrooms" editMode={editMode} onChange={(v) => setEditData({...editData, bedrooms: v})} icon={<BedDouble className="w-3.5 h-3.5 text-slate-400" />} />
                    <FieldGroup label="Baños" value={editData.bathrooms} field="bathrooms" editMode={editMode} onChange={(v) => setEditData({...editData, bathrooms: v})} icon={<Bath className="w-3.5 h-3.5 text-slate-400" />} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Piso N°" value={editData.floor} field="floor" editMode={editMode} onChange={(v) => setEditData({...editData, floor: v})} />
                    <FieldGroup label="Estacionamientos" value={editData.parkingSpots} field="parkingSpots" editMode={editMode} onChange={(v) => setEditData({...editData, parkingSpots: v})} />
                  </div>
                </div>
              )}

              {activeTab === 'description' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Descripción y notas internas</label>
                  {editMode ? (
                    <textarea rows={6} value={editData.description || ''} onChange={e => setEditData({...editData, description: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 resize-none leading-relaxed"
                      placeholder="Detalles sobre vista, acabados, promociones, notas internas..."
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {editData.description || 'Sin descripción o notas registradas para esta unidad.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <NewUnitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchUnits}
      />
    </div>
  );
}

// Reusable Field Group Component
function FieldGroup({ label, value, field, editMode, onChange, icon }: {
  label: string;
  value?: string;
  field: string;
  editMode: boolean;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      {editMode ? (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
        />
      ) : (
        <p className="text-sm text-slate-900 flex items-center gap-2">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className="truncate">{value || '—'}</span>
        </p>
      )}
    </div>
  );
}
