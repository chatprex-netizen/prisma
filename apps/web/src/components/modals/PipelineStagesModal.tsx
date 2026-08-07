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
      <div className="bg-white rounded-xl shadow-xl w-[95vw] md:w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Gestión de Etapas del Pipeline</h2>
            <p className="text-xxs text-slate-500 mt-0.5">Configura nombres, detalles, colores y visibilidad de las etapas del embudo comercial</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {loading && stages.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">Cargando etapas...</div>
          ) : (
            <div className="space-y-3">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex flex-col md:flex-row items-start md:items-center gap-3">
                  {/* Color preview indicator */}
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <input 
                      type="color" 
                      value={stage.color || '#64748b'} 
                      onChange={e => handleFieldChange(idx, 'color', e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border border-slate-250 bg-transparent shrink-0" 
                      title="Elegir color de la etapa"
                    />
                    <span className="text-xxs font-bold text-slate-400 block md:hidden">Color</span>
                  </div>

                  {/* Stage Identifier and custom Name */}
                  <div className="flex-1 min-w-0 space-y-1 w-full">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">
                        {stage.key}
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={stage.name}
                      onChange={e => handleFieldChange(idx, 'name', e.target.value)}
                      placeholder="Nombre de la etapa"
                      className="w-full px-3 py-1 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green bg-white font-medium"
                    />
                  </div>

                  {/* Details / Description */}
                  <div className="flex-[1.5] w-full">
                    <span className="text-[10px] text-slate-400 block mb-0.5 font-medium md:hidden">Detalle / Notas</span>
                    <input 
                      type="text" 
                      value={stage.details || ''}
                      onChange={e => handleFieldChange(idx, 'details', e.target.value)}
                      placeholder="Ej. Leads nuevos por calificar"
                      className="w-full px-3 py-1 rounded border border-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-brand-green focus:border-brand-green bg-white text-slate-600"
                    />
                  </div>

                  {/* Visibility toggle (Si/No) */}
                  <div className="flex items-center gap-2 shrink-0 md:justify-center w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleFieldChange(idx, 'isVisible', !stage.isVisible)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
                        stage.isVisible 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {stage.isVisible ? (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
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
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-1.5 rounded-lg bg-brand-green text-white text-sm font-medium hover:bg-brand-greenHover flex items-center gap-1.5 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Etapas'}
          </button>
        </div>
      </div>
    </div>
  );
}
