import { useState } from 'react';
import { X, Upload, Image as ImageIcon, FileText, Film, Link as LinkIcon } from 'lucide-react';
import { createProperty } from '../../lib/api';

interface NewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewUnitModal({ isOpen, onClose, onSuccess }: NewUnitModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    unitCode: '',
    projectId: '',
    type: 'DEPARTAMENTO',
    status: 'DISPONIBLE',
    currency: 'USD',
    price: '',
    areaTotal: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await createProperty({
        ...formData,
        projectId: formData.projectId || undefined,
        price: Number(formData.price),
        areaTotal: formData.areaTotal ? Number(formData.areaTotal) : null,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        floor: formData.floor ? Number(formData.floor) : null,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al crear la unidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-900">Nueva Unidad / Propiedad</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Fila 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Código de Unidad *</label>
              <input 
                type="text" 
                value={formData.unitCode}
                onChange={e => setFormData({...formData, unitCode: e.target.value})}
                placeholder="Ej. T1-A-501"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all uppercase"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Proyecto ID</label>
              <input 
                type="text" 
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                placeholder="UUID del proyecto (opcional)"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
              />
            </div>
          </div>

          <div className="space-y-1 hidden">
            <label className="block text-[11px] font-medium text-slate-700">Título / Nombre Comercial</label>
            <input 
              type="text" 
              placeholder="Ej. Departamento 3 Dormitorios Vista Mar"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          {/* Fila 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Tipo *</label>
              <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none">
                <option value="DEPARTAMENTO">Departamento</option>
                <option value="DUPLEX">Dúplex</option>
                <option value="PENTHOUSE">Penthouse</option>
                <option value="OFICINA">Oficina</option>
                <option value="LOCAL_COMERCIAL">Local Comercial</option>
                <option value="LOTE">Lote</option>
                <option value="ESTACIONAMIENTO">Estacionamiento</option>
                <option value="DEPOSITO">Depósito</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Estado *</label>
              <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none">
                <option value="DISPONIBLE">Disponible</option>
                <option value="SEPARADO">Separado</option>
                <option value="RESERVADO">Reservado</option>
                <option value="VENDIDO">Vendido</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Finanzas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Precio y Moneda *</label>
              <div className="flex gap-2">
                <select 
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                  className="w-24 px-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-slate-50 text-slate-700">
                  <option value="USD">USD ($)</option>
                  <option value="PEN">PEN (S/)</option>
                </select>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20" 
                  placeholder="0.00" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-1 hidden">
              <label className="block text-[11px] font-medium text-slate-700">Precio x m² (Opcional)</label>
              <input 
                type="number" 
                placeholder="Ej. 4500"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all bg-slate-50"
              />
            </div>
          </div>

          {/* Fila 4: Características */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Área (m²)</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.areaTotal}
                onChange={e => setFormData({...formData, areaTotal: e.target.value})}
                placeholder="0.0"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Dormitorios</label>
              <input 
                type="number" 
                value={formData.bedrooms}
                onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Baños</label>
              <input 
                type="number" 
                value={formData.bathrooms}
                onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Piso N°</label>
              <input 
                type="number" 
                value={formData.floor}
                onChange={e => setFormData({...formData, floor: e.target.value})}
                placeholder="1"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Descripción / Notas internas</label>
            <textarea 
              rows={2}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Detalles sobre vista, acabados, promociones..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
          >
            {loading ? 'Creando...' : 'Crear Unidad'}
          </button>
        </div>
      </div>
    </div>
  );
}
