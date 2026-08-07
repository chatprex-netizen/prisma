import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter, Phone, MessageSquare, Mail, Settings } from 'lucide-react';
import { NewOpportunityModal } from '../components/modals/NewOpportunityModal';
import { OpportunityDetailModal } from '../components/modals/OpportunityDetailModal';
import { PipelineStagesModal } from '../components/modals/PipelineStagesModal';
import { getPipeline, getPipelineStages } from '../lib/api';

export function Pipeline() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = async () => {
    try {
      setLoading(true);
      const res = await getPipeline();
      setOpportunities(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStages = async () => {
    try {
      const res = await getPipelineStages();
      setStages(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPipeline();
    fetchStages();
  }, []);

  // Filter only visible stages for the kanban board
  const visibleStages = stages.filter(s => s.isVisible);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Pipeline de Ventas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestiona tus oportunidades comerciales por etapa</p>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <button 
            onClick={() => setIsStagesModalOpen(true)}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            Gestionar Etapas
          </button>
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
        {loading && stages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">Cargando oportunidades...</div>
        ) : (
          <div className="flex gap-5 h-full items-start w-max pb-4">
            {visibleStages.map((stage) => {
              const stageOpps = opportunities.filter(o => o.stage === stage.key);
              const totalValue = stageOpps.reduce((acc, curr) => {
                const val = curr.value || 0;
                return acc + Number(val);
              }, 0);

              // Use custom color for line and text
              const headerColorStyle = { color: stage.color };
              const lineStyle = { borderTop: `4px solid ${stage.color}` };

              return (
                <div 
                  key={stage.id} 
                  className="w-72 max-h-full flex flex-col bg-slate-50/80 rounded-xl border border-slate-200/50 shrink-0"
                  style={lineStyle}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-slate-200/60 flex justify-between items-center bg-white/50 rounded-t-lg">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2" style={headerColorStyle}>
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }}></div>
                        {stage.name}
                      </h3>
                      <p className="text-xxs text-slate-500 font-semibold mt-1">
                        {stageOpps.length} op. · S/ {totalValue.toLocaleString('es-PE')}
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
                          className="bg-white p-3 rounded-lg border border-slate-200/80 shadow-sm cursor-pointer hover:border-brand-green/30 hover:shadow-md transition-all group select-none space-y-2 relative"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xxs font-semibold text-slate-500 uppercase tracking-wider block truncate max-w-[80%]">
                              {opp.project?.name || 'Sin Proyecto'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium shrink-0">{oppDays}d</span>
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-950 group-hover:text-brand-green transition-colors truncate">
                              {contactName}
                            </p>
                            {opp.title && opp.title !== opp.contact?.firstName && (
                              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{opp.title}</p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100/70 flex justify-between items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900">
                              {opp.contact?.currency === 'EUR' ? '€' : opp.contact?.currency === 'PEN' ? 'S/' : '$'} {Number(opp.value || 0).toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            
                            {/* Action Buttons to the right */}
                            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                              {opp.contact?.phone && (
                                <>
                                  <a 
                                    href={`tel:${opp.contact.phone}`}
                                    className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="Llamar"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                  <a 
                                    href={`https://wa.me/${opp.contact.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                    title="WhatsApp"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                </>
                              )}
                              {opp.contact?.email && (
                                <a 
                                  href={`mailto:${opp.contact.email}`}
                                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Enviar correo"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}
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

      <PipelineStagesModal
        isOpen={isStagesModalOpen}
        onClose={() => setIsStagesModalOpen(false)}
        onSuccess={() => { fetchPipeline(); fetchStages(); }}
      />
    </div>
  );
}
