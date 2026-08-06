import { useState } from 'react';
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
  AlertCircle,
  FileText,
  User,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { NotificationsDropdown } from '../components/layout/NotificationsDropdown';

const LEAD_SOURCE_DATA = [
  { name: 'Redes Sociales', value: 42, color: '#10B981' },
  { name: 'Portales Inmobiliarios', value: 28, color: '#059669' },
  { name: 'Web Directa', value: 18, color: '#047857' },
  { name: 'Referidos', value: 8, color: '#065F46' },
  { name: 'Eventos / Feria', value: 4, color: '#34D399' },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<'todos' | 'pendientes' | 'completados'>('todos');

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
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

      {/* Stats Cards - 2 Columns on Mobile, 4 Columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard 
          icon={TrendingUp} 
          iconBg="bg-green-100" 
          iconColor="text-green-600"
          label="Pipeline abierto" 
          value="S/ 2,612,000" 
          subtext="5 oportunidades" 
        />
        <StatCard 
          icon={Home} 
          iconBg="bg-emerald-50" 
          iconColor="text-emerald-600"
          label="Unidades disponibles" 
          value="3" 
          subtext="6 registradas" 
        />
        <StatCard 
          icon={Users} 
          iconBg="bg-teal-50" 
          iconColor="text-teal-600"
          label="Contactos" 
          value="5" 
          subtext="Base activa" 
        />
        <StatCard 
          icon={CheckCircle} 
          iconBg="bg-green-50" 
          iconColor="text-green-600"
          label="Cierres ganados" 
          value="S/ 342,000" 
          subtext="1 operación" 
        />
      </div>

      {/* Main Grid: Appointments & Lead Chart on LEFT (5 cols), Funnel on RIGHT (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LADO IZQUIERDO: Próximas Citas y Orígenes de Contactos */}
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
              <span className="text-[11px] font-medium text-slate-400">3 agendadas</span>
            </div>
            
            <div className="space-y-2.5">
              <AppointmentItem 
                title="Llamada de seguimiento"
                date="Hoy, 10:29 p. m."
                contact="José Moreno"
                status="Pendiente"
                statusColor="bg-amber-50 text-amber-700 border-amber-200/60"
              />
              <AppointmentItem 
                title="Visita a Torre Marina"
                date="Mañana, 08:29 p. m."
                contact="Phyllis Yang"
                status="Confirmada"
                statusColor="bg-emerald-50 text-emerald-700 border-emerald-200/60"
              />
              <AppointmentItem 
                title="Presentación Los Cedros"
                date="07-ago., 06:29 p. m."
                contact="Mariana Quispe"
                status="Pendiente"
                statusColor="bg-amber-50 text-amber-700 border-amber-200/60"
              />
            </div>
          </div>

          {/* Gráfico Estadístico: Orígenes de los Contactos */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <PieIcon className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">Orígenes de contactos</h2>
              </div>
              <span className="text-[11px] text-slate-400">Últimos 30 días</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-36 h-36 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={LEAD_SOURCE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={62}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {LEAD_SOURCE_DATA.map((entry, index) => (
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
                {LEAD_SOURCE_DATA.map((source) => (
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
                  <span>5 Oportunidades</span>
                </div>
              </div>

              <div className="space-y-5">
                <FunnelRow label="Prospección" count="1" value="S/ 489,000" percent={80} color="bg-emerald-500" />
                <FunnelRow label="Calificación" count="1" value="S/ 365,000" percent={60} color="bg-emerald-600" />
                <FunnelRow label="Visita" count="1" value="S/ 298,000" percent={45} color="bg-teal-600" />
                <FunnelRow label="Propuesta" count="1" value="S/ 920,000" percent={100} color="bg-green-600" />
                <FunnelRow label="Negociación" count="1" value="S/ 540,000" percent={75} color="bg-green-700" />
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">Ticket promedio</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">S/ 522,400</p>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">Tasa de conversión</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">24.5%</p>
              </div>
              <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 col-span-2 sm:col-span-1">
                <p className="text-[10px] text-slate-400 font-medium">Tiempo promedio</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">14 días</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* AL FINAL: SECCIÓN DE SEGUIMIENTO (Follow-up Section) */}
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
          {(activeTab === 'todos' || activeTab === 'pendientes') && (
            <>
              <FollowUpItem 
                icon={PhoneCall}
                iconBg="bg-amber-50 text-amber-600"
                title="Llamada inicial de calificación de presupuesto"
                contact="Phyllis Yang"
                property="Torre Marina - Dpto 501"
                agent="Carlos Agente"
                date="Hoy · 08:30 PM"
                status="Pendiente"
                statusBg="bg-amber-50 text-amber-700 border-amber-200/60"
              />
              <FollowUpItem 
                icon={FileText}
                iconBg="bg-blue-50 text-blue-600"
                title="Envío de borrador de contrato de separación"
                contact="José Moreno"
                property="Los Cedros - Lote 12"
                agent="Ana Asistente"
                date="07-ago. · 11:00 AM"
                status="En revisión"
                statusBg="bg-blue-50 text-blue-700 border-blue-200/60"
              />
            </>
          )}

          {(activeTab === 'todos' || activeTab === 'completados') && (
            <>
              <FollowUpItem 
                icon={CheckCircle2}
                iconBg="bg-emerald-50 text-emerald-600"
                title="Visita guiada a la sala de ventas realizada con éxito"
                contact="Lucía Ferrer"
                property="Condominio El Valle"
                agent="Carlos Agente"
                date="04-ago. · 08:29 PM"
                status="Completado"
                statusBg="bg-emerald-50 text-emerald-700 border-emerald-200/60"
              />
              <FollowUpItem 
                icon={User}
                iconBg="bg-teal-50 text-teal-600"
                title="Contacto registrado desde formulario Web"
                contact="Mariana Quispe"
                property="Interés en Duplex"
                agent="Sistema CRM"
                date="03-ago. · 04:15 PM"
                status="Completado"
                statusBg="bg-emerald-50 text-emerald-700 border-emerald-200/60"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Subcomponent: StatCard with compact mobile padding & text size
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

// Subcomponent: Funnel Row
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
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

// Subcomponent: Appointment Item
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

// Subcomponent: Follow-up Item
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

