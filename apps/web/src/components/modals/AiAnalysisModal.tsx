import { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, Bot } from 'lucide-react';
import { getAiAnalysis } from '../../lib/api';

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId: string;
}

export function AiAnalysisModal({ isOpen, onClose, opportunityId }: AiAnalysisModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && opportunityId) {
      setLoading(true);
      getAiAnalysis(opportunityId)
        .then(res => {
          if (res.success) {
            setData(res.data);
          } else {
            setError(res.error || 'Error al obtener análisis');
          }
        })
        .catch(err => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [isOpen, opportunityId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200/50">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-sm font-extrabold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            <Bot className="w-5 h-5 text-indigo-500" />
            Análisis Predictivo IA
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full shadow-2xs transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
              </div>
              <p className="text-sm font-bold text-slate-500 animate-pulse">Analizando conversaciones y perfil...</p>
            </div>
          ) : error ? (
            <div className="py-10 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <p className="text-sm text-slate-600 font-medium">{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Score Section */}
              <div className="text-center space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Probabilidad de Cierre</p>
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-4xl font-black ${
                    data.score >= 80 ? 'text-green-500' :
                    data.score >= 50 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {data.score}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      data.score >= 80 ? 'bg-green-500' :
                      data.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${data.score}%` }}
                  ></div>
                </div>
              </div>

              {/* Diagnosis Section */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Diagnóstico del Lead
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {data.diagnosis}
                </p>
              </div>

              {/* Suggestions Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Sugerencias de Próximos Pasos
                </h4>
                <ul className="space-y-2">
                  {data.suggestions?.map((sug: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                      <span className="text-emerald-500 font-black text-[10px] mt-0.5">•</span>
                      <span className="text-xs font-semibold text-emerald-900">{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ) : null}
        </div>
        
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
