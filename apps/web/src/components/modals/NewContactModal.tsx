import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createContact, updateContact, getProjects, getUsers, getLeadSources } from '../../lib/api';

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
  const [sources, setSources] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    type: 'LEAD',
    source: 'Otro',
    isVip: false,
    budgetMin: '',
    budgetMax: '',
    currency: 'USD',
    stage: 'PROSPECCION',
    projectOfInterest: '',
    assignedUserId: '',
    tags: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Load real projects, users, and dynamic lead sources from the backend
      getProjects().then(res => setProjects(res?.data || [])).catch(console.error);
      getUsers().then(res => setUsers(res?.data || [])).catch(console.error);
      getLeadSources().then(res => setSources(res?.data || [])).catch(console.error);
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
        source: initialData.source || 'Otro',
        isVip: !!initialData.isVip,
        budgetMin: initialData.budgetMin ? String(initialData.budgetMin) : '',
        budgetMax: initialData.budgetMax ? String(initialData.budgetMax) : '',
        currency: initialData.currency || 'USD',
        stage: initialData.opportunities?.[0]?.stage || 'PROSPECCION',
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
        type: 'LEAD',
        source: 'Otro',
        isVip: false,
        budgetMin: '',
        budgetMax: '',
        currency: 'USD',
        stage: 'PROSPECCION',
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
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">{initialData ? 'Editar Contacto' : 'Nuevo Contacto'}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {/* Row 1: Nombre, Teléfono and Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Correo Electrónico</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 space-y-3">
            <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Detalles Adicionales & Preferencias</span>
            
            {/* Line 1: Proyecto de Interés, Origen, and Asesor Asignado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                <label className="block text-[11px] font-medium text-slate-700">Origen de Lead *</label>
                <select 
                  value={formData.source}
                  onChange={e => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none">
                  {sources.map(src => (
                    <option key={src.id} value={src.name}>{src.name}</option>
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

            {/* Line 2: Estado según Pipeline, Moneda and Presupuesto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Estado según Pipeline</label>
                <select 
                  value={formData.stage}
                  onChange={e => setFormData({...formData, stage: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white font-semibold"
                >
                  <option value="PROSPECCION">Prospección</option>
                  <option value="CALIFICACION">Calificación</option>
                  <option value="VISITA">Visita</option>
                  <option value="PROPUESTA">Propuesta</option>
                  <option value="NEGOCIACION">Negociación</option>
                  <option value="CIERRE_GANADO">Ganado</option>
                  <option value="CIERRE_PERDIDO">Perdido</option>
                </select>
              </div>
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
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
          >
            {loading ? 'Guardando...' : initialData ? 'Actualizar Contacto' : 'Guardar Contacto'}
          </button>
        </div>
      </div>
    </div>
  );
}
