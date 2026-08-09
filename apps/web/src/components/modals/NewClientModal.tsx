import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClient } from '../../lib/api';

interface NewClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewClientModal({ isOpen, onClose, onSuccess }: NewClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dni: '',
    address: '',
    city: '',
    district: '',
    department: '',
    maritalStatus: 'SOLTERO',
    spouseName: '',
    spouseDni: '',
    spouseEmail: '',
    spousePhone: '',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        dni: '',
        address: '',
        city: '',
        district: '',
        department: '',
        maritalStatus: 'SOLTERO',
        spouseName: '',
        spouseDni: '',
        spouseEmail: '',
        spousePhone: '',
        notes: ''
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.firstName.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!formData.phone.trim()) {
      alert('El teléfono es obligatorio');
      return;
    }

    if (!window.confirm('¿Confirmas que deseas guardar este cliente?')) {
      return;
    }

    try {
      setLoading(true);
      await createClient(formData);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  const needsSpouse = formData.maritalStatus === 'CASADO' || formData.maritalStatus === 'CONVIVIENTE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-3.5 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-sm font-semibold text-slate-900">Nuevo Cliente</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-full transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 sm:p-3.5 overflow-y-auto space-y-2 flex-1 custom-scrollbar">
          {/* Row 1: Nombre and Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Nombre *</label>
              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                placeholder="Ej. Juan"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Apellido</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                placeholder="Ej. Pérez"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          {/* Row 2: Teléfono, Email and DNI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Teléfono *</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="Ej. 987654321"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">DNI / RUC</label>
              <input type="text" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})}
                placeholder="Ej. 12345678"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="juan@correo.com"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          {/* Row 3: Dirección */}
          <div className="space-y-0.5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Dirección</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Av. Larco 456"
              className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          {/* Row 4: Ubicación (Ciudad, Distrito, Departamento) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Ciudad</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                placeholder="Ej. Lima"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Distrito</label>
              <input type="text" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}
                placeholder="Ej. Miraflores"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-0.5">
              <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Región/Dpto</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                placeholder="Ej. Lima"
                className="w-full px-2.5 py-1 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          {/* Row 5: Estado Civil */}
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

          {/* Cónyuge Fields (if Married/Cohabitating) */}
          {needsSpouse && (
            <div className="border border-slate-100 rounded-lg p-2.5 bg-slate-50/50 space-y-2 animate-slide-down">
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

          {/* Row 6: Notas */}
          <div className="space-y-0.5">
            <label className="block text-[10px] sm:text-[11px] font-medium text-slate-700">Notas / comentarios</label>
            <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Detalles adicionales del cliente..."
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
            {loading ? 'Guardando...' : 'Crear Cliente'}
          </button>
        </div>
      </div>
    </div>
  );
}
