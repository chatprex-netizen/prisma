import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Mail, Phone, MoreHorizontal, Eye, Edit2, Trash2, Tag, Star } from 'lucide-react';
import { NewContactModal } from '../components/modals/NewContactModal';
import { getContacts, deleteContact } from '../lib/api';

export function Contacts() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleOpenNewModal = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: any) => {
    setEditingContact(contact);
    setIsModalOpen(true);
    setActiveMenu(null);
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Directorio de Leads y Clientes</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestión y registro completo de prospectos ingresados al CRM</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button 
            onClick={handleOpenNewModal}
            className="flex-1 md:flex-none bg-brand-green hover:bg-brand-greenHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Nuevo Contacto
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
            placeholder="Buscar por nombre, correo o teléfono..." 
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
          />
        </div>
        <select 
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green text-slate-700 cursor-pointer outline-none"
        >
          <option value="">Cualquier Origen</option>
          <option value="FACEBOOK">Facebook</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="TIK_TOK">Tik Tok</option>
          <option value="GOOGLE_ADS">Google Ads</option>
          <option value="OTRO">Otro</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nombre Completo</th>
                <th className="px-6 py-4">Información de Contacto</th>
                <th className="px-6 py-4">Origen</th>
                <th className="px-6 py-4">Etiquetas</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Cargando contactos...
                  </td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron contactos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green font-bold text-xs shrink-0 relative">
                        {contact.firstName ? contact.firstName.charAt(0).toUpperCase() : '?'}
                        {contact.isVip && (
                          <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5 border-2 border-white text-white">
                            <Star className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors">
                          {contact.firstName} {contact.lastName || ''}
                        </div>
                        {contact.notes && (
                          <div className="text-xs text-slate-400 truncate max-w-xs">{contact.notes}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600 text-xs">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {contact.phone}
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2 text-slate-600 text-xs">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {contact.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className="text-[10px] text-brand-green font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-brand-green/10">
                        {contact.source ? contact.source.replace('_', ' ') : 'Desconocido'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {contact.tags?.map((tag: string) => (
                        <span key={tag} className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-md border border-slate-200/60">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === contact.id ? null : contact.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                    
                    {/* Acciones Dropdown */}
                    {activeMenu === contact.id && (
                      <div className="absolute right-6 top-10 w-36 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1 flex flex-col text-left">
                        <button 
                          onClick={() => handleOpenEditModal(contact)}
                          className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 w-full text-left"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          Editar
                        </button>
                        <div className="h-px bg-slate-100 my-1"></div>
                        <button 
                          onClick={async () => {
                            if (window.confirm(`¿Estás seguro de que deseas eliminar a "${contact.firstName}" de forma permanente?`)) {
                              try {
                                await deleteContact(contact.id);
                                fetchContacts();
                              } catch (error) {
                                alert('Error al eliminar contacto');
                              }
                            }
                            setActiveMenu(null);
                          }}
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
        
        {/* Pagination Footer */}
        <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50">
          <span>Mostrando {filteredContacts.length} de {contacts.length} contactos registrados</span>
        </div>
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
