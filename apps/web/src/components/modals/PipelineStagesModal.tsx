import { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { getPipelineStages, updatePipelineStage } from '../../lib/api';

interface PipelineStagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PipelineStagesModal({ isOpen, onClose, onSuccess }: PipelineStagesModalProps) {
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getPipelineStages()
        .then(res => setStages(res.data || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (index: number, field: string, value: any) => {
    const updated = [...stages];
    updated[index] = { ...updated[index], [field]: value };
    setStages(updated);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // Save all stages configs sequentially
      for (const stage of stages) {
        await updatePipelineStage(stage.id, {
          name: stage.name,
          details: stage.details,
          color: stage.color,
          isVisible: stage.isVisible
        });
      }
      alert('Configuración de etapas guardada con éxito.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert('Error al guardar la configuración de etapas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-3.5 py-2.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Gestión de Etapas del Pipeline</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Configura nombres, detalles, colores y visibilidad de las etapas</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-3 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
          {loading && stages.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">Cargando etapas...</div>
          ) : (
            <div className="space-y-2">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="px-3 py-2 bg-slate-50 hover:bg-slate-100/30 rounded-lg border border-slate-200/60 flex items-center gap-3 transition-colors">
                  {/* Color Picker (Stylized interactive circle) */}
                  <div className="relative shrink-0 flex items-center">
                    <input type="color" value={stage.color || '#64748b'} onChange={e => handleFieldChange(idx, 'color', e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Elegir color de la etapa"
                    />
                    <div 
                      className="w-5 h-5 rounded-full border border-slate-300 shadow-inner"
                      style={{ backgroundColor: stage.color || '#64748b' }}
                    />
                  </div>

                  {/* Custom Name */}
                  <div className="w-1/3 min-w-0">
                    <input type="text" value={stage.name} onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                      placeholder="Nombre de etapa"
                      className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green bg-white font-bold text-slate-800"
                    />
                  </div>

                  {/* Details / Description */}
                  <div className="flex-1 min-w-0">
                    <input type="text" value={stage.details || ''} onChange={e => handleFieldChange(idx, 'details', e.target.value)}
                      placeholder="Detalle o descripción..."
                      className="w-full px-2.5 py-1 rounded border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green bg-white text-slate-500"
                    />
                  </div>

                  {/* Visibility toggle (Si/No) */}
                  <div className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleFieldChange(idx, 'isVisible', !stage.isVisible)}
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold border transition-all ${
                        stage.isVisible 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {stage.isVisible ? (
                        <>
                          <Eye className="w-3 h-3" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" />
                          Oculto
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-3.5 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1 rounded-lg bg-brand-green text-white text-xs font-semibold hover:bg-brand-greenHover flex items-center gap-1 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Save className="w-3.5 h-3.5" />
            {loading ? 'Guardando...' : 'Guardar Etapas'}
          </button>
        </div>
      </div>
    </div>
  );
}
