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
    return (
      c.firstName.toLowerCase().includes(term) ||
      (c.lastName && c.lastName.toLowerCase().includes(term)) ||
      (c.dni && c.dni.includes(term)) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      c.phone.includes(term)
    );
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
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-brand-green" />
            Gestión de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-1">Clientes que ya realizaron una acción comercial (separación, compra, alquiler)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex bg-brand-green hover:bg-brand-greenHover text-white px-4 py-2 rounded-lg text-sm font-medium items-center gap-2 transition-colors shadow-sm shadow-brand-green/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Total Clientes</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{clients.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Con Contrato</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{clients.filter(c => c.buyerContracts && c.buyerContracts.length > 0).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Con DNI</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{clients.filter(c => c.dni).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Casados/Convivientes</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{clients.filter(c => c.maritalStatus === 'CASADO' || c.maritalStatus === 'CONVIVIENTE').length}</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className={`bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden ${selectedClient ? 'w-1/2' : 'w-full'} transition-all`}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <UserCheck className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No hay clientes registrados</p>
              <p className="text-xs mt-1">Los contactos se convierten en clientes al realizar una acción comercial</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500">Cliente</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden md:table-cell">DNI</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Teléfono</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden lg:table-cell">Estado Civil</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 hidden xl:table-cell">Distrito</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(client => (
                    <tr
                      key={client.id}
                      onClick={() => openDetail(client)}
                      className={`border-b border-slate-50 cursor-pointer transition-colors ${selectedClient?.id === client.id ? 'bg-brand-green/5' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green font-bold text-xs shrink-0">
                            {client.firstName[0]}{client.lastName ? client.lastName[0] : ''}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{client.firstName} {client.lastName || ''}</p>
                            <p className="text-xs text-slate-400">{client.email || 'Sin email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 hidden md:table-cell">{client.dni || '—'}</td>
                      <td className="py-3 px-4 text-slate-600 hidden lg:table-cell">{client.phone}</td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        {client.maritalStatus ? (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${client.maritalStatus === 'CASADO' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                            {maritalLabels[client.maritalStatus] || client.maritalStatus}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-600 hidden xl:table-cell">{client.district || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedClient && (
          <div className="w-1/2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-900">{selectedClient.firstName} {selectedClient.lastName || ''}</h2>
                <p className="text-xs text-slate-400">{selectedClient.dni ? `DNI: ${selectedClient.dni}` : 'Sin DNI registrado'}</p>
              </div>
              <div className="flex items-center gap-2">
                {editMode ? (
                  <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-greenHover transition-colors disabled:opacity-50">
                    <Save className="w-3.5 h-3.5" />{saving ? 'Guardando...' : 'Guardar'}
                  </button>
                ) : (
                  <>
                    <button onClick={() => setEditMode(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors">
                      <Edit3 className="w-3.5 h-3.5" />Editar
                    </button>
                    <button onClick={() => handleDelete(selectedClient.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />Eliminar
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedClient(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {(['personal', 'spouse', 'contracts'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-medium transition-colors ${activeTab === tab ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab === 'personal' ? 'Datos Personales' : tab === 'spouse' ? 'Cónyuge' : 'Contratos'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeTab === 'personal' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Nombre" value={editData.firstName} field="firstName" editMode={editMode} onChange={(v) => setEditData({...editData, firstName: v})} />
                    <FieldGroup label="Apellido" value={editData.lastName} field="lastName" editMode={editMode} onChange={(v) => setEditData({...editData, lastName: v})} />
                  </div>
                  <FieldGroup label="DNI" value={editData.dni} field="dni" editMode={editMode} onChange={(v) => setEditData({...editData, dni: v})} icon={<FileText className="w-3.5 h-3.5" />} />
                  <FieldGroup label="Email" value={editData.email} field="email" editMode={editMode} onChange={(v) => setEditData({...editData, email: v})} icon={<Mail className="w-3.5 h-3.5" />} />
                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Teléfono" value={editData.phone} field="phone" editMode={editMode} onChange={(v) => setEditData({...editData, phone: v})} icon={<Phone className="w-3.5 h-3.5" />} />
                    <FieldGroup label="Teléfono 2" value={editData.phone2} field="phone2" editMode={editMode} onChange={(v) => setEditData({...editData, phone2: v})} />
                  </div>
                  <FieldGroup label="Dirección" value={editData.address} field="address" editMode={editMode} onChange={(v) => setEditData({...editData, address: v})} icon={<MapPin className="w-3.5 h-3.5" />} />
                  <div className="grid grid-cols-3 gap-3">
                    <FieldGroup label="Distrito" value={editData.district} field="district" editMode={editMode} onChange={(v) => setEditData({...editData, district: v})} />
                    <FieldGroup label="Ciudad" value={editData.city} field="city" editMode={editMode} onChange={(v) => setEditData({...editData, city: v})} />
                    <FieldGroup label="Departamento" value={editData.department} field="department" editMode={editMode} onChange={(v) => setEditData({...editData, department: v})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Estado Civil</label>
                    {editMode ? (
                      <select
                        value={editData.maritalStatus || ''}
                        onChange={e => setEditData({...editData, maritalStatus: e.target.value as MaritalStatus})}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      >
                        <option value="">Seleccionar...</option>
                        {Object.entries(maritalLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-sm text-slate-900 flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-slate-400" />
                        {editData.maritalStatus ? maritalLabels[editData.maritalStatus] : '—'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'spouse' && (
                <div className="space-y-3">
                  {needsSpouse ? (
                    <>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 mb-4">
                        <p className="text-xs text-purple-700 font-medium">Datos del cónyuge o copropietario(a)</p>
                        <p className="text-xs text-purple-500 mt-0.5">Estos datos serán utilizados en la preparación de documentos legales.</p>
                      </div>
                      <FieldGroup label="Nombre Completo" value={editData.spouseName} field="spouseName" editMode={editMode} onChange={(v) => setEditData({...editData, spouseName: v})} />
                      <FieldGroup label="DNI Cónyuge" value={editData.spouseDni} field="spouseDni" editMode={editMode} onChange={(v) => setEditData({...editData, spouseDni: v})} />
                      <FieldGroup label="Email Cónyuge" value={editData.spouseEmail} field="spouseEmail" editMode={editMode} onChange={(v) => setEditData({...editData, spouseEmail: v})} />
                      <FieldGroup label="Teléfono Cónyuge" value={editData.spousePhone} field="spousePhone" editMode={editMode} onChange={(v) => setEditData({...editData, spousePhone: v})} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <Heart className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm font-medium">Sin cónyuge registrado</p>
                      <p className="text-xs mt-1">Cambia el estado civil a "Casado" o "Conviviente" para habilitar los datos de cónyuge</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contracts' && (
                <div className="space-y-3">
                  {selectedClient.buyerContracts && selectedClient.buyerContracts.length > 0 ? (
                    selectedClient.buyerContracts.map((contract: any) => (
                      <div key={contract.id} className="p-3 border border-slate-100 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{contract.type}</p>
                          <p className="text-xs text-slate-400">#{contract.number}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          contract.status === 'FIRMADO' ? 'bg-emerald-50 text-emerald-600' : 
                          contract.status === 'BORRADOR' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {contract.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <FileText className="w-10 h-10 mb-3 opacity-30" />
                      <p className="text-sm font-medium">Sin contratos</p>
                      <p className="text-xs mt-1">Este cliente aún no tiene contratos asociados</p>
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
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {editMode ? (
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
        />
      ) : (
        <p className="text-sm text-slate-900 flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          {value || '—'}
        </p>
      )}
    </div>
  );
}
