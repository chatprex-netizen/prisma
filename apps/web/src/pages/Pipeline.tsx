import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter, Phone, MessageSquare, Mail, Settings, List, Kanban, Tag, DollarSign, Bot, Edit, Trash2 } from 'lucide-react';
import { OpportunityDetailModal } from '../components/modals/OpportunityDetailModal';
import { PipelineStagesModal } from '../components/modals/PipelineStagesModal';
import { getPipeline, getPipelineStages, updateOpportunityStage, deleteOpportunity, toggleChatBot } from '../lib/api';

export function Pipeline() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStagesModalOpen, setIsStagesModalOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null);
  
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Default to list view on mobile screens (< 768px), otherwise grid (kanban)
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'list' : 'kanban'
  );

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

  const handleDeleteOpportunity = async (oppId: string) => {
    if (!window.confirm('¿Confirmas que deseas eliminar esta oportunidad?')) return;
    try {
      await deleteOpportunity(oppId);
      fetchPipeline();
    } catch (error: any) {
      console.error(error);
      alert('Error al eliminar la oportunidad');
    }
  };

  useEffect(() => {
    fetchPipeline();
    fetchStages();
    
    // Auto toggle list view on mobile resize
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('list');
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // run on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter only visible stages for the kanban board
  const visibleStages = stages.filter(s => s.isVisible);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4 shrink-0 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Pipeline de Ventas</h1>
          <p className="text-xs text-slate-500 mt-0.5">Gestiona tus oportunidades comerciales por etapa</p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
          {/* View Mode Toggle Buttons (Grid vs List) */}
          <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista Tablero Kanban"
            >
              <Kanban className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista Lista Compacta"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={() => setIsStagesModalOpen(true)}
            className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Gestionar Etapas</span>
          </button>
          <button className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Container / List View */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading && stages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">Cargando oportunidades...</div>
        ) : viewMode === 'list' ? (
          /* List View (Ultra Compact) */
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {visibleStages.map((stage) => {
              const stageOpps = opportunities.filter(o => o.stage === stage.key);
              if (stageOpps.length === 0) return null;

              return (
                <div key={stage.id} className="bg-white rounded-xl border border-slate-200/50 overflow-hidden shadow-xs">
                  {/* Stage Header */}
                  <div 
                    className="px-3.5 py-2 bg-slate-50/50 flex justify-between items-center border-b border-slate-100"
                    style={{ borderLeft: `4px solid ${stage.color}` }}
                  >
                    <h3 className="text-xs font-bold flex items-center gap-1.5" style={{ color: stage.color }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stage.color }}></div>
                      {stage.name}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {stageOpps.length} op. · S/ {stageOpps.reduce((acc, curr) => acc + Number(curr.value || 0), 0).toLocaleString('es-PE')}
                    </span>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-slate-100">
                    {stageOpps.map((opp) => {
                      const contactName = opp.contact?.firstName ? `${opp.contact.firstName} ${opp.contact.lastName || ''}` : 'Sin Contacto';
                      
                      const getElapsedTime = (createdAtString: string) => {
                        const diffMs = new Date().getTime() - new Date(createdAtString).getTime();
                        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        
                        let parts = [];
                        if (days > 0) parts.push(`${days}d`);
                        if (hours > 0) parts.push(`${hours}h`);
                        parts.push(`${minutes}m`);
                        return parts.join(' ');
                      };

                      return (
                        <div 
                          key={opp.id}
                          onDoubleClick={() => setSelectedOpp(opp)}
                          className="p-2.5 flex items-center justify-between hover:bg-slate-50/30 transition-colors cursor-pointer gap-4"
                        >
                          <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 font-sans">
                            {/* Client Name & Project */}
                            <div className="min-w-0 sm:w-1/2">
                              <span className="text-xs font-bold text-slate-900 block truncate">{contactName}</span>
                              <span className="text-[9px] text-slate-400 font-semibold truncate block sm:hidden">
                                {opp.project?.name || 'Sin Proyecto'}
                              </span>
                            </div>

                            {/* Project Name (Desktop Only) */}
                            <div className="hidden sm:block min-w-0 sm:w-1/2">
                              <span className="text-[10px] text-slate-500 font-semibold truncate block">
                                {opp.project?.name || 'Sin Proyecto'}
                              </span>
                            </div>
                          </div>

                          {/* Date and Quick Actions */}
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[9px] text-slate-400 font-semibold bg-slate-50 border border-slate-200/60 px-1 py-0.5 rounded shrink-0" title="Tiempo transcurrido">
                              {getElapsedTime(opp.createdAt)}
                            </span>
                            
                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                              {opp.contact?.phone && (
                                <>
                                  <a 
                                    href={`tel:${opp.contact.phone}`}
                                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                    title="Llamar"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                  <a 
                                    href={`https://wa.me/${opp.contact.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                    title="WhatsApp"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                </>
                              )}
                              {opp.contact?.email && (
                                <a 
                                  href={`mailto:${opp.contact.email}`}
                                  className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-600 rounded-lg transition-colors"
                                  title="Enviar correo"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </a>
                              )}

                              {/* Bot Toggle Button in List View */}
                              {opp.contact?.chats?.[0] ? (
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      const chat = opp.contact.chats[0];
                                      await toggleChatBot(chat.id, !chat.isBotActive);
                                      fetchPipeline();
                                    } catch (err: any) {
                                      alert(err.message || 'Error al alternar bot');
                                    }
                                  }}
                                  className={`p-1.5 rounded-lg border transition-all ${
                                    opp.contact.chats[0].isBotActive 
                                      ? 'bg-rose-50 text-rose-600 border-rose-150' 
                                      : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/50'
                                  }`}
                                  title={opp.contact.chats[0].isBotActive ? "Pausar Asistente de IA" : "Activar Asistente de IA"}
                                >
                                  <Bot className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="p-1.5 bg-slate-100 text-slate-300 rounded-lg cursor-not-allowed border border-slate-200/30"
                                  title="Sin chat de WhatsApp activo"
                                >
                                  <Bot className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* Edit / Delete actions */}
                              <div className="flex items-center gap-1 pl-1 border-l border-slate-200 ml-1">
                                <button 
                                  onClick={() => setSelectedOpp(opp)}
                                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteOpportunity(opp.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
        ) : (
          /* Kanban Board View */
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
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
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setDraggedOverStage(stage.id)}
                      onDragLeave={() => setDraggedOverStage(null)}
                      onDrop={async (e) => {
                        const oppId = e.dataTransfer.getData('text/plain');
                        setDraggedOverStage(null);
                        if (!oppId) return;
                        
                        // Optimistic UI update
                        setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, stage: stage.key } : o));
                        
                        try {
                          await updateOpportunityStage(oppId, stage.key);
                        } catch (error) {
                          console.error(error);
                          fetchPipeline();
                        }
                      }}
                      className={`p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar transition-all ${
                        draggedOverStage === stage.id ? 'bg-slate-100/80 border-2 border-dashed border-brand-green/20 rounded-b-xl' : ''
                      }`}
                    >
                      {stageOpps.map((opp) => {
                        const contactName = opp.contact?.firstName ? `${opp.contact.firstName} ${opp.contact.lastName || ''}` : 'Sin Contacto';
                        
                        const getElapsedTime = (createdAtString: string) => {
                          const diffMs = new Date().getTime() - new Date(createdAtString).getTime();
                          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                          const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                          
                          let parts = [];
                          if (days > 0) parts.push(`${days}d`);
                          if (hours > 0) parts.push(`${hours}h`);
                          parts.push(`${minutes}m`);
                          return parts.join(' ');
                        };

                        return (
                          <div 
                            key={opp.id} 
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', opp.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDoubleClick={() => setSelectedOpp(opp)}
                            className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs cursor-pointer hover:border-brand-green/20 hover:shadow-md transition-all group select-none space-y-2.5 relative text-left"
                          >
                            {/* Row 1: Name and Probability / Elapsed Time Badge */}
                            <div className="flex justify-between items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-brand-green transition-colors truncate">
                                {contactName}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[9px] text-slate-400 font-semibold bg-slate-50 border border-slate-200/60 px-1 py-0.5 rounded" title="Tiempo transcurrido">
                                  {getElapsedTime(opp.createdAt)}
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center gap-0.5">
                                  🎯 {opp.probability || 0}%
                                </span>
                              </div>
                            </div>

                            {/* Row 2: Phone number with green icon */}
                            {opp.contact?.phone && (
                              <div className="flex items-center gap-2 text-xxs font-semibold text-slate-500">
                                <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>{opp.contact.phone}</span>
                              </div>
                            )}

                            {/* Row 3: Project with tag icon */}
                            <div className="flex items-center gap-2 text-xxs font-semibold text-slate-600">
                              <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">
                                {opp.project?.name || 'Sin Proyecto'}
                              </span>
                            </div>

                            <hr className="border-slate-100/80 my-1" />

                            {/* Bottom row: Call, Message, Bot and Edit/Delete */}
                            <div className="flex items-center justify-between gap-2 pt-1" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5">
                                {opp.contact?.phone ? (
                                  <>
                                    <a 
                                      href={`tel:${opp.contact.phone}`}
                                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-colors"
                                      title="Llamar"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                    </a>
                                    <a 
                                      href={`https://wa.me/${opp.contact.phone.replace(/\+/g, '').replace(/\s/g, '')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                      title="Chat de WhatsApp"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                    </a>
                                  </>
                                ) : (
                                  <div className="w-16 h-7" /> // Spacer
                                )}
                                {opp.contact?.chats?.[0] ? (
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const chat = opp.contact.chats[0];
                                        await toggleChatBot(chat.id, !chat.isBotActive);
                                        fetchPipeline();
                                      } catch (err: any) {
                                        alert(err.message || 'Error al alternar bot');
                                      }
                                    }}
                                    className={`p-1.5 rounded-lg border transition-all ${
                                      opp.contact.chats[0].isBotActive 
                                        ? 'bg-rose-50 text-rose-600 border-rose-150' 
                                        : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200/50'
                                    }`}
                                    title={opp.contact.chats[0].isBotActive ? "Pausar Asistente de IA" : "Activar Asistente de IA"}
                                  >
                                    <Bot className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="p-1.5 bg-slate-100 text-slate-300 rounded-lg cursor-not-allowed border border-slate-200/30"
                                    title="Sin chat de WhatsApp activo"
                                  >
                                    <Bot className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setSelectedOpp(opp)}
                                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-colors"
                                  title="Editar"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteOpportunity(opp.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
          </div>
        )}
      </div>

      
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
