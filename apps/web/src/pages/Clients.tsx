import { useState, useEffect } from 'react';
import { UserCheck, Search, Filter, ChevronDown, ChevronRight, X, Edit3, FileText, Phone, Mail, MapPin, Heart, Save, Plus, Trash2 } from 'lucide-react';
import { getClients, updateClient, deleteClient } from '../lib/api';
import { NewClientModal } from '../components/modals/NewClientModal';

type MaritalStatus = 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO' | 'CONVIVIENTE';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  phone2?: string;
  dni?: string;
  address?: string;
  city?: string;
  district?: string;
  department?: string;
  maritalStatus?: MaritalStatus;
  spouseName?: string;
  spouseDni?: string;
  spouseEmail?: string;
  spousePhone?: string;
  notes?: string;
  createdAt: string;
  buyerContracts?: any[];
  incomes?: any[];
}

const maritalLabels: Record<MaritalStatus, string> = {
  SOLTERO: 'Soltero(a)',
  CASADO: 'Casado(a)',
  DIVORCIADO: 'Divorciado(a)',
  VIUDO: 'Viudo(a)',
  CONVIVIENTE: 'Conviviente',
};

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Client>>({});
  const [activeTab, setActiveTab] = useState<'personal' | 'spouse' | 'contracts'>('personal');
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  
  // Advanced Filters states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [maritalFilter, setMaritalFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [hasContractFilter, setHasContractFilter] = useState('todos');
  const [hasDniFilter, setHasDniFilter] = useState('todos');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const data = await getClients();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = clients.filter(c => {
    const term = search.toLowerCase();
    const matchesSearch = 
      c.firstName.toLowerCase().includes(term) ||
      (c.lastName && c.lastName.toLowerCase().includes(term)) ||
      (c.dni && c.dni.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      c.phone.includes(term);

    const matchesMarital = maritalFilter ? c.maritalStatus === maritalFilter : true;
    const matchesCity = cityFilter ? c.city === cityFilter : true;
    
    const hasContracts = c.buyerContracts && c.buyerContracts.length > 0;
    const matchesContract = hasContractFilter === 'todos' 
      ? true 
      : hasContractFilter === 'si' 
        ? hasContracts 
        : !hasContracts;

    const hasDni = !!c.dni;
    const matchesDni = hasDniFilter === 'todos'
      ? true
      : hasDniFilter === 'si'
        ? hasDni
        : !hasDni;

    return matchesSearch && matchesMarital && matchesCity && matchesContract && matchesDni;
  });

  const openDetail = (client: Client) => {
    setSelectedClient(client);
    setEditData({ ...client });
    setEditMode(false);
    setActiveTab('personal');
  };

  const handleSave = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      await updateClient(selectedClient.id, editData);
      await loadClients();
      // Keep selected client updated
      setSelectedClient({ ...selectedClient, ...editData } as Client);
      setEditMode(false);
    } catch (err) {
      console.error('Error saving client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const pwd = prompt('🔒 Este registro es un CLIENTE. Ingresa la contraseña del supervisor para eliminarlo (admin123):');
    if (pwd !== 'admin123') {
      alert('Contraseña incorrecta. No tienes permisos para borrar este cliente.');
      return;
    }
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente este cliente?')) return;
    try {
      await deleteClient(id);
      setSelectedClient(null);
      loadClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      alert('Error al eliminar el cliente');
    }
  };

  const needsSpouse = editData.maritalStatus === 'CASADO' || editData.maritalStatus === 'CONVIVIENTE';

  return (
    <div className="p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-row justify-between items-center gap-3 shrink-0">
        <div>
          <h1 className="text-sm sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-green" />
            Clientes
          </h1>
          <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">Clientes con acción comercial (separación, compra, alquiler)</p>
        </div>

        {/* Compact Single-Row Action Buttons */}
        <div className="flex flex-row items-center gap-1.5 shrink-0 justify-end">
          {showSearch && (
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-brand-green w-32 sm:w-44 transition-all animate-in fade-in slide-in-from-right-1 duration-200"
              autoFocus
            />
          )}
          
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg border transition-all ${showSearch ? 'border-brand-green text-brand-green bg-brand-green/5' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
            title="Buscar"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-1.5 rounded-lg border transition-all ${showAdvancedFilters ? 'border-brand-green text-brand-green bg-brand-green/5' : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'}`}
            title="Filtros"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 rounded-lg bg-brand-green text-white hover:bg-brand-greenHover transition-all shadow-xs shadow-brand-green/10"
            title="Nuevo Cliente"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats Panel (Hidden on mobile) */}
      <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 shrink-0">
        <div className="bg-white rounded-xl border border-slate-100 p-2.5 sm:p-3 shadow-xs">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Total Clientes</p>
          <p className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-2.5 sm:p-3 shadow-xs">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Con Contrato</p>
          <p className="text-base sm:text-xl font-bold text-emerald-600 mt-0.5">{clients.filter(c => c.buyerContracts && c.buyerContracts.length > 0).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-2.5 sm:p-3 shadow-xs">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Con DNI</p>
          <p className="text-base sm:text-xl font-bold text-blue-600 mt-0.5">{clients.filter(c => c.dni).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-2.5 sm:p-3 shadow-xs">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Casados/Convivientes</p>
          <p className="text-base sm:text-xl font-bold text-purple-600 mt-0.5">{clients.filter(c => c.maritalStatus === 'CASADO' || c.maritalStatus === 'CONVIVIENTE').length}</p>
        </div>
      </div>

      {/* Advanced Collapsible Filter Panel */}
      {showAdvancedFilters && (
        <div className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-3 shadow-2xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 shrink-0 text-left animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="space-y-0.5">
            <label className="block text-[10px] font-medium text-slate-500">Estado civil</label>
            <select value={maritalFilter} onChange={e => setMaritalFilter(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Estado Civil</option>
              {Object.entries(maritalLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] font-medium text-slate-500">Ciudad</label>
            <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="">Cualquier Ciudad</option>
              {Array.from(new Set(clients.map(c => c.city).filter(Boolean))).map((city: any) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] font-medium text-slate-500">Contratos</label>
            <select value={hasContractFilter} onChange={e => setHasContractFilter(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Contratos</option>
              <option value="si">Con Contrato Activo</option>
              <option value="no">Sin Contrato</option>
            </select>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] font-medium text-slate-500">DNI / Documento</label>
            <select value={hasDniFilter} onChange={e => setHasDniFilter(e.target.value)}
              className="w-full px-2 py-1 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:ring-1 focus:ring-brand-green focus:outline-none cursor-pointer"
            >
              <option value="todos">Todos los Documentos</option>
              <option value="si">Con DNI Registrado</option>
              <option value="no">Sin DNI Registrado</option>
            </select>
          </div>

        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3.5 sm:gap-4 items-start">
        {/* Table */}
        <div className={`bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden w-full ${selectedClient ? 'hidden md:block md:w-1/2' : 'w-full'} transition-all duration-300`}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400">
              <UserCheck className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs sm:text-sm font-medium">No hay clientes registrados</p>
              <p className="text-[11px] mt-0.5">Los contactos se convierten en clientes al realizar una acción comercial</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-slate-500">
                      <span className="md:hidden">Documento / Nombre</span>
                      <span className="hidden md:inline">DNI</span>
                    </th>
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-slate-500 hidden md:table-cell">Nombres</th>
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-slate-500">Teléfono / Email</th>
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-slate-500">
                      <span className="md:hidden">Dirección / Ciudad</span>
                      <span className="hidden md:inline">Dirección</span>
                    </th>
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-slate-500 hidden md:table-cell">Ciudad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(client => (
                    <tr
                      key={client.id}
                      onDoubleClick={() => openDetail(client)}
                      className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-brand-green/5' : 'hover:bg-slate-50/80'}`}
                    >
                      <td className="py-1.5 px-3">
                        <div className="md:hidden">
                          <p className="font-medium text-xs text-slate-900 truncate">{client.dni || 'Sin DNI'}</p>
                          <p className="text-[10px] text-slate-500 truncate">{client.firstName} {client.lastName || ''}</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-xs text-slate-600 truncate">{client.dni || '—'}</p>
                        </div>
                      </td>
                      <td className="py-1.5 px-3 hidden md:table-cell">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-[11px] shrink-0">
                            {client.firstName[0]}{client.lastName ? client.lastName[0] : ''}
                          </div>
                          <p className="font-medium text-xs text-slate-900 truncate">{client.firstName} {client.lastName || ''}</p>
                        </div>
                      </td>
                      <td className="py-1.5 px-3">
                        <p className="text-xs text-slate-600 truncate">{client.phone || '—'}</p>
                        <p className="text-[10px] text-slate-400 truncate">{client.email || '—'}</p>
                      </td>
                      <td className="py-1.5 px-3">
                        <div className="md:hidden">
                          <p className="text-xs text-slate-600 truncate">{client.address || '—'}</p>
                          <p className="text-[10px] text-slate-400 truncate">{client.city || '—'}</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-xs text-slate-600 truncate">{client.address || '—'}</p>
                        </div>
                      </td>
                      <td className="py-1.5 px-3 hidden md:table-cell">
                        <p className="text-xs text-slate-600 truncate">{client.city || '—'}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedClient && (
          <div className="w-full md:w-1/2 bg-white rounded-xl border border-slate-100 shadow-xs overflow-hidden flex flex-col animate-fade-in">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-2.5 sm:p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="min-w-0">
                <h2 className="font-bold text-xs sm:text-sm text-slate-900 truncate">{selectedClient.firstName} {selectedClient.lastName || ''}</h2>
                <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{selectedClient.dni ? `DNI: ${selectedClient.dni}` : 'Sin DNI registrado'}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {editMode ? (
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-greenHover transition-colors disabled:opacity-50">
                    <Save className="w-3 h-3" />{saving ? 'Guardando...' : 'Guardar'}
                  </button>
                ) : (
                  <>
                    <button onClick={() => setEditMode(true)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors">
                      <Edit3 className="w-3 h-3" />Editar
                    </button>
                    <button onClick={() => handleDelete(selectedClient.id)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3 h-3" />Eliminar
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedClient(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 shrink-0">
              {(['personal', 'spouse', 'contracts'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-1.5 sm:py-2 text-xs font-medium transition-colors ${activeTab === tab ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab === 'personal' ? 'Datos Personales' : tab === 'spouse' ? 'Cónyuge' : 'Contratos'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5 custom-scrollbar max-h-[calc(100vh-250px)]">
              {activeTab === 'personal' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <FieldGroup label="Nombre" value={editData.firstName} field="firstName" editMode={editMode} onChange={(v) => setEditData({...editData, firstName: v})} />
                    <FieldGroup label="Apellido" value={editData.lastName} field="lastName" editMode={editMode} onChange={(v) => setEditData({...editData, lastName: v})} />
                  </div>
                  <FieldGroup label="DNI" value={editData.dni} field="dni" editMode={editMode} onChange={(v) => setEditData({...editData, dni: v})} icon={<FileText className="w-3 h-3" />} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <FieldGroup label="Teléfono" value={editData.phone} field="phone" editMode={editMode} onChange={(v) => setEditData({...editData, phone: v})} icon={<Phone className="w-3 h-3" />} />
                    <FieldGroup label="Teléfono 2" value={editData.phone2} field="phone2" editMode={editMode} onChange={(v) => setEditData({...editData, phone2: v})} />
                  </div>
                  <FieldGroup label="Email" value={editData.email} field="email" editMode={editMode} onChange={(v) => setEditData({...editData, email: v})} icon={<Mail className="w-3 h-3" />} />
                  <FieldGroup label="Dirección" value={editData.address} field="address" editMode={editMode} onChange={(v) => setEditData({...editData, address: v})} icon={<MapPin className="w-3 h-3" />} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <FieldGroup label="Distrito" value={editData.district} field="district" editMode={editMode} onChange={(v) => setEditData({...editData, district: v})} />
                    <FieldGroup label="Ciudad" value={editData.city} field="city" editMode={editMode} onChange={(v) => setEditData({...editData, city: v})} />
                    <FieldGroup label="Departamento" value={editData.department} field="department" editMode={editMode} onChange={(v) => setEditData({...editData, department: v})} />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 mb-0.5">Estado civil</label>
                    {editMode ? (
                      <select value={editData.maritalStatus || ''} onChange={e => setEditData({...editData, maritalStatus: e.target.value as MaritalStatus})}
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20"
                      >
                        <option value="">Seleccionar...</option>
                        {Object.entries(maritalLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                        <Heart className="w-3 h-3 text-slate-400" />
                        {editData.maritalStatus ? maritalLabels[editData.maritalStatus] : '—'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'spouse' && (
                <div className="space-y-2.5">
                  {needsSpouse ? (
                    <>
                      <div className="p-2 bg-purple-50/80 rounded-lg border border-purple-100 mb-2.5">
                        <p className="text-[11px] text-purple-700 font-medium">Datos del cónyuge o copropietario(a)</p>
                        <p className="text-[10px] text-purple-500 mt-0.5">Estos datos serán utilizados en la preparación de documentos legales.</p>
                      </div>
                      <FieldGroup label="Nombre Completo" value={editData.spouseName} field="spouseName" editMode={editMode} onChange={(v) => setEditData({...editData, spouseName: v})} />
                      <FieldGroup label="DNI Cónyuge" value={editData.spouseDni} field="spouseDni" editMode={editMode} onChange={(v) => setEditData({...editData, spouseDni: v})} />
                      <FieldGroup label="Email Cónyuge" value={editData.spouseEmail} field="spouseEmail" editMode={editMode} onChange={(v) => setEditData({...editData, spouseEmail: v})} />
                      <FieldGroup label="Teléfono Cónyuge" value={editData.spousePhone} field="spousePhone" editMode={editMode} onChange={(v) => setEditData({...editData, spousePhone: v})} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <Heart className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs font-medium">Sin cónyuge registrado</p>
                      <p className="text-[10px] mt-0.5">Cambia el estado civil a "Casado" o "Conviviente" para habilitar los datos de cónyuge</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contracts' && (
                <div className="space-y-2">
                  {selectedClient.buyerContracts && selectedClient.buyerContracts.length > 0 ? (
                    selectedClient.buyerContracts.map((contract: any) => (
                      <div key={contract.id} className="p-2.5 border border-slate-100 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-slate-900">{contract.type}</p>
                          <p className="text-[10px] text-slate-400">#{contract.number}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          contract.status === 'FIRMADO' ? 'bg-emerald-50 text-emerald-600' : 
                          contract.status === 'BORRADOR' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                      <FileText className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-xs font-medium">Sin contratos</p>
                      <p className="text-[10px] mt-0.5">Este cliente aún no tiene contratos asociados</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <NewClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadClients}
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
      <label className="block text-[10px] sm:text-[11px] font-medium text-slate-500 mb-0.5">{label}</label>
      {editMode ? (
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green"
        />
      ) : (
        <p className="text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
          {icon && <span className="text-slate-400">{icon}</span>}
          {value || '—'}
        </p>
      )}
    </div>
  );
}
