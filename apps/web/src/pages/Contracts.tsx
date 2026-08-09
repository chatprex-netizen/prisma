import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileSignature, MoreHorizontal, Eye, Download, Send, Trash2, CalendarDays } from 'lucide-react';
import { NewContractModal } from '../components/modals/NewContractModal';
import { getContracts, deleteContract } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  ENVIADO: 'bg-blue-100 text-blue-700',
  FIRMADO: 'bg-emerald-100 text-emerald-700',
  PAGADO: 'bg-purple-100 text-purple-700',
  CANCELADO: 'bg-red-100 text-red-700',
};

const TYPE_LABELS: Record<string, string> = {
  SEPARACION: 'Separación',
  RESERVA: 'Reserva',
  COMPRAVENTA: 'Compraventa',
  ALQUILER: 'Alquiler',
  PROMESA: 'Promesa',
};

export function Contracts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Compact Toolbar States
  const [showSearch, setShowSearch] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchContractsData = async () => {
    try {
      setLoading(true);
      const res = await getContracts();
      if (res.data) {
        setContracts(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractsData();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este contrato de forma permanente?')) {
      try {
        await deleteContract(id);
        fetchContractsData();
      } catch (error) {
        alert('Error al eliminar contrato');
      }
    }
    setActiveMenu(null);
  };

  // Dynamic filter logic
  const filteredContracts = contracts.filter((c) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || (
      c.number.toLowerCase().includes(term) ||
      (c.buyer && `${c.buyer.firstName} ${c.buyer.lastName || ''}`.toLowerCase().includes(term)) ||
      (c.property && c.property.unitCode.toLowerCase().includes(term)) ||
      (c.property && c.property.title.toLowerCase().includes(term))
    );

    const matchesType = !typeFilter || c.type === typeFilter;
    const matchesStatus = !statusFilter || c.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 min-h-full flex flex-col bg-slate-50/30 animate-fade-in">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <h1 className="text-sm sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <FileSignature className="w-5 h-5 sm:w-6 sm:h-6 text-brand-green" />
            Contratos
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block mt-0.5">Control de documentos y acuerdos legales</p>
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
            title="Nuevo Contrato"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Advanced Filters */}
      {showAdvancedFilters && (
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 shrink-0 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Tipo de contrato</label>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Tipo</option>
              <option value="SEPARACION">Separación</option>
              <option value="RESERVA">Reserva</option>
              <option value="COMPRAVENTA">Compraventa</option>
              <option value="ALQUILER">Alquiler</option>
              <option value="PROMESA">Promesa</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-500 ">Estado del contrato</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Estado</option>
              <option value="BORRADOR">Borrador</option>
              <option value="ENVIADO">Enviado</option>
              <option value="FIRMADO">Firmado</option>
              <option value="PAGADO">Pagado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-[11px] sm:text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-550 font-medium border-b border-slate-200">
              <tr>
                <th className="px-3 py-2.5 sm:px-6 sm:py-4">N° Documento / Propiedad</th>
                <th className="px-3 py-2.5 sm:px-6 sm:py-4 hidden sm:table-cell">Tipo</th>
                <th className="px-3 py-2.5 sm:px-6 sm:py-4 hidden md:table-cell">Comprador</th>
                <th className="px-3 py-2.5 sm:px-6 sm:py-4">Monto</th>
                <th className="px-3 py-2.5 sm:px-6 sm:py-4">Estado</th>
                <th className="px-3 py-2.5 sm:px-6 sm:py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 sm:px-6 sm:py-8 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 sm:px-6 sm:py-8 text-center text-slate-400 font-medium">
                    No hay contratos registrados.
                  </td>
                </tr>
              ) : filteredContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-3 py-2.5 sm:px-6 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <FileSignature className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors">
                          {contract.number}
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
                          {contract.property ? `${contract.property.title} (${contract.property.unitCode})` : 'Sin propiedad'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 sm:px-6 sm:py-4 hidden sm:table-cell">
                    <span className="text-slate-700 font-medium">{TYPE_LABELS[contract.type]}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(contract.createdAt).toLocaleDateString('es-PE')}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 sm:px-6 sm:py-4 hidden md:table-cell">
                    <div className="font-medium text-slate-800">
                      {contract.buyer ? `${contract.buyer.firstName} ${contract.buyer.lastName || ''}`.trim() : 'Desconocido'}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 sm:px-6 sm:py-4">
                    <div className="font-bold text-slate-900">
                      {contract.currency === 'PEN' ? 'S/' : '$'} {contract.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 sm:px-6 sm:py-4">
                    <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold uppercase tracking-wide inline-block ${STATUS_COLORS[contract.status]}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-6 sm:py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === contract.id ? null : contract.id)}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    
                    {/* Acciones Dropdown */}
                    {activeMenu === contract.id && (
                      <div className="absolute right-6 top-10 w-44 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1 flex flex-col text-left">
                        <button className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          Ver / Editar
                        </button>
                        <button className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Download className="w-3.5 h-3.5 text-slate-400" />
                          Descargar PDF
                        </button>
                        <button className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                          <Send className="w-3.5 h-3.5 text-slate-400" />
                          Enviar por Correo
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                          onClick={() => handleDelete(contract.id)}
                          className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 w-full text-left"
                        >
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
          <span>Mostrando {filteredContracts.length} de {contracts.length} contratos</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded hover:bg-slate-200/50 transition-colors" disabled>Anterior</button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 font-medium text-brand-green shadow-sm">1</button>
            <button className="px-2 py-1 rounded hover:bg-slate-200/50 transition-colors">Siguiente</button>
          </div>
        </div>
      </div>

      <NewContractModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchContractsData}
      />
    </div>
  );
}
