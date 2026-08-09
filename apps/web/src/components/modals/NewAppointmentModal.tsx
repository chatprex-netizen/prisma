import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createAppointment, updateAppointment, getContacts, getProjects } from '../../lib/api';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function NewAppointmentModal({ isOpen, onClose, onSuccess, initialData }: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    type: 'VISITA_PROYECTO',
    status: 'PENDIENTE',
    startAt: '',
    endAt: '',
    contactId: '',
    projectId: '',
    location: '',
    notes: '',
    agentId: 'user1' // default for now until auth is fully setup
  });

  // Convert ISO date string to datetime-local format (YYYY-MM-DDTHH:MM)
  const formatDateTimeLocal = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (isOpen) {
      getContacts().then(res => setContacts(res.data || [])).catch(console.error);
      getProjects().then(res => setProjects(res.data || [])).catch(console.error);

      if (initialData) {
        setFormData({
          title: initialData.title || '',
          type: initialData.type || 'VISITA_PROYECTO',
          status: initialData.status || 'PENDIENTE',
          startAt: formatDateTimeLocal(initialData.startAt),
          endAt: formatDateTimeLocal(initialData.endAt),
          contactId: initialData.contactId || '',
          projectId: initialData.projectId || '',
          location: initialData.location || '',
          notes: initialData.notes || '',
          agentId: initialData.agentId || 'user1'
        });
      } else {
        setFormData({
          title: '',
          type: 'VISITA_PROYECTO',
          status: 'PENDIENTE',
          startAt: '',
          endAt: '',
          contactId: '',
          projectId: '',
          location: '',
          notes: '',
          agentId: 'user1'
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.title || !formData.startAt || !formData.endAt || !formData.contactId) {
      alert('Título, fechas de inicio y fin, y el contacto son obligatorios');
      return;
    }

    const startDateTime = new Date(formData.startAt);
    const endDateTime = new Date(formData.endAt);
    const now = new Date();

    // Validate past dates (allow 5 min tolerance)
    if (startDateTime < new Date(now.getTime() - 5 * 60 * 1000)) {
      alert('Error: No se pueden agendar citas o tareas en fechas pasadas.');
      return;
    }

    if (endDateTime < startDateTime) {
      alert('Error: La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }

    const confirmMsg = initialData 
      ? '¿Confirmas que deseas guardar los cambios de esta cita?' 
      : '¿Confirmas que deseas agendar esta cita?';
      
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);
      const payload = {
        ...formData,
        startAt: startDateTime.toISOString(),
        endAt: endDateTime.toISOString(),
        projectId: formData.projectId || null
      };

      if (initialData?.id) {
        await updateAppointment(initialData.id, payload);
      } else {
        await createAppointment(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al agendar la cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">{initialData ? 'Editar Cita / Agenda' : 'Nueva Cita / Evento'}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-3.5 flex-1">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Título del evento *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Ej. Visita a Torre Marina con Juan Pérez"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Tipo de evento *</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
              >
                <option value="VISITA_PROYECTO">Visita a Proyecto</option>
                <option value="VISITA_UNIDAD">Visita a Unidad</option>
                <option value="LLAMADA">Llamada</option>
                <option value="REUNION">Reunión</option>
                <option value="PRESENTACION">Presentación</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="COMPLETADA">Completada</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="NO_SHOW">No Show</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Inicio *</label>
              <input type="datetime-local" value={formData.startAt} onChange={e => setFormData({...formData, startAt: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Fin *</label>
              <input type="datetime-local" value={formData.endAt} onChange={e => setFormData({...formData, endAt: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-3.5 p-4 md:p-5 border border-slate-100 rounded-lg bg-slate-50/50">
            <h3 className="text-[11px] font-semibold text-slate-800 uppercase tracking-wider">Detalles de la Cita</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Contacto asignado *</label>
                <select value={formData.contactId} onChange={e => setFormData({...formData, contactId: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
                >
                  <option value="">Seleccionar contacto...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Proyecto de interés</label>
                <select value={formData.projectId} onChange={e => setFormData({...formData, projectId: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
                >
                  <option value="">Ninguno</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Unidad específica</label>
                <select className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none">
                  <option value="">Ninguna</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Ubicación / link</label>
                <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="Ej. Oficina Central o Zoom"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Notas / agenda</label>
            <textarea rows={3} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Temas a tratar durante la reunión..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
          >
            {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Agendar Cita')}
          </button>
        </div>
      </div>
    </div>
  );
}
