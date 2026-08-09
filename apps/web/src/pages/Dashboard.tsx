import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Home, 
  Users, 
  CheckCircle, 
  Clock, 
  Calendar as CalendarIcon, 
  PieChart as PieIcon, 
  PhoneCall, 
  CheckCircle2, 
  FileText,
  User,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { NotificationsDropdown } from '../components/layout/NotificationsDropdown';
import { getPipeline, getPipelineStages, getProperties, getContacts, getAppointments } from '../lib/api';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'todos' | 'pendientes' | 'completados'>('todos');
  
  // Real Data states
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [oppsRes, stagesRes, propsRes, contactsRes, apptsRes] = await Promise.all([
          getPipeline().catch(() => ({ data: [] })),
          getPipelineStages().catch(() => ({ data: [] })),
          getProperties().catch(() => ({ data: [] })),
          getContacts().catch(() => ({ data: [] })),
          getAppointments().catch(() => ({ data: [] }))
        ]);

        setOpportunities(oppsRes.data || []);
        setStages(stagesRes.data || []);
        setProperties(propsRes.data || []);
        setContacts(contactsRes.data || []);
        setAppointments(apptsRes.data || []);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 1. Stats Calculations
  const activeOpps = opportunities.filter(o => o.stage !== 'CIERRE_GANADO' && o.stage !== 'CIERRE_PERDIDO');
  const openPipelineValue = activeOpps.reduce((acc, o) => acc + Number(o.value || 0), 0);
  
  const totalProperties = properties.length;
  const availableProperties = properties.filter(p => p.status === 'DISPONIBLE').length;

  const totalContactsCount = contacts.length;

  const wonOpps = opportunities.filter(o => o.stage === 'CIERRE_GANADO');
  const wonPipelineValue = wonOpps.reduce((acc, o) => acc + Number(o.value || 0), 0);

  // 2. Upcoming Appointments (Top 3 future appointments)
  const now = new Date().getTime();
  const upcomingAppts = appointments
    .filter(a => new Date(a.startAt).getTime() > now)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 3);

  // 3. Lead Sources chart calculations
  const sourceGroups: Record<string, number> = {};
  contacts.forEach(c => {
    const src = c.source || 'OTRO';
    sourceGroups[src] = (sourceGroups[src] || 0) + 1;
  });

  const totalContactsForChart = contacts.length || 1;
  const sourceLabelMap: Record<string, string> = {
    REDES_SOCIALES: 'Redes Sociales',
    WEB: 'Sitio Web',
    PORTAL_INMOBILIARIO: 'Portales Inmob.',
    REFERIDO: 'Referidos',
    EVENTO: 'Eventos/Ferias',
    CALL_CENTER: 'Call Center',
    VISITA_OFICINA: 'Visita Oficina',
    OTRO: 'Otros'
  };

  const sourceColorMap: Record<string, string> = {
    REDES_SOCIALES: '#3B82F6', // blue
    WEB: '#8B5CF6', // purple
    PORTAL_INMOBILIARIO: '#F59E0B', // amber
    REFERIDO: '#10B981', // green
    EVENTO: '#EC4899', // pink
    CALL_CENTER: '#EF4444', // red
    VISITA_OFICINA: '#06B6D4', // cyan
    OTRO: '#94A3B8' // slate
  };

  const leadSourceData = Object.keys(sourceGroups).map(key => ({
    name: sourceLabelMap[key] || key,
    value: Math.round((sourceGroups[key] / totalContactsForChart) * 100),
    color: sourceColorMap[key] || '#cbd5e1'
  })).sort((a, b) => b.value - a.value);

  // 4. Funnel stages calculations
  const visibleStages = stages.filter(s => s.isVisible);
  
  // Calculate value and count per stage
  const funnelData = visibleStages.map(stage => {
    const stageOpps = opportunities.filter(o => o.stage === stage.key);
    const value = stageOpps.reduce((acc, o) => acc + Number(o.value || 0), 0);
    return {
      label: stage.name,
      count: stageOpps.length,
      value: value,
      color: stage.color
    };
  });

  const maxFunnelValue = Math.max(...funnelData.map(f => f.value), 1);
  const totalValueSum = funnelData.reduce((acc, f) => acc + f.value, 0);
  const ticketPromedio = funnelData.reduce((acc, f) => acc + f.count, 0) > 0 
    ? totalValueSum / funnelData.reduce((acc, f) => acc + f.count, 0)
    : 0;

  // 5. Follow-up dynamic list (Pending and Completed tasks/actions)
  const pendingFollowUps = [
    // Future appointments
    ...appointments
      .filter(a => new Date(a.startAt).getTime() > now)
      .map(a => ({
        id: `appt-${a.id}`,
        icon: PhoneCall,
        iconBg: "bg-amber-50 text-amber-600",
        title: a.title,
        contact: a.contact ? `${a.contact.firstName} ${a.contact.lastName || ''}` : 'Sin cliente',
        property: a.property?.title || 'General',
        agent: a.agent ? `${a.agent.firstName}` : 'Asesor',
        date: new Date(a.startAt).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
        status: "Pendiente",
        statusBg: "bg-amber-50 text-amber-700 border-amber-250/60"
      })),
    // Opportunities in progress
    ...activeOpps.slice(0, 4).map(o => ({
      id: `opp-${o.id}`,
      icon: FileText,
      iconBg: "bg-blue-50 text-blue-600",
      title: `Seguimiento: Calificación de interés comercial`,
      contact: o.contact ? `${o.contact.firstName} ${o.contact.lastName || ''}` : 'Sin cliente',
      property: o.property?.title || o.project?.name || 'General',
      agent: o.agent ? `${o.agent.firstName}` : 'Asesor',
      date: new Date(o.createdAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
      status: "En Proceso",
      statusBg: "bg-blue-50 text-blue-700 border-blue-200/60"
    }))
  ];

  const completedFollowUps = [
    // Old appointments
    ...appointments
      .filter(a => new Date(a.startAt).getTime() <= now)
      .map(a => ({
        id: `appt-done-${a.id}`,
        icon: CheckCircle2,
        iconBg: "bg-emerald-50 text-emerald-600",
        title: `Reunión: ${a.title} realizada con éxito`,
        contact: a.contact ? `${a.contact.firstName} ${a.contact.lastName || ''}` : 'Sin cliente',
        property: a.property?.title || 'General',
        agent: a.agent ? `${a.agent.firstName}` : 'Asesor',
        date: new Date(a.startAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        status: "Completado",
        statusBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60"
      })),
    // Won Opportunities
    ...wonOpps.slice(0, 3).map(o => ({
      id: `opp-done-${o.id}`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-emerald-600",
      title: `Trato Ganado: Oportunidad de venta cerrada`,
      contact: o.contact ? `${o.contact.firstName} ${o.contact.lastName || ''}` : 'Sin cliente',
      property: o.property?.title || o.project?.name || 'General',
      agent: o.agent ? `${o.agent.firstName}` : 'Asesor',
      date: new Date(o.updatedAt).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
      status: "Cerrado",
      statusBg: "bg-emerald-50 text-emerald-700 border-emerald-250/60"
    }))
  ];

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Resumen comercial y seguimiento de operaciones</p>
        </div>
        <div className="hidden md:block">
          <NotificationsDropdown />
        </div>
      </div>

      {loading && opportunities.length === 0 ? (
        <div className="text-center py-20 text-slate-500 text-sm font-medium">Cargando información comercial real...</div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard 
              icon={TrendingUp} 
              iconBg="bg-green-100" 
              iconColor="text-green-600"
              label="Pipeline abierto" 
              value={`S/ ${openPipelineValue.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
              subtext={`${activeOpps.length} oportunidades`} 
            />
            <StatCard 
              icon={Home} 
              iconBg="bg-emerald-50" 
              iconColor="text-emerald-600"
              label="Unidades disponibles" 
              value={`${availableProperties}`} 
              subtext={`${totalProperties} registradas`} 
            />
            <StatCard 
              icon={Users} 
              iconBg="bg-teal-50" 
              iconColor="text-teal-600"
              label="Contactos" 
              value={`${totalContactsCount}`} 
              subtext="Base activa" 
            />
            <StatCard 
              icon={CheckCircle} 
              iconBg="bg-green-50" 
              iconColor="text-green-600"
              label="Cierres ganados" 
              value={`S/ ${wonPipelineValue.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
              subtext={`${wonOpps.length} operaciones`} 
            />
          </div>

          {/* Main Grid: Appointments & Lead Chart on LEFT (5 cols), Funnel on RIGHT (7 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LADO IZQUIERDO */}
            <div className="lg:col-span-5 space-y-6">
              {/* Próximas Citas */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-800">Próximas citas</h2>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">{upcomingAppts.length} agendadas</span>
                </div>
                
                <div className="space-y-2.5">
                  {upcomingAppts.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-medium">Sin próximas citas agendadas</div>
                  ) : (
                    upcomingAppts.map(appt => (
                      <AppointmentItem 
                        key={appt.id}
                        title={appt.title}
                        date={new Date(appt.startAt).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        contact={appt.contact ? `${appt.contact.firstName} ${appt.contact.lastName || ''}` : 'Sin cliente'}
                        status={appt.status === 'CONFIRMADA' ? 'Confirmada' : 'Pendiente'}
                        statusColor={appt.status === 'CONFIRMADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-250/60' : 'bg-amber-50 text-amber-700 border-amber-250/60'}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Orígenes de los Contactos */}
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                      <PieIcon className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-semibold text-slate-800">Orígenes de contactos</h2>
                  </div>
                  <span className="text-[11px] text-slate-400">Total base de datos</span>
                </div>

                {leadSourceData.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium">Sin orígenes de contactos registrados</div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-36 h-36 relative shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={leadSourceData}
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={62}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {leadSourceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`${value}%`, 'Porcentaje']}
                            contentStyle={{ borderRadius: '8px', fontSize: '12px', borderColor: '#E2E8F0' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-xs font-bold text-slate-800">100%</span>
                        <span className="text-[9px] text-slate-400">Leads</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      {leadSourceData.map((source) => (
                        <div key={source.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                            <span className="text-slate-600 truncate max-w-[120px]">{source.name}</span>
                          </div>
                          <span className="font-semibold text-slate-800">{source.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* LADO DERECHO: Embudo por etapa */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl border border-slate-200/60 p-4 sm:p-6 shadow-sm h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">Embudo por etapa</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Distribución del valor comercial por fases</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-slate-400" />
                      <span>{opportunities.length} Oportunidades</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {funnelData.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs font-medium">Ninguna etapa visible configurada</div>
                    ) : (
                      funnelData.map((stage, idx) => (
                        <FunnelRow 
                          key={idx}
                          label={stage.label} 
                          count={stage.count} 
                          value={`S/ ${stage.value.toLocaleString('es-PE')}`} 
                          percent={Math.max(10, Math.round((stage.value / maxFunnelValue) * 100))} 
                          color={stage.color}
                        />
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium">Ticket promedio</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">S/ {Math.round(ticketPromedio).toLocaleString('es-PE')}</p>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium">Tasa de conversión</p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                      {opportunities.length > 0 ? ((wonOpps.length / opportunities.length) * 100).toFixed(1) : '0.0'}%
                    </p>
                  </div>
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                    <p className="text-[10px] text-slate-400 font-medium">Oportunidades ganadas</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{wonOpps.length} leads</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* SECCIÓN DE SEGUIMIENTO */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Sección de seguimiento</h2>
                <p className="text-xs text-slate-400 mt-0.5">Bitácora de tareas comerciales y acciones pendientes</p>
              </div>
              
              <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-lg self-start sm:self-auto text-xs">
                <button 
                  onClick={() => setActiveTab('todos')} 
                  className={`px-3 py-1 rounded-md font-medium transition-all ${activeTab === 'todos' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setActiveTab('pendientes')} 
                  className={`px-3 py-1 rounded-md font-medium transition-all ${activeTab === 'pendientes' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Pendientes
                </button>
                <button 
                  onClick={() => setActiveTab('completados')} 
                  className={`px-3 py-1 rounded-md font-medium transition-all ${activeTab === 'completados' ? 'bg-white shadow-xs text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Completados
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {activeTab === 'todos' && pendingFollowUps.length === 0 && completedFollowUps.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">Ninguna actividad de seguimiento registrada</div>
              )}
              {activeTab === 'pendientes' && pendingFollowUps.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">Ningún seguimiento pendiente</div>
              )}
              {activeTab === 'completados' && completedFollowUps.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">Ningún seguimiento completado</div>
              )}

              {(activeTab === 'todos' || activeTab === 'pendientes') && (
                pendingFollowUps.map(item => (
                  <FollowUpItem 
                    key={item.id}
                    icon={item.icon}
                    iconBg={item.iconBg}
                    title={item.title}
                    contact={item.contact}
                    property={item.property}
                    agent={item.agent}
                    date={item.date}
                    status={item.status}
                    statusBg={item.statusBg}
                  />
                ))
              )}

              {(activeTab === 'todos' || activeTab === 'completados') && (
                completedFollowUps.map(item => (
                  <FollowUpItem 
                    key={item.id}
                    icon={item.icon}
                    iconBg={item.iconBg}
                    title={item.title}
                    contact={item.contact}
                    property={item.property}
                    agent={item.agent}
                    date={item.date}
                    status={item.status}
                    statusBg={item.statusBg}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Subcomponents
function StatCard({ icon: Icon, iconBg, iconColor, label, value, subtext }: any) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 border border-slate-200/60 shadow-sm flex items-center sm:items-start gap-2.5 sm:gap-4 hover:shadow-md transition-shadow">
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate mb-0.5">{label}</p>
        <p className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight leading-none mb-1 truncate">{value}</p>
        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">{subtext}</p>
      </div>
    </div>
  );
}

function FunnelRow({ label, count, value, percent, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{label}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">{count}</span>
        </div>
        <span className="font-semibold text-slate-700">{value}</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex items-center">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function AppointmentItem({ title, date, contact, status, statusColor }: any) {
  return (
    <div className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all group">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-xs font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">{title}</h4>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 text-[11px] mt-1.5">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-1">
          <User className="w-3 h-3 text-slate-400" />
          <span className="font-medium text-slate-700">{contact}</span>
        </div>
      </div>
    </div>
  );
}

function FollowUpItem({ icon: Icon, iconBg, title, contact, property, agent, date, status, statusBg }: any) {
  return (
    <div className="py-3.5 first:pt-2 last:pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 px-2 rounded-lg transition-colors">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-slate-800">{title}</h4>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
            <span>Cliente: <strong className="text-slate-700 font-medium">{contact}</strong></span>
            <span>·</span>
            <span>{property}</span>
            <span>·</span>
            <span>Resp: {agent}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-auto w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-50">
        <span className="text-[10px] text-slate-400 font-medium">{date}</span>
        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border font-medium ${statusBg}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
