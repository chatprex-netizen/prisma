import { useState } from 'react';
import { X } from 'lucide-react';
import { createTransaction } from '../../lib/api';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewTransactionModal({ isOpen, onClose, onSuccess }: NewTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'INCOME',
    title: '',
    amount: '',
    currency: 'USD',
    projectId: '',
    propertyId: '',
    status: 'COMPLETED'
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.title || !formData.amount) {
        alert('Descripción y Monto son obligatorios');
        return;
      }
      setLoading(true);
      await createTransaction({
        ...formData,
        amount: Number(formData.amount),
        projectId: formData.projectId || undefined,
        propertyId: formData.propertyId || undefined,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al crear transacción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-[95vw] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Nueva Transacción</h2>
            <p className="text-xs text-slate-500 mt-0.5">Registra un nuevo ingreso o egreso</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 md:p-5 overflow-y-auto custom-scrollbar flex-1">
          <form id="tx-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Tipo de Transacción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="relative cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="INCOME" 
                  className="peer sr-only" 
                  checked={formData.type === 'INCOME'}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                />
                <div className="w-full text-center p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 peer-checked:border-brand-green peer-checked:bg-brand-green/10 peer-checked:text-brand-green transition-all">
                  Ingreso (+)
                </div>
              </label>
              <label className="relative cursor-pointer">
                <input 
                  type="radio" 
                  name="type" 
                  value="EXPENSE" 
                  className="peer sr-only" 
                  checked={formData.type === 'EXPENSE'}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                />
                <div className="w-full text-center p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 peer-checked:border-red-500 peer-checked:bg-red-50 peer-checked:text-red-600 transition-all">
                  Egreso (-)
                </div>
              </label>
            </div>

            {/* Detalles */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">Descripción *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" 
                  placeholder="Ej: Pago Inicial de Reserva" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-slate-700">Monto y Moneda *</label>
                  <div className="flex gap-2">
                    <select 
                      value={formData.currency}
                      onChange={e => setFormData({...formData, currency: e.target.value})}
                      className="w-24 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-slate-50 text-slate-700"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="PEN">PEN (S/)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                    <input 
                      type="number" 
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" 
                      placeholder="0.00" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Asociaciones */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wider">Asociar a (Opcional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-700">Proyecto ID</label>
                    <input 
                      type="text"
                      value={formData.projectId}
                      onChange={e => setFormData({...formData, projectId: e.target.value})}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white" 
                      placeholder="UUID del proyecto"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-medium text-slate-700">Unidad ID</label>
                    <input 
                      type="text"
                      value={formData.propertyId}
                      onChange={e => setFormData({...formData, propertyId: e.target.value})}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white" 
                      placeholder="UUID de la unidad"
                    />
                  </div>
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-medium text-slate-700">Estado</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-white"
                >
                  <option value="COMPLETED">Completado</option>
                  <option value="PENDING">Pendiente</option>
                </select>
              </div>

            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50/50">
          <button 
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="tx-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-green hover:bg-brand-greenHover rounded-lg transition-colors shadow-sm shadow-brand-green/20"
          >
            {loading ? 'Guardando...' : 'Guardar Transacción'}
          </button>
        </div>
      </div>
    </div>
  );
}
