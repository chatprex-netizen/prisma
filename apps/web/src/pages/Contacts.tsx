import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, Phone, MoreHorizontal, Eye, Edit3, Trash2, Tag, Star, X, Save, User, Building2, Wallet, Calendar, ClipboardList } from 'lucide-react';
import { NewContactModal } from '../components/modals/NewContactModal';
import { getContacts, deleteContact, updateContact, getProjects, getUsers, getLeadSources } from '../lib/api';

export function Contacts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Split screen and Edit modes
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'personal' | 'commercial' | 'notes'>('personal');
  const [saving, setSaving] = useState(false);

  // Dynamic references
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await getContacts();
      setContacts(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // Load dynamic dropdown data for inline editing
    getProjects().then(res => setProjects(res?.data || [])).catch(console.error);
    getUsers().then(res => setUsers(res?.data || [])).catch(console.error);
    getLeadSources().then(res => setSources(res?.data || [])).catch(console.error);
  }, []);

  const handleOpenNewModal = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const openDetail = (contact: any) => {
    setSelectedContact(contact);
    setEditData({
      ...contact,
      projectOfInterest: contact.interests?.[0] || '',
      assignedUserId: contact.assignedTo || contact.assignedUserId || '',
      tags: Array.isArray(contact.tags) ? contact.tags.join(', ') : contact.tags || ''
    });
    setEditMode(false);
    setActiveTab('personal');
  };

  const handleSave = async () => {
    if (!selectedContact) return;
    setSaving(true);
    try {
      const payload = {
        firstName: editData.firstName,
        lastName: editData.lastName,
        phone: editData.phone,
        email: editData.email,
        type: editData.type || 'LEAD',
        source: editData.source || 'Otro',
        isVip: !!editData.isVip,
        budgetMin: editData.budgetMin ? Number(editData.budgetMin) : null,
        budgetMax: editData.budgetMax ? Number(editData.budgetMax) : null,
        currency: editData.currency || 'USD',
        stage: editData.stage || 'PROSPECCION',
        tags: editData.tags 
          ? editData.tags.split(',').map((t: string) => t.trim()).filter(Boolean) 
          : [],
        interests: editData.projectOfInterest ? [editData.projectOfInterest] : [],
        assignedTo: editData.assignedUserId || null,
        notes: editData.notes || ''
      };

      await updateContact(selectedContact.id, payload);
      await fetchContacts();
      
      // Update selected state locally
      setSelectedContact({
        ...selectedContact,
        ...payload,
        tags: payload.tags,
        interests: payload.interests,
        assignedTo: payload.assignedTo,
        opportunities: selectedContact.opportunities // Preserve nested relations
      });
      setEditMode(false);
    } catch (err) {
      console.error('Error saving contact:', err);
      alert('Error al guardar el contacto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente este contacto?')) return;
    try {
      await deleteContact(id);
      setSelectedContact(null);
      fetchContacts();
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert('Error al eliminar el contacto');
    }
  };

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const nameMatch = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = (c.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = (c.phone || '').includes(searchQuery);

    const matchesSearch = nameMatch || emailMatch || phoneMatch;
    const matchesSource = sourceFilter ? c.source === sourceFilter : true;

    return matchesSearch && matchesSource;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-brand-green" />
            Directorio de Leads y Contactos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestión y registro completo de prospectos ingresados al CRM</p>
        </div>
        <div className="flex flex-row items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..." 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green w-full md:w-64 transition-all"
            />
          </div>
          <button 
            onClick={handleOpenNewModal}
            className="flex bg-brand-green hover:bg-brand-greenHover text-white p-2 md:px-4 md:py-2 rounded-lg text-sm font-medium items-center gap-2 transition-colors shadow-sm shadow-brand-green/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Nuevo Contacto</span>
          </button>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 shrink-0">
        <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Total Contactos</p>
          <p className="text-lg sm:text-2xl font-bold text-slate-900 mt-1">{contacts.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Contactos VIP</p>
          <p className="text-lg sm:text-2xl font-bold text-amber-600 mt-1">{contacts.filter(c => c.isVip).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Con Oportunidad Activa</p>
          <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-1">{contacts.filter(c => c.opportunities && c.opportunities.length > 0).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-sm">
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate font-sans">Origen WhatsApp</p>
          <p className="text-lg sm:text-2xl font-bold text-emerald-600 mt-1">{contacts.filter(c => c.source === 'WHATSAPP' || c.source === 'WhatsApp').length}</p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col md:flex-row gap-4 shrink-0">
        <select 
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-700 cursor-pointer outline-none w-full md:w-48"
        >
          <option value="">Cualquier Origen</option>
          {Array.from(new Set(contacts.map(c => c.source).filter(Boolean))).map((src: any) => (
            <option key={src} value={src}>{src}</option>
          ))}
        </select>
      </div>

      {/* Split Screen Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden min-h-0">
        {/* Contacts Table */}
        <div className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col w-full ${selectedContact ? 'hidden md:flex md:w-1/2' : 'w-full'} transition-all duration-300`}>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-250 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3 hidden md:table-cell">Contacto Info</th>
                  <th className="px-4 py-3 hidden lg:table-cell">Origen</th>
                  <th className="px-4 py-3 hidden xl:table-cell">Presupuesto</th>
                  <th className="px-4 py-3 hidden md:table-cell">Estado / Etapa</th>
                  <th className="px-4 py-3 hidden xl:table-cell">Etiquetas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No se encontraron contactos.
                    </td>
                  </tr>
                ) : filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    onClick={() => openDetail(contact)}
                    className={`cursor-pointer transition-colors group ${selectedContact?.id === contact.id ? 'bg-brand-green/5' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green font-bold text-xs shrink-0 relative">
                          {contact.firstName ? contact.firstName.charAt(0).toUpperCase() : '?'}
                          {contact.isVip && (
                            <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5 border-2 border-white text-white">
                              <Star className="w-2 h-2 fill-current" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors truncate">
                            {contact.firstName} {contact.lastName || ''}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium block truncate md:hidden">{contact.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {contact.phone}
                        </div>
                        {contact.email && (
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {contact.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-[10px] text-brand-green font-bold uppercase tracking-wide px-2 py-0.5 rounded bg-brand-green/10 border border-brand-green/20">
                        {contact.source ? contact.source.replace('_', ' ') : 'Otro'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      {contact.budgetMin ? (
                        <span className="font-semibold text-slate-900 text-xs">
                          {contact.currency === 'EUR' ? '€' : contact.currency === 'PEN' ? 'S/' : '$'} {Number(contact.budgetMin).toLocaleString('es-PE')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {contact.opportunities?.[0]?.stage ? (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border bg-slate-50 text-slate-700 border-slate-200 uppercase">
                          {contact.opportunities[0].stage.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-semibold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">Sin op.</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {contact.tags?.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.2 rounded border border-slate-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 shrink-0">
            <span>Mostrando {filteredContacts.length} de {contacts.length} registrados</span>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedContact && (
          <div className="w-full md:w-1/2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-fade-in">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="min-w-0">
                <h2 className="font-bold text-slate-900 truncate">{selectedContact.firstName} {selectedContact.lastName || ''}</h2>
                <p className="text-xs text-slate-400 truncate">{selectedContact.phone}</p>
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
                      onClick={() => setEditMode(true)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(selectedContact.id)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar
                    </button>
                  </>
                )}
                <button 
                  onClick={() => setSelectedContact(null)} 
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 shrink-0">
              {(['personal', 'commercial', 'notes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === tab ? 'text-brand-green border-b-2 border-brand-green' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {tab === 'personal' ? 'Datos de Contacto' : tab === 'commercial' ? 'Comercial' : 'Notas'}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {activeTab === 'personal' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Nombre" value={editData.firstName} field="firstName" editMode={editMode} onChange={(v) => setEditData({...editData, firstName: v})} />
                    <FieldGroup label="Apellido" value={editData.lastName} field="lastName" editMode={editMode} onChange={(v) => setEditData({...editData, lastName: v})} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FieldGroup label="Teléfono" value={editData.phone} field="phone" editMode={editMode} onChange={(v) => setEditData({...editData, phone: v})} icon={<Phone className="w-3.5 h-3.5 text-slate-400" />} />
                    <FieldGroup label="Email" value={editData.email} field="email" editMode={editMode} onChange={(v) => setEditData({...editData, email: v})} icon={<Mail className="w-3.5 h-3.5 text-slate-400" />} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Tipo de Contacto</label>
                      {editMode ? (
                        <select
                          value={editData.type || 'LEAD'}
                          onChange={e => setEditData({...editData, type: e.target.value})}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                        >
                          <option value="LEAD">Lead / Prospecto</option>
                          <option value="CLIENTE">Cliente Activo</option>
                        </select>
                      ) : (
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${editData.type === 'CLIENTE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>
                          {editData.type || 'LEAD'}
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Origen del Lead</label>
                      {editMode ? (
                        <select
                          value={editData.source || 'Otro'}
                          onChange={e => setEditData({...editData, source: e.target.value})}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                        >
                          {sources.map(src => (
                            <option key={src.id} value={src.name}>{src.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-slate-900 font-semibold">
                          {editData.source || 'Otro'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Asesor Asignado</label>
                    {editMode ? (
                      <select
                        value={editData.assignedUserId || ''}
                        onChange={e => setEditData({...editData, assignedUserId: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      >
                        <option value="">Sin asignar (Libre)</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.firstName} {u.lastName || ''}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-slate-900 font-medium">
                        {users.find(u => u.id === (editData.assignedTo || editData.assignedUserId)) 
                          ? `${users.find(u => u.id === (editData.assignedTo || editData.assignedUserId)).firstName} ${users.find(u => u.id === (editData.assignedTo || editData.assignedUserId)).lastName || ''}`
                          : 'Sin asignar (Libre)'}
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    {editMode ? (
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={!!editData.isVip}
                          onChange={e => setEditData({...editData, isVip: e.target.checked})}
                          className="w-4 h-4 text-brand-green border-slate-300 rounded focus:ring-brand-green/20"
                        />
                        <span className="text-xs font-bold text-slate-700">¿Es Contacto VIP?</span>
                      </label>
                    ) : editData.isVip ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xxs font-bold uppercase">
                        <Star className="w-3 h-3 fill-current text-amber-500" />
                        VIP
                      </span>
                    ) : null}
                  </div>
                </div>
              )}

              {activeTab === 'commercial' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <FieldGroup label="Presupuesto Estimado" value={editData.budgetMin} field="budgetMin" editMode={editMode} onChange={(v) => setEditData({...editData, budgetMin: v})} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Moneda</label>
                      {editMode ? (
                        <select
                          value={editData.currency || 'USD'}
                          onChange={e => setEditData({...editData, currency: e.target.value})}
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="PEN">PEN (S/)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      ) : (
                        <span className="text-sm text-slate-900 font-bold">{editData.currency || 'USD'}</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Proyecto de Interés</label>
                    {editMode ? (
                      <select
                        value={editData.projectOfInterest || ''}
                        onChange={e => setEditData({...editData, projectOfInterest: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      >
                        <option value="">Ninguno específico</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-sm text-slate-900 font-medium">
                        {editData.projectOfInterest || editData.interests?.[0] || 'Ninguno específico'}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Etiquetas (Separadas por comas)</label>
                    {editMode ? (
                      <input 
                        type="text"
                        value={editData.tags || ''}
                        onChange={e => setEditData({...editData, tags: e.target.value})}
                        placeholder="Ej. departamento, miraflores, inversion"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(editData.tags) ? editData.tags : []).length > 0 ? (
                          (Array.isArray(editData.tags) ? editData.tags : []).map((t: string) => (
                            <span key={t} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded border border-slate-200">
                              {t}
                            </span>
                          ))
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Fase del Pipeline Actual</label>
                    {editMode ? (
                      <select
                        value={editData.stage || 'PROSPECCION'}
                        onChange={e => setEditData({...editData, stage: e.target.value})}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 font-semibold"
                      >
                        <option value="PROSPECCION">Prospección</option>
                        <option value="CALIFICACION">Calificación</option>
                        <option value="VISITA">Visita</option>
                        <option value="PROPUESTA">Propuesta</option>
                        <option value="NEGOCIACION">Negociación</option>
                        <option value="CIERRE_GANADO">Ganado</option>
                        <option value="CIERRE_PERDIDO">Perdido</option>
                      </select>
                    ) : (
                      <span className="text-xs font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-250 text-slate-700 inline-block uppercase">
                        {editData.stage || selectedContact.opportunities?.[0]?.stage || 'PROSPECCION'}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Notas de Seguimiento</label>
                  {editMode ? (
                    <textarea 
                      rows={5}
                      value={editData.notes || ''}
                      onChange={e => setEditData({...editData, notes: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 resize-none"
                      placeholder="Escribe comentarios sobre las llamadas, coordinaciones, etc..."
                    />
                  ) : (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {editData.notes || 'Sin notas de seguimiento registradas.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <NewContactModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingContact(null);
        }} 
        initialData={editingContact}
        onSuccess={fetchContacts}
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
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
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
