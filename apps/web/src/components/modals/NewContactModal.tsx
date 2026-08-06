import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createContact, updateContact, getProjects, getUsers } from '../../lib/api';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function NewContactModal({ isOpen, onClose, onSuccess, initialData }: NewContactModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    type: 'LEAD',
    source: 'FACEBOOK',
    isVip: false,
    budgetMin: '',
    budgetMax: '',
    currency: 'USD',
    projectOfInterest: '',
    assignedUserId: '',
    tags: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Load real projects and users from the backend
      getProjects().then(res => setProjects(res?.data || [])).catch(console.error);
      getUsers().then(res => setUsers(res?.data || [])).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        type: initialData.type || 'LEAD',
        source: initialData.source || 'FACEBOOK',
        isVip: !!initialData.isVip,
        budgetMin: initialData.budgetMin ? String(initialData.budgetMin) : '',
        budgetMax: initialData.budgetMax ? String(initialData.budgetMax) : '',
        currency: initialData.currency || 'USD',
        projectOfInterest: initialData.projectOfInterest || '',
        assignedUserId: initialData.assignedTo || initialData.assignedUserId || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        type: 'CLIENTE',
        source: 'FACEBOOK',
        isVip: false,
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        projectOfInterest: '',
        assignedUserId: '',
        tags: '',
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.phone) {
      alert('El Nombre y Teléfono son obligatorios');
      return;
    }

    const actionText = initialData ? 'actualizar' : 'guardar';
    if (!window.confirm(`¿Confirmas que deseas ${actionText} este contacto en la base de datos?`)) {
      return;
    }

    try {
      setLoading(true);
      const { currency, projectOfInterest, assignedUserId, ...restOfData } = formData;
      const payload = {
        ...restOfData,
        budgetMin: formData.budgetMin ? Number(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? Number(formData.budgetMax) : null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        interests: formData.projectOfInterest ? [formData.projectOfInterest] : [],
        assignedTo: formData.assignedUserId || null
      };

      if (initialData?.id) {
        await updateContact(initialData.id, payload);
      } else {
        await createContact(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Error al guardar el contacto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">{initialData ? 'Editar Contacto' : 'Nuevo Contacto'}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          
          {/* Row 1: Nombre and Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Nombre *</label>
              <input 
                type="text" 
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                placeholder="Ej. Carlos"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Teléfono *</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+51 999 888 777"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          {/* Row 2: Correo, Origen, and Lead VIP */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="space-y-1 md:col-span-5">
              <label className="block text-[11px] font-medium text-slate-700">Correo Electrónico</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1 md:col-span-5">
              <label className="block text-[11px] font-medium text-slate-700">Origen de Lead *</label>
              <select 
                value={formData.source}
                onChange={e => setFormData({...formData, source: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none">
                <option value="FACEBOOK">Facebook</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="TIK_TOK">Tik Tok</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="GOOGLE_ADS">Google Ads</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>
            <div className="space-y-1 flex items-end pb-2 md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isVip}
                  onChange={e => setFormData({...formData, isVip: e.target.checked})}
                  className="rounded border-slate-300 text-brand-green focus:ring-brand-green/20 w-4 h-4" 
                />
                <span className="text-sm font-medium text-amber-600">VIP 🌟</span>
              </label>
            </div>
          </div>

          <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100 space-y-4">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Detalles Adicionales & Preferencias</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Proyecto de Interés</label>
                <select 
                  value={formData.projectOfInterest}
                  onChange={e => setFormData({...formData, projectOfInterest: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                >
                  <option value="">Ninguno específico</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Asesor Asignado</label>
                <select 
                  value={formData.assignedUserId}
                  onChange={e => setFormData({...formData, assignedUserId: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                >
                  <option value="">Sin asignar (Libre)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName || ''}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Moneda</label>
                <select 
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  translate="no"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white notranslate"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PEN">PEN (S/)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Presupuesto Estimado</label>
                <input 
                  type="number" 
                  value={formData.budgetMin}
                  onChange={e => setFormData({...formData, budgetMin: e.target.value})}
                  placeholder="0"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Etiquetas (Separadas por coma)</label>
              <input 
                type="text" 
                value={formData.tags}
                onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="Ej. departamento, inversion, miraflores"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Notas</label>
            <textarea 
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Información adicional sobre el contacto..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
          >
            {loading ? 'Guardando...' : initialData ? 'Actualizar Contacto' : 'Guardar Contacto'}
          </button>
        </div>
      </div>
    </div>
  );
}
