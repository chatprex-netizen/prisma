import { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { createDeveloper, updateDeveloper } from '../../lib/api';

interface NewDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function NewDeveloperModal({ isOpen, onClose, onSuccess, initialData }: NewDeveloperModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ruc: '',
    phone: '',
    email: '',
    contactName: '',
    notes: '',
    logo: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        ruc: initialData.ruc || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        contactName: initialData.contactName || '',
        notes: initialData.notes || '',
        logo: initialData.logo || ''
      });
    } else {
      setFormData({
        name: '',
        ruc: '',
        phone: '',
        email: '',
        contactName: '',
        notes: '',
        logo: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert('La Razón Social es obligatoria.');
      return;
    }
    if (!formData.ruc.trim() || formData.ruc.length !== 11) {
      alert('El RUC es obligatorio y debe tener exactamente 11 dígitos.');
      return;
    }

    const actionText = initialData ? 'actualizar' : 'registrar';
    if (!window.confirm(`¿Confirmas que deseas ${actionText} los datos de esta Desarrolladora?`)) {
      return;
    }

    try {
      setLoading(true);
      if (initialData?.id) {
        await updateDeveloper(initialData.id, formData);
      } else {
        await createDeveloper(formData);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Error al guardar la desarrolladora');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">
            {initialData ? 'Editar Desarrolladora' : 'Nueva Desarrolladora'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Avatar / Logo URL */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Logo / URL de Avatar</label>
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <input 
                type="text"
                value={formData.logo}
                onChange={e => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          {/* Razón Social */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Razón Social *</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="Ej. Inmobiliaria Praderas S.A.C."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          {/* RUC */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">RUC *</label>
            <input 
              type="text" 
              maxLength={11}
              value={formData.ruc}
              onChange={e => setFormData({...formData, ruc: e.target.value.replace(/\D/g, '')})}
              placeholder="Ej. 20123456789"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          {/* Contacto & Teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Nombre de Contacto</label>
              <input 
                type="text" 
                value={formData.contactName}
                onChange={e => setFormData({...formData, contactName: e.target.value})}
                placeholder="Ej. Ing. Juan Pérez"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Teléfono</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+51 987 654 321"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Correo Electrónico</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="contacto@inmobiliaria.com"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Notas / Descripción</label>
            <textarea 
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Detalles sobre convenios o acuerdos..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Desarrolladora'}
          </button>
        </div>
      </div>
    </div>
  );
}
