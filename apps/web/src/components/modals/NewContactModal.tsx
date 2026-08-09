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
    notes: '',
    dni: '',
    address: '',
    city: '',
    district: '',
    department: '',
    maritalStatus: 'SOLTERO',
    spouseName: '',
    spouseDni: '',
    spouseEmail: '',
    spousePhone: ''
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
        projectOfInterest: initialData.projectOfInterest || initialData.interests?.[0] || '',
        assignedUserId: initialData.assignedTo || initialData.assignedUserId || '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
        notes: initialData.notes || '',
        dni: initialData.dni || '',
        address: initialData.address || '',
        city: initialData.city || '',
        district: initialData.district || '',
        department: initialData.department || '',
        maritalStatus: initialData.maritalStatus || 'SOLTERO',
        spouseName: initialData.spouseName || '',
        spouseDni: initialData.spouseDni || '',
        spouseEmail: initialData.spouseEmail || '',
        spousePhone: initialData.spousePhone || ''
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
        notes: '',
        dni: '',
        address: '',
        city: '',
        district: '',
        department: '',
        maritalStatus: 'SOLTERO',
        spouseName: '',
        spouseDni: '',
        spouseEmail: '',
        spousePhone: ''
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
      const { projectOfInterest, assignedUserId, ...restOfData } = formData;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-3.5 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-sm font-semibold text-slate-900">{initialData ? 'Editar Contacto' : 'Nuevo Contacto'}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-3.5 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
          {/* Row 1: Nombre, Apellido, Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Nombre *</label>
              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                placeholder="Ej. Carlos"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Apellido</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                placeholder="Ej. Mendoza"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Tipo de contacto</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
              >
                <option value="LEAD">Lead</option>
                <option value="CLIENTE">Cliente</option>
              </select>
            </div>
          </div>

          {/* Row 2: Teléfono, Email, VIP */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Teléfono *</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+51 999 888 777"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Correo electrónico</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="correo@ejemplo.com"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="flex items-center pt-4 pl-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={formData.isVip} onChange={e => setFormData({...formData, isVip: e.target.checked})}
                  className="w-3.5 h-3.5 text-brand-green border-slate-300 rounded focus:ring-brand-green/20"
                />
                <span className="text-[11px] font-semibold text-slate-700">¿Es Cliente VIP?</span>
              </label>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50/50 rounded-lg border border-slate-100 space-y-2">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block uppercase tracking-wider">Detalles Adicionales & Preferencias</span>
            
            {/* Line 1: Proyecto de Interés, Origen, and Asesor Asignado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
              <div className="space-y-0.5">
                <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Proyecto de interés</label>
                <select value={formData.projectOfInterest} onChange={e => setFormData({...formData, projectOfInterest: e.target.value})}
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                >
                  <option value="">Ninguno específico</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Origen de lead *</label>
                <select value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
                >
                  {sources.map(src => (
                    <option key={src.id} value={src.name}>{src.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Asesor asignado</label>
                <select value={formData.assignedUserId} onChange={e => setFormData({...formData, assignedUserId: e.target.value})}
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                >
                  <option value="">Sin asignar (Libre)</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName || ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Line 2: Estado según Pipeline, Moneda and Presupuesto */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
              <div className="space-y-0.5">
                <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Estado según pipeline</label>
                <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white font-semibold"
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
              <div className="space-y-0.5">
                <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Moneda</label>
                <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}
                  translate="no"
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white notranslate"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PEN">PEN (S/)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="space-y-0.5">
                <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Presupuesto estimado</label>
                <input type="number" value={formData.budgetMin} onChange={e => setFormData({...formData, budgetMin: e.target.value})}
                  placeholder="0"
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
                />
              </div>
            </div>
            
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Etiquetas (separadas por coma)</label>
              <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})}
                placeholder="Ej. departamento, inversion, miraflores"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-white"
              />
            </div>
          </div>

          {/* Client Specific Fields in Modal */}
          {formData.type === 'CLIENTE' && (
            <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 space-y-2 pt-2 text-left animate-slide-down">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 block uppercase tracking-wider">Datos de Cliente / Facturación</span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                <div className="space-y-0.5">
                  <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">DNI / Documento</label>
                  <input type="text" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})}
                    placeholder="Ej. 12345678"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Dirección</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    placeholder="Av. Larco 456"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
                <div className="space-y-0.5">
                  <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Ciudad</label>
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                    placeholder="Ej. Lima"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Distrito</label>
                  <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}
                    placeholder="Ej. Miraflores"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Región/Dpto</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                    placeholder="Ej. Lima"
                    className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Estado civil</label>
                <select value={formData.maritalStatus} onChange={e => setFormData({...formData, maritalStatus: e.target.value})}
                  className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
                >
                  <option value="SOLTERO">Soltero(a)</option>
                  <option value="CASADO">Casado(a)</option>
                  <option value="DIVORCIADO">Divorciado(a)</option>
                  <option value="VIUDO">Viudo(a)</option>
                  <option value="CONVIVIENTE">Conviviente</option>
                </select>
              </div>

              {(formData.maritalStatus === 'CASADO' || formData.maritalStatus === 'CONVIVIENTE') && (
                <div className="border border-slate-200 rounded-lg p-2.5 bg-white space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 block">Datos del Cónyuge</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-medium text-slate-700">Nombre completo</label>
                      <input type="text" value={formData.spouseName} onChange={e => setFormData({...formData, spouseName: e.target.value})}
                        placeholder="Ej. María López"
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-medium text-slate-700">DNI cónyuge</label>
                      <input type="text" value={formData.spouseDni} onChange={e => setFormData({...formData, spouseDni: e.target.value})}
                        placeholder="Ej. 87654321"
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-medium text-slate-700">Teléfono</label>
                      <input type="text" value={formData.spousePhone} onChange={e => setFormData({...formData, spousePhone: e.target.value})}
                        placeholder="Ej. 912345678"
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <label className="block text-[10px] font-medium text-slate-700">Email</label>
                      <input type="email" value={formData.spouseEmail} onChange={e => setFormData({...formData, spouseEmail: e.target.value})}
                        placeholder="maria@correo.com"
                        className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-0.5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Notas</label>
            <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Información adicional sobre el contacto..."
              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1 rounded-lg bg-brand-green text-white text-xs font-medium hover:bg-brand-greenHover transition-colors shadow-xs shadow-brand-green/20"
          >
            {loading ? 'Guardando...' : initialData ? 'Actualizar Contacto' : 'Guardar Contacto'}
          </button>
        </div>
      </div>
    </div>
  );
}
