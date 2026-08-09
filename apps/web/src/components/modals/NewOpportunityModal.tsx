import { useState } from 'react';
import { X } from 'lucide-react';
import { createOpportunity } from '../../lib/api';

interface NewOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewOpportunityModal({ isOpen, onClose, onSuccess }: NewOpportunityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    contactId: '',
    propertyId: '',
    value: '',
    stage: 'PROSPECCION',
    expectedCloseDate: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.contactId) {
        alert('Título y Contacto son obligatorios');
        return;
      }
      setLoading(true);
      await createOpportunity({
        ...formData,
        value: formData.value ? Number(formData.value) : null,
        propertyId: formData.propertyId || undefined,
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : null
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al crear oportunidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-3.5 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-sm font-semibold text-slate-900">Nueva Oportunidad</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-3.5 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
          <div className="space-y-0.5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Título / nombre de la oportunidad *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="Ej. Venta de Penthouse"
              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Contacto ID *</label>
            <input type="text" value={formData.contactId} onChange={e => setFormData({...formData, contactId: e.target.value})}
              placeholder="UUID del contacto"
              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Propiedad ID (opcional)</label>
            <input type="text" value={formData.propertyId} onChange={e => setFormData({...formData, propertyId: e.target.value})}
              placeholder="UUID de la propiedad"
              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Valor (S/)</label>
              <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})}
                placeholder="Ej. 350000"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Etapa inicial</label>
              <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
              >
                <option value="PROSPECCION">Prospección</option>
                <option value="CALIFICACION">Calificación</option>
                <option value="VISITA">Visita</option>
                <option value="PROPUESTA">Propuesta</option>
                <option value="NEGOCIACION">Negociación</option>
              </select>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Fecha de cierre esperada</label>
            <input type="date" value={formData.expectedCloseDate} onChange={e => setFormData({...formData, expectedCloseDate: e.target.value})}
              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all text-slate-700"
            />
          </div>

          <div className="space-y-0.5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Notas</label>
            <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Detalles adicionales sobre la oportunidad..."
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
            {loading ? 'Creando...' : 'Crear Oportunidad'}
          </button>
        </div>
      </div>
    </div>
  );
}
