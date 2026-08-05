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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Gestión de Contratos</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control de documentos y acuerdos legales</p>
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
            Nuevo Contrato
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por número, comprador o propiedad..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          />
        </div>
        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-700 cursor-pointer outline-none">
          <option value="">Cualquier Tipo</option>
          <option value="SEPARACION">Separación</option>
          <option value="COMPRAVENTA">Compraventa</option>
          <option value="ALQUILER">Alquiler</option>
        </select>
        <select className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-700 cursor-pointer outline-none">
          <option value="">Cualquier Estado</option>
          <option value="BORRADOR">Borrador</option>
          <option value="ENVIADO">Enviado</option>
          <option value="FIRMADO">Firmado</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">N° Documento / Propiedad</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Monto</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Cargando contratos...
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No hay contratos registrados.
                  </td>
                </tr>
              ) : contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        <FileSignature className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors">
                          {contract.number}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {contract.property ? `${contract.property.title} (${contract.property.unitCode})` : 'Sin propiedad'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-700 font-medium">{TYPE_LABELS[contract.type]}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      {new Date(contract.createdAt).toLocaleDateString('es-PE')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">
                      {contract.buyer ? `${contract.buyer.firstName} ${contract.buyer.lastName}` : 'Desconocido'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">
                      {contract.currency === 'PEN' ? 'S/' : '$'} {contract.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide inline-block ${STATUS_COLORS[contract.status]}`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === contract.id ? null : contract.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
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
          <span>Mostrando 3 de 45 contratos</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 rounded hover:bg-slate-200/50 transition-colors" disabled>Anterior</button>
            <button className="px-2 py-1 rounded bg-white border border-slate-200 font-medium text-brand-green shadow-sm">1</button>
            <button className="px-2 py-1 rounded hover:bg-slate-200/50 transition-colors">2</button>
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
