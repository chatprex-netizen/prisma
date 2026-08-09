import { useState, useEffect } from 'react';
import { X, BookOpen, Key, DollarSign } from 'lucide-react';
import { createAccount, updateAccount } from '../../lib/api';

interface NewAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function NewAccountModal({ isOpen, onClose, onSuccess, initialData }: NewAccountModalProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'ACTIVO',
    subtype: 'CAJA',
    currency: 'PEN',
    initialBalance: '0',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          code: initialData.code || '',
          name: initialData.name || '',
          type: initialData.type || 'ACTIVO',
          subtype: initialData.subtype || 'CAJA',
          currency: initialData.currency || 'PEN',
          initialBalance: String(initialData.initialBalance || '0'),
          description: initialData.description || '',
        });
      } else {
        setFormData({
          code: '',
          name: '',
          type: 'ACTIVO',
          subtype: 'CAJA',
          currency: 'PEN',
          initialBalance: '0',
          description: '',
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert('El código y nombre de la cuenta son obligatorios');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        initialBalance: Number(formData.initialBalance),
        currentBalance: initialData ? Number(initialData.currentBalance) : Number(formData.initialBalance),
      };

      if (initialData?.id) {
        await updateAccount(initialData.id, payload);
      } else {
        await createAccount(payload);
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error al guardar la cuenta contable');
    } finally {
      setLoading(false);
    }
  };

  // Keep subtype in sync when type changes to provide good defaults
  const handleTypeChange = (typeVal: string) => {
    let sub = 'CAJA';
    if (typeVal === 'PASIVO') sub = 'CUENTAS_PAGAR';
    if (typeVal === 'PATRIMONIO') sub = 'CAPITAL';
    if (typeVal === 'INGRESO') sub = 'VENTAS_PROPIEDADES';
    if (typeVal === 'EGRESO') sub = 'PUBLICIDAD';

    setFormData(prev => ({
      ...prev,
      type: typeVal,
      subtype: sub
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-green" />
            {initialData ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Código de cuenta *</label>
              <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ej. 10411"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Nombre cuenta *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. BCP Soles Operaciones"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Tipo cuenta *</label>
              <select value={formData.type} onChange={e => handleTypeChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                <option value="ACTIVO">Activo</option>
                <option value="PASIVO">Pasivo</option>
                <option value="PATRIMONIO">Patrimonio</option>
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Subtipo cuenta *</label>
              <select value={formData.subtype} onChange={e => setFormData({ ...formData, subtype: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white"
              >
                {formData.type === 'ACTIVO' && (
                  <>
                    <option value="CAJA">Caja</option>
                    <option value="BANCOS">Bancos</option>
                    <option value="CUENTAS_COBRAR">Cuentas por Cobrar</option>
                    <option value="INVENTARIO">Inventario</option>
                    <option value="INMUEBLES">Inmuebles</option>
                  </>
                )}
                {formData.type === 'PASIVO' && (
                  <>
                    <option value="CUENTAS_PAGAR">Cuentas por Pagar</option>
                    <option value="IMPUESTOS_PAGAR">Impuestos por Pagar</option>
                    <option value="PRESTAMOS">Préstamos</option>
                  </>
                )}
                {formData.type === 'PATRIMONIO' && (
                  <>
                    <option value="CAPITAL">Capital Social</option>
                    <option value="RESULTADOS">Resultados</option>
                  </>
                )}
                {formData.type === 'INGRESO' && (
                  <>
                    <option value="VENTAS_PROPIEDADES">Ventas Propiedades</option>
                    <option value="COMISIONES_RECIBIDAS">Comisiones Recibidas</option>
                    <option value="BONOS_RECIBIDOS">Bonos Recibidos</option>
                    <option value="ALQUILERES">Alquileres</option>
                    <option value="INTERESES">Intereses</option>
                    <option value="OTROS">Otros Ingresos</option>
                  </>
                )}
                {formData.type === 'EGRESO' && (
                  <>
                    <option value="PUBLICIDAD">Publicidad</option>
                    <option value="COMISIONES_PAGADAS">Comisiones Pagadas</option>
                    <option value="SERVICIOS">Servicios Profesionales</option>
                    <option value="SUELDOS">Sueldos y Planilla</option>
                    <option value="IMPUESTOS">Impuestos</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="ARRIENDO_OFICINA">Arriendo Oficina</option>
                    <option value="UTILITIES">Servicios Públicos</option>
                    <option value="SEGUROS">Seguros</option>
                    <option value="VIAJES_TRANSPORTE">Viajes y Transporte</option>
                    <option value="MATERIALES_OFICINA">Materiales Oficina</option>
                    <option value="CAPACITACION">Capacitación</option>
                    <option value="OTROS">Otros Egresos</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Moneda</label>
              <select value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}
                translate="no"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none bg-white notranslate"
              >
                <option value="PEN">PEN (S/)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Saldo inicial</label>
              <input type="number" step="0.01" value={formData.initialBalance} onChange={e => setFormData({ ...formData, initialBalance: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Descripción / notas</label>
            <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción opcional de la cuenta contable..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
            >
              {loading ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Cuenta')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
