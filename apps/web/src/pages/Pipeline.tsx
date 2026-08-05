import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter } from 'lucide-react';
import { NewOpportunityModal } from '../components/modals/NewOpportunityModal';
import { OpportunityDetailModal } from '../components/modals/OpportunityDetailModal';
import { getPipeline } from '../lib/api';

const STAGES = [
  { id: 'PROSPECCION', name: 'Prospección', color: 'bg-slate-200' },
  { id: 'CALIFICACION', name: 'Calificación', color: 'bg-blue-100' },
  { id: 'VISITA', name: 'Visita', color: 'bg-indigo-100' },
  { id: 'PROPUESTA', name: 'Propuesta', color: 'bg-purple-100' },
  { id: 'NEGOCIACION', name: 'Negociación', color: 'bg-orange-100' },
];

export function Pipeline() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const res = await getPipeline();
      setOpportunities(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipeline();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Pipeline de Ventas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestiona tus oportunidades comerciales por etapa</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 md:flex-none bg-brand-green hover:bg-brand-greenHover text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm shadow-brand-green/20"
          >
            <Plus className="w-4 h-4" />
            Nueva Oportunidad
          </button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500">Cargando oportunidades...</div>
        ) : (
          <div className="flex gap-5 h-full items-start w-max">
            {STAGES.map((stage) => {
              const stageOpps = opportunities.filter(o => o.stage === stage.id);
              const totalValue = stageOpps.reduce((acc, curr) => {
                const val = curr.value || 0;
                return acc + Number(val);
              }, 0);

              return (
                <div key={stage.id} className="w-72 max-h-full flex flex-col bg-slate-50/80 rounded-xl border border-slate-200/50 shrink-0">
                  {/* Column Header */}
                  <div className="p-3 border-b border-slate-200/60 flex justify-between items-center bg-white/50 rounded-t-xl">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></div>
                        {stage.name}
                      </h3>
                      <p className="text-xxs text-slate-500 font-medium mt-1">
                        {stageOpps.length} op. · S/ {totalValue.toLocaleString()}
                      </p>
                    </div>
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Column Content */}
                  <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                    {stageOpps.map((opp) => {
                      const oppDays = Math.floor((new Date().getTime() - new Date(opp.createdAt).getTime()) / (1000 * 3600 * 24));
                      const contactName = opp.contact?.firstName ? `${opp.contact.firstName} ${opp.contact.lastName || ''}` : 'Sin Contacto';
                      
                      return (
                        <div 
                          key={opp.id} 
                          onDoubleClick={() => setSelectedOpp(opp)}
                          className="bg-white p-3.5 rounded-lg border border-slate-200/70 shadow-sm cursor-pointer hover:border-brand-green/40 hover:shadow-md transition-all group select-none"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold text-slate-900 group-hover:text-brand-green transition-colors">{opp.title}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{oppDays}d</span>
                          </div>
                          <p className="text-xs text-slate-600 mb-3">{contactName}</p>
                          <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800">S/ {Number(opp.value || 0).toLocaleString()}</span>
                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-white ring-1 ring-slate-200">
                              {contactName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewOpportunityModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchPipeline}
      />
      
      <OpportunityDetailModal
        isOpen={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        opportunity={selectedOpp}
      />
    </div>
  );
}
