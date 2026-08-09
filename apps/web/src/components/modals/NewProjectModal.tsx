import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createProject, updateProject, getDevelopers } from '../../lib/api';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: any;
}

export function NewProjectModal({ isOpen, onClose, onSuccess, initialData }: NewProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    developerId: '',
    type: 'EDIFICIO_MULTIFAMILIAR',
    status: 'PREVENTA',
    address: '',
    city: '',
    state: '',
    country: 'Perú',
    totalUnits: '',
    deliveryDate: '',
    brochureUrl: '',
    description: ''
  });

  useEffect(() => {
    if (isOpen) {
      getDevelopers()
        .then(res => {
          const devs = res?.data || [];
          setDevelopers(devs);
          
          if (initialData) {
            setFormData({
              name: initialData.name || '',
              developerId: initialData.developerId || '',
              type: initialData.type || 'EDIFICIO_MULTIFAMILIAR',
              status: initialData.status || 'PREVENTA',
              address: initialData.address || '',
              city: initialData.city || '',
              state: initialData.state || '',
              country: initialData.country || 'Perú',
              totalUnits: initialData.totalUnits ? String(initialData.totalUnits) : '',
              deliveryDate: initialData.deliveryDate ? initialData.deliveryDate.split('T')[0] : '',
              brochureUrl: initialData.brochureUrl || '',
              description: initialData.description || ''
            });
          } else {
            setFormData({
              name: '',
              developerId: devs.length > 0 ? devs[0].id : '',
              type: 'EDIFICIO_MULTIFAMILIAR',
              status: 'PREVENTA',
              address: '',
              city: '',
              state: '',
              country: 'Perú',
              totalUnits: '',
              deliveryDate: '',
              brochureUrl: '',
              description: ''
            });
          }
        })
        .catch(console.error);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name || !formData.developerId) {
      alert('El Nombre del Proyecto y la Desarrolladora son obligatorios');
      return;
    }

    const confirmMsg = initialData 
      ? '¿Confirmas que deseas guardar los cambios de este proyecto?' 
      : '¿Confirmas que deseas guardar este proyecto en la base de datos?';

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        totalUnits: formData.totalUnits ? Number(formData.totalUnits) : null,
        deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate) : null
      };

      if (initialData) {
        await updateProject(initialData.id, payload);
      } else {
        await createProject(payload);
      }
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert(initialData ? 'Error al actualizar el proyecto' : 'Error al crear el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">
            {initialData ? 'Editar Proyecto Inmobiliario' : 'Nuevo Proyecto Inmobiliario'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 custom-scrollbar text-left">
          {/* Row 1: Nombre and Desarrolladora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 ">Nombre del proyecto *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej. Torre Marina"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 ">Desarrolladora *</label>
              <select value={formData.developerId} onChange={e => setFormData({...formData, developerId: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all cursor-pointer"
              >
                <option value="">Selecciona desarrolladora...</option>
                {developers.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Tipo and Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 ">Tipo de proyecto *</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all cursor-pointer">
                <option value="EDIFICIO_MULTIFAMILIAR">Edificio Multifamiliar</option>
                <option value="CONDOMINIO">Condominio</option>
                <option value="LOTIZACION">Lotización</option>
                <option value="TERRENO_COMERCIAL">Terreno Comercial</option>
                <option value="CENTRO_COMERCIAL">Centro Comercial</option>
                <option value="OFICINAS_CORPORATIVAS">Oficinas Corporativas</option>
                <option value="HABILITACION_URBANA">Habilitación Urbana</option>
                <option value="MIXTO">Mixto</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 ">Estado *</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green bg-white transition-all cursor-pointer">
                <option value="PREVENTA">Preventa</option>
                <option value="EN_CONSTRUCCION">En Construcción</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="AGOTADO">Agotado</option>
              </select>
            </div>
          </div>

          {/* Row 3: Dirección */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 ">Dirección</label>
            <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
              placeholder="Av. Principal 123"
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          {/* Row 4: Ciudad and Provincia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 ">Ciudad</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                placeholder="Ej. Miraflores"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 ">Provincia/región</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})}
                placeholder="Ej. Lima"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
          </div>

          {/* Row 5: Total Unidades and Fecha Entrega */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 ">Total unidades</label>
              <input type="number" value={formData.totalUnits} onChange={e => setFormData({...formData, totalUnits: e.target.value})}
                placeholder="Ej. 120"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-slate-600 ">Fecha de entrega estimada</label>
              <input type="date" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all text-slate-700"
              />
            </div>
          </div>
          
          {/* Row 6: URL Brochure */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 ">Url del brochure</label>
            <input type="url" value={formData.brochureUrl} onChange={e => setFormData({...formData, brochureUrl: e.target.value})}
              placeholder="https://..."
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all"
            />
          </div>

          {/* Row 7: Descripción */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-600 ">Descripción / notas</label>
            <textarea rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Detalles sobre amenidades, acabados..."
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
            {loading ? (initialData ? 'Guardando...' : 'Creando...') : (initialData ? 'Guardar Cambios' : 'Crear Proyecto')}
          </button>
        </div>
      </div>
    </div>
  );
}
