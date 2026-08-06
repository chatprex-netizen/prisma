import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, Building, FileSpreadsheet } from 'lucide-react';
import { createExpense, getProjects, getProperties } from '../../lib/api';

interface NewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewExpenseModal({ isOpen, onClose, onSuccess }: NewExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    description: '',
    category: 'PUBLICIDAD_MARKETING',
    amount: '',
    taxAmount: '0',
    totalAmount: '',
    currency: 'PEN',
    date: new Date().toISOString().substring(0, 10),
    vendorName: '',
    vendorRuc: '',
    vendorPhone: '',
    docType: 'FACTURA',
    docNumber: '',
    projectId: '',
    propertyId: '',
    paymentMethod: 'TRANSFERENCIA',
    status: 'PENDIENTE',
  });

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        getProjects().catch(() => ({ data: [] })),
        getProperties().catch(() => ({ data: [] }))
      ]).then(([pRes, propRes]) => {
        setProjects(pRes?.data || []);
        setProperties(propRes?.data || []);
      });

      setFormData({
        description: '',
        category: 'PUBLICIDAD_MARKETING',
        amount: '',
        taxAmount: '0',
        totalAmount: '',
        currency: 'PEN',
        date: new Date().toISOString().substring(0, 10),
        vendorName: '',
        vendorRuc: '',
        vendorPhone: '',
        docType: 'FACTURA',
        docNumber: '',
        projectId: '',
        propertyId: '',
        paymentMethod: 'TRANSFERENCIA',
        status: 'PENDIENTE',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Auto calculate totalAmount when amount or taxAmount changes
  const handleAmountChange = (val: string) => {
    const amt = Number(val) || 0;
    const tax = Number(formData.taxAmount) || 0;
    setFormData(prev => ({
      ...prev,
      amount: val,
      totalAmount: String(amt + tax)
    }));
  };

  const handleTaxChange = (val: string) => {
    const tax = Number(val) || 0;
    const amt = Number(formData.amount) || 0;
    setFormData(prev => ({
      ...prev,
      taxAmount: val,
      totalAmount: String(amt + tax)
    }));
  };

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
        taxAmount: formData.taxAmount ? Number(formData.taxAmount) : null,
        totalAmount: Number(formData.totalAmount),
        projectId: formData.projectId || null,
        propertyId: formData.propertyId || null,
        date: new Date(formData.date).toISOString(),
      };

      await createExpense(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al crear el egreso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-base font-semibold text-slate-900">Registrar Nuevo Egreso</h2>
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
              placeholder="Ej. Pago de publicidad en Meta Ads de Julio"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Monto Base *</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={e => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Impuestos / IGV</label>
              <input
                type="number"
                step="0.01"
                value={formData.taxAmount}
                onChange={e => handleTaxChange(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Monto Total</label>
              <input
                type="number"
                value={formData.totalAmount}
                disabled
                placeholder="0.00"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-[11px] font-medium text-slate-700">Categoría</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="PUBLICIDAD_MARKETING">Publicidad y Marketing</option>
                <option value="COMISIONES_AGENTES">Comisiones Agentes</option>
                <option value="SERVICIOS_PROFESIONALES">Servicios Profesionales</option>
                <option value="SUELDOS_PLANILLA">Sueldos y Planilla</option>
                <option value="IMPUESTOS">Impuestos</option>
                <option value="MANTENIMIENTO">Mantenimiento</option>
                <option value="ARRIENDO_OFICINA">Arriendo Oficina</option>
                <option value="UTILITIES">Servicios Públicos</option>
                <option value="SEGUROS">Seguros</option>
                <option value="VIAJES_TRANSPORTE">Viajes y Transporte</option>
                <option value="MATERIALES_OFICINA">Materiales de Oficina</option>
                <option value="CAPACITACION">Capacitación</option>
                <option value="OTROS">Otros</option>
              </select>
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Tipo de Documento</label>
              <select
                value={formData.docType}
                onChange={e => setFormData({ ...formData, docType: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="FACTURA">Factura</option>
                <option value="BOLETA">Boleta</option>
                <option value="RECIBO">Recibo</option>
                <option value="NOTA_CREDITO">Nota de Crédito</option>
                <option value="TICKET">Ticket</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Número de Documento</label>
              <input
                type="text"
                value={formData.docNumber}
                onChange={e => setFormData({ ...formData, docNumber: e.target.value })}
                placeholder="F001-0000123"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Datos del Proveedor</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 col-span-2">
                <label className="block text-[11px] font-medium text-slate-700">Razón Social / Proveedor</label>
                <input
                  type="text"
                  value={formData.vendorName}
                  onChange={e => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="Ej. Meta Platforms Inc"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-700">RUC</label>
                <input
                  type="text"
                  value={formData.vendorRuc}
                  onChange={e => setFormData({ ...formData, vendorRuc: e.target.value })}
                  placeholder="20123456789"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Vincular a (Opcional)</h4>
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
              {loading ? 'Guardando...' : 'Guardar Egreso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
