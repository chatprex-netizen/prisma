import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, User, Building } from 'lucide-react';
import { createIncome, getContacts, getProjects, getProperties } from '../../lib/api';

interface NewIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewIncomeModal({ isOpen, onClose, onSuccess }: NewIncomeModalProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    description: '',
    type: 'VENTA_PROPIEDAD',
    amount: '',
    currency: 'PEN',
    date: new Date().toISOString().substring(0, 10),
    contactId: '',
    projectId: '',
    propertyId: '',
    paymentMethod: 'TRANSFERENCIA',
    status: 'PENDIENTE',
  });

  useEffect(() => {
    if (isOpen) {
      // Load dropdown datasets
      Promise.all([
        getContacts().catch(() => ({ data: [] })),
        getProjects().catch(() => ({ data: [] })),
        getProperties().catch(() => ({ data: [] }))
      ]).then(([cRes, pRes, propRes]) => {
        setContacts(cRes?.data || []);
        setProjects(pRes?.data || []);
        setProperties(propRes?.data || []);
      });

      setFormData({
        description: '',
        type: 'VENTA_PROPIEDAD',
        amount: '',
        currency: 'PEN',
        date: new Date().toISOString().substring(0, 10),
        contactId: '',
        projectId: '',
        propertyId: '',
        paymentMethod: 'TRANSFERENCIA',
        status: 'PENDIENTE',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.date) {
      alert('La descripción, monto y fecha son obligatorios');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        contactId: formData.contactId || null,
        projectId: formData.projectId || null,
        propertyId: formData.propertyId || null,
        date: new Date(formData.date).toISOString(),
      };

      await createIncome(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al crear el ingreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">Registrar Nuevo Ingreso</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 space-y-4 flex-1 custom-scrollbar">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Descripción *</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Ej. Cobro de separación departamento 402"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Monto *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Moneda</label>
              <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="PEN">Soles (S/)</option>
                <option value="USD">Dólares ($)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Tipo de Ingreso</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="VENTA_PROPIEDAD">Venta de Propiedad</option>
                <option value="COMISION_PROYECTO">Comisión de Proyecto</option>
                <option value="BONO">Bono</option>
                <option value="ALQUILER">Alquiler</option>
                <option value="SEPARACION">Separación</option>
                <option value="RESERVA">Reserva</option>
                <option value="CUOTA">Cuota</option>
                <option value="INTERESES">Intereses</option>
                <option value="OTROS">Otros</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Fecha *</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Método de Pago</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="CHEQUE">Cheque</option>
                <option value="TARJETA">Tarjeta</option>
                <option value="DEPOSITO">Depósito</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Estado</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="COBRADO">Cobrado</option>
                <option value="ANULADO">Anulado</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Vincular a (Opcional)</h4>
            
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700 flex items-center gap-1"><User className="w-3.5 h-3.5" /> Cliente</label>
              <select
                value={formData.contactId}
                onChange={e => setFormData({ ...formData, contactId: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="">Seleccionar cliente...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.firstName} {c.lastName || ''} ({c.phone})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Proyecto</label>
                <select
                  value={formData.projectId}
                  onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700 flex items-center gap-1"><Building className="w-3.5 h-3.5" /> Unidad</label>
                <select
                  value={formData.propertyId}
                  onChange={e => setFormData({ ...formData, propertyId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
                >
                  <option value="">Seleccionar...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.unitCode} - {p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
            >
              {loading ? 'Guardando...' : 'Guardar Ingreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
