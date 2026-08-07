import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Filter, Phone, MessageSquare, Mail, Settings, List, Kanban, Tag, DollarSign, Bot, Edit, Trash2 } from 'lucide-react';
import { OpportunityDetailModal } from '../components/modals/OpportunityDetailModal';
import { getPipeline, getPipelineStages, updateOpportunityStage, deleteOpportunity, toggleChatBot } from '../lib/api';

export function Pipeline() {
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [draggedOverStage, setDraggedOverStage] = useState<string | null>(null);
  const [activeMobileMenuId, setActiveMobileMenuId] = useState<string | null>(null);
  
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Advanced Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  
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

  // Client-side advanced filtering
  const filteredOpportunities = opportunities.filter(opp => {
    const contactName = opp.contact?.firstName ? `${opp.contact.firstName} ${opp.contact.lastName || ''}`.toLowerCase() : '';
    const matchesSearch = !filterSearch || contactName.includes(filterSearch.toLowerCase());
    const matchesProject = !filterProject || opp.projectId === filterProject;
    const matchesSource = !filterSource || opp.contact?.source === filterSource;
    const matchesAgent = !filterAgent || opp.agentId === filterAgent;
    return matchesSearch && matchesProject && matchesSource && matchesAgent;
  });

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto h-[calc(100vh-80px)] flex flex-col overflow-hidden font-sans animate-fade-in">
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
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-1 md:flex-none bg-white border text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm ${showFilters ? 'bg-slate-100 border-slate-300 font-bold' : 'border-slate-200'}`}
          >
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Filtros avanzados</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white border border-slate-200 p-3 rounded-xl mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-xs animate-in slide-in-from-top-1 duration-200 text-left shrink-0 font-sans">
          <div className="space-y-0.5">
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Buscar Lead</label>
            <input
              type="text"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20"
            />
          </div>
          <div className="space-y-0.5">
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Proyecto</label>
            <select
              value={filterProject}
              onChange={e => setFilterProject(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 font-semibold"
            >
              <option value="">Todos los Proyectos</option>
              {Array.from(new Map(opportunities.map(o => o.project).filter(Boolean).map(p => [p.id, p])).values()).map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-0.5">
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Origen / Fuente</label>
            <select
              value={filterSource}
              onChange={e => setFilterSource(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 font-semibold"
            >
              <option value="">Todos los Orígenes</option>
              {Array.from(new Set(opportunities.map(o => o.contact?.source).filter(Boolean))).map((src: any) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>
          <div className="space-y-0.5">
            <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">Asesor encargado</label>
            <select
              value={filterAgent}
              onChange={e => setFilterAgent(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-green/20 font-semibold"
            >
              <option value="">Todos los Asesores</option>
              {Array.from(new Map(opportunities.map(o => o.agent).filter(Boolean).map(a => [a.id, a])).values()).map((a: any) => (
                <option key={a.id} value={a.id}>{a.firstName} {a.lastName || ''}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Kanban Board Container / List View */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {loading && stages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">Cargando oportunidades...</div>
        ) : viewMode === 'list' ? (
          /* List View - Single Flat Table with Headers */
          <div className="flex-1 overflow-hidden bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col animate-fade-in text-left">
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200 sticky top-0 z-10 text-xs">
                  <tr>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3 hidden md:table-cell">Proyecto</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Origen / Fuente</th>
                    <th className="px-4 py-3">Etapa</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Antigüedad</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOpportunities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                        No se encontraron oportunidades en el listado.
                      </td>
                    </tr>
                  ) : (
                    filteredOpportunities.map((opp) => {
                      const contactName = opp.contact?.firstName ? `${opp.contact.firstName} ${opp.contact.lastName || ''}`.trim() : 'Sin Contacto';
                      const stageConfig = stages.find(s => s.key === opp.stage) || { name: opp.stage, color: '#475569' };
                      
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
                        <tr 
                          key={opp.id} 
                          onClick={() => setSelectedOpp(opp)}
                          className="hover:bg-slate-50/50 cursor-pointer transition-colors group"
                        >
                          {/* Cliente */}
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-900 group-hover:text-brand-green transition-colors">{contactName}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{opp.contact?.phone || opp.contact?.email || 'Sin datos de contacto'}</div>
                          </td>
                          {/* Proyecto */}
                          <td className="px-4 py-3.5 hidden md:table-cell">
                            <span className="text-slate-600 font-semibold text-xs">
                              {opp.project?.name || 'Sin Proyecto'}
                            </span>
                          </td>
                          {/* Origen */}
                          <td className="px-4 py-3.5 hidden lg:table-cell">
                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/50 text-slate-500">
                              {opp.contact?.source || 'Sin Origen'}
                            </span>
                          </td>
                          {/* Etapa */}
                          <td className="px-4 py-3.5">
                            <span 
                              className="text-[9px] font-bold px-2.5 py-0.5 rounded-full border inline-block"
                              style={{ 
                                color: stageConfig.color || '#475569', 
                                backgroundColor: `${stageConfig.color}12` || '#f1f5f9',
                                borderColor: `${stageConfig.color}25` || '#e2e8f0'
                              }}
                            >
                              {stageConfig.name}
                            </span>
                          </td>
                          {/* Antigüedad */}
                          <td className="px-4 py-3.5 hidden sm:table-cell text-slate-500 text-xs font-medium">
                            {getElapsedTime(opp.createdAt)}
                          </td>
                          {/* Acciones */}
                          <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
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

                              <div className="flex items-center gap-1 pl-1.5 border-l border-slate-200 ml-1">
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
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500 bg-slate-50/50 shrink-0 font-medium">
              <span>Mostrando {filteredOpportunities.length} oportunidades</span>
            </div>
          </div>
        ) : (
          /* Kanban Board View */
          <div className="flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-5 h-full items-start w-max pb-4">
              {visibleStages.map((stage) => {
                const stageOpps = filteredOpportunities.filter(o => o.stage === stage.key);
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


    </div>
  );
}
