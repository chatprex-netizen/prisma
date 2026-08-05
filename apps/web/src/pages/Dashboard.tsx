import { TrendingUp, Home, Users, CheckCircle, Clock } from 'lucide-react';
import { NotificationsDropdown } from '../components/layout/NotificationsDropdown';

export function Dashboard() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Resumen comercial de tu inmobiliaria</p>
        </div>
        <div className="hidden md:block">
          <NotificationsDropdown />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtext="6 unidades registradas" 
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
          subtext="1 operaciones" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions & Recent Activity */}
        <div className="col-span-2 space-y-6">
          {/* Funnel */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-6">Embudo por etapa</h2>
            <div className="space-y-5">
              <FunnelRow label="Prospección" value="1 · S/ 489,000" percent={80} />
              <FunnelRow label="Calificación" value="1 · S/ 365,000" percent={50} />
              <FunnelRow label="Visita" value="1 · S/ 298,000" percent={40} />
              <FunnelRow label="Propuesta" value="1 · S/ 920,000" percent={100} />
              <FunnelRow label="Negociación" value="1 · S/ 540,000" percent={70} />
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">Actividad reciente</h2>
            <div className="space-y-0 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              <ActivityItem 
                title="Llamada inicial de calificación con el cliente."
                meta="Llamada · Phyllis Yang · 04-ago., 08:29 p. m."
              />
              <ActivityItem 
                title="Visita realizada a la sala de ventas de Torre Marina."
                meta="Visita · Lucía Ferrer · 04-ago., 08:29 p. m."
              />
              <ActivityItem 
                title="Oportunidad movida a Negociación."
                meta="Cambio etapa · José Moreno · 04-ago., 08:29 p. m."
                isLast
              />
            </div>
          </div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">Próximas citas</h2>
            <div className="space-y-3">
              <AppointmentItem 
                title="Llamada de seguimiento"
                date="04-ago., 10:29 p. m. · José Moreno"
                status="Pendiente"
              />
              <AppointmentItem 
                title="Visita Torre Marina"
                date="05-ago., 08:29 p. m. · Phyllis Yang"
                status="Confirmada"
                statusColor="bg-green-100 text-green-700"
              />
              <AppointmentItem 
                title="Presentación Los Cedros"
                date="07-ago., 06:29 p. m. · Mariana Quispe"
                status="Pendiente"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, iconBg, iconColor, label, value, subtext }: any) {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200/60 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-lg font-bold text-slate-900 tracking-tight leading-none mb-1.5">{value}</p>
        <p className="text-xxs text-slate-400">{subtext}</p>
      </div>
    </div>
  );
}

function FunnelRow({ label, value, percent }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-end text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-brand-green rounded-full" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function AppointmentItem({ title, date, status, statusColor = "bg-slate-100 text-slate-600" }: any) {
  return (
    <div className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors group">
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="text-xs font-semibold text-slate-800">{title}</h4>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-slate-500">
        <Clock className="w-3 h-3" />
        <span className="text-[10px]">{date}</span>
      </div>
    </div>
  );
}

function ActivityItem({ title, meta, isLast }: any) {
  return (
    <div className={`relative pl-6 py-3 ${!isLast ? 'border-b border-slate-50' : ''}`}>
      <div className="absolute left-0 top-4 w-2 h-2 rounded-full bg-brand-green ring-4 ring-white" />
      <p className="text-xs font-medium text-slate-700">{title}</p>
      <p className="text-[10px] text-slate-400 mt-1">{meta}</p>
    </div>
  );
}
