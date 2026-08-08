import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createProperty, getProjects } from '../../lib/api';

interface NewUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewUnitModal({ isOpen, onClose, onSuccess }: NewUnitModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
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
    parkingSpots: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      getProjects()
        .then(res => {
          const projs = res?.data || [];
          setProjects(projs);
          if (projs.length > 0) {
            setFormData(prev => ({ ...prev, projectId: projs[0].id }));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.unitCode.trim()) {
      alert('El Código de Unidad/Propiedad es obligatorio');
      return;
    }
    if (!formData.price.trim()) {
      alert('El precio es obligatorio');
      return;
    }

    try {
      setLoading(true);
      // Clean and map fields to match the database schema
      await createProperty({
        ...formData,
        projectId: formData.projectId || undefined,
        price: Number(formData.price),
        areaTotal: formData.areaTotal ? Number(formData.areaTotal) : null,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : null,
        floor: formData.floor ? Number(formData.floor) : null,
        parkingSpots: formData.parkingSpots ? Number(formData.parkingSpots) : null,
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.message || 'Error al crear la unidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-base font-semibold text-slate-900">Nueva Unidad / Propiedad</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          {/* Fila 1: Código de Unidad and Proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Código de Unidad *</label>
              <input 
                type="text" 
                value={formData.unitCode}
                onChange={e => setFormData({...formData, unitCode: e.target.value})}
                placeholder="Ej. Mz A, Lt 01"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-700">Proyecto</label>
              <select 
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all appearance-none"
              >
                <option value="">Selecciona proyecto...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: Tipo and Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {/* Fila 3: Precio y Moneda */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Precio y Moneda *</label>
            <div className="flex gap-2">
              <select 
                value={formData.currency}
                onChange={e => setFormData({...formData, currency: e.target.value})}
                translate="no"
                className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 bg-slate-50 text-slate-700 notranslate"
              >
                <option value="USD">USD ($)</option>
                <option value="PEN">PEN (S/)</option>
                <option value="EUR">EUR (€)</option>
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

          {/* Fila 4: Características Compactas */}
          <div className="grid grid-cols-5 gap-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-700 truncate">Área (m²)</label>
              <input 
                type="number" 
                step="0.1"
                value={formData.areaTotal}
                onChange={e => setFormData({...formData, areaTotal: e.target.value})}
                placeholder="0.0"
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-700 truncate">Habitac.</label>
              <input 
                type="number" 
                value={formData.bedrooms}
                onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                placeholder="0"
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-700 truncate">Baños</label>
              <input 
                type="number" 
                value={formData.bathrooms}
                onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                placeholder="0"
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-700 truncate">Piso N°</label>
              <input 
                type="number" 
                value={formData.floor}
                onChange={e => setFormData({...formData, floor: e.target.value})}
                placeholder="1"
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-medium text-slate-700 truncate" title="Estacionamiento">Estac.</label>
              <input 
                type="number" 
                value={formData.parkingSpots}
                onChange={e => setFormData({...formData, parkingSpots: e.target.value})}
                placeholder="0"
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          {/* Fila 5: Descripción */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-700">Descripción / Notas internas</label>
            <textarea 
              rows={2}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Detalles sobre vista, acabados, promociones..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover transition-colors shadow-sm shadow-brand-green/20"
          >
            {loading ? 'Creando...' : 'Crear Unidad'}
          </button>
        </div>
      </div>
    </div>
  );
}
